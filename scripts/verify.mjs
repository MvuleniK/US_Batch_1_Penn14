#!/usr/bin/env node
/** Acceptance-criteria checks for the built site (Penn_14 assessment §11). Exit code 1 on any failure. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CONST } from "./build.mjs";

const PUB = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const files = readdirSync(PUB).filter((f) => f.endsWith(".html"));
let failures = 0;
const fail = (m) => { failures++; console.error("  ✗ " + m); };
const ok = (m) => console.log("  ✓ " + m);

const pages = Object.fromEntries(files.map((f) => [f, readFileSync(join(PUB, f), "utf8")]));
const ids = Object.fromEntries(files.map((f) => [f, new Set([...pages[f].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const stripTags = (s) => s.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

const BOOK_TEXT = /(request an appointment|request appointment|book online|request a (pediatric|orthodontic) visit|open the request form)/i;
const phones = new Set([CONST.TEL_ORTHO, CONST.TEL_PEDO]);

for (const [f, html] of Object.entries(pages)) {
  console.log(f);
  const anchors = [...html.matchAll(/<a\s[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({ href: m[1], text: stripTags(m[2]) }));

  // 1. booking URL preserved exactly in every booking CTA
  const booking = anchors.filter((a) => BOOK_TEXT.test(a.text) || a.href.includes("appointment-request"));
  const badBook = booking.filter((a) => a.href !== CONST.BOOK);
  badBook.length ? badBook.forEach((a) => fail(`booking CTA "${a.text}" → ${a.href}`)) : ok(`${booking.length} booking CTA(s) use the exact client URL`);

  // 2. no agency scheduler
  /cal\.com|oculeus/i.test(html) ? fail("contains cal.com / oculeus reference") : ok("no Cal.com / Oculeus reference");

  // 3. tel links
  const tels = anchors.filter((a) => a.href.startsWith("tel:"));
  const badTel = tels.filter((a) => !phones.has(a.href) || (/pediatric|pedo/i.test(a.text) && a.href !== CONST.TEL_PEDO) || (/ortho/i.test(a.text) && !/pediatric/i.test(a.text) && a.href !== CONST.TEL_ORTHO));
  badTel.length ? badTel.forEach((a) => fail(`tel mismatch: "${a.text}" → ${a.href}`)) : ok(`${tels.length} tel link(s) correct`);

  // 4. structure / a11y basics
  const h1s = html.match(/<h1[\s>]/g) || [];
  h1s.length === 1 ? ok("exactly one h1") : fail(`${h1s.length} h1 elements`);
  const imgNoAlt = (html.match(/<img\b(?![^>]*\balt=)[^>]*>/g) || []);
  imgNoAlt.length ? fail(`${imgNoAlt.length} img without alt`) : ok("all images have alt");
  /<html lang="en"/.test(html) ? ok("lang set") : fail("missing lang");

  // 5. internal links + fragments resolve
  let broken = 0;
  for (const a of anchors) {
    if (/^(https?:|tel:|mailto:)/.test(a.href)) continue;
    const [file, frag] = a.href.split("#");
    const target = file || f;
    if (!existsSync(join(PUB, target))) { fail(`broken link ${a.href}`); broken++; continue; }
    if (frag && !ids[target]?.has(frag)) { fail(`missing anchor ${a.href}`); broken++; }
  }
  if (!broken) ok("internal links & anchors resolve");

  // 6. ARIA tab wiring
  for (const m of html.matchAll(/aria-controls="([^"]+)"/g)) if (!ids[f].has(m[1])) fail(`aria-controls → #${m[1]} not found`);

  // 7. content guardrails
  if (html.includes("info@topofthehillsmiles.com")) fail("unapproved email displayed");
  for (const re of [/appointment is confirmed/i, /book now/i, /instant(ly)? (confirm|book)/i, /Verified Record/i, /HIPAA Compliant/i]) {
    if (re.test(stripTags(html).replace(/not an instant booking/ig, ""))) fail(`forbidden phrase ${re}`);
  }
}

// Home H1 verbatim
const h1 = stripTags(pages["index.html"].match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]);
h1 === "Welcome to Top of The Hill — Dentistry for Children & Orthodontics for All Ages" ? console.log("✓ home H1 preserved verbatim") : fail(`home H1 changed: ${h1}`);

// Testimonials: every entry from data file rendered on reviews page
const data = JSON.parse(readFileSync(join(PUB, "..", "src", "data", "testimonials.json"), "utf8"));
const rendered = (pages["reviews.html"].match(/<figure class="quote">/g) || []).length;
rendered === data.length ? console.log(`✓ ${rendered} testimonials rendered (all from current website)`) : fail(`testimonials rendered ${rendered} ≠ ${data.length}`);

console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
