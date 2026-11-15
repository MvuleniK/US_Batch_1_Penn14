#!/usr/bin/env node
/**
 * Static site builder (Node >= 18, zero dependencies).
 *   src/pages/*.html     page fragments, first line: <!--meta {"title":..,"description":..,"nav":..} -->
 *   src/partials/*.html  shared pieces ({{include:name}})
 *   src/data/*.json      content data (testimonials)
 *   public/              output (committed so the site can be served as-is)
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "public");

/* ---- Verified constants (see Penn_14 assessment §1). Do not edit casually. ---- */
export const CONST = {
  BOOK: "https://www.topofthehillsmiles.com/appointment-request", // client's real request form — preserve exactly
  TEL_ORTHO: "tel:+12152203777",
  TEL_PEDO: "tel:+12152203778",
  ORTHO: "(215) 220-3777",
  PEDO: "(215) 220-3778",
  ADDR: "10 W Gravers Lane, Philadelphia, PA 19118",
  MAPS: "https://maps.google.com/?q=10+W+Gravers+Lane,+Philadelphia,+PA+19118",
  ORIG: "https://www.topofthehillsmiles.com",
  H1: "Welcome to Top of The Hill — Dentistry for Children &amp; Orthodontics for All Ages",
};

const NAV = [
  ["home", "Home", "index.html"],
  ["pediatric", "Pediatric Dentistry", "pediatric-dentistry.html"],
  ["ortho", "Orthodontics", "orthodontics.html"],
  ["new", "New Patients", "new-patients.html"],
  ["about", "Meet Our Doctors", "about.html"],
  ["reviews", "Reviews & Office Tour", "reviews.html"],
  ["contact", "Contact", "contact.html"],
];

/* One icon set, one stroke (1.5), one size (18px, set in CSS). Icons take their text colour. */
const ICONS = {
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  train: '<rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 11h16M8 21l2-4M16 21l-2-4"/>',
  alert: '<path d="m10.3 3.9-8.5 14.7A2 2 0 0 0 3.5 22h17a2 2 0 0 0 1.7-3.4L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
};

/* Source tags are review-mode notes: hidden when the footer switch is off. */
const SRC_LABEL = {
  site: "From current website",
  snapshot: "Assessment snapshot",
  placeholder: "Placeholder, approved asset needed",
  review: "Pending practice review",
  proposal: "Proposal, not live",
};

const read = (p) => readFileSync(p, "utf8");
const partial = (n) => read(join(SRC, "partials", `${n}.html`));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Quiet line art inside image placeholders (no synthetic photography). */
const ART = {
  person: '<svg class="frame__art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true" fill="none"><circle cx="150" cy="150" r="46"/><path d="M62 400c6-74 42-110 88-110s82 36 88 110"/></svg>',
  window: '<svg class="frame__art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true" fill="none"><path d="M70 360V170a80 80 0 0 1 160 0v190z"/><path d="M150 90v270M70 200h160"/><path d="M40 360h220"/></svg>',
  arch: '<svg class="frame__art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true" fill="none"><path d="M40 330c10-100 60-150 110-150s100 50 110 150"/><path d="M84 330c8-62 34-92 66-92s58 30 66 92" opacity=".6"/></svg>',
};

/* Hero drawing: Chestnut Hill arched façade. The two inner arches are the two specialties.
   Decorative only (aria-hidden); the labels beside it are real HTML. */
