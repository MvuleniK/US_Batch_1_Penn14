#!/usr/bin/env node
/**
 * Static site builder (Node >= 18, zero dependencies).
 *   src/pages/*.html     page fragments, first line: <!--meta {"title":..,"description":..,"nav":..} -->
 *   src/partials/*.html  shared pieces ({{include:name}})
 *   src/data/*.json      content data (testimonials)
 *   public/              output (committed so the site can be served as-is)
 *
 * Single source of truth for the facts that must never drift:
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

const ICONS = {
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  alert: '<path d="m10.3 3.9-8.5 14.7A2 2 0 0 0 3.5 22h17a2 2 0 0 0 1.7-3.4L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  train: '<rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 11h16M8 21l2-4M16 21l-2-4"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14a5 5 0 0 0 8 0M9 9h.01M15 9h.01"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  baby: '<circle cx="12" cy="12" r="9"/><path d="M12 3c-1 2 0 3 1.5 3M9 13h.01M15 13h.01M10 16.5c1 .8 3 .8 4 0"/>',
  sport: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  quote: '<path d="M7 7h4v4a4 4 0 0 1-4 4M15 7h4v4a4 4 0 0 1-4 4"/>',
  home: '<path d="m3 11 9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
};

const SRC_LABEL = {
  site: "From current website",
  snapshot: "Assessment snapshot",
  placeholder: "Placeholder — approved asset needed",
  review: "Pending clinical / practice review",
  proposal: "Proposal — not live",
};

const read = (p) => readFileSync(p, "utf8");
const partial = (n) => read(join(SRC, "partials", `${n}.html`));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* decorative line-art used by image placeholders */
const ART = {
  arch: '<svg class="ph__art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M40 210c20-90 90-130 160-130s140 40 160 130"/><path d="M80 210c14-62 62-90 120-90s106 28 120 90" opacity=".6"/><path d="M130 210c8-34 36-50 70-50s62 16 70 50" opacity=".4"/></svg>',
  window: '<svg class="ph__art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M120 250V110a80 80 0 0 1 160 0v140z"/><path d="M200 30v220M120 140h160"/><path d="M40 250h320" opacity=".6"/></svg>',
  person: '<svg class="ph__art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="200" cy="115" r="48"/><path d="M95 270c8-62 52-92 105-92s97 30 105 92"/></svg>',
  smile: '<svg class="ph__art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M110 150c20 60 160 60 180 0"/><path d="M135 172c10 18 120 18 130 0" opacity=".6"/><circle cx="200" cy="150" r="104" opacity=".4"/></svg>',
};

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
          return `<span class="src src--${arg}">${SRC_LABEL[arg]}</span>`;
        }
        case "cur": return page.nav === arg ? ' aria-current="page"' : "";
        case "ph": {
          // {{ph:Caption|shape|art|tone}}  shape: wide|tall|square|round|""  art: arch|window|person|smile  tone: ped|""
          const [cap, shape = "", art = "arch", tone = ""] = arg.split("|");
          const cls = ["ph", shape && `ph--${shape}`, tone && `ph--${tone}`].filter(Boolean).join(" ");
          return `<figure class="${cls}" role="img" aria-label="Placeholder image: ${esc(cap)}">${ART[art]}<figcaption>${cap}</figcaption></figure>`;
        }
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

function renderTestimonials() {
  const data = JSON.parse(read(join(SRC, "data", "testimonials.json")));
  return data
    .map((t) => {
      const who = t.attribution ? esc(t.attribution) : "Unattributed on current website";
      return `<figure class="quote"><blockquote>“${esc(t.quote)}”</blockquote><figcaption>— ${who}</figcaption></figure>`;
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
