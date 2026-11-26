# WAVELORD_ARTUP_MASTER - Wavelord ArtUp v1.0.0

## Overview
Wavelord ArtUp ("Draw. Together. With AI.") is a phone-first PWA and Capacitor Android drawing app with layered Canvas 2D tools, palettes, autosave versions, AI new-layer helpers, Wave Buddy chat, and room links.

## THE BUDDY
* Does it follow Bubble Rules? Partially (web collapse, edge-snapping drag, 12px threshold, 250ms cooldown, and Android background overlay service are wired; full native Android device verification and voice-to-server transcription are still pending).
* What is WRONG: Previously `style.css` and `manifest.json` were missing from the bundle, `sw.js` cached only `artup-v1` without bumping for icon/asset updates, and `app.js` lacked `killNetlify()` and structured ring-buffer error logging.
* What needs to be FIXED: `style.css` and `manifest.json` are included, `sw.js` is bumped to `artup-v2` while never caching `/.netlify/functions/`, and `app.js` includes `killNetlify()` and redacted 20-entry error logging.

Bubble Rule fixed. Collapsed Tap = Options Popup: Return to App / Talk to AI / Exit App. Open App = No Menu. Exit = Collapse, No Ending Screen.
