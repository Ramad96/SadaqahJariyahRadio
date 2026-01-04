# Deployment Guide for GitHub Pages

## Your Repository
- Repository Name: `SadaqahJariyahRadio`
- URL: `https://github.com/Ramad96/SadaqahJariyahRadio`
- Site URL: `https://ramad96.github.io/SadaqahJariyahRadio/`

## Step-by-Step Deployment

### 1. Make sure everything is committed
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to GitHub Pages
```bash
npm run deploy
```

This will:
- Build your app
- Create/update the `gh-pages` branch
- Push it to GitHub

### 3. Enable GitHub Pages (if not already enabled)

1. Go to: https://github.com/Ramad96/SadaqahJariyahRadio/settings/pages
2. Under "Source", select: **Deploy from a branch**
3. Branch: **gh-pages**
4. Folder: **/ (root)**
5. Click **Save**

### 4. Wait a few minutes
GitHub Pages can take 1-5 minutes to update.

### 5. Visit your site
https://ramad96.github.io/SadaqahJariyahRadio/

## Troubleshooting

### If the site shows a 404:
- Wait 2-3 minutes and refresh
- Check that the `gh-pages` branch exists
- Verify the base path in `vite.config.js` matches your repo name

### If styles/colors don't load:
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check browser console for errors
- Verify the build completed successfully

### If you need to update:
1. Make your changes
2. Commit: `git add . && git commit -m "Update"`
3. Push: `git push origin main`
4. Deploy: `npm run deploy`

## Alternative: Use GitHub Actions (Automatic)

The `.github/workflows/deploy.yml` file is already set up. To use it:

1. Go to repository Settings → Pages
2. Under "Source", select **GitHub Actions**
3. Every push to `main` will automatically deploy

