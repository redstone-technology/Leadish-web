# Hero scene (variant C)

The animated picture under the homepage headline. Built with
[Stageshow](https://github.com/benjitaylor/skills) by Benji Taylor (MIT, see `STAGESHOW-LICENSE`),
a React kit for faux product UI with a scripted story. The kit is copied in `kit/`.

What it shows: one live leaderboard. Each call card is the next rep calling an AI customer.
A close sends its points flying into that rep's row; ranks change only when a score passes
someone, and the crown moves only when #1 changes. A hang-up gives nothing. When time's up the
board names the winner, then a fresh challenge starts. The footer's green ribbon draws in,
holds, and draws out behind it, on a loop.

- `Hero.tsx`: the scene, its data (`CALLS`, `SCORES`) and the script (`play`, `next`, `script`).
- `leadish.css`: its styles (black + neon green, gold crown, the ribbon keyframes).
- `blobs.ts`: player faces from [Blobatar](https://github.com/Alain00/blobatar) (MIT), pre-rendered.
  Regenerate with `npm run faces`.
- `mount.tsx`: mounts the scene into every `[data-ld-stage]` on the page.

Build and copy into the site:

```sh
cd src/hero-stage
npm install
npm run build
cp dist/ld-stage.js ../../js/ld-stage.js
cp dist/ld-stage.css ../../css/ld-stage.css
```

`src/` is not deployed (`.vercelignore`); only the built files are.
