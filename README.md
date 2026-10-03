# Uni-Tech — websites that feel like you

A static website focused on website design for independent businesses in Kent and East Sussex. No package install or build step is needed. Serve the folder with a local static server or publish through the existing hosting workflow. The existing `CNAME` is unchanged.

## Pages

- `index.html`: website-design homepage, illustrative concepts, process, approach and FAQs.
- `websites.html`: interactive design playground.
- `services.html`: new website design, redesign and website care.
- `contact.html`: website enquiry form, including a visitor’s playground brief when supplied.
- `thank-you.html` and `404.html`: confirmation and missing-page views.

`css/site.css` provides shared foundations; `css/design.css` contains the shared visual direction; `css/home.css` gives the homepage its full-width photographic hero, layered concept previews and larger image-led sections. `js/site.js` handles navigation and contact submission; `js/design.js` handles the playground. Earlier assets and unused scripts remain in the repository but are not loaded by these pages.

## Design playground

Visitors can choose a studio, barber, café or trades concept, customise their business name and headline, pick one of four palettes, change typography and layout, toggle a services section and preview a phone-sized layout. These are illustrative concepts, not customer projects or a self-service publishing platform.

Changes save locally in the visitor’s browser when storage is available. Opening a direct concept link starts that concept fresh; opening the playground without a concept restores the saved design. Reset restores the defaults. A text design brief can be downloaded. “Let’s build this” includes the current design in the contact URL, where the choices appear in a read-only field and are submitted with the enquiry. Inputs are bounded and inserted as text. No design is sent to Uni-Tech until the visitor submits the contact form.

## Contact

The existing `enquires@uni-tech.co.uk` address and `https://formspree.io/f/xykdypnr` endpoint are preserved. The form supports normal HTML submission without JavaScript; enhanced submission validates fields, prevents duplicates, preserves entries after errors and redirects on confirmed success. The form informs visitors that Formspree handles their enquiry. Real inbox delivery must be checked with a genuine enquiry after publication.

## Assets

Photography is saved locally in `images/design/` from Unsplash:

- Interior: https://images.unsplash.com/photo-1600210492486-724fe5c67fb0
- Café: https://images.unsplash.com/photo-1442512595331-e89e73853f31
- Barber hero: https://images.unsplash.com/photo-1503951914875-452162b0f3f1
- Barber detail: https://images.unsplash.com/photo-1599351431202-1e0f0137899a

These images are design-preview imagery, not Uni-Tech client work. DM Sans and Manrope are self-hosted in `font/design/`, with their SIL Open Font License files, to avoid a remote font stylesheet delaying the site. The illustrative compositions and page design are original; Squarespace was the visual reference.

## Verification

Browser checks cover all six pages at 1440, 1024, 768, 390 and 320 pixels, including page overflow and primary headings. Playground checks cover editing, concepts, palette, type, layout, services, screen size, persistence, reset, download and contact handoff. Contact success and failure are checked using intercepted responses; no automated message is sent to the live endpoint. Mobile navigation and the no-JavaScript fallback are checked separately.

This redesign is local. It has not been committed, pushed or deployed.
