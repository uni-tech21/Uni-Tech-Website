# Uni-Tech / Good tech. Great things.

A responsive static website for Uni-Tech, serving homes and small businesses in Kent and East Sussex. Open `index.html` locally or use any static web server. No build step or package installation is required.

## Design

The new direction combines oversized editorial typography, warm off-white, electric lime and lilac, original device illustrations, and a large typographic footer. It carries through the homepage, services, web design, contact, confirmation and 404 pages.

The homepage sculpture is an original, locally generated torus knot rendered using native WebGL. It responds gently to the pointer and changes colour when visitors explore Repair, Create and Connect. Each mode links to the appropriate service. It has a pause/play control, starts still for reduced-motion preferences, stops when offscreen or in a background tab, and falls back to an SVG illustration when WebGL is unavailable. No 3D library or downloaded model is required.

The design playground includes Studio, Trades and Café concepts, each with its own typography, copy and CSS illustration. Colour controls work independently; the web design page also offers desktop/mobile previews. All concepts are explicitly identified as illustrative work, not customer projects.

## Files

- `index.html`: hero, service highlights, service finder, design concepts, about, process and FAQs.
- `services.html`: full service directory, audience filters and enquiry links.
- `websites.html`: website services and the interactive design playground.
- `contact.html`: enquiry form with service preselection.
- `thank-you.html`: enquiry confirmation.
- `404.html`: branded missing-page fallback.
- `css/site.css`: existing content components and responsive foundations.
- `css/next.css`: new art direction, illustrations and responsive refinements.
- `js/site.js`: navigation, finder, palette/device controls, filters and form handling.
- `js/next.js`: scene renderer, scene modes, design concepts and progressive enhancements.
- `images/favicon.svg`: updated brand mark.

Navigation and footer markup are shared by convention, rather than generated; update them consistently across pages. Legacy styles, scripts and images remain in the repository but are not loaded by the redesigned pages.

## Contact and content

The existing `enquires@uni-tech.co.uk` spelling and Formspree endpoint `https://formspree.io/f/xykdypnr` are preserved. The contact form works as a regular POST without JavaScript. With JavaScript it validates, indicates progress, redirects on success and preserves entries after errors. A timeout may still mean a message was received, so the error copy avoids claiming definite non-delivery.

The malformed repairs option in the original form has been corrected, restoring repairs preselection. No prices, reviews, qualifications or turnaround guarantees have been invented.

Fonts load from Google Fonts with system fallbacks. Essential navigation, links, FAQs and form access work without JavaScript. JavaScript-only controls are hidden in that case.

## Verification

Browser checks cover all six pages at 1440, 1024, 768, 390 and 320 pixels: no horizontal page overflow, one primary heading, and local asset/link/anchor integrity. Interaction checks cover the scene modes and motion controls, all finder routes, concept/palette/device switches, audience filters, mobile menu and Escape focus, keyboard FAQs, reduced motion, and no-JavaScript navigation.

Contact checks cover all six preselected services, required-field validation and intercepted success/failure responses. No test enquiry is sent to Formspree. Live inbox delivery requires a genuine enquiry after publication.

## Publishing

The original `CNAME` and hosting setup are retained. Publish using the repository's existing workflow when ready. This local redesign does not commit, push or deploy the website.