function archArt(kind) {
  const left = `<path class="a-win" d="M44 532V340a90 90 0 0 1 180 0v192"/><path class="a-lines" d="M134 250v170M44 340h180M44 420h180"/><rect class="a-lines" x="64" y="444" width="140" height="72" rx="4"/>`;
  const right = `<path class="a-win" d="M296 532V340a90 90 0 0 1 180 0v192"/><path class="a-lines" d="M386 250v170M296 340h180M296 420h180"/><rect class="a-lines" x="316" y="444" width="140" height="72" rx="4"/>`;
  const one = `<path class="a-win" d="M170 532V340a90 90 0 0 1 180 0v192"/><path class="a-lines" d="M260 250v170M170 340h180M170 420h180"/><rect class="a-lines" x="190" y="444" width="140" height="72" rx="4"/>`;
  let inner, dots;
  if (kind === "both") { inner = left + right; dots = `<circle class="a-dot-ped" cx="134" cy="232" r="6"/><circle class="a-dot-ortho" cx="386" cy="232" r="6"/>`; }
  else { inner = one; dots = `<circle class="${kind === "ped" ? "a-dot-ped" : "a-dot-ortho"}" cx="260" cy="232" r="6"/>`; }
  return `<svg class="arch-art" viewBox="0 0 520 540" aria-hidden="true" focusable="false"><path class="a-outer" d="M8 532V228a252 208 0 0 1 504 0v304z"/><path class="a-mould" d="M22 532V228a238 194 0 0 1 476 0v304"/>${inner}${dots}<circle class="a-key" cx="260" cy="64" r="7"/><path class="a-ground" d="M0 532.5h520"/></svg>`;
}

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
        case "icon": {
          if (!ICONS[arg]) throw new Error(`Unknown icon "${arg}" in ${page.file}`);
          return `<svg class="i" aria-hidden="true" focusable="false" viewBox="0 0 24 24">${ICONS[arg]}</svg>`;
        }
        case "src": {
          if (!SRC_LABEL[arg]) throw new Error(`Unknown src tag "${arg}" in ${page.file}`);
          return `<span class="src">${SRC_LABEL[arg]}</span>`;
        }
        case "cur": return page.nav === arg ? ' aria-current="page"' : "";
        case "ph": {
          // {{ph:Caption|shape|art}}  shape: arch|wide|square   art: person|window|arch
          const [cap, shape = "arch", art = "window"] = arg.split("|");
          return `<figure class="frame frame--${shape}" role="img" aria-label="Placeholder image: ${esc(cap)}">${ART[art]}<figcaption class="review-only">${cap}</figcaption></figure>`;
        }
        case "arch": return archArt(arg.trim());
        case "testimonials": return renderTestimonials();
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
const FEATURED = ["We have loved having Dr. Abbey", "Could not love TOTH more", "Saved me a lot of pain"];
function renderTestimonials() {
  const data = JSON.parse(read(join(SRC, "data", "testimonials.json")));
  const isFeat = (t) => FEATURED.some((f) => t.quote.startsWith(f));
  const ordered = [...data.filter(isFeat), ...data.filter((t) => !isFeat(t))];
  return ordered
    .map((t) => {
      const who = t.attribution ? esc(t.attribution) : "Unattributed on the current website";
      return `<figure class="quote${isFeat(t) ? " quote--feature" : ""}"><blockquote>“${esc(t.quote)}”</blockquote><figcaption>${who}</figcaption></figure>`;
    })
    .join("\n");
}

function navLinks(menu) {
  return NAV.map(([key, label, href]) => `<li><a href="${href}"{{cur:${key}}}>${esc(label)}${menu ? "{{icon:arrow}}" : ""}</a></li>`).join("");
}

/* ---- Build ---- */
mkdirSync(OUT, { recursive: true });
const pagesDir = join(SRC, "pages");
const built = [];
for (const file of readdirSync(pagesDir).filter((f) => f.endsWith(".html"))) {
  const raw = read(join(pagesDir, file));
  const m = raw.match(/^<!--meta\s*(\{[\s\S]*?\})\s*-->\s*/);
  if (!m) throw new Error(`${file}: missing <!--meta {...}--> header`);
  const meta = JSON.parse(m[1]);
  const page = { file, ...meta };
  const body = raw.slice(m[0].length);
  const extra = {
    title: meta.title,
    description: meta.description,
    content: body,
    nav_links: navLinks(false),
    nav_links_menu: navLinks(true),
    body_class: meta.nav ? `page-${meta.nav}` : "",
    jsonld: meta.nav === "home" ? partial("jsonld") : "",
  };
  const html = tokens(partial("layout"), page, extra).replace(/[ \t]+$/gm, "");
  writeFileSync(join(OUT, file), html);
  built.push(file);
}
console.log(`Built ${built.length} pages → public/: ${built.join(", ")}`);
