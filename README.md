![the-shrine-ng](https://github.com/svenpanel/the-shrine-ng/raw/master/static/og_image.png)

# the shrine, 21st century edition

But why?

Well, to:

- [x] save the [original shrine](http://theshrine.de) from becoming history due to technical advancements.
- [x] allow everyone to contribute to the project.
- [x] keep the authentic design (for now), but make it usable on small screens.
- [x] allow it to be used offline.

## Adding a groove

1. Make sure it's freely usable.
2. Lower the volume by roughly 11dB.
3. Encode it to a low bitrate to keep file size small
4. add it to the `public/grooves` folder
5. add it to the `public/grooves.json` file

## Development

No dependencies and no build step: `public/` is the site. Native ES modules and custom elements live in `public/js/`, styles in `public/style.css`.

```bash
# serve public/ at localhost:3000 (any static server works)
$ python3 -m http.server -d public 3000

# run the tests (node:test, no install needed)
$ node --test 'test/*.test.js'
```

Adding or replacing a sound: drop the mp3 into `public/sounds/` and edit `public/sounds.json`. Nothing else. The service worker precaches whatever the JSON files list, and the deploy stamps a content hash that renews the media cache when a file changes.

Adding a shell file (css, js, font): list it in `SHELL` in `public/sw.js`; the tests check it. The deploy workflow stamps the cache names with `.github/stamp-sw.sh`; locally they stay `dev`; the dev worker skips the media precache and loads audio network-first, so a replaced sound plays right away without clearing site data.
