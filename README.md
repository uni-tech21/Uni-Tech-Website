# Uni-Tech website

A responsive, static website for Uni-Tech. Open `index.html` to view it locally, or serve this folder with any static web server. No package install or build process is needed.

## Pages

- `index.html`: home, service finder, interactive design concept, about, process and FAQs.
- `services.html`: detailed services, audience filters and enquiry links.
- `websites.html`: web design information with palette and desktop/mobile preview controls.
- `contact.html`: enquiry form with service preselection.
- `thank-you.html`: successful enquiry confirmation.
- `404.html`: missing-page fallback.

## Editing

The pages contain their own content and shared navigation/footer markup. Update shared text consistently across all pages. Styles are in `css/site.css`; interactive behaviour is in `js/site.js`. Older assets and scripts are retained in the repository but are not loaded by the new pages. The new design and illustrations are original HTML/CSS/SVG; the former template is not used.

The `enquires@uni-tech.co.uk` spelling is deliberately preserved from the existing website. The contact form keeps the existing Formspree endpoint, `https://formspree.io/f/xykdypnr`. Do not replace either without checking the intended account. The form works as a regular POST without JavaScript; with JavaScript it shows submission progress, preserves entered details after errors, and redirects after success. A request that times out may still have been received; the error message therefore says delivery could not be confirmed.

Fonts load from Google Fonts, with local system fallbacks. The design playground is clearly labelled as a concept, not client work. No testimonials, prices, qualifications or turnaround guarantees have been invented.

## Verification

Checked all six pages at 1440, 768, 390 and 320 pixels wide. Tested all service-finder options, palette switching, desktop/mobile preview, filters, menu and Escape behaviour, FAQ expansion, contact preselection, local asset/link existence and JavaScript errors. Form success and failure were tested with intercepted, simulated responses; no test enquiry was sent. Actual inbox delivery still needs to be checked with a genuine enquiry after publication.

## Publishing

The original `CNAME` is retained. Publish through the repository's existing hosting workflow when ready. The redesign itself does not commit, push or deploy the site.
