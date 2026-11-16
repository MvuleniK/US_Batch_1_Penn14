#!/usr/bin/env node
/**
 * Deploy public/ to Cloudflare Workers (static assets) and attach a custom domain.
 * Zero dependencies (Node >= 18). Mirrors the existing "<client>-poc" Worker + custom-domain convention.
 *
 *   CLOUDFLARE_API_TOKEN=... node scripts/deploy-cloudflare.mjs \
 *     --account <id> --zone <id> --name topofthehillsmiles-poc --domain topofthehillsmiles.oculeusltd.com
 *
 * Modes: default "assets" uploads to Workers Static Assets (needs the upload JWT to reach Cloudflare unchanged).
 * If that is rejected (e.g. a credential-injecting proxy replaces the JWT, HTTP 401) it falls back to "inline",
 * which embeds the site in the Worker script. Force one with --mode assets|inline.
 *
 * Token needs: Workers Scripts:Edit, Workers Routes/Custom Domains, Zone:DNS:Edit on the zone.
 * Behind a proxy that injects credentials, any non-empty token value works for account-level calls.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, extname, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith("--") ? [...a, [v.slice(2), all[i + 1]]] : a), []));
const need = (k) => args[k] || (console.error(`Missing --${k}`), process.exit(2));
const ACCOUNT = need("account"), ZONE = need("zone"), NAME = need("name"), DOMAIN = need("domain");
const TOKEN = process.env.CLOUDFLARE_API_TOKEN || "injected-by-proxy";
const API = "https://api.cloudflare.com/client/v4";
const PUB = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const TYPES = { ".webp": "image/webp", ".jpg": "image/jpeg", ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".txt": "text/plain" };

async function cf(path, init = {}, bearer = TOKEN) {
  const res = await fetch(API + path, { ...init, headers: { Authorization: `Bearer ${bearer}`, ...(init.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) throw new Error(`${init.method || "GET"} ${path} → ${res.status} ${JSON.stringify(body.errors || body)}`);
  return body;
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// 1. manifest: hash = sha256(base64(content) + extension) truncated to 32 hex chars (Workers Assets format)
const files = walk(PUB);
const manifest = {}, byHash = {};
for (const p of files) {
  const buf = readFileSync(p);
  const b64 = buf.toString("base64");
  const hash = createHash("sha256").update(b64 + extname(p).slice(1)).digest("hex").slice(0, 32);
  const key = "/" + relative(PUB, p).split(sep).join("/");
  manifest[key] = { hash, size: buf.length };
  byHash[hash] = { b64, type: TYPES[extname(p)] || "application/octet-stream" };
}
console.log(`Manifest: ${Object.keys(manifest).length} files`);

const MODE = args.mode || "auto";
const COMPAT = "2026-11-01";

async function deployAssets() {
  // 2. upload session
  const session = (await cf(`/accounts/${ACCOUNT}/workers/scripts/${NAME}/assets-upload-session`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ manifest }),
  })).result;
  let completion = session.jwt;
  console.log(`Upload session: ${session.buckets?.flat().length ?? 0} file(s) to upload`);
  // 3. upload missing files, bucket by bucket (authenticated with the session JWT)
  for (const bucket of session.buckets || []) {
    const form = new FormData();
    for (const h of bucket) form.append(h, new Blob([byHash[h].b64], { type: byHash[h].type }), h);
    const r = await cf(`/accounts/${ACCOUNT}/workers/assets/upload?base64=true`, { method: "POST", body: form }, session.jwt);
    if (r.result?.jwt) completion = r.result.jwt;
  }
  if (!completion) throw new Error("No completion token returned");
  // 4. deploy the Worker (assets binding plus a pass-through script)
  const script = `export default { async fetch(request, env) { return env.ASSETS.fetch(request); } };`;
  const metadata = { main_module: "worker.js", compatibility_date: COMPAT, bindings: [{ name: "ASSETS", type: "assets" }],
    assets: { jwt: completion, config: { html_handling: "auto-trailing-slash", not_found_handling: "none" } } };
  await putScript(metadata, script);
}

/** Parse public/_headers (path block + indented "Name: value") so both modes send the same headers. */
function parseHeaders() {
  const rules = []; let cur = null;
  let text = ""; try { text = readFileSync(join(PUB, "_headers"), "utf8"); } catch { /* none */ }
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) { cur = { pattern: line.trim(), headers: {} }; rules.push(cur); }
    else if (cur) { const i = line.indexOf(":"); cur.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  }
  return rules;
}

async function deployInline() {
  const site = {};
  for (const p of files) {
    const key = "/" + relative(PUB, p).split(sep).join("/");
    if (key === "/_headers") continue;
    const type = TYPES[extname(p)] || "application/octet-stream";
    const text = /^text\/|javascript|json|svg/.test(type);
    site[key] = { type, text, body: text ? readFileSync(p, "utf8") : readFileSync(p).toString("base64") };
  }
  const script = `const SITE = ${JSON.stringify(site)};
const RULES = ${JSON.stringify(parseHeaders())};
const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
function headersFor(path, type) {
  const h = new Headers({ "Content-Type": type + (/^text\\/|javascript|json|svg/.test(type) ? "; charset=utf-8" : "") });
  for (const r of RULES) {
    const pre = r.pattern.endsWith("/*") ? r.pattern.slice(0, -1) : null;
    if (r.pattern === path || (pre && path.startsWith(pre))) for (const [k, v] of Object.entries(r.headers)) h.set(k, v);
  }
  return h;
}
export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
    let path = new URL(request.url).pathname;
    if (path.endsWith("/")) path += "index.html";
    let file = SITE[path] || SITE[path + ".html"];
    if (!file) return new Response("Not found", { status: 404, headers: headersFor("/404", "text/plain") });
    const body = request.method === "HEAD" ? null : file.text ? file.body : b64(file.body);
    return new Response(body, { headers: headersFor(path, file.type) });
  },
};`;
  console.log(`Inline worker: ${(script.length / 1024).toFixed(0)} KB`);
  await putScript({ main_module: "worker.js", compatibility_date: COMPAT }, script);
}

async function putScript(metadata, script) {
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("worker.js", new Blob([script], { type: "application/javascript+module" }), "worker.js");
  await cf(`/accounts/${ACCOUNT}/workers/scripts/${NAME}`, { method: "PUT", body: form });
  console.log(`Worker deployed: ${NAME}`);
}

if (MODE === "inline") await deployInline();
else if (MODE === "assets") await deployAssets();
else {
  try { await deployAssets(); }
  catch (e) {
    if (!/→ 401/.test(String(e))) throw e;
    console.log("Asset upload token rejected (401); falling back to inline mode.");
    await deployInline();
  }
}

// 5. custom domain (Cloudflare creates the proxied DNS record itself)
await cf(`/accounts/${ACCOUNT}/workers/domains`, {
  method: "PUT", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ hostname: DOMAIN, service: NAME, zone_id: ZONE, environment: "production" }),
});
console.log(`Custom domain attached: https://${DOMAIN}`);
