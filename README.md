# City Electronics Hub

i am running an electronics store named city electronics which includes cables , connectors , remotes , components , laptop accessories , mobile accessories etc . i want to make a website which is a classic look and attractive . the order msut be placed through whatsapp . built with this now and later i will suggest changes

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b0724523-428f-4e37-944f-dadecec74ac9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploying to GitHub Pages

The storefront loads its catalogue directly from the database in the browser, so it
runs as a static site with no server.

1. Push this project to a GitHub repository (e.g. `city-electronics`).
2. Repository → Settings → Pages → Source: **GitHub Actions**.
3. Repository → Settings → Secrets and variables → Actions → add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   (values are in the project `.env`)
4. Push to `main`. The workflow `.github/workflows/deploy-pages.yml` builds and deploys.

Site URL: `https://<username>.github.io/city-electronics/`

Using a custom domain (or a `<username>.github.io` repo)? Change `BASE_PATH: /city-electronics/`
to `BASE_PATH: /` in the workflow.

Local static build: `GITHUB_PAGES=1 BASE_PATH=/city-electronics/ bun run build:pages`
(output in `dist/client`).
