# Sadaqah Jariyah Radio — TODO

## Bug Fixes & Code Quality

### High Priority

- [x] **Keyboard event listener leak** (`App.jsx`) — fixed by adding `isPlayingRef` and removing `isPlaying` from the effect's dependency array so a single stable listener is registered.
- [x] **Silent audio errors** — audio `error` event now sets an `audioError` state shown as a banner; cleared on next successful load.
- [x] **Clip filename parser silently fails** (`clipParser.js`) — added numeric range validation; logs a `console.warn` in dev mode for malformed filenames.

### Medium Priority

- [x] **Missing React Error Boundaries** — created `ErrorBoundary` component and wrapped `SurahLibrary` in it.
- [x] **Modal accessibility** — all 5 modals now have `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to their `h2`.
- [x] **Arabic search normalization** (`SurahLibrary.jsx`) — `normalizeArabic` helper strips diacritics and normalises alef/ya/ta-marbuta variants before comparing.
- [x] **Null safety in VersesDisplay** — optional chaining added on `currentAudioOption?.range` and `currentSurah?.number`.

### Low Priority

- [ ] **Add unit tests** — zero test coverage. Start with `clipParser.js` (most logic-heavy utility) to catch regressions when audio naming conventions change.

---

## Architecture Improvements

- [x] **Extract audio engine from App.jsx** — all playback state, refs, effects, and handlers moved into `src/hooks/useAudioPlayer.js`. App.jsx is now a thin layout shell (~90 lines).
- [x] **Split SurahLibrary.jsx** — all 5 modals extracted into `src/components/modals/` (HelpModal, AboutModal, BookmarkModal, CommunityModal, SettingsModal). Each modal owns its own state and refs.
- [x] **PWA service worker** — `public/sw.js` created with cache-first for audio files and network-first for the app shell. Registered in `main.jsx` on page load.
- [x] **JSDoc types** — `@typedef` blocks added to `useAudioPlayer.js` for `Surah` and `AudioOption`; key public functions annotated.

---

## New Features

### Audio & Playback
- [ ] Playback speed control (0.75x, 1x, 1.25x, 1.5x)
- [ ] Sleep timer — stop playback after 15 / 30 / 60 minutes
- [ ] Shuffle mode — random surah from the available library
- [ ] Volume control in the UI
- [ ] Resume from last position — remember playback position within a surah across sessions

### Content Discovery
- [ ] "Play all by reciter" — filter to one reciter and play their full library in order
- [ ] Recently played list
- [ ] Surah info panel — revelation type (Meccan/Medinan), ayah count, theme summary

### Text & Learning
- [ ] Word-by-word translation — tap/hover an Arabic word to see its meaning (Quran.com API supports this)
- [ ] Transliteration — romanized pronunciation for non-Arabic readers
- [ ] Verse highlighting sync — highlight the currently playing verse as audio progresses (requires per-verse timestamps)
- [ ] Font size slider for Arabic text

### Community & Sharing
- [ ] Deep-link sharing — `/?surah=1&reciter=X` URL so users can share what they're listening to
- [ ] Dua / Islamic calendar widget
- [ ] Offline mode (PWA) — cache audio files for offline listening

### Stats & Motivation
- [ ] Personal listening history — which surahs listened to and how many times
- [ ] Listening streaks — consecutive days listened
