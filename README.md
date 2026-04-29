# AchiMate

AchiMate is a Chrome-compatible media downloader web app built from the original static prototype.

## What It Does

- Accepts a public URL and analyzes it on the backend.
- Detects direct video, audio, and image files.
- Parses public HTML pages for discoverable media tags, Open Graph media, image tags, and media file links.
- Provides preview, download, queue, and local library flows in the browser.
- Includes a basic authenticated admin stats endpoint.

## Project Structure

```text
client/
  index.html
  styles.css
  app.js
server/
  index.js
  routes/
  controllers/
  services/
  utils/
```

## Run

```bash
npm run build
npm start
```

Open:

```text
http://localhost:3000
```

During local development the server serves `client/index.html` and `client/src/app.js` directly. `npm run build` copies the dependency-free client into `client/dist` for production serving.

## PWA Install

AchiMate includes a web app manifest, service worker, and app icons. In Chrome on `localhost` or HTTPS, open Settings and use **Install AchiMate App** when the browser exposes the install prompt.

Admin password defaults to:

```text
admin123
```

Override it with:

```bash
ADMIN_PASSWORD=your-password npm start
```

## Scope

This implementation supports public direct media URLs and media discoverable from ordinary public HTML. It intentionally does not bypass DRM, logins, private APIs, or site protections. Add source-specific adapters in `server/services/extractorService.js` when you have lawful access to a provider API or backend extraction workflow.
