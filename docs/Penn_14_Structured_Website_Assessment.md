# Penn_14 — Structured Website Assessment

> **Client:** Top of the Hill Orthodontics & Pediatric Dentistry  
> **Location:** Philadelphia, Pennsylvania, USA  
> **Assessment date:** 12 November 2026  
> **Source:** Penn_14.docx  
> **Purpose:** Source-grounded requirements for a high-conversion website redesign and Google Stitch design handoff.

## 1. Identity and verified links

| Field | Value | Status |
|---|---|---|
| Business | Top of the Hill Orthodontics & Pediatric Dentistry | Assessment |
| Category | Paediatric dentistry and orthodontics | Source/current website |
| City | Philadelphia, Pennsylvania | Source/current website |
| Original site | https://www.topofthehillsmiles.com/ | Verified publicly, 13 Nov 2026 |
| **Existing client booking link — preserve** | **https://www.topofthehillsmiles.com/appointment-request** | **Verified publicly, 13 Nov 2026** |
| Booking type | Appointment request; coordinator confirms later, **not** live instant booking | Verified publicly |
| Orthodontics phone | (215) 220-3777 / `tel:+12152203777` | Verified publicly |
| Paediatric dentistry phone | (215) 220-3778 / `tel:+12152203778` | Verified publicly |
| Address | 10 W Gravers Lane, Philadelphia, PA 19118 | Verified publicly |
| Listed email | info@topofthehillsmiles.com | In assessment; not found in assessed crawled pages |
| Google Business Profile | 4.8 / 147 reviews | Assessment snapshot; do not imply live values |
| Named specialists | Dr. Abbey Sullivan Orozco (paediatric dentistry); Dr. Jacob Orozco (orthodontics) | Current site |
| Suggested proof-of-concept URL | https://topofthehillsmiles.oculeusltd.com | Proposal, not confirmed deployed |
| Assessment confidence | High | Source |
| Apollo email validation | Validated | Source, independent verification not performed |

### Booking-link preservation policy — mandatory

1. Use **https://www.topofthehillsmiles.com/appointment-request** as the canonical destination for every client-facing `Book Online`, `Request an Appointment` or equivalent CTA in the Stitch design and initial prototype.
2. This is a **request form**, not a live bookable calendar. Never describe it as guaranteed real-time booking or direct time-slot selection.
3. The assessment separately recommends **https://cal.com/oculeus-ltd/us-gmt** as a *proposed external scheduler*. This is not the client's established booking URL and must **not** silently replace the original. Use it only after the practice authorises a new integration, and verify practice ownership, patient privacy and actual scheduling functionality.
4. Preserve the two speciality-specific telephone links and route medical emergencies to an appropriate call-first message, not an unmonitored form.

## 2. Business context and positioning

- **Primary audiences:** parents/guardians seeking children’s dental care; parents arranging orthodontic assessment; teenagers and adults considering orthodontic treatment.
- **Core service lines evidenced on current website:** paediatric dentistry, orthodontic treatments, early orthodontic treatment, adult orthodontics, Invisalign® clear aligners, orthodontic and paediatric emergency information.
- **Current homepage H1 (preserve):** “Welcome to Top of The Hill — Dentistry for Children & Orthodontics for All Ages”.
- **Current trust assets:** named clinicians, team pages, office tour, testimonials, new-patient information and patient forms.
- **Business goal (proposed):** increase qualified appointment requests, simplify navigation by audience, reduce contact friction and reinforce trust.

## 3. Observed business and conversion findings

| Dimension | Evidence | Implication | Status |
|---|---|---|---|
| Booking CTA | `Book Online` opens `/appointment-request` | Visitors cannot select a confirmed slot | Verified |
| Booking fields | Name, email, phone, appointment type, comment; type options Ortho, Pedo, Both | Potential friction; don't remove required operational fields without approval | Verified |
| Form fulfilment | Coordinator contacts patient to confirm | Requires staff follow-up | Verified |
| Contact routes | Orthodontics and paediatric dentistry have separate telephone numbers | Both must stay clear and clickable | Verified |
| Public email | Listed in assessment, not observed on crawled pages | Confirm before publishing | Assessment |
| Homepage forms | Two forms observed, five and seven customer fields | Opportunity to rationalise design | Assessment |
| Missed calls / after-hours | No capture tool detected in captured HTML | Investigate operational need | Not verified live |
| Speed-to-lead | No SMS/chat widget observed; no test form submission | Response speed unknown | Not measured |
| Review request automation | Not detected in HTML | Opportunity only, not proof of absence | Not verified live |
| Analytics | `gtag` scripts observed | Conversion-event configuration unverified | Assessment |
| Financial loss | No quantified estimate | Do not fabricate revenue impact | Not estimated |

**Pitch insight from source:** The site says “Book Online” but currently presents an appointment-request form instead of a selectable calendar. A redesigned experience should clarify what happens next, while retaining the genuine practice booking pathway until a clinician-approved replacement is deployed.

