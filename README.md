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

## Design direction (unslop pass)

This pass applies the **unslop** method (see credit below): audit, set a direction, then nine passes
(spacing, colour, icons, copy, type, layout, details, visuals, motion). Direction was agreed with the owner.

| | |
|---|---|
| Product | A combined pediatric dental and orthodontic practice for parents of infants to teens, and for adults considering braces or Invisalign |
| Feeling (owner's choice) | **Confident and premium**, kept calm and neighbourly |
| World | Chestnut Hill: arched windows, stone and brick, paper and ink |
| Signature | The **arch**: a dental arch and a Chestnut Hill window at once. Logo mark, hero drawing and image frames |
| Moments | The arched-façade hero (its two inner arches are the two specialties) and the real testimonial wall on Reviews |

**Colour and emotion.** Dental sites default to clinical blue and white, which reads cold and generic.
Parents are anxious, children need to feel safe, adults want to look trustworthy and modern, so:

| Colour | Role | Feeling |
|---|---|---|
| Warm stone `#f6f3ed` / `#fcfaf6` | Surfaces | Human, calm, private-practice |
| Deep navy ink `#16293a` | Text, primary button, dark bands | Competence, authority, steadiness |
| Brass `#a67c2e` (`#7a5a1c` as text) | The one accent: current page, the 4.8 figure, the arch keystone | Quiet premium, used rarely |
| Terracotta `#c0703f` / teal `#2f7777` | **Dots only**, marking pediatric / orthodontics | Warmth for children, precision for orthodontics |
| Muted red `#9a2f25` | Emergency callouts only | Urgency |

Contrast is computed, not eyeballed: body text 13.4:1, secondary 6.7:1, muted 4.8:1, brass-as-text 5.7:1, white on navy 14.9:1.
Palette values are a concept proposal, not verified brand colours.

**What changed from the Stitch mock-up:** one accent instead of two (specialties are marked with dots); sentence-case labels
and weights 400 to 500 instead of uppercase tracked 700s; no radial wash, glass blur or gradients; a text-led asymmetric hero
with a coded arch drawing instead of a centred stack with placeholder boxes; editorial lists and ruled steps instead of rows of
identical icon cards; one icon set at one size and stroke; the 4px spacing scale with no inline styles; one easing curve and no
looping motion; the five-star row (which implied 5.0) replaced with the real 4.8 figure.

**Review-mode switch.** Source tags ("From current website", "Pending practice review", "Placeholder, approved asset needed",
"Proposal, not live") are now one calm neutral style. A **Source notes for review** switch (top strip and footer) shows or hides them.
It is ON by default for the owner review so nothing is hidden; switch it off for a clean, launch-style view. Required public
disclosures, such as the dated rating snapshot, stay visible in both views.

## Provenance: everything the owner needs to see

Included from the original site, as requested: all **103 testimonials** (verbatim, `src/data/testimonials.json`), the doctors'
**credentials and affiliations** (ABPD diplomate, AAPD / ADA / AAO and society memberships, research award, OKU), the
"certified Invisalign Teen® provider" statement, the two **Invisalign / Invisalign Teen logos**
(`public/assets/img/original/`), the team roster, parking and transit, form PDFs and the Notice of Privacy Practices.
None is independently verified; each is flagged for the practice to confirm.

**Not carried over from Stitch** because it does not appear on the current site: the invented "Verified Record" quotes,
"Dual Board Leadership", "Invisalign Certified Provider / Platinum", a "HIPAA Compliant" badge, AI-generated doctor and
office photos, an "Open Appointment Calendar" panel, and a named coordinator avatar.

## Open items

Approved logo, photos and bios; confirmation of every credential and testimonial reuse (including children's names and ages);
opening hours; whether `info@topofthehillsmiles.com` may be public; re-verify the Google rating; privacy and analytics consent
(events `appointment_cta_click`, `call_ortho_click`, `call_pedo_click`, `patient_forms_click` are wired but inert until
`window.TOTH_CONSENT = true`); re-run Lighthouse after deployment (no performance improvement is claimed yet). On the current
site at least one footer link labelled (215) 220-3778 dials the orthodontics number (`tel:2152203777`); worth telling the
practice. The links here are correct.

## Credits

The design pass follows **unslop** by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), licensed
[CC BY 4.0](https://github.com/heydamir/unslop/blob/main/LICENSE): <https://github.com/heydamir/unslop>.
The checks in `scripts/verify.mjs` encode its checklist. This repo adapts the method; it does not copy the skill's text.
