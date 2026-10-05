# Uni-Tech — websites that feel like you

A static website focused on website design for independent businesses in Kent and East Sussex. No package install or build step is needed. Serve the folder with a local static server or publish through the existing hosting workflow. The existing `CNAME` is unchanged.

## Pages

- `index.html`: website-design homepage, scrollable featured websites, links to dedicated portfolio and services pages, process, approach and FAQs.
- `websites.html`: template selection followed by the website editor, with editable content, section controls and working page previews.
- `builder-preview.html`: isolated, responsive website preview used inside the editor.
- `about.html`: introduces Paris, Callum and the wider computer networking team.
- `portfolio.html`: clickable live projects for Impact Scaffolding, Ross Services and Julie Martin Fine Art.
- `services.html`: new website design, redesign and website care, with included work and starting prices.
- `contact.html`: website enquiry form, including a visitor’s playground brief when supplied.
- `thank-you.html` and `404.html`: confirmation and missing-page views.

`css/site.css` provides shared foundations; `css/design.css` contains the shared visual direction; `css/home.css` gives the homepage its full-width photographic hero, layered concept previews and larger image-led sections. `js/site.js` handles navigation and contact submission; `js/design.js` handles the editor and design brief handoff. Earlier assets and unused scripts remain in the repository but are not loaded by these pages.

## Website editor

The editor provides three distinct starter sites: an interiors studio, a local trades business and a neighbourhood café. Each has navigable Home, Services/Menu, About and Contact pages, with a scrolling website preview independent from the editor interface. The example businesses, menu prices and opening hours are illustrative.

“Build your own” opens the template selection page first. Each card offers a read-only preview of the complete template, including its pages and desktop/mobile layouts. Choosing a template opens the editor; a saved draft is resumed when available. “Browse templates” returns to the selection page without clearing changes. Browsing previews does not create or alter drafts. A `?template=studio`, `?template=trades` or `?template=cafe` URL opens that template directly so a reload keeps the editor open; browser Back and Forward move between selection and editing.

Visitors can edit text directly in the site or through the Content panel. The Design panel changes colours, typography, the hero layout and photograph. The Sections panel reorders and hides optional homepage sections. Header/intro and contact remain included. Dedicated pages remain available when a homepage section is hidden. Preview mode removes editing controls from the rendered website. Desktop, tablet and mobile modes set the frame’s real layout width; Expand provides a larger view. Undo/redo preserves recent changes in the current session.

Each template keeps a separate local draft in `unitech-site-drafts-v2`. Existing v1 design data is migrated where possible. Photo uploads accept JPG, PNG and WebP up to 10 MB and are resized locally before saving; images are not uploaded. Storage errors are reported clearly. Template resets can be undone. A text brief downloads from the current draft. “Send to Uni-Tech” includes validated text, design settings and section order in the contact URL. Uploaded image data is excluded from that URL, and the brief asks visitors to provide the original photo separately.

`js/builder-state.js` defines shared defaults, field limits, validation and brief generation. `js/design.js` handles the editor and contact brief handoff. The preview uses `js/builder-preview.js` and `css/builder-preview.css`, communicating only with its own parent window. Text is inserted with `textContent`; inline paste is plain text. Preview contact forms are local demonstrations and do not send messages. This creates a design brief, not a published website.

## Contact

The existing `enquires@uni-tech.co.uk` address and `https://formspree.io/f/xykdypnr` endpoint are preserved. The form supports normal HTML submission without JavaScript; enhanced submission validates fields, prevents duplicates, preserves entries after errors and redirects on confirmed success. The form informs visitors that Formspree handles their enquiry. Real inbox delivery must be checked with a genuine enquiry after publication.

## Assets

Images are saved locally in `images/design/`. Photography comes from Unsplash; the homepage uses user-provided artwork:

- Interior: https://images.unsplash.com/photo-1600210492486-724fe5c67fb0
- Café: https://images.unsplash.com/photo-1442512595331-e89e73853f31
- Homepage hero: user-provided artwork in `images/design/barber.jpg`
- Barber detail: https://images.unsplash.com/photo-1599351431202-1e0f0137899a

These images are design-preview imagery, not Uni-Tech client work. The homepage artwork is framed independently of the portfolio carousel. Its front face and the hero text share responsive dimensions so the content stays within the block on desktop and mobile. DM Sans and Manrope are self-hosted in `font/design/`, with their SIL Open Font License files, to avoid a remote font stylesheet delaying the site. The illustrative compositions and page design are original; Squarespace was the visual reference.

## Verification

Browser checks cover the public pages at 1440, 1024, 768, 390 and 320 pixels, including page overflow and primary headings. Playground checks cover editing, concepts, palette, type, layout, services, screen size, persistence, reset, download and contact handoff. Contact success and failure are checked using intercepted responses; no automated message is sent to the live endpoint. Mobile navigation and the no-JavaScript fallback are checked separately.

Edits can be reviewed locally before publication through the existing hosting workflow.

## Featured websites and portfolio

The homepage showcases Impact Scaffolding, Ross Services and Julie Martin Fine Art using the screenshots provided by Uni-Tech, optimised as local WebP images in `images/portfolio/`. Each preview opens its supplied live website URL in a new tab. Portfolio navigation and hero links lead to `portfolio.html`. The full project directory lives on that page, with short homepage links at the old `#portfolio` and `#designs` anchors.

`js/portfolio.js` provides a looping homepage showcase with previous/next controls, position status and keyboard navigation. Ross follows Julie and the same sequence continues in either direction, including native touch/trackpad scrolling. Identical copies keep neighbouring cards visible across the join; only the original links are exposed to keyboard and assistive navigation. Motion respects reduced-motion preferences. Without JavaScript, the original three HTML projects remain clickable in a native horizontal scroll area. The website editor remains a separate customisation tool.

Both the homepage and the Portfolio page read `portfolio/projects.json` through `js/portfolio-data.js`. To add a project, put its screenshot in `portfolio/images/` and add an entry with its `name`, complete website `url` and relative `image` path. No page HTML edits are needed. See [portfolio/README.md](portfolio/README.md) for a copyable example and optional project details. The list order sets the homepage sequence; an optional `portfolioOrder` keeps the directory in a different order. `initial: true` chooses the opening centred project. The registry is revalidated on each page load; invalid entries are skipped, with the existing HTML preserved if the file cannot load.

## Services and pricing

Website services now list concrete scopes, revision limits and starting prices: one-page websites £495, business websites £995, redesigns £595 and website care £35/month. Additional pages start at £100; one-off updates are £60/hour. The owner authorised choosing the rates in this chat. The enquiry form can preselect both the service and package from service-card links. Hosting, domain registration and paid third-party services are separate; the final written quote confirms scope and any applicable VAT.

The detailed offers live in `services.html`, with package labels in `contact.html` and a price answer in the homepage FAQ. Update those when rates change. The homepage links to the services page instead of duplicating its cards. `css/services.css` styles the pricing cards; `css/portfolio.css` styles the dedicated project directory. Site-wide marketing copy has been revised to use direct descriptions of services and deliverables.

## Layout corrections

The homepage design illustration uses separate areas for the heading and photograph. Its typography and colour samples are arranged below the preview on phones so they remain readable. A malformed font-import remnant was removed from the shared stylesheet, and preview layout controls now target buttons only. Navigation links throughout the site point to the dedicated portfolio and service pages.
