# Content packs, proposed design | חבילות תוכן

Design draft only. The current implementation still uses the music-shaped `Song` type. It does not load generic content packs yet.

## Product direction

Nir and Ofer suggested expanding beyond songs into movie release years, historical events and inventions. A proposed implementation is to separate packs from the timeline engine so new contributors can add content without rewriting placement and scoring.

## Proposed boundary

The core owns turns, player positions, ordering checks, scoring and feedback. A pack supplies content, presentation type, date rules, sources and rights information. A renderer for each supported presentation type hides answer-bearing metadata until reveal.

Possible schema, not accepted or wired into code:

```ts
type TimelinePack = {
  id: string;
  title: string;
  language: string;
  schemaVersion: 1;
  dateRule: string;
  license: string;
  items: Array<{
    id: string;
    prompt: string;
    answerTitle: string;
    year: number;
    sourceUrls: string[];
    media?: { type: 'audio' | 'image'; localPath: string; license: string; credit: string };
  }>;
};
```

## Before implementation

- Decide if dates are year-only, how BCE dates work, and whether disputed dates are excluded or represented as ranges.
- Define date rules per category: first theatrical release versus local release; invention prototype versus patent versus commercial launch. Historical events may span several years.
- Choose initial presentation types. Historical facts can be text-only. Movie clips, stills and posters require their own rights review; a year/title fact does not license an image or soundtrack.
- Require schema validation, duplicate checks, deterministic examples, sources and a rights manifest.
- Keep answer data out of the visible prompt. This is a casual local game, not an anti-cheat platform.
- First add a generic renderer/loader and pack contract, then a separately maintained sample pack. Until that exists, do not claim that adding a JSON file is sufficient.

## Contribution target after the pack system exists

A contributor adds a pack directory containing its manifest, entries, source notes and permitted assets. Validation should run without edits to the turn, scoring or timeline engine. New presentation types may still need a core renderer change and review.

## עברית בקצרה

הרעיונות של ניר ועופר: סרטים לפי שנים, אירועים היסטוריים והמצאות. ההצעה הטכנית היא מנוע ציר זמן משותף וחבילות תוכן נפרדות, עם מקורות ותנאי שימוש לכל פריט. כרגע זו הצעת תכנון בלבד. עוד צריך להחליט מה נחשב שנת הסרט או ההמצאה, איך מטפלים בתאריך שנוי במחלוקת ובאילו סוגי מדיה תומכים. תמונות, פוסטרים, קטעי סרטים ושמע אינם מותרים אוטומטית רק מפני שהמשחק בקוד פתוח.
