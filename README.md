# Hearth & Table Catering

Demo website for a catering business. It's a plain HTML/CSS/JS site in `public/`, served by a small Node server (`server.js`) with no dependencies.

## Run locally

```bash
npm start
# open http://localhost:3000
```

## Deploy on Railway

1. New Project → Deploy from GitHub repo → pick this repo and branch.
2. Railway detects Node and runs `npm start`. The server reads `PORT` automatically.
3. Settings → Networking → Generate Domain.

## Editing content

- Text, menu items and contact details: `public/index.html`
- Colours and fonts: the variables at the top of `public/styles.css` (forest green, brass, ivory; Cormorant Garamond + Jost)
- Photos: the arched panel in "Our Story" and the hero illustration are placeholders; real food and event photos can drop into `public/images/`
- Quote requests are posted to `/api/quote` and currently only **logged** (visible in Railway's deploy logs). Wire up email or a database in `server.js` before going live.
