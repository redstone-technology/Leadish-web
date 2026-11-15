# Homepage hero variants

Saved snapshots of the three hero designs, so we can mix and match later.
Each folder is a full working page (its own CSS and JS, sharing the site's `/assets`).
They are live but hidden from search (`noindex`):

| Variant | URL | Headline | Picture under it |
|---|---|---|---|
| A | `/variants/a` | "Sales practice your team wants to play." | Three-card story: call → points fly to the board → manager replay |
| B | `/variants/b` | "Stop training your sales team. Let them play." | Big live scoreboard on the purple panel, crown, Blobatar faces |
| C | `/variants/c` | Same as B | Stageshow scene: dark product window, call card, points flying, one crown, the footer's green ribbon looping |

**C is the live homepage** (`/index.html`, `css/hero.css`, `css/ld-stage.css`, `js/ld-stage.js`).
The source of C's scene is in `src/hero-stage/` (see its README).

Mixing ideas: B's scoreboard lives in `variants/b/js/scoreboard.js` + `variants/b/css/variant-b.css`;
A's story cards in `variants/a/js/hero.js` + the "Hero: two-line headline…" block in `variants/a/css/styles.css`.
