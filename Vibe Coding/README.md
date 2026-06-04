# NYC Bites & Nights

A simple personal website template to document every restaurant and bar you have visited in New York City.

## Run locally

Open `index.html` directly in your browser, or serve the folder with any static server.

## Customize your places

Edit the `places` array in `script.js`:

- `name`: place name
- `type`: `restaurant` or `bar`
- `cuisine`: cuisine or venue style
- `borough`: Manhattan, Brooklyn, etc.
- `neighborhood`: neighborhood name
- `dateVisited`: format as `YYYY-MM-DD`
- `notes`: your quick impression
- `image` (optional): path or URL to a photo (see below)

## Photos for each place

1. Save image files in the `images` folder (same folder as `index.html`, inside `images/`).
2. In `script.js`, add an `image` field to any entry, pointing at that file:

```js
{
  name: "L'Artusi",
  // ...other fields...
  image: "./images/lartusi.jpg",
}
```

Use a **short filename without spaces** (e.g. `golden-diner.jpg`). Match the filename exactly, including `.jpg` vs `.png`.

**Or** use a full URL if the photo is already online:

```js
image: "https://example.com/my-photo.jpg",
```

If you omit `image`, the card shows text only (no broken image).

## Ideas for next upgrades

- Add a rating field and sort by favorites
- Save entries in Notion/Airtable and fetch dynamically
- Deploy to Vercel/Netlify with a custom domain
