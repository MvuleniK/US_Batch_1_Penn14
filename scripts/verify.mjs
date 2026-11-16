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

  const pair = anchors.filter((a) => a.href.startsWith("tel:") && ((a.text.includes(CONST.ORTHO) && a.href !== CONST.TEL_ORTHO) || (a.text.includes(CONST.PEDO) && a.href !== CONST.TEL_PEDO)));
  pair.length ? pair.forEach((a) => fail(`number/link mismatch: "${a.text}" → ${a.href}`)) : ok("each visible number dials its own line");

  // 4. structure / a11y basics
  const h1s = html.match(/<h1[\s>]/g) || [];
  h1s.length === 1 ? ok("exactly one h1") : fail(`${h1s.length} h1 elements`);
  const imgNoAlt = (html.match(/<img\b(?![^>]*\balt=)[^>]*>/g) || []);
  imgNoAlt.length ? fail(`${imgNoAlt.length} img without alt`) : ok("all images have alt");
  /<html lang="en"/.test(html) ? ok("lang set") : fail("missing lang");
  // images: file exists, explicit width/height (no layout shift), non-empty alt, no leftover placeholder
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const badImg = imgs.filter((t) => { const src = (t.match(/src="([^"]+)"/) || [])[1]; return !src || !existsSync(join(PUB, src)) || !/\bwidth="\d+"/.test(t) || !/\bheight="\d+"/.test(t) || /alt=""/.test(t); });
  badImg.length ? badImg.forEach((t) => fail(`image problem: ${t.slice(0, 90)}`)) : ok(`${imgs.length} image(s) exist, sized, with alt text`);
  /placeholder image|class="ph\b/i.test(html) ? fail("leftover image placeholder") : ok("no image placeholders");

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

  // 8. unslop checklist (github.com/heydamir/unslop) — craft rules for built HTML
  /\sstyle="(?!--h: ?[12](; --hm: ?[12])?")/.test(html) ? fail("inline style attribute (only the kit's --h section height is allowed)") : ok("no inline styles");
  /\p{Extended_Pictographic}/u.test(html.replace(/[©®™]/g, "")) ? fail("emoji in interface") : ok("no emoji");
  const visible = stripTags(html.replace(/<blockquote>[\s\S]*?<\/blockquote>/g, "")); // testimonials are the practice's own words
  /!/.test(visible) ? fail("exclamation mark in interface text") : ok("no exclamation marks");
}

// CSS lint: the slop signs that must never come back
const css = readFileSync(join(PUB, "assets", "page.css"), "utf8");
console.log("page.css (our own CSS; the kit's files are unmodified)");
const cssRules = [
  [/gradient\(/, "gradient"],
  [/text-transform:\s*uppercase/, "uppercase labels"],
  [/font(-weight)?:[^;]*\b[789]00\b/, "weight 700 to 900"],
  [/transition:\s*all/, "transition: all"],
  [/@keyframes|animation:/, "looping or keyframe animation"],
  [/backdrop-filter/, "glass blur"],
  [/hover[^{]*\{[^}]*scale\(1\./, "hover scale up"],
];
for (const [re, label] of cssRules) re.test(css) ? fail(`CSS contains ${label}`) : ok(`no ${label}`);
const offGrid = [...css.matchAll(/(?:margin|padding|gap)[a-z-]*:\s*([^;{}]+);/g)].flatMap((m) => [...m[1].matchAll(/(-?\d+(?:\.\d+)?)px/g)].map((x) => Number(x[1]))).filter((n) => n > 2 && n % 4 !== 0);
offGrid.length ? fail(`off-grid spacing values: ${[...new Set(offGrid)].join(", ")}`) : ok("all margin, padding and gap values are on the 4px grid");

// Home H1 verbatim
const h1 = stripTags(pages["index.html"].match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]);
h1 === "Welcome to Top of The Hill — Dentistry for Children & Orthodontics for All Ages" ? console.log("✓ home H1 preserved verbatim") : fail(`home H1 changed: ${h1}`);

// Testimonials: every entry from data file rendered on reviews page
const data = JSON.parse(readFileSync(join(PUB, "..", "src", "data", "testimonials.json"), "utf8"));
const rendered = (pages["reviews.html"].match(/<figure class="quote[ "]/g) || []).length;
rendered === data.length ? console.log(`✓ ${rendered} testimonials rendered (all from current website)`) : fail(`testimonials rendered ${rendered} ≠ ${data.length}`);

console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
