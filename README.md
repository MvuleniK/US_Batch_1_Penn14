# Top of the Hill Orthodontics & Pediatric Dentistry — front-end PoC

Static, dependency-free front end (**HTML, CSS, vanilla JavaScript**) built from the Google Stitch design
and the *Penn_14 Structured Website Assessment* (`docs/`). Chestnut Hill, Philadelphia, PA.

> Proof of concept for client review. It is **not** the practice's live website and is not connected to any
> practice system.

## Run it

```bash
npm run serve      # http://localhost:4173  (Node >= 18, no install step)
npm run build      # regenerate public/ from src/
npm run verify     # build + acceptance checks + design lint (exit 1 on failure)
```

`public/` is committed, so it can also be hosted as-is on any static host.

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

## Pages

Home · Pediatric Dentistry · Orthodontics · New Patients · Meet Our Doctors (`about.html`) ·
Reviews & Office Tour · Contact & Appointments · FAQs — each in `public/*.html`.

Edit `src/pages/*.html`, `src/partials/*.html`, `src/data/testimonials.json`, then `npm run build`.
`public/assets/css/styles.css` and `public/assets/js/main.js` are edited directly.
Facts that must never drift (booking URL, both phone numbers, address) live **once** in `scripts/build.mjs`.

## Non-negotiables (enforced by `npm run verify`)

- Every "Request an Appointment" CTA → exactly `https://www.topofthehillsmiles.com/appointment-request`.
- No `cal.com` / Oculeus scheduler anywhere. It appears only as a *proposal* note, hidden in clean view.
- Copy says "appointment request … coordinator will contact you to confirm", never instant or confirmed booking.
- Two separate `tel:` links, Orthodontics `+12152203777` and Pediatric `+12152203778`; label and number are checked.
- Home H1 preserved verbatim; one `h1` per page; alt text; internal links and anchors resolve.
- No unapproved email, invented hours or prices, or patient-data collection.

## Design direction

A clean, clinical medical site in **the practice's own colours**, using its own photography. The first pass used a warm
cream, terracotta and brass palette that came from the Stitch mock-up's concept colours, not from the practice, and it read
as boutique rather than medical. It was replaced after the owner questioned it. The real logo (a navy-teal tooth with a
leaf-green hill, pale sky and a sun) and the green treatment rooms give a better, verifiable palette.

| | |
|---|---|
| Feeling | Clean, trustworthy, clinical, still friendly for children |
| Colour source | Sampled from the practice's logo and treatment rooms (confirm exact brand values with the practice) |
| Signature | The hill (an arch) with a sun dot, echoing the logo; used as the logo mark |
| Moments | The real photo of the two doctors in the hero, and the real testimonial wall on Reviews |
| Type | One family, Source Sans 3 (400 to 600). The serif was dropped: it read as editorial, and one family loads faster |

| Colour | Value | Role |
|---|---|---|
| Cool white and pale green-grey | `#ffffff` / `#f3f7f6` | Surfaces, a clinical feel |
| Navy-teal ink | `#12303b` | Text and dark bands (the logo wordmark colour) |
| Leaf green | `#1f7a33` | The one accent: primary buttons, current page, key figure (the logo's green) |
| Sun amber / teal | `#b97b08` / `#1b7f87` | Dots only, marking pediatric / orthodontics |
| Muted red | `#9a2f25` | Emergency callouts only |

Contrast is computed, not eyeballed: body text 12.9:1, secondary 7.3:1, muted 5.3:1, green-as-text 6.7:1, white on the green button 5.4:1.

**Photography.** Every image is one of the practice's own photographs from topofthehillsmiles.com (doctors, treatment rooms,
building entrance, sign); no stock or AI images. They are processed to WebP with metadata stripped, with alt text and the
original URL recorded in `src/data/images.json` and `docs/IMAGE-SOURCES.md`. Permission, patient releases and higher-resolution
originals are open items (the current site's files are small, so they look soft on large screens).

The design pass follows the **unslop** method (see Credits): one accent, sentence-case labels, weights 400 to 600, the 4px
spacing scale with no inline styles, hairline borders, no gradients, glass or looping motion, one icon set at one size and stroke.

**Review-mode switch.** Source tags ("From current website", "Pending practice review", "Proposal, not live", and a small
"From practice site, permission pending" tag on every photo) are one calm neutral style. A **Source notes** switch (top strip
and footer) shows or hides them. It is ON by default for the owner review so nothing is hidden; switch it off for a clean,
launch-style view. Required public disclosures, such as the dated rating snapshot, stay visible in both views.

## Provenance: everything the owner needs to see

Included from the original site, as requested: all **103 testimonials** (verbatim, `src/data/testimonials.json`), the doctors'
**credentials and affiliations** (ABPD diplomate, AAPD / ADA / AAO and society memberships, research award, OKU), the
"certified Invisalign Teen® provider" statement, the two **Invisalign / Invisalign Teen logos**
(`public/assets/img/original/`), the team roster, parking and transit, form PDFs and the Notice of Privacy Practices.
None is independently verified; each is flagged for the practice to confirm.

**Not carried over from Stitch** because it does not appear on the current site: the invented "Verified Record" quotes,
"Dual Board Leadership", "Invisalign Certified Provider / Platinum", a "HIPAA Compliant" badge, AI-generated doctor and
office photos (replaced by the practice's real photographs), an "Open Appointment Calendar" panel, and a named coordinator avatar.

## Open items

Approved logo file (the logo currently exists only as a photo of the wall sign), permission and patient releases for the photographs, higher-resolution originals, and bios; confirmation of every credential and testimonial reuse (including children's names and ages);
opening hours; whether `info@topofthehillsmiles.com` may be public; re-verify the Google rating; privacy and analytics consent
(events `appointment_cta_click`, `call_ortho_click`, `call_pedo_click`, `patient_forms_click` are wired but inert until
`window.TOTH_CONSENT = true`); re-run Lighthouse after deployment (no performance improvement is claimed yet). On the current
site at least one footer link labelled (215) 220-3778 dials the orthodontics number (`tel:2152203777`); worth telling the
practice. The links here are correct.

## Credits

The design pass follows **unslop** by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), licensed
[CC BY 4.0](https://github.com/heydamir/unslop/blob/main/LICENSE): <https://github.com/heydamir/unslop>.
The checks in `scripts/verify.mjs` encode its checklist, plus image checks (file exists, sized, alt text). This repo adapts the method; it does not copy the skill's text.
