# Timeliner | ציר הזמן המוזיקלי

משחק מוזיקלי סביב טאבלט אחד. מקשיבים, גוררים תקליט לציר הזמן ומנסים לסדר את השירים לפי השנה.

A shared-tablet music timeline game. Listen, drag a record into your timeline, and put the songs in order.

**קוד פתוח ברישיון MIT. הגרסה כוללת צלילי הדגמה, לא שירים מסחריים.**  
**MIT-licensed source code. This version includes demo tones, not commercial recordings.**

[English](#english) · [תרומה לפרויקט](#תרומה-לפרויקט) · [רישוי](#רישוי)

## למה Timeliner?

- 2 עד 4 שחקנים סביב מסך אחד, בלי לסרוק QR בכל תור.
- כל שחקן יושב בפאה אחרת. התקליט והמשוב מסתובבים לכיוון השחקן הפעיל.
- התקליט הוא גם נגן וגם קלף: מקישים כדי לשמוע, גוררים כדי למקם.
- ממשק בעברית, תקליטי ויניל וצירי זמן אישיים.
- יעד ניצחון לבחירה: 5 עד 30 תקליטים, ברירת מחדל 12.

## מה יש בגרסה הזאת?

זהו קוד המשחק שהופרד מהגרסה הקיימת, עם סביבת פיתוח עצמאית ב-React, TypeScript ו-Vite.

**המאגר הזה אינו כולל שירים מסחריים או קישורי preview של Spotify או Apple.** כברירת מחדל הוא משמיע צלילים סינתטיים בני 5 שניות שנוצרים בדפדפן. השמות והשנים במצב זה הם נתוני בדיקה, לא חידון מוזיקלי אמיתי. כך אפשר לבדוק את הממשק והחוקים בלי להפיץ הקלטות שאין לנו רישיון להשתמש בהן.

למשחק עם מוזיקה אמיתית צריך לספק קטלוג וקובצי שמע שהשימוש בהם במשחק מותר. החזקת קובץ או מנוי לשירות מוזיקה אינה כשלעצמה רישיון להפצה או לשימוש במשחק. מדיניות Spotify אוסרת משחקים וחידונים, ותנאי iTunes מגבילים previews לשימוש לקידום תוכן ולא לבידור עצמאי. ראו [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## הרצה מקומית

דרישות: Node.js 22 ומעלה ו-npm. ללא חשבון שירות מוזיקה או מפתחות API.

```bash
npm ci
npm run dev
```

פתחו את הכתובת ש-Vite מציג. לבדיקה בטאבלט באותה רשת, השתמשו בכתובת ה-Network שמוצגת במסוף. הריצו רק ברשת שאתם סומכים עליה. מסך מלא עשוי לדרוש HTTPS או localhost ודפדפן שתומך בו.

```bash
npm test       # בדיקות חוקי מיקום
npm run build # בדיקת TypeScript ובניית dist
npm run preview
```

להגשה סטטית מעלים את תוכן `dist/` לשירות אירוח. הבנייה משתמשת בנתיבים יחסיים לתמיכה גם בתיקיית משנה. אין כאן שרת משחק או מערכת משתמשים.

## חוקי המשחק

1. בוחרים 2, 3 או 4 שחקנים, שמות ויעד ניצחון.
2. בכל תור מופיע תקליט מוסתר. הקשה משמיעה או עוצרת. הנגן משתמש בעד 30 שניות מהקובץ. לאחר סיום הקטע אפשר לנגן אותו שוב בגרסה הנוכחית.
3. גוררים את התקליט לציר האישי: לפני, אחרי או בין תקליטים קיימים.
4. התקליט הראשון של כל שחקן מתקבל בכל מיקום בציר הריק.
5. מיקום נכון משאיר את התקליט ומוסיף נקודה. טעות חושפת את הפרטים, שוברת את התקליט ולא מוסיפה נקודה.
6. בשירים מאותה שנה כל מיקום ששומר על סדר שנים לא יורד נחשב תקין.
7. התור עובר לשחקן הבא. הראשון שמגיע ליעד מנצח.

הרשימה מתערבבת בלי חזרות עד שממצים אותה, ואז מתערבבת מחדש. מצב המשחק חי בזיכרון, לא נשמר אוטומטית אחרי רענון. מעבר לטאב למסך מלא מעביר שחקנים וניקוד ב-fragment של הכתובת, אך לא את התקליט הנוכחי או את סדר החפיסה. הימנעו משיתוף כתובת כזאת אם שמות השחקנים פרטיים.

## הוספת שמע מורשה, מקומית בלבד

1. צרו `public/audio/` והוסיפו קובצי שמע שמותר לכם להשתמש בהם בהקשר הזה.
2. צרו `public/catalog.local.json` כרשימה של לפחות שתי רשומות:

```json
[
  { "t": "שם יצירה א", "a": "שם היוצר", "y": 2001, "u": "audio/track-a.mp3" },
  { "t": "שם יצירה ב", "a": "שם היוצר", "y": 2007, "u": "audio/track-b.mp3" }
]
```

`t` הוא שם השיר, `a` הוא האמן, `y` היא השנה ו-`u` הוא נתיב שמע מקומי. נתמכים רק קבצים מתחת ל-`audio/`, ללא כתובות חיצוניות. מומלץ לספק לפחות `מספר שחקנים × יעד ניצחון` קטעים, כדי לצמצם חזרות.

הקטלוג והשמע מוחרגים מ-Git. זה מונע הוספה מקרית למאגר, **לא** העלאה: בניית Vite מעתיקה אותם ל-`dist/`. אל תפרסמו את `dist/` עם קבצים מקומיים בלי לוודא שיש לכם זכויות מתאימות.

שנות יציאה דורשות בדיקה לפי ביצוע האמן והכלל שבוחרים. שנת העלאה דיגיטלית או רימאסטר אינה בהכרח שנת ההוצאה המקורית. לכל קטלוג חדש כדאי לצרף מקורות לשנים ותיעוד של ההחלטות.

## כיווני פיתוח

### הרעיונות שניר ועופר העלו

- [ ] חבילות קטגוריה: סרטים לפי שנת יציאה, אירועים היסטוריים והמצאות על ציר זמן.
- [ ] תשתית לחבילות תוכן נפרדות, כדי שתורמים יוכלו להוסיף חבילה בלי לשנות את מנוע המשחק. זהו כיוון מימוש מוצע לרעיונות, עדיין לא יכולת קיימת. ראו [PACKS.md](PACKS.md).

### הצעות טכניות לאישור

- [ ] קטלוג מוזיקה שמותר להשתמש בו במשחק, עם מקור וזכויות לכל הקלטה.
- [ ] בדיקת שנים עם מקורות והבחנה בין שיר מקורי, כיסוי ורימאסטר.
- [ ] בחירת קטלוג מתוך הממשק ובדיקת קבצים חסרים.
- [ ] הגבלת האזנה מצטברת אמיתית, אם זה הכלל שניר יבחר.
- [ ] שמירה ושחזור של משחק, כולל התקליט הנוכחי וסדר החפיסה.
- [ ] בדיקות גרירה במגע בכל ארבע הפאות ובמסכים בגדלים שונים.
- [ ] שליטה נגישה במקלדת וחלופה לגרירה בלבד.
- [ ] תרגום ממשק לאנגלית.

אלה הצעות לסבב הבא, לא פיצ'רים שניר כבר התחייב לפתח.

## תרומה לפרויקט

יתקבלו בשמחה דיווחי באגים, שיפורי ממשק ובדיקות בטאבלטים. לפני שינוי גדול כדאי לפתוח issue ולתאם. ראו [CONTRIBUTING.md](CONTRIBUTING.md) לתהליך המקומי ולרשימת הבדיקות. אל תעלו הקלטות, מילים, עטיפות או מפתחות שירות שאין לכם רשות לשתף.

## קרדיטים

נבנה עם ניר זיגדון. משחק עצמאי בהשראת ז'אנר משחקי ציר הזמן המוזיקליים. אין קשר רשמי ל-HITSTER, ל-Spotify או ל-Apple. מבנה התיעוד הושפע מ-[Dibbur של Ofer Shapira](https://github.com/ofershap/dibbur); לא הועתק ממנו קוד.

## רישוי

הקוד והתיעוד המקוריים ברישיון MIT, ראו [LICENSE](LICENSE). זכויות היוצרים: 2026 Nir Zigdon. הרישיון אינו מעניק זכויות למוזיקה, למאגרי צד שלישי, לסימנים מסחריים או לתלויות.

---

## English

### Why Timeliner?

A Hebrew-first music timeline game for 2-4 people around one tablet. Each player has a side of the screen and a personal timeline. Tap the central record to listen, then drag it before, between, or after your existing records. Correct placements score one point. Wrong placements reveal the answer and disappear. First to the chosen target wins, default 12, adjustable from 5 to 30.

The first record on an empty timeline always fits. Equal-year placements are allowed as long as the timeline stays in non-decreasing order. The deck reshuffles only after exhaustion. Playback uses up to 30 seconds of a file; the current implementation allows replay after the clip ends.

### Status and audio rights

This is an MIT-licensed code release. It preserves the current game UI and rules while removing commercial preview URLs. Its default catalog contains 40 synthetic five-second test tones, with fictional test dates, not real songs.

For real music, supply audio and metadata you have the necessary rights to use in a game. A streaming subscription or possession of a recording is not a redistribution license. Spotify's developer policy prohibits games and trivia; Apple's iTunes preview terms restrict use to promotion rather than independent entertainment. No Spotify or Apple API integration is included.

### Run

Use Node.js 22+ and npm:

```bash
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Vite prints local and network addresses. Use the network address for a tablet on a trusted shared network. Fullscreen support depends on the browser and secure-context rules. Serve `dist/` from a static host for deployment. No account or backend is needed for demo mode. Initial package installation needs internet.

For local licensed audio, add files under `public/audio/` and a `public/catalog.local.json` array with `t` (title), `a` (artist), `y` (year), and `u` (relative path such as `audio/track-a.mp3`). See the JSON example above. These paths are ignored by Git but copied into `dist/` at build time. Inspect deployment output before uploading it.

Game state is memory-only. A fullscreen-tab handoff carries names and scores in the URL fragment, but not the current card or deck order. Refreshing resets the game.

### Roadmap

Nir and Ofer's category ideas: movie release years, historical events, and inventions on a timeline. Proposed architecture: separate content packs that contributors can add without changing the core engine. This is a design direction, not an implemented pack system. See [PACKS.md](PACKS.md).

Other proposed improvements: licensed catalog with recording-level rights and year sources; catalog picker; accurate cumulative listening limit if selected as the rule; complete save/restore; tablet drag-and-drop tests; keyboard accessibility; English UI. These implementation proposals await Nir's priorities, not promised features.

### Contribute

Bug reports, tablet testing, UI fixes and pull requests will be welcome. Discuss large changes first. See [CONTRIBUTING.md](CONTRIBUTING.md). Do not contribute unauthorized audio, lyrics, artwork, credentials or copied provider catalogs.

### Credits and license

Built with Nir Zigdon. Independent music-timeline game, not affiliated with HITSTER, Spotify or Apple. Documentation structure takes inspiration from [Ofer Shapira's Dibbur](https://github.com/ofershap/dibbur), without copying its code.

Original code and documentation are licensed under [MIT](LICENSE), copyright 2026 Nir Zigdon. Music, third-party datasets, trademarks and dependency licenses are separate.
