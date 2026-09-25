# Hearth & Table Catering

Preview website for a catering business. It is plain HTML, CSS, and JavaScript in `public/`, served by Node.js with no package dependencies.

## Run locally

Install Node.js 18 or newer, then run:

```bash
npm start
```

Open `http://localhost:3000`. The server uses `PORT` when Railway supplies it. `GET /health` returns `{"ok":true}`.

## Deploy a test with Railway CLI

Run these commands from the repository root. Railway CLI login opens an interactive browser sign-in.

```bash
railway login
railway init --name hearth-and-table-preview
railway add --service web
railway up --service web
railway domain --service web
```

`railway init` creates and links a new project. If using an existing test project, run `railway link` instead and choose its project and environment. Railway builds this Node project and starts it with `npm start`. The generated domain points to the `web` service. Check `https://<generated-domain>/health` and the home page after the deployment is active. For troubleshooting, run `railway deployment list --service web` and `railway logs --service web --lines 100`.

## Preview limitations and editing

- The site is a design preview. Confirm the company name, contact details, menu, pricing language, photos, testimonials, and any business claims with the owner before sharing it as a real business site.
- The quote form is an interactive preview. It validates locally but does not send or store customer details; after submission, it shows a clear no-send message. `POST /api/quote` returns HTTP 503. Connect a real delivery service before accepting enquiries.
- Edit page content in `public/index.html`, styling in `public/styles.css`, and interactions in `public/script.js`.
