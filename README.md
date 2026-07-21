# traceytrahan.com — Portfolio Site

## File Structure

```
/
├── index.html                          ← Homepage (single self-contained file: HTML/CSS/JS inline)
├── TraceyTrahanHeadshot.png            ← Headshot used in the Hero section
└── projects/
    ├── time-waste-calculator.html      ← Standalone tool, self-contained
    ├── sop-showcase.html               ← Standalone tool, self-contained
    ├── onboarding-tracker.html         ← Standalone tool, self-contained
    └── time-waste-calculator.jsx       ← Original React source the calculator was ported from (not deployed)
```

Each HTML file is fully self-contained (styles and scripts inline, no shared `style.css`/`main.js`,
no build step) so any of them can be dropped in or embedded via `<iframe>` independently.

Design system: deep purple background (`#1D1145`), card surface `#2B1C5E`, Trapper Keeper green
accent (`#0DB4B9`), Modern Pink Backpack secondary (`#E76D89`), Pink Boot tertiary (`#F2A1A1`).
Fonts: Fraunces (headlines), IBM Plex Mono (numbers/labels), Work Sans (body) — loaded via Google
Fonts `<link>` in each file.

---

## Deploying to Cloudflare Pages

1. Push this entire folder to a GitHub repository
2. Log in to Cloudflare → Pages → Create a project
3. Connect your GitHub repo
4. Build settings: leave blank (it's static HTML — no build step needed)
5. Output directory: `/` (root)
6. Deploy — then connect your `traceytrahan.com` domain in the Pages settings

### Routing the tool pages under `/tools/`

`index.html` links to the three tools at `/tools/time-waste-calculator/`, `/tools/sop-showcase/`,
and `/tools/onboarding-tracker/`. Either:

- Move/rename the files in `projects/` into a top-level `tools/` folder with those exact names
  (e.g. `tools/time-waste-calculator/index.html`) before deploying, or
- Add redirects/rewrites in Cloudflare Pages (`_redirects` file) from those paths to the actual
  file locations.

---

## Placeholders still to replace

- `index.html` — the LinkedIn link in the footer: search for `LINKEDIN_URL_PLACEHOLDER`.
- `index.html` — the "Book a Free Audit Call" buttons scroll to the on-page Calendly section
  (`#booking`), which is already wired to `https://calendly.com/tnjones12`.
- `projects/time-waste-calculator.html`, `sop-showcase.html`, `onboarding-tracker.html` — each has
  its own "Book a Free Audit Call" button linking to `BOOKING_LINK_PLACEHOLDER`; update once these
  are deployed under `/tools/`.

---

## Customization Checklist

- [ ] Replace `LINKEDIN_URL_PLACEHOLDER` in `index.html` with the real LinkedIn profile URL
- [ ] Replace `BOOKING_LINK_PLACEHOLDER` in the three tool pages (or point them at `/#booking`)
- [ ] Move/redirect the `projects/*.html` tool pages to resolve at `/tools/...`
- [ ] Set up Cloudflare Email Routing so `tracey@traceytrahan.com` forwards to your Gmail
