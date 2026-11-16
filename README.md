# Top of the Hill Orthodontics & Pediatric Dentistry — front-end PoC

Static, dependency-free front end (**HTML, CSS, vanilla JavaScript**) built from the Google Stitch design
and the *Penn_14 Structured Website Assessment* (`docs/`). Chestnut Hill, Philadelphia, PA.

> Proof of concept for client review. It is **not** the practice's live website and is not connected to any
> practice system.

## Run it

```bash
npm run serve      # http://localhost:4173  (Node >= 18, no install step)
npm run build      # regenerate public/ from src/  (or: node scripts/build.mjs index about)
npm run verify     # build + acceptance checks + design lint (exit 1 on failure)
```

`public/` is committed, so it can also be hosted as-is on any static host.

## Pages

Home · Pediatric Dentistry · Orthodontics · New Patients · Doctors (`about.html`) · Reviews (with the office photos) ·
Contact · FAQs, each in `public/*.html`. The nav uses one-word nouns (Children, Orthodontics, Patients, Doctors, Reviews, Contact)
with hover panels for the two specialties.

Edit `src/pages/*.html`, `src/partials/*.html`, `src/data/*.json`, then `npm run build`. `public/assets/page.css` and
`page.js` are the only hand-written CSS and JS (review mode, call sheet, testimonial wall, badges). Facts that must never drift
(booking URL, both phone numbers, address) live **once** in `scripts/build.mjs`.

## Built on the taste-skill kit

This round applies **taste-skill** (github.com/leonxlnx/taste-skill, MIT) to the site. The kit's `system.css`, `layout.css`,
`motion.css`, scripts and two dealt moments are copied **unmodified** into `public/assets/` (licence in `assets/KIT-LICENSE.txt`);
the pages follow its markup contract, and its own checker (`consistency.mjs`) and copy linter were run against every page.

What the skill's dealers and rules decided, and what that changed:

| Deal | Result |
|---|---|
| Page kind | **service** (a clinic: people are hired), site-kind other: photographs, type and flat colour, no shaders or scenes |
| Hero | **split** (the dealt layout): the words left, the practice's own photograph whole on the right; a `photo` hero was dealt first and rejected because it needs 1920px photographs and the practice's are 600px |
| Type | **Red Hat Display / Red Hat Text** (dealt for clinics: steady, approachable), display weight 400 |
| Colour | The practice's own: navy-teal ink `#12303b`, leaf green `#1f7a33` from its logo, cool surfaces (the skill's own dealt clinic palettes were cool teal too) |
| Moments | **pinned-chapters** (first-visit steps) and **word-highlight** (type-led statements); the photo-based `photo-chapters` was dealt but needs 1800px photographs, so it was not used |
| Rules applied | One section per screen (every section exactly one or two screens, hero alone on the first); equal edges; the kit's hover and press layer; hero entrance on load; FAQs open in full (no accordions or tabs); no captions under images; plain, noun-led headings; buttons as a verb and an object; 16px text; one credits line in the footer |



### Checker and gate results

The skill's browser checker (`consistency.mjs`, run at 1440 and 390 with its rhythm checks, `--address-allow` for the practice's real contacts) was
run on every page. On the first run the **home page had 35 FAIL and 17 WARN**.

| Page | FAIL now (1440 + 390) |
|---|---|
| Home, Doctors, New patients, Reviews, Contact, FAQs | **0** |
| Pediatric dentistry, Orthodontics | 1 each, the same kit behaviour: the closing button's brief colour change at 390px (the kit's phone bar hiding as that button scrolls into view), which the checker reads as a scroll reveal |

The finish gate (`gate.mjs`) on the home page ended **OPEN** with its three rounds used up. Its open findings are:

- **8 × street-number, postcode, phone-number**: the skill's house rule 9 expects stand-in contacts. The practice's verified address and two specialty
  phone numbers are mandatory in the Penn_14 assessment (and are the whole point of the site), the gate has no allow-list, and it caps waivers
  at five, so these stay open and are reported rather than hidden. The checker itself accepts them via `--address-allow`.
- **1 × neighbour at 390**: the pinned-steps section left 141px of the next section showing. Fixed after the gate's last round (a two-screen
  phone height in `page.css`) and confirmed by measuring (2.0 screens); not re-gated.
- **1 waiver**: `hero-lines`. The home h1 is the practice's current headline, required verbatim by the assessment, at 13 words and 5 lines against the
  skill's 3-line limit (`.taste-skill/waivers.json`, not committed).