## 4. Technical assessment

### 4.1 Reported local Lighthouse results

| Metric | Value | Interpretation |
|---|---:|---|
| Mobile performance | 76/100 | Improvement opportunity |
| Desktop performance | 96/100 | Strong lab baseline |
| Mobile Largest Contentful Paint | 5.6 s | Main improvement priority |
| Mobile Total Blocking Time | 34 ms | Low in this run |
| Mobile Cumulative Layout Shift | 0.0 | Good in this run |
| Lighthouse SEO | 92/100 | Baseline, not comprehensive ranking audit |

**Measurement limitation:** Local Lighthouse 13.6.0 on Chrome 156; not field data or official PageSpeed Insights. The keyless PSI API returned HTTP 429. INP not available, mobile tap-target audit not included. Do not label these as Core Web Vitals field measurements.

### 4.2 Technical observations

- HTTP listing redirects/uses HTTPS for inspected site; titles and metadata present.
- Apache, Google Analytics `gtag`, custom `sc_form` mailer observed in assessment.
- No schema types observed in captured HTML; this does not prove absence on every page or from other rendering modes.
- No live scheduler, Zocdoc or Dental Symphony detected in checked booking path.
- Tap target dimensions not measured.
- GTM event strategy, call tracking and detailed attribution not validated.
- Responsive design should prioritise fast hero loading, image dimensions, compressed imagery, limited scripts and accessible touch targets.

## 5. Website information architecture — recommended

### Main navigation

1. **Home** `/`
2. **Pediatric Dentistry** `/pediatric-dentistry`
3. **Orthodontics** `/orthodontics`
4. **New Patients** `/new-patients`
5. **About & Doctors** `/about`
6. **Reviews & Office Tour** `/reviews`
7. **Contact & Appointments** `/contact`

### Additional subpage content / navigation

- Pediatric: first visit, baby dental care, thumb sucking, sports dentistry, pediatric dental emergencies.
- Orthodontics: early treatment, adult treatment, treatment options, Invisalign®, life with braces, appliance instructions, orthodontic emergency care.
- New patients: first pediatric visit, first orthodontic visit, new-patient forms, financial information; link original content where appropriate.
- About: Dr. Abbey Sullivan Orozco, Dr. Jacob Orozco, team, what sets the practice apart, office tour.
- FAQs: pediatric and orthodontic topics; only clinically vetted content.
- Location: address, two phone numbers, maps and practical visit information; do not invent opening hours or parking details.

The assessment's minimum PoC pages are Home, Services, Service Areas, Reviews/Trust and Quote/Book. The enhanced architecture above separates specialties to better serve distinct visitors; it is a **design recommendation**, not a claim that the source specified these exact routes.

## 6. Page-level requirements

### 6.1 Home

- Preserve source H1: “Welcome to Top of The Hill — Dentistry for Children & Orthodontics for All Ages”.
- Hero: confident clinician-led family-friendly visual direction, honest copy, primary `Request an Appointment` CTA (or `Book Online` with visible request-form explanation), secondary speciality-specific call buttons.
- Two prominent service paths: Pediatric Dentistry / Orthodontics.
- Doctor introductions, new-patient steps, office-tour preview, carefully attributed review snapshot, helpful FAQ and location/appointment footer.
- CTA helper: “Submit an appointment request. Our scheduling coordinator will contact you to confirm.”

### 6.2 Pediatric Dentistry

- Friendly, parent-facing benefits and age-appropriate first-visit guidance based on approved content.
- Cards linking to baby dental care, preventive visits, thumb-sucking support, sports dentistry and paediatric emergencies.
- Dr. Abbey's profile and linked first-visit guidance.
- Avoid invented medical outcomes or treatment claims.

### 6.3 Orthodontics

- Children, teens, adults; early orthodontic evaluation, braces and Invisalign® where documented.
- Dr. Jacob's profile and clear treatment-path cards.
- No claims of costs, speed of treatment or guaranteed outcomes without practice-approved facts.

### 6.4 New Patients

- Two explicit patient journeys (Pediatric vs Orthodontic).
- Steps: choose service → submit request → office confirms details → prepare with linked patient forms.
- Link to real current forms and policy pages; don't fabricate insurance networks or financing promises.

### 6.5 About / Doctors / Trust

- Real professional names with biographies pending content validation.
- Office tour and team asset slots; no fictitious awards, affiliations, certifications or staff photos.
- Review snapshot labelled “Assessment snapshot: Google 4.8/5 based on 147 reviews (12 Nov 2026)” pending refreshed verification.
- No invented patient quotations or transformations.

### 6.6 Contact / Appointment Request

- State explicitly this is not an instant confirmed appointment.
- Primary CTA destination: **https://www.topofthehillsmiles.com/appointment-request**.
- Orthodontic phone `tel:+12152203777`; paediatric phone `tel:+12152203778`.
- Office address: 10 W Gravers Lane, Philadelphia, PA 19118.
- Only display email if approved by client.
- Avoid collecting health information in unapproved demo forms.

