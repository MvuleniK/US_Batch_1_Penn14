#!/usr/bin/env node
/**
 * Static site builder (Node >= 18, zero dependencies).
 *   src/pages/*.html     page fragments, first line: <!--meta {"title":..,"description":..,"nav":..,"moments":[..]} -->
 *   src/partials/*.html  shared pieces ({{include:name}})
 *   src/data/*.json      content data (testimonials, images)
 *   public/              output (committed so the site can be served as-is)
 *
 * The page structure, styles, motion layer and moments come from the taste-skill kit
 * (github.com/leonxlnx/taste-skill, MIT), copied unmodified into public/assets/.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "public");

/* ---- Verified constants (see Penn_14 assessment §1). Do not edit casually. ---- */
export const CONST = {
  BOOK: "https://www.topofthehillsmiles.com/appointment-request", // client's real request form: preserve exactly
  TEL_ORTHO: "tel:+12152203777",
  TEL_PEDO: "tel:+12152203778",
  ORTHO: "(215) 220-3777",
  PEDO: "(215) 220-3778",
  ADDR: "10 W Gravers Lane, Philadelphia, PA 19118",
  MAPS: "https://maps.google.com/?q=10+W+Gravers+Lane,+Philadelphia,+PA+19118",
  ORIG: "https://www.topofthehillsmiles.com",
  H1: "Welcome to Top of The Hill — Dentistry for Children &amp; Orthodontics for All Ages",
  ACTION: "Request an appointment", // the one main action, word for word in nav, hero, close and phone bar
};

/* The kit's drawn arrow, one style a page, on the primary actions that need one. */
const ARROW = '<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>';

const SRC_LABEL = {
  site: "From current website",
  snapshot: "Assessment snapshot",
  review: "Pending practice review",
  proposal: "Proposal, not live",
};

const read = (p) => readFileSync(p, "utf8");
const partial = (n) => read(join(SRC, "partials", `${n}.html`));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* Real photographs from the practice's own site, described in src/data/images.json (alt text and source URL). */
const IMAGES = JSON.parse(read(join(SRC, "data", "images.json")));

/* ---- Token engine ---- */
function tokens(html, page, extra = {}) {
  const re = /\{\{\s*([A-Za-z0-9_]+)(?::([^}]*?))?\s*\}\}/g;
  for (let pass = 0; pass < 6; pass++) {
    let changed = false;
    html = html.replace(re, (m, name, arg) => {
      changed = true;
      if (name in CONST) return CONST[name];
      if (name in extra) return extra[name];
      switch (name) {
        case "include": return partial(arg.trim());
        case "arrow": return ARROW;
        case "testimonial_count": return String(JSON.parse(read(join(SRC, "data", "testimonials.json"))).length);
        case "src": {
          if (!SRC_LABEL[arg]) throw new Error(`Unknown src tag "${arg}" in ${page.file}`);
          return `<span class="src">${SRC_LABEL[arg]}</span>`;
        }
        case "cur": return page.nav === arg ? ' aria-current="page"' : "";
        case "pic": {
          // {{pic:key|eager}} -> the kit's framed image (<img class="frame__img">), never a caption
          const [key, eager] = arg.split("|");
          const im = IMAGES[key];
          if (!im) throw new Error(`Unknown image "${key}" in ${page.file}`);
          const load = eager === "eager" ? 'fetchpriority="high"' : 'loading="lazy"';
          return `<img class="frame__img" src="${im.file}" width="${im.w}" height="${im.h}" alt="${esc(im.alt)}" ${load} data-source="client" data-subject="${esc(im.subject || "the practice")}">`;
        }
        case "testimonials": return renderTestimonials(arg);
        default: changed = false; return m;
      }
    });
    if (!changed) break;
  }
  const left = html.match(/\{\{[^}]+\}\}/);
  if (left) throw new Error(`Unresolved token ${left[0]} in ${page.file}`);
  return html;
}

/* Three testimonials from the practice's own page lead the wall as pull quotes. */
const FEATURED = ["We have loved having Dr. Abbey", "Could not love TOTH more", "Saved me a lot of pain"]; // lead the wall; no special size, so every row is one height
function renderTestimonials(range) {
  const data = JSON.parse(read(join(SRC, "data", "testimonials.json")));
  const isFeat = (t) => FEATURED.some((f) => t.quote.startsWith(f));
  const ordered = [...data.filter(isFeat), ...data.filter((t) => !isFeat(t))];
  const [from, to] = range ? range.split("-").map(Number) : [0, ordered.length];
  return ordered
    .slice(from, to)
    .map((t) => {
      const cap = t.attribution ? `<figcaption>${esc(t.attribution)}</figcaption>` : ""; // the practice's own page shows no name for these
      return `<figure class="quote"><blockquote>“${esc(t.quote)}”</blockquote>${cap}</figure>`;
    })
    .join("\n");
}

/* ---- Build ---- */
mkdirSync(OUT, { recursive: true });
const pagesDir = join(SRC, "pages");
const built = [];
const only = process.argv.slice(2).map((n) => n.replace(/\.html$/, ""));
for (const file of readdirSync(pagesDir).filter((f) => f.endsWith(".html") && (!only.length || only.includes(f.replace(/\.html$/, ""))))) {
  const raw = read(join(pagesDir, file));
  const m = raw.match(/^<!--meta\s*(\{[\s\S]*?\})\s*-->\s*/);
  if (!m) throw new Error(`${file}: missing <!--meta {...}--> header`);
  const meta = JSON.parse(m[1]);
  const page = { file, ...meta };
  const body = raw.slice(m[0].length);
  // modulepreload for each dealt moment this page mounts (assets/moments/<id>/moment.js)
  const moments = (meta.moments || []).map((id) => `<link rel="modulepreload" href="assets/moments/${id}/moment.js">`).join("\n");
  const extra = {
    title: meta.title,
    description: meta.description,
    content: body,
    body_class: meta.nav ? `page-${meta.nav}` : "",
    moment_links: moments,
    jsonld: meta.nav === "home" ? partial("jsonld") : "",
  };
  const html = tokens(partial("layout"), page, extra).replace(/[ \t]+$/gm, "");
  writeFileSync(join(OUT, file), html);
  built.push(file);
}
console.log(`Built ${built.length} pages → public/: ${built.join(", ")}`);