What I deliberately did not take from the skill: its **one-page** navigation (the assessment requires separate pages), its **dealt full-bleed
photo hero and photo moment** (they need 1920px and 1800px photographs; the practice's are 600px), and its **no-phone-number rule** (see above).
Every photograph is shown at or below 1.33× its natural width, the skill's own limit.

## Non-negotiables (enforced by `npm run verify`)

- Every "Request an Appointment" CTA → exactly `https://www.topofthehillsmiles.com/appointment-request`.
- No `cal.com` / Oculeus scheduler anywhere. It appears only as a *proposal* note, hidden in clean view.
- Copy says "appointment request … coordinator will contact you to confirm", never instant or confirmed booking.
- Two separate `tel:` links, Orthodontics `+12152203777` and Pediatric `+12152203778`; label and number are checked.
- Home H1 preserved verbatim; one `h1` per page; alt text; internal links and anchors resolve.
- No unapproved email, invented hours or prices, or patient-data collection.


## Live proof of concept

**https://topofthehillsmiles.oculeusltd.com** — a Cloudflare Worker named `topofthehillsmiles-poc`, following the existing
`<client>-poc` convention on the Oculeus zone. It is `noindex` (header and meta tag), served over HTTPS, with a restrictive
Content-Security-Policy from `public/_headers`. Cloudflare's auto-injected Web Analytics beacon is blocked by that policy, so no
analytics run on the PoC until the practice's consent approach is decided.

Redeploy after any change (Node >= 18, no install step):

```bash
npm run verify
CLOUDFLARE_API_TOKEN=... node scripts/deploy-cloudflare.mjs \
  --account <cloudflare-account-id> --zone <zone-id> \
  --name topofthehillsmiles-poc --domain topofthehillsmiles.oculeusltd.com
```

The script uploads to Workers Static Assets and, if the asset-upload token is rejected (as behind a credential-injecting proxy),
falls back to embedding the site in the Worker (`--mode inline`). To take the PoC down, remove the custom domain and the
Worker `topofthehillsmiles-poc` in the Cloudflare dashboard. The Oculeus apex site and other client PoCs are not touched.


## Provenance: everything the owner needs to see

Included from the original site, as requested: all **103 testimonials** (verbatim, `src/data/testimonials.json`; quotes the
practice shows with no name stay unnamed), the doctors' **credentials and affiliations**, the "certified Invisalign Teen®
provider" statement, the two **Invisalign / Invisalign Teen logos**, the team roster, parking and transit, form PDFs, the Notice
of Privacy Practices and **13 of the practice's own photographs** (`docs/IMAGE-SOURCES.md`). None is independently verified;
each is flagged for the practice to confirm.

**Review mode.** Owner-review notes ("From current website", "Pending practice review", "Placeholder", "Proposal, not live")
are hidden by default so the page reads as it would at launch. Turn them on with the **Source notes** control in the footer, or
open any page with `?review=on` (`?review=off` turns them off again); the choice is remembered per browser. Required public
disclosures, such as the dated Google rating, stay visible either way.

**Not carried over from Stitch** because it does not appear on the current site: the invented "Verified Record" quotes,
"Dual Board Leadership", "Invisalign Certified Provider / Platinum", a "HIPAA Compliant" badge, AI-generated photos, an
"Open Appointment Calendar" panel, and a named coordinator avatar.

## Open items

Approved logo file (the logo currently exists only as a photo of the wall sign), permission and patient releases for the photographs, higher-resolution originals, and bios; confirmation of every credential and testimonial reuse (including children's names and ages);
opening hours; whether `info@topofthehillsmiles.com` may be public; re-verify the Google rating; privacy and analytics consent
(events `appointment_cta_click`, `call_ortho_click`, `call_pedo_click`, `patient_forms_click` are wired but inert until
`window.TOTH_CONSENT = true`); re-run Lighthouse after deployment (no performance improvement is claimed yet). On the current
site at least one footer link labelled (215) 220-3778 dials the orthodontics number (`tel:2152203777`); worth telling the
practice. The links here are correct.

## Credits

- Layout, motion layer and moments: **taste-skill** by Leonxlnx, MIT, <https://github.com/leonxlnx/taste-skill>. The kit files in
  `public/assets/` are unmodified; its licence is kept in `public/assets/KIT-LICENSE.txt`.
- The earlier design pass used **unslop** by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0,
  <https://github.com/heydamir/unslop>. `scripts/verify.mjs` encodes parts of its checklist.
- Photographs and Invisalign logos belong to the practice (from its own website); see `docs/IMAGE-SOURCES.md`.
