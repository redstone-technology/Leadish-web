# Leadish landing page

The site at leadish.app. Plain HTML, CSS and JavaScript. No build step: Vercel serves the files as they are.

```
index.html          the page (logo and mascot are inline SVG symbols at the top of <body>)
css/styles.css      all styles; colours and glass live in the tokens at the top
js/main.js          colour picker, scroll reveals, the looping call, the replay panel, the leaderboard
assets/             fonts (Sora, Readex Pro Arabic), mascot faces, favicon, share image
```

## Colours

Four finishes, all from the brand palette: `light` (white), `mist` (Soft Grey), `ink` (Deep Ink) and `violet` (Leadish Purple).
The page follows the visitor's light/dark setting (`light` or `ink`). The dots in the nav switch between all four.
To preview one directly, add `?finish=ink` to the URL.

To ship a single finish: set `data-theme` on `<html>`, then remove the `.finish` groups in `index.html`.

## The button

"Book a free team challenge" opens an email to tayeb@leadish.app. To use a form or a booking link instead,
change the `href` on the button inside `<section class="close" id="book">`.

## Brand notes

- Green is the rep's voice, purple is the AI customer's response. The line behind the glass is the brand's conversation line, in one solid colour. Backgrounds are flat with a fine grain.
- Headlines use Sora. The brand guide's headline face, Forma DJR Display, needs a web licence before it can be added.
- Names, scores and calls shown in the interface are sample data.
