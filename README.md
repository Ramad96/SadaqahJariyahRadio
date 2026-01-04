# Quran Radio Station

A responsive web application for listening to Quran recitations.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

### Option 1: Using npm script (Quick)

1. Make sure your repository is named `QuranRadio` (or update the `base` path in `vite.config.js`)
2. Run:
```bash
npm run deploy
```

### Option 2: Using GitHub Actions (Recommended)

1. Push your code to GitHub
2. Go to your repository Settings → Pages
3. Under "Source", select "GitHub Actions"
4. The workflow will automatically deploy on every push to `main` branch

### Important Notes:

- If your repository name is different from `QuranRadio`, update the `base` path in `vite.config.js`
- For root domain deployment (username.github.io), change `base: '/QuranRadio/'` to `base: '/'` in `vite.config.js`
- The site will be available at: `https://yourusername.github.io/QuranRadio/`
