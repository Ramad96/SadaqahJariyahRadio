# Troubleshooting Blank Screen on GitHub Pages

## Quick Checks

1. **Open Browser Console (F12)**
   - Look for any red error messages
   - Check the Network tab for 404 errors on assets

2. **Verify the URL**
   - Should be: `https://ramad96.github.io/SadaqahJariyahRadio/`
   - Make sure there's a trailing slash

3. **Check GitHub Pages Settings**
   - Settings → Pages
   - Source: `gh-pages` branch
   - Folder: `/ (root)`

## Common Issues

### Issue: 404 on JavaScript/CSS files
**Solution:** The base path might be wrong. Check `vite.config.js` has:
```js
base: '/SadaqahJariyahRadio/',
```

### Issue: Blank white screen
**Possible causes:**
- JavaScript error (check console)
- Assets not loading (check Network tab)
- React not mounting (check if `#root` exists)

### Issue: Styles not loading
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache

## Debug Steps

1. **Check the deployed files:**
   - Go to: https://github.com/Ramad96/SadaqahJariyahRadio/tree/gh-pages
   - Verify `index.html` and `assets/` folder exist

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

3. **Test locally:**
   ```bash
   npm run build
   npm run preview
   ```
   Then visit: http://localhost:4173/SadaqahJariyahRadio/

## If Still Not Working

Share:
1. Screenshot of browser console errors
2. Screenshot of Network tab (filter by "Failed")
3. What you see when visiting the URL

