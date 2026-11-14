# EVRAA 2027: installing and packaging the app

The site is a Progressive Web App. These files make it one:

| File | What it does |
|---|---|
| `manifest.json` | Name, colours, icons, screenshots and shortcuts of the app |
| `sw.js` | Service worker: keeps visited pages working offline (must stay in the site's root folder) |
| `offline.html` | Shown when a page that was never opened is requested without a connection |
| `evraa/images/icons/` | App icons, the Apple touch icon, store screenshots, and `store-1024.png` for the store listings |

## Install straight from the browser

- **Android / Chrome / Edge:** open the site and press **Install app** in the header (or the browser menu → Install app).
- **iPhone / iPad:** open the site in Safari → Share → **Add to Home Screen**.

The site must be served over **https**.

## Package for the stores with PWABuilder

1. Upload the whole site to its final address.
2. Go to https://www.pwabuilder.com, enter the address and let it analyse the site.
3. Press **Package for stores**.

### Google Play (Trusted Web Activity)

1. Choose **Android**. Set the package ID (for example `ph.gov.deped.calbayog.evraa2027`) and keep the signing key it creates in a safe place: updates need the same key.
2. PWABuilder gives you an `assetlinks.json` file. Upload it to the site as `/.well-known/assetlinks.json`. Without it the app shows a browser address bar.
   The folder name starts with a dot, so it is hidden on a Mac (press Cmd+Shift+. in Finder to see it).
3. Upload the `.aab` file to the Google Play Console (a developer account costs a one-time US$25).

### Apple App Store

1. Choose **iOS**. PWABuilder gives you an Xcode project.
2. Open it on a Mac with Xcode, set your team and bundle ID, and submit through App Store Connect (the Apple Developer Program costs US$99 a year).
3. Apple reviews wrapped websites strictly; be ready to explain what the app adds over the website (offline use, home-screen shortcuts).

## Important: the hosting

Free InfinityFree hosting (`*.42web.io`, `*.xo.je`) puts a "checking your browser" step in front of every first visit.
People never notice it, but **PWABuilder and Google's servers cannot get past it**, so the analysis fails and the Play Store app cannot be verified.
Before packaging, move the site to hosting without that check (paid hosting, or a static host such as Cloudflare Pages or Netlify for the public pages).

## After changing the site

Phones show new pages and content right away when online. To make them drop saved styles and scripts immediately, change `VERSION` at the top of `sw.js` (for example `evraa-v2`).
