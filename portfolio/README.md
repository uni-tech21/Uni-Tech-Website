# Adding a portfolio project

The homepage carousel and the Portfolio page read the same list: `portfolio/projects.json`.
You only need a screenshot, a website link and the project name. No HTML changes are needed.

## Add a project

1. Save the website screenshot in `portfolio/images/`. Use a simple filename, such as `new-client.webp`. PNG, JPG, WebP and AVIF are supported.
2. Open `portfolio/projects.json`. Copy this entry into the list, adding a comma between entries:

```json
{
  "name": "New client",
  "url": "https://example.com/",
  "image": "images/new-client.webp"
}
```

3. Change the name, website address and image filename. Save the file.
4. Refresh the homepage and Portfolio page to check the result. When you publish the update, include both the image and `projects.json` in the same commit and push.

The website address must be a complete `https://` or `http://` address. Screenshot paths are relative to this `portfolio/` folder. Images must be stored on this website; remote image links are not accepted. The three original screenshots are kept in `images/portfolio/` at the root of the website, so their entries start with `../images/portfolio/`.

A screenshot around 1800 pixels wide works well. Show the top of the website, and use a similar shape to the existing screenshots. The image is displayed without cropping.

## Change the order or remove a project

Move an entry up or down in the JSON list to change the homepage carousel order. Delete the entry to remove it from both pages. Keep the opening `[` and closing `]`, and do not leave a comma after the last entry.

The Portfolio page follows the same list order unless a project has an optional `portfolioOrder` number. The existing projects have those numbers to keep Impact first on the Portfolio page while starting with the three-card homepage composition. Remove those `portfolioOrder` fields if you want both places to use exactly the list order.

The optional `initial` setting chooses which project starts in the centre of the homepage carousel. Set it to `true` on one entry. Impact currently has this setting.

## Optional details

The three fields in the short example are enough. Add any of these if you want more detail on the Portfolio page:

```json
{
  "name": "New client",
  "url": "https://example.com/",
  "image": "images/new-client.webp",
  "id": "new-client",
  "alt": "New client homepage showing its services and project photographs",
  "width": 1800,
  "height": 970,
  "category": "BUSINESS WEBSITE",
  "description": "A short description of the website and what it includes.",
  "features": ["Service information", "Project gallery", "Contact form"],
  "initial": false,
  "portfolioOrder": 4
}
```

- `id`: a short unique label for page links, such as `portfolio.html#new-client`. Use letters, numbers and hyphens. An ID is created from the name when omitted.
- `alt`: a description of the screenshot for visitors using screen readers. A basic description is supplied when omitted.
- `width` and `height`: the screenshot dimensions in pixels. These help reserve space while the image loads.
- `category`, `description` and `features`: optional text on the Portfolio page. Missing descriptions and feature lists are left out.
- `initial`: starts this project in the middle of the homepage carousel.
- `portfolioOrder`: an optional number to give the Portfolio page a different order.

Reload after changing the list. The site asks for an up-to-date copy of the JSON file each time the page loads. Use the local website preview or the published site; opening the HTML directly from your computer can prevent the JSON file loading.

Invalid entries are skipped. If the JSON cannot load, is malformed or has no valid projects, the existing three-project HTML previews remain visible. If a new project does not appear, check the commas, its full website address and the screenshot filename. Keep this fallback HTML in place for visitors with JavaScript turned off; it does not need editing when adding a project to the live list.
