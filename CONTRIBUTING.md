# Contributing | תרומה

דיווחי באגים, בדיקות בטאבלטים ושיפורי קוד מתקבלים בשמחה.
Bug reports, tablet testing and code improvements are welcome.

## Start

1. Discuss larger changes in an issue before implementing them.
2. Use Node.js 22+; run `npm ci`.
3. Run `npm run dev`, `npm test`, and `npm run build`.
4. Keep a change focused. Explain the problem and include before/after screenshots for visual changes.

## Manual checks

- 2, 3 and 4 player layouts; landscape tablet sizes.
- Tap/pause playback, dragging, and insertion before/between/after existing records.
- Each of the four player orientations, including readable year labels and result feedback.
- Equal-year placements and incorrect placements.
- Target controls 5-30, first to target, and new game.
- Fullscreen, tab handoff, refresh behavior, and missing/invalid local audio.
- No console exceptions or provider preview network requests in default demo mode.

## Content and data

Do not submit commercial recordings, album covers, lyrics, provider preview URLs, service credentials or copied music catalogs. Use original synthetic fixtures for tests. For any proposed distributable content, document its source, license, attribution, and whether redistribution and game use are allowed. Keep dataset rights separate from the software license.

Year corrections should identify the artist/version, original release year, evidence URL, and the reason for any ambiguity. Never silently use a remaster or upload date as the original release date.

אל תצרפו קבצים פרטיים. הקטלוג והשמע המקומיים מוחרגים מ-Git, אבל נכללים בבנייה. בדקו גם את `dist/` לפני פריסה.
