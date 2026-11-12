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

## Booking (/book)

Every "Book" button goes to `/book` (`book.html`, `css/book.css`, `js/book.js`): one question per screen.
The last question (optional notes) sends the booking, Skip included, then a thank-you screen shows a slot
for the intro video (`videoSlot()` in `js/book.js`). Answers stay in the visitor's browser until they book.

Every lead is scored (Hot, Warm or Not a fit), on the page and again on the server. Not a fit = a team of
1 to 5 and someone who can't decide for the company: they skip picking a day, leave their details for the
waitlist, and get a polite "not yet". Hot = 6+ salespeople, a decision maker, and no real practice today.

The booking is sent to `api/book.js` (a Vercel function), which checks it and then:

- saves a row in the **Challenge Bookings** database in Notion (Redstone HQ), and
- sends an email alert through Resend (optional).

Set these in Vercel, under Project → Settings → Environment Variables, then redeploy:

| Name | What it is |
| --- | --- |
| `NOTION_TOKEN` | The secret of a Notion internal integration. Share the Challenge Bookings database with that integration. |
| `NOTION_DATABASE_ID` | Optional. Defaults to the Challenge Bookings database. |
| `RESEND_API_KEY` | Optional. Turns on the email alert. |
| `BOOKING_ALERT_TO` | Optional. Where the alert goes. Until leadish.app is verified in Resend, this must be the Resend account's own email. |
| `BOOKING_ALERT_FROM` | Optional. Defaults to `Leadish Bookings <onboarding@resend.dev>`. |

If neither Notion nor Resend is set up, the page tells the visitor it couldn't send, and offers to copy
the booking or email it to tayeb@leadish.app, so no lead is lost silently.

## Brand notes

- Green is the rep's voice, purple is the AI customer's response. The line behind the glass is the brand's conversation line, in one solid colour. Backgrounds are flat with a fine grain.
- Headlines use Sora. The brand guide's headline face, Forma DJR Display, needs a web licence before it can be added.
- Names, scores and calls shown in the interface are sample data.
