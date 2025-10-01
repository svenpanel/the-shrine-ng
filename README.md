![the-shrine-ng](https://github.com/svenpanel/the-shrine-ng/raw/master/public/og_image.png)

# the shrine, 21st century edition

The classic shrine soundboard rebuilt with a static [Astro](https://astro.build) site. The retro design, copy, and audio assets
remain untouched while the implementation is dramatically simpler and works without any JavaScript.

## Development

```bash
npm install
npm run dev
```

Astro serves the site on <http://localhost:4321>. The shrine is fully functional with JavaScript enabled and still offers basic
audio playback via plain links when JavaScript is disabled.

Before opening a pull request, ensure the static build succeeds:

```bash
npm run build
```

## Data & assets

- Button sounds live in `public/sounds/` with their metadata defined in `src/data/sounds.json`.
- Grooves live in `public/grooves/` with metadata in `src/data/grooves.json`.
- Keep filenames and JSON objects unchanged when replacing audio. Update both the file and the JSON entry together.

### Adding a groove

1. Make sure the file is free to use.
2. Lower the volume by roughly 11 dB.
3. Encode it to a low bitrate to keep the file size tiny.
4. Copy the file into `public/grooves/`.
5. Append an entry to `src/data/grooves.json` with the filename and display name.

## Deployment

GitHub Pages deployment is handled by `.github/workflows/deploy.yml`. After merging to `main`, GitHub Actions will build the
static site and publish it to the repository's Pages environment at `https://svenpanel.github.io/the-shrine-ng/`.

If you are publishing from a fork, update the `site` value in `astro.config.mjs` to match your own Pages URL (for example,
`https://<username>.github.io/<repo>/`).
