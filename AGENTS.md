# the-shrine-ng modernization notes

## Project summary
- The site is now a static [Astro](https://astro.build) app that renders the retro "Shrine" soundboard layout.
- Sound metadata lives in `src/data/sounds.json`, groove metadata in `src/data/grooves.json`. The corresponding audio files stay
  in `public/sounds/` and `public/grooves/`.
- Styling is authored as hand-written CSS in `src/styles/global.css` to match the original Sass output.
- Interactive behaviour (multi-sound playback, looping groove control) is handled by the lightweight
  `src/scripts/soundboard.ts` module that enhances the otherwise functional HTML.

## Mandatory constraints
- **Do not change the visual design.** Keep copy, layout, typography, spacing, and colour usage identical unless a regression
  prevents parity with the archived shrine.
- Preserve the audio experience: clicking buttons must play instantly, multiple sounds can overlap, and the groove loop toggles on
  repeat.
- Keep asset filenames and JSON structures stable. Any replacements must update both the file and its JSON entry.

## Implementation guidelines
- Prefer filesystem routes and static rendering; add small client scripts only when necessary for interactivity.
- Keep npm dependencies minimal—Astro core and vanilla TypeScript/JavaScript should cover most needs.
- Maintain the progressive enhancement baseline: the shrine should still expose playable links when JavaScript is disabled.
- Reuse the existing CSS tokens; if new styles are required, integrate them into `src/styles/global.css` without introducing
  preprocessors.
- Honour existing accessibility affordances (focus styles, keyboard activation with Enter/Space, descriptive labelling).

## Project structure expectations
- Document contributor guidance here. Add nested `AGENTS.md` files if specific subdirectories require extra rules.
- Ensure `npm run dev`, `npm run build`, and `npm run preview` remain the primary workflows.

## Testing & verification
- Run `npm run build` before landing major structural changes to confirm the static output succeeds.
- Update the README with any workflow changes contributors should know about.
