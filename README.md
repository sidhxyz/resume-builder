# ResumeCraft — Offline Resume Builder

A modern SaaS-style resume builder built with React + Vite. It uses no external API, no backend, and no database. Resume data is saved only in the user's browser through localStorage.

## Features

- Modern SaaS UI
- Live A4 resume preview
- ATS health score
- Job description keyword matcher
- Role-based skill suggestions
- Suggested bullet points
- Browser local auto-save
- Print / Save as PDF export
- GitHub Pages ready

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload/push this project.
3. Go to `Settings > Pages`.
4. Under `Build and deployment`, select `GitHub Actions`.
5. Push to the `main` branch.
6. The workflow in `.github/workflows/deploy.yml` will deploy the site.

The Vite config uses `base: './'`, so it works under most GitHub Pages repo paths without changing the repo name.