## 7. UX and visual direction

- **Brand mood:** elegant, welcoming, established, professional; serious enough for clinical confidence, warm enough for parents and children.
- **Typography:** Vollkorn for editorial/hero serif hierarchy (source recommendation); accessible modern sans-serif for forms, menus and body copy.
- **Colours:** propose warm ivory, deep navy/charcoal, muted teal and restrained sage or apricot; **concept only**, no verified brand hex codes supplied.
- **Layout:** generous white space, editorial image blocks, gentle curves and subtle line illustrations; avoid childish clip art, clutter and generic medical-stock overload.
- **Responsive:** start with mobile layouts; accessible navigation, one-tap calling, high-contrast CTAs, labelled input states and non-obstructive mobile bottom CTA.
- **Images:** use approved office/team assets; otherwise clearly mark representative placeholders. Avoid synthetic images implying they depict actual patients, practitioners or the office.

## 8. Conversion and integration requirements

### Required at launch of prototype

- All `Book Online` or `Request an Appointment` buttons use the **actual client booking page**.
- Explain that request submission is followed by staff confirmation.
- Both `tel:` links must be available from desktop and mobile.
- Preserve links to patient forms and emergency guidance.
- Never show fabricated scheduler availability or make the demo appear linked to the clinic's records.

### Optional future integration — requires approval

- Assess and integrate a clinic-controlled real-time scheduler with genuinely selectable slots, staff controls and the appropriate privacy/security arrangements.
- The document's example `https://cal.com/oculeus-ltd/us-gmt` is a **proposed Oculeus placeholder**, not an established clinic booking system; do not publish it as the clinic's booking CTA.
- After-hours missed-call capture, missed-call text-back, review-request workflows and conversion event tracking are *proposals*, not observed capabilities.
- Healthcare-related messaging must undergo practice/legal/privacy review before handling patient data.

## 9. Automation opportunity estimates — source suggestions, not quotes

| Proposed workstream | Setup effort | Suggested project price | Notes |
|---|---:|---:|---|
| Live scheduling integration | 10–20 h | USD 2,000–4,000 | Requires practice approval, booking ownership and data security review |
| Missed-call/after-hours capture | 6–15 h | USD 1,200–3,000 | Not currently confirmed in use |
| Review-request automation | 6–15 h | USD 1,200–3,000 | Requires consent/policy review |

## 10. Prioritised actions

1. **P0 — Preserve genuine booking and phone links:** no broken patient routing or substitution with a third-party agency calendar.
2. **P0 — Clarify booking expectations:** distinguish appointment requests from confirmed calendar bookings.
3. **P1 — Simplify journeys by specialty:** parent/child vs orthodontic visitors.
4. **P1 — Improve mobile LCP:** audit hero image, fonts and render-blocking assets.
5. **P1 — Strengthen contact visibility and provenance:** verify email, real clinician imagery, review attribution.
6. **P2 — Add relevant schema:** `Dentist`/`MedicalBusiness`, office location and applicable metadata only where verified and valid.
7. **P2 — Measure conversion:** CTA clicks, phone taps and outbound appointment-link clicks; respect privacy and consent.
8. **P3 — Evaluate optional automation:** only after consultation, technical validation and approval.

## 11. Acceptance criteria

- [ ] Original appointment link present **unaltered** in all booking CTAs.
- [ ] No mention of real-time slots or confirmed booking unless a real owned integration exists.
- [ ] Both correct specialty telephone numbers work.
- [ ] Original homepage H1 retained.
- [ ] Dedicated Pediatric, Orthodontic, New Patients, About, Trust and Contact experiences.
- [ ] Mobile header and CTA behaviour works across sizes.
- [ ] Accessible labels, keyboard support, alt text and contrast.
- [ ] Review data labelled as historical unless reverified.
- [ ] No invented patient stories, certifications, practice photos, prices or clinical promises.
- [ ] No sensitive patient information captured by demo forms.
- [ ] Mobile performance retested after implementation; target improvements are not presented as achieved.
- [ ] Footer includes verified address and specialty phones.

## 12. Open dependencies

- Obtain practice-approved logo, palette, photos, biographies, policies, accurate hours and any current review exports.
- Confirm permission to use publicly visible brand assets and review snippets in a prospect prototype.
- Verify email visibility, scheduler ownership, patient data handling and any integrations before publishing.
- Confirm whether the example Cal.com URL is purely agency demo infrastructure; treat it as **not client-owned** until verified.

## 13. Source and verification notes

- Primary source: user-supplied `Penn_14.docx` (reviewed 12 November 2026).
- Current public homepage checked 13 November 2026: https://www.topofthehillsmiles.com/
- Current public appointment-request page checked 13 November 2026: https://www.topofthehillsmiles.com/appointment-request
- Original document conflicts with preservation requirement by proposing an Oculeus Cal.com replacement. This structured assessment **preserves both facts** and explicitly gives the real client booking URL priority for the mockup.
