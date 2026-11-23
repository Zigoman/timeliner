# Third-party content and release boundaries

Reviewed 23 November 2026. Practical release assessment, not legal advice.

## What this candidate includes

- Adapted game source, documentation, synthetic-tone fixtures and rule tests.
- React, React DOM, Vite, TypeScript, tsx and development type dependencies, installed via npm. Their licenses remain separate. Keep applicable dependency notices when distributing a bundled build.
- No commercial recordings, album artwork, lyrics, service credentials, provider preview URLs or copied provider catalog.

## Why previews were removed

The recovered private source used both Spotify and Apple CDN previews. A publicly reachable audio URL does not grant permission to use it in a game. No audio files were downloaded for this preparation.

- Spotify's developer policy prohibits games, including trivia, and restricts preview use. Its compliance page explicitly includes name-that-tune gameplay in the restriction. Its widget terms require written approval for game functionality.
  - https://developer.spotify.com/policy
  - https://developer.spotify.com/compliance-tips
  - https://developer.spotify.com/documentation/embeds/terms
- Apple's archived iTunes Search API overview limits previews to promotion of store content rather than independent entertainment. Not storing audio files is insufficient to satisfy that purpose limit.
  - https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/

No claim is made that these terms are an exhaustive review of copyright or service contracts. A future provider integration needs a separate permissions review. This candidate does not implement one.

## Metadata and year research

No provider-derived song catalog is included. Reuse of a provider-derived catalog needs review of its source and contractual/database rights, not only the factual nature of an individual title or year.

A future independently sourced dataset should document provenance, release-year methodology and a separate data license. Uncertain song-version dates must remain marked uncertain.

## Names and acknowledgments

Timeliner is an independent project. No official affiliation with HITSTER, Spotify or Apple is claimed. This is not a trademark clearance for the name Timeliner. Documentation structure was inspired by Ofer Shapira's Dibbur README; no source code or prose was copied from it:
https://github.com/ofershap/dibbur

## Optional user-supplied audio

Local files may still require composition, recording, performance or redistribution permissions depending on their use and jurisdiction. A subscription or purchased file alone does not settle those rights. Git ignores local music paths, but Vite copies public assets to the build output. Review `dist/` before deployment.
