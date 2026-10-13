# NESA redesign: audit, sources and launch checklist (internal)

This file is not linked from the site, and `netlify.toml` returns a 404 for it.

## How the audit was done (and its limits)

The current site (niagarasocceracademy.com) **could not be opened directly** from the build environment. The sandbox's network policy blocks the domain, and the server-side fetcher got a DNS failure for both `www.` and the bare domain. [Certain]
Every fact below comes from **search-engine extracts** of the site's own pages (index, staff, keeper-academy, field-player-academy, field-player-training, small-group-training, the Buffalo pages, registration.php, overnight-camp), cross-checked against business listings. Extracts are paraphrased by the search tool, so wording marked "verbatim" still needs checking against the live page.

**Check first: does the live domain resolve?** If the fetcher's DNS failure is real, the current site may be down.

## Facts used, and where they came from

| Fact on the new site | Source |
|---|---|
| Name spelled **Brian Elniski** | Staff page (the brief spells it "Elnisky"; the staff pages, LinkedIn and ZoomInfo all spell it "Elniski") |
| Academy name **Niagara Elite Soccer Academy (NESA)** | Site page titles and registration page |
| Director of Coaching, 30+ years, youth / high school / college / Rochester Rhinos | Staff page bio |
| Playing: club, Lewiston-Porter HS, Plattsburgh State, London City (CPSL) | Staff page bio |
| NSCAA Advanced National Coaching Diploma + **National Goalkeeper Diploma** | Staff page (the brief says "Goalkeeping"; the site says "Goalkeeper") |
| Ages 10 and up | Homepage |
| Goalkeeper training 1-on-1 and small group for ages 12 and up; grouped by age and ability | Keeper Academy page |
| Finishing / First Touch / Skills (Ball Mastery) academies, in small groups and team training; "custom design an academy to your team or club's needs" | Field Player Academy / Training pages |
| (716) 617-1630, "Coach Brian" | Homepage, Field Player Training page |
| 4131 Calkins Rd, Youngstown, NY 14174 | MapQuest / Yelp listings (the homepage mentions Calkins Road) |
| Service area: Youngstown, Niagara Falls, Grand Island, Wheatfield, Wilson, Buffalo | Keeper Academy page |
| info@niagarasocceracademy.com | Project brief (not seen in the search extracts) |
| Full coaching-history list (Irondequoit … Greece United, ODP U16/U17, Western Ontario, Lancers, Lew-Port roles) | **Project brief only.** The search extracts confirmed the Rhinos and a Penfield club; the rest still needs checking against the staff page |
| Testimonial "The improvement in the players who have participated in the training has been outstanding." (Penfield Rangers Soccer Club) | Keeper Academy page, as quoted by the search tool. **Verify the exact wording** |

## Conflicts found on the current site: decide before launch

- [ ] **Name spelling:** Elniski (site) vs Elnisky (brief). The new site uses **Elniski**. To change it everywhere, run `grep -rl Elniski . | xargs sed -i 's/Elniski/Elnisky/g'`.
- [ ] **Penfield club name:** the staff page testimonial says *Penfield Strikers*, the Keeper Academy page says *Penfield Rangers*. Both appear in the experience list (from the brief). The quote is attributed to Rangers, as on the Keeper Academy page.
- [ ] **Camps:** the homepage reportedly says "we don't do soccer camps; we run training sessions", but the keeper pages advertise camps and a youth keeper academy for ages 9–11 with an 8:1 staff ratio. The new site mentions **no camps** and no ratio.
- [ ] **Registration page:** it lists $35 per small-group session, $75 per 1-on-1 session and $195 for a Ball Mastery small group, and it says checks are payable to **"Rochester Elite Soccer Academy"**, which looks like a leftover from the Rochester site. **Prices are deliberately not shown** on the new site until they are confirmed as current. `registration.php` is **not redirected**.
- [ ] **The only real photo of Brian** (supplied with the brief) shows players in **Rochester Elite Soccer** shirts. Fine for a demo; for launch, swap it for a photo from a NESA session if one exists.
- [ ] Testimonials also mention co-trainer "Shawn" and Niagara Pioneer goalkeeper clinics. These are not used; no exact wording was available.

## Media: what is real, what is a slot

**Real (1 image):** `assets/media/brian-coaching-423.*` is the photo supplied with the brief: Brian on an indoor field with players. Grade **A** for subject, but **low resolution (423 × 411)**, so it is shown no wider than about 370 px and never stretched to full width. It appears once (the hero). `og-1200.jpg` is an upscaled crop of it for link previews (soft, so replace it later).

**Not available:** none of the current site's photos or videos could be downloaded (domain blocked; see above). Stock is not used anywhere. Every other image position is a **labelled slot** (`<figure class="slot" data-slot="…">`) with field-line art, so the layout holds up while it is empty.

| Slot (`data-slot`) | Role (one job each) | Intended grade | Source to pull from |
|---|---|---|---|
| `about-01` | Brian portrait | B | Staff page |
| `gk-01` | Goalkeeper training (a clip if one exists) | A | Keeper Academy page |
| `train-1on1` / `train-small` / `train-team` | One image per format in the selector | B | Field Player / Small Group pages |
| `media-feature` | Main "Training in motion" clip or photo | A | Strongest current-site footage |
| `media-gk`, `media-players`, `media-team`, `media-finishing` | Gallery support | B/C | Keeper / Field Player pages |

**To fill a slot:** export WebP at about 2× the display size, then add inside the figure:
`<img src="assets/media/FILE.webp" alt="WRITE A REAL DESCRIPTION" loading="lazy" decoding="async">`
(the slot CSS already covers it edge to edge).
**For a video tile:** add `data-video="assets/media/FILE.mp4"` to the `.mtile` figure, plus a poster `<img>`. The "Watch" button and the lightbox switch on automatically. Encode muted H.264 MP4 and keep it under ~8 MB.

- [ ] **Media rights / parental consent** for every photo or clip showing minors, including the hero photo (identifiable players).

## Other launch items

- [ ] Confirm `info@niagarasocceracademy.com` is monitored (it came from the brief, not the site).
- [ ] Social links: none were confirmed as linked from the current site, so none are shown. (A Pinterest profile "niagaraelite" exists. The Facebook "Niagara Soccer Skills Academy" page may be a different organisation.)
- [ ] Forms: the inquiry form uses Netlify Forms (`data-netlify`). Set the notification email in Netlify.
- [ ] SEO: the old Youngstown / Buffalo landing pages are 301-redirected to homepage sections in `netlify.toml`. They probably carry local search traffic, so consider rebuilding them as real pages in this design instead.
- [ ] The privacy note is a short draft and needs NESA's review.
