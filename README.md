# theklatsch

Vite, React, TypeScript, Tailwind, shadcn-style UI, Supabase.

## Local development

```bash
git clone https://github.com/acypher/theklatsch.git
cd theklatsch
npm install
cp .env.example .env
# Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from
# Supabase → Project Settings → API (or API Keys, depending on your key type).
npm run dev
```

App dev server: `http://127.0.0.1:8080` (see `vite.config.ts`).

Use Cursor: **File → Open Folder** and select this project.

## Environment variables (production and local)

- **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_PUBLISHABLE_KEY`**: from Supabase; required for the app to run.
- Never commit **`.env`**. The repo includes **`.env.example`** only. Copy to `.env` locally.

`service_role` and other secrets stay on the server (Edge Functions, backend), never in `VITE_*` or the browser.

## If secrets ever lived in Git (historical)

Previously committed `.env` or keys embedded in `client.ts` are still in **git history** until you rewrite it.

1. **Minimum:** After the current `main` is on GitHub, **rotate** keys in the [Supabase dashboard](https://supabase.com/dashboard) (publishable/anon, and any leaked `service_role` / secret keys) so old commits cannot access your project.
2. **Optional hardening:** Use [`git filter-repo`](https://github.com/newren/git-filter-repo) to remove `.env` from all history, then `git push --force` (rewrites all commit hashes; coordinate with any collaborators).

In Lovable’s UI, **disconnect** this repo when you are fully on local + CI workflows so the project does not keep syncing from their side.

## Publish to theklatsch.com

Production is hosted from InMotion cPanel at `/public_html`, with source code in GitHub.

1. **Build and deploy**
   - Push to `main` on `https://github.com/acypher/theklatsch`.
   - GitHub Actions runs `npm ci`, `npm run build`, and uploads `dist/` to InMotion via FTP.
   - Manual deploys can also be run from the **Deploy to InMotion** workflow in GitHub Actions.

2. **GitHub secrets**
   Configure these repository secrets:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `INMOTION_FTP_SERVER`
   - `INMOTION_FTP_USERNAME`
   - `INMOTION_FTP_PASSWORD`

   If the InMotion FTP secrets are missing, the workflow still builds but skips the upload step.

3. **SPA routing**
   This repo includes `public/.htaccess` so Apache serves `index.html` for client-side routes like `/article/...`.

4. **DNS and SSL**
   InMotion cPanel currently serves `theklatsch.com` from `/public_html`. DNS should point `theklatsch.com` and `www.theklatsch.com` at the InMotion web IP, then AutoSSL / Force HTTPS can be enabled in cPanel.

5. **Supabase**
   In the Supabase project: **Authentication → URL configuration** (and OAuth providers if you use them), add the production URLs, for example:

   - `https://theklatsch.com`
   - `https://www.theklatsch.com` (if used)
   - `http://127.0.0.1:8080` for local dev (if you use email/OAuth callbacks here)

## Quality checks

- `npm run lint`
- `npm run build`

## Article video uploads

The article media Upload button accepts JPEG, PNG, GIF, and WebP images up to
5 MB, and MP4, WebM, Ogg, and MOV videos up to 50 MB. MP4 with H.264 video
and AAC audio is recommended for broad browser compatibility. Videos are stored in InMotion's
`public_html/videos/` folder; images remain in Supabase's `article-images`
bucket. Article pages and cards show videos paused with native controls.

`public/api/upload-video.php` verifies the user's Supabase login, validates the
file's actual MIME type and size, and saves it under a random filename. The
production build generates its authentication configuration using the existing
Supabase URL and publishable key. No service-role key is needed. PHP with cURL
and Fileinfo must be enabled on InMotion. `public/api/.user.ini` sets a 50 MB
upload limit with a 52 MB request limit.

The deployment copies the video directory's protection rules but leaves uploaded
videos alone. Do not enable a deployment option that wipes `public_html/`.
No Supabase storage migration is needed for video uploads.

Browser regression checks: `npx playwright install chromium`, then
`npx playwright test`. These tests use the real upload/display components with
mocked authentication and storage responses; they do not modify live articles.
