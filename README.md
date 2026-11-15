# Top of the Hill Orthodontics & Pediatric Dentistry — front-end PoC

Static, dependency-free front end (**HTML, CSS, vanilla JavaScript**) built from the Google Stitch design
("Chestnut Hill Editorial Clinical") and the *Penn_14 Structured Website Assessment*
(`docs/`). Philadelphia, PA.

> Proof of concept for client review — **not** the practice's live website, and not connected to any
> practice system.

## Run it

```bash
npm run serve      # http://localhost:4173  (Node >= 18, no install step)
npm run build      # regenerate public/ from src/
npm run verify     # build + run acceptance checks (exit 1 on failure)
```

`public/` is committed, so it can also be hosted as-is on any static host.

## Pages

| Page | File |
|---|---|
| Home | `public/index.html` |
| Pediatric Dentistry | `public/pediatric-dentistry.html` |
| Orthodontics | `public/orthodontics.html` |
| New Patients | `public/new-patients.html` |
| Meet Our Doctors (About) | `public/about.html` |
| Reviews & Office Tour | `public/reviews.html` |
| Contact & Appointments | `public/contact.html` |
| FAQs (recommended enhancement) | `public/faqs.html` |

Edit `src/pages/*.html`, `src/partials/*.html`, `src/data/testimonials.json`, then `npm run build`.
`public/assets/css/styles.css` and `public/assets/js/main.js` are edited directly.
Facts that must never drift (booking URL, both phone numbers, address) live **once** in
`scripts/build.mjs` (`CONST`).

## Non-negotiables (enforced by `npm run verify`)

- Every "Request an Appointment" CTA → exactly `https://www.topofthehillsmiles.com/appointment-request`.
- No `cal.com` / Oculeus scheduler anywhere; it appears only as a labelled, non-linked *proposal* note on Contact.
- Copy says "appointment request … coordinator will contact you to confirm" — never instant or confirmed booking.
- Two separate `tel:` links: Orthodontics `+12152203777`, Pediatric `+12152203778` (label ↔ number checked).
- Home H1 preserved verbatim; one `h1` per page; alt text; internal links and anchors resolve.
- No unapproved email shown; no invented hours, prices, or patient data collection.

## Provenance: everything the owner needs to see, labelled

Every non-obvious item carries a tag so the business owner can see what came from where:

| Tag | Meaning |
|---|---|
| **From current website** | Taken from topofthehillsmiles.com (read 15 Nov 2026) |
| **Assessment snapshot** | Google 4.8 / 147 reviews, 12 Nov 2026 — not live |
| **Pending clinical / practice review** | Needs sign-off before launch |
| **Placeholder — approved asset needed** | Stands in for real photography |
| **Proposal — not live** | Idea from the assessment, not implemented |

Included from the original site, as requested: all **103 testimonials** (verbatim, `src/data/testimonials.json`,
including unattributed and first-name-only entries), the doctors' **credentials and affiliations**
(ABPD diplomate, AAPD/ADA/AAO and society memberships, research award, OKU), the "certified Invisalign Teen®
provider" statement, the two **Invisalign / Invisalign Teen logos** (`public/assets/img/original/`), the
team roster, parking/transit, form PDFs and the Notice of Privacy Practices.
None of these are independently verified — they are flagged for the practice to confirm.

**Not carried over from the Stitch mock-up** because they do not appear on the current site:
the three invented "Verified Record" quotes, "Dual Board Leadership", "Invisalign Certified Provider /
Platinum", "HIPAA Compliant Practice" badge, AI-generated doctor/office photos, an
"Open Appointment Calendar" panel and a named "scheduling coordinator" avatar.

## Adjustments to the Stitch navbar

- Removed the fake coordinator avatar and the "Requests confirmed by phone" under the CTA (the form says a
  coordinator will *contact* you; channel isn't specified).
- Top contact strip scrolls away; only the primary header is sticky (the mock-up fixed both, eating ~110 px).
- Nav labels fit on one line at 1140 px+ (the mock-up wrapped "Meet Our Doctors"); below that, a labelled
  **Menu** button opens a full-screen menu with both call buttons and the booking CTA.
- Added skip link, `aria-current`, focus trap/Esc in the menu, 44 px targets, and a mobile bottom bar
  (Request Appointment + Call → "which office?" sheet) that hides when the footer is in view.
- Replaced Tailwind CDN + Material Symbols font with plain CSS and inline SVG icons (mobile LCP concern in the assessment).

## Open items

Approved logo, photos and bios; confirmation of every credential/testimonial reuse (including minors' names/ages);
opening hours; whether `info@topofthehillsmiles.com` may be public; re-verify Google rating; privacy/analytics
consent (event hooks `appointment_cta_click`, `call_ortho_click`, `call_pedo_click`, `patient_forms_click`
are wired but inert until `window.TOTH_CONSENT = true`); re-run Lighthouse after deployment (no performance
improvement is claimed yet). Note: on the current site, at least one footer link labelled (215) 220-3778 actually dials the orthodontics number (tel:2152203777) — worth telling the practice; the links here are correct.
