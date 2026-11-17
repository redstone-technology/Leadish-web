"""The four topic pages (stage 1). Facts only from the live site, the business
model canvas and the team: no invented customers, stats, prices or features."""
from leadish_site import section, cards, prose, table, panel

BOOK = "Run a free team challenge"
CLOSE = ("See how your team performs.",
         "Your first team challenge is free: 30 minutes, your whole sales team, one live leaderboard.",
         BOOK)

# ── Shared product snippets (built with the homepage's real examples) ──

LEADERBOARD = """<div class="u-card">
  <div class="u-title">Live leaderboard <span class="u-pill u-pill--g">Round in play</span></div>
  <div class="u-row u-row--lead"><span class="u-pos">1</span><span class="u-av" style="background:#7654D6">S</span><span class="u-name">Sara</span><span class="u-score">24</span></div>
  <div class="u-row"><span class="u-pos">2</span><span class="u-av" style="background:#20B878">N</span><span class="u-name">Noor</span><span class="u-score">21</span></div>
  <div class="u-row"><span class="u-pos">3</span><span class="u-av" style="background:#E19440">O</span><span class="u-name">Omar</span><span class="u-score">14</span></div>
  <div class="u-row"><span class="u-pos">4</span><span class="u-av" style="background:#3CB4F0">M</span><span class="u-name">Maha</span><span class="u-score">9</span></div>
</div>"""

CALL = """<div class="u-card">
  <div class="u-cust"><img src="/assets/customer-cap.webp" alt="" width="40" height="40" loading="lazy"><span><b>Khalid Aziz</b><small>AI customer · Restaurant owner · Hostile</small></span></div>
  <p class="u-say"><small>Khalid</small>I'm busy. You have one minute.</p>
  <p class="u-say u-say--you"><small>Noor</small>One question, then. What does an empty table cost you on a Tuesday?</p>
  <p class="u-say"><small>Khalid</small>Too much. Go on.</p>
</div>"""

TRIES = """<div class="u-card">
  <div class="u-title">Noor's score <span class="u-pill u-pill--p">3 tries</span></div>
  <div class="u-tries">
    <div><i style="height:22%"></i><b>5</b><small>Try 1</small></div>
    <div><i style="height:58%"></i><b>14</b><small>Try 2</small></div>
    <div><i style="height:90%"></i><b>21</b><small>Try 3</small></div>
  </div>
</div>"""

TEAM_TABLE = """<div class="u-card">
  <div class="u-title">Team calls <span class="u-pill">Today</span></div>
  <div class="u-scroll"><table class="u-table">
    <thead><tr><th>Rep</th><th>AI customer</th><th>Score</th><th>Rapport</th><th>Outcome</th></tr></thead>
    <tbody>
      <tr><td>Noor</td><td>Khalid · Restaurants</td><td>21</td><td>60%</td><td><span class="u-pill u-pill--g">Won</span></td></tr>
      <tr><td>Sara</td><td>Adel · Real estate</td><td>18</td><td>50%</td><td><span class="u-pill u-pill--g">Won</span></td></tr>
      <tr><td>Omar</td><td>Mariam · Gyms</td><td>14</td><td>46%</td><td><span class="u-pill">Completed</span></td></tr>
      <tr><td>Yousef</td><td>Khalid · Restaurants</td><td>5</td><td>25%</td><td><span class="u-pill u-pill--r">Hung up</span></td></tr>
    </tbody>
  </table></div>
</div>"""

RAMP = ('New reps take <strong>5.7 months</strong> on average to get up to speed (source: Sailes). '
        'Until then, every weak call is a lost deal.')

SCENARIOS = [
    ("customer-cap.webp", "Khalid Aziz", "Restaurant owner · Hostile", "I'm busy. You have one minute.",
     "Goal: earn ten minutes on Thursday."),
    ("customer-neutral.webp", "Adel Rasheed", "Property buyer · Neutral", "Why this building and not the one next door?",
     "Goal: book a viewing for Sunday."),
    ("customer-hat.webp", "Mariam Saleh", "Gym owner · Guarded", "We already have a supplier.",
     "Goal: get her to ask for your price."),
]


def scenario_cards():
    out = []
    for img, name, role, line, goal in SCENARIOS:
        out.append(f"""<div class="u-card">
  <div class="u-cust"><img src="/assets/{img}" alt="" width="40" height="40" loading="lazy"><span><b>{name}</b><small>AI customer · {role}</small></span></div>
  <p class="u-say">{line}</p>
  <p style="margin-top:12px;font-size:13px;font-weight:600;color:#0B7F4F">{goal}</p>
</div>""")
    return f'<div class="u-grid">{"".join(out)}</div>'


# ─────────────────────────────── 1. AI Sales Training ───────────────────────────────

AI_SALES_TRAINING = {
    "file": "ai-sales-training.html",
    "url": "/ai-sales-training",
    "lang": "en",
    "title": "AI Sales Training for Sales Teams | Leadish",
    "description": "What AI sales training is, how it works and how to run it with your team. Leadish lets reps practise live calls with an AI customer, in Arabic or English.",
    "crumbs": [("Home", "/"), ("AI sales training", None)],
    "kicker": "AI sales training",
    "h1": "AI sales training your reps actually do.",
    "lede": "Leadish is AI sales training built as a game. Your reps sell to an AI customer out loud, get a score after every call, and race on a live leaderboard. You hear every call.",
    "note": "Free first challenge · 30 minutes · Arabic or English",
    "answer": ("What is AI sales training?",
               "AI sales training means salespeople practise real sales conversations with an AI that plays the customer. "
               "The AI talks back, raises objections and reacts to what the rep says, and every call is scored. "
               "Reps can repeat the same situation until they get it right, without risking a real customer. "
               "Leadish does this by voice, in Arabic or English, as a team game with a live leaderboard."),
    "panel": panel(f'<div class="u-grid">{CALL}{TRIES}{LEADERBOARD}</div>'),
    "body": "".join([
        section("How AI sales training works", prose("""<ol>
<li><strong>Set the customer.</strong> We build an AI customer around what you sell: their business, what they care about and their mood (neutral, guarded or hostile).</li>
<li><strong>The rep calls and sells, out loud.</strong> No typing. It feels like a phone call, in Arabic or English.</li>
<li><strong>The AI customer answers back.</strong> It doubts, it haggles, and it can hang up, just like a real buyer.</li>
<li><strong>Every call ends with a score.</strong> You also get rapport, the transcript, the recording and an analysis of the call.</li>
<li><strong>The rep plays again to beat it.</strong> Each rep gets three tries per challenge, so practice turns into progress you can see.</li>
</ol>"""), lede="One round takes a few minutes. Nobody has to be told to play another one."),
        section("Why sales teams need it",
                prose(f"<p>Most sales training is watching: videos, slides, a workshop once a year. Then reps learn the objections for real, on your customers. {RAMP}</p>"
                      "<p>Practice is what closes that gap, but it rarely happens. Roleplay with a colleague feels awkward, managers don't have the time, and nobody keeps score. "
                      "AI sales training makes practice available any time, the same for every rep, and measurable.</p>")
                + cards([
                    ("Practise without losing deals", "Mistakes happen with the AI customer, not with a real one. Reps arrive at real calls having already heard the hard questions."),
                    ("Repeat until it sticks", "The same customer, the same objection, as many times as it takes. Three tries per challenge, and a score every time."),
                    ("See who is ready", "Every call is scored and recorded, so you know who is ready for real customers and who needs one more round."),
                    ("Reps want to play", "Scores and a live leaderboard turn practice into a competition. The team plays because it's fun, not because it's mandatory."),
                ], cols=4)),
        section("AI sales training vs traditional training",
                table(["", "Videos and workshops", "Roleplay with a colleague", "Leadish"], [
                    ("How reps learn", "Watching and listening", "Acting out a call", "Selling out loud to an AI customer"),
                    ("How often", "Once, then forgotten", "When someone has time", "Any time, a few minutes per round"),
                    ("Realism", "None", "The colleague breaks character", "The customer doubts, haggles and can hang up"),
                    ("Feedback", "A quiz at best", "An opinion", "A score, rapport, transcript and recording"),
                    ("Manager view", "Who attended", "Nothing written down", "Every call, every rep, on one leaderboard"),
                    ("Language", "Usually one", "Whatever the pair speaks", "Arabic (several dialects) or English"),
                ], us_col=3),
                lede="Not a replacement for coaching. A way to make sure reps practise between coaching sessions."),
        section("What makes Leadish different", cards([
            ("It's a game", "Scores, three tries, and a live leaderboard the whole team can see. Reps join a challenge with a code, like a quiz game."),
            ("Voice, not chat", "Reps speak and listen, like a real phone call. Selling is said out loud, so practice should be too."),
            ("Arabic and English", "The AI customer speaks Gulf, Egyptian and Sudanese Arabic and more, or English. See <a href=\"/arabic-sales-training\">Arabic sales training</a>."),
            ("Built around what you sell", "Challenges are ready-made templates set up for your industry and your customers, not generic scripts."),
            ("You hear every call", "Score, rapport, transcript and recording for each rep, without sitting in on a single call."),
            ("Runs in the browser", "Reps open play.leadish.app and enter a code. Online or at your office."),
        ])),
        section("Who it's for", prose("""<ul>
<li><strong>Sales managers and heads of sales</strong> who want their team to practise more and want to know who is ready.</li>
<li><strong>Business owners</strong> with a sales team of six or more reps, who can't sit in on every call.</li>
<li><strong>HR and training (L&amp;D) teams</strong> looking for sales training that people actually finish.</li>
</ul>
<p>Leadish is used by teams that sell over the phone or face to face, such as real estate, cars, insurance, telecom, retail, software and agencies. It's built in Doha for sales teams in Qatar, Saudi Arabia and across the GCC.</p>""")),
    ]),
    "faq": [
        ("Does AI sales training replace a sales coach?",
         "No. A coach teaches the method; AI sales training gives reps the reps. With Leadish your team practises between coaching sessions, and you can see from the scores and recordings where coaching is needed."),
        ("How long does a round take?",
         "A single call takes a few minutes. A team challenge, where the whole team plays at the same time, takes 30 minutes."),
        ("Which languages does Leadish support?",
         "Arabic and English. In Arabic the AI customer speaks Gulf, Egyptian and Sudanese dialects and more. <a href=\"/arabic-sales-training\">More on Arabic sales training</a>."),
        ("Do reps need to install anything?",
         "No. Reps open play.leadish.app in the browser and join the challenge with a code, a link or a QR code."),
        ("Can the AI customer match our products and customers?",
         "Yes. We set up the AI customer around what you sell: your industry, the kind of customer and the objections your reps actually hear."),
        ("How can we try it?",
         "Book a free 30-minute team challenge. We set up the customer, your team plays, and you get every score, transcript and recording. <a href=\"/book\">Book it here</a>."),
    ],
    "related": [
        ("/ai-sales-roleplay", "AI sales roleplay", "Practise the hard calls before they're real", "Objections, pitches and closing, with example scenarios."),
        ("/sales-training-for-teams", "For teams", "Train the whole team at once", "How a 30-minute team challenge works, and what managers get."),
        ("/arabic-sales-training", "Arabic", "Sales practice in your customers' dialect", "Gulf, Egyptian and Sudanese Arabic, for teams across the GCC."),
    ],
    "close": CLOSE,
}

# ─────────────────────────────── 2. AI Sales Roleplay ───────────────────────────────

AI_SALES_ROLEPLAY = {
    "file": "ai-sales-roleplay.html",
    "url": "/ai-sales-roleplay",
    "lang": "en",
    "stage": True,
    "title": "AI Sales Roleplay: Practise Real Sales Calls | Leadish",
    "description": "AI sales roleplay lets reps practise objections, pitches and closing with an AI customer that talks back. Example scenarios and how Leadish runs it.",
    "crumbs": [("Home", "/"), ("AI sales roleplay", None)],
    "kicker": "AI sales roleplay",
    "h1": "Practise the hard calls before they're real.",
    "lede": "With Leadish, your rep picks up, the AI customer pushes back, and every call is scored and recorded. Objections, pitches and closing, as many times as it takes.",
    "note": "Also called AI sales simulation",
    "answer": ("What is AI sales roleplay?",
               "AI sales roleplay is a practice call where an AI plays the customer. Instead of a colleague pretending to be a buyer, "
               "the AI stays in character: it has a business, a mood and real objections, and it reacts to what the rep says. "
               "It's also called AI sales simulation. With Leadish the roleplay is spoken, scored, and played as a team game."),
    "panel": panel('<div class="ld-host" data-ld-stage role="img" aria-label="A Leadish roleplay: a rep closes the AI customer on a call, the points fly to the live leaderboard and the crown moves to the new leader"></div>', stage=True),
    "body": "".join([
        section("What reps practise", cards([
            ("Objection handling", "“It's too expensive.” “We already have a supplier.” “Just send me an email.” The objections your reps hear every week, until answering them is automatic."),
            ("Cold calls and openers", "“I'm busy. You have one minute.” Practise the first 30 seconds, where most calls are won or lost."),
            ("Pitching", "Explain what you sell clearly and briefly, to a customer who interrupts and asks why it matters to them."),
            ("Negotiating", "The AI customer haggles. Practise holding your price and trading value instead of giving discounts."),
            ("Closing", "Ask for the meeting, the viewing or the order, and handle the last doubt before the yes."),
            ("Staying calm", "Hostile customers can hang up. Reps learn to keep the call alive without taking it personally."),
        ]), lede="Pick the situation. The AI customer plays it the same way for every rep, so practice is fair and comparable."),
        section("Example roleplay scenarios",
                panel(scenario_cards())
                + prose("<p>Each scenario is a ready-made template: a customer, a mood and a goal. We set them up around what your team sells, and new challenges arrive every few days so reps keep coming back.</p>"),
                lede="Three AI customers from Leadish, each with a different mood and a clear goal for the rep."),
        section("AI roleplay vs practising with a colleague",
                table(["", "Roleplay with a colleague", "AI roleplay with Leadish"], [
                    ("Realism", "Hard to stay in character", "The customer stays in character, every time"),
                    ("Availability", "When two people are free", "Any time, in a few minutes"),
                    ("Consistency", "Every colleague plays it differently", "The same customer for every rep"),
                    ("Feedback", "An opinion", "A score, rapport, transcript and recording"),
                    ("Comfort", "Awkward in front of peers", "Practise privately, compete openly"),
                ], us_col=2)),
        section("Sales simulation: use roleplay to assess your team",
                prose("<p>Because every rep sells to the same AI customer, a roleplay is also a fair test. "
                      "You can compare reps on the same situation and see who wins the call, who completes it, and who gets hung up on.</p>"
                      "<ul><li><strong>Onboarding check:</strong> make sure new reps can handle your top objections before they talk to real customers.</li>"
                      "<li><strong>Before a launch:</strong> practise the new pitch with the whole team before it goes live.</li>"
                      "<li><strong>Regular check-ins:</strong> a short challenge shows who has improved and who needs coaching.</li></ul>"
                      "<p>Every call comes with a score, rapport, the transcript, the recording and an analysis. "
                      "See how this works for a whole team on <a href=\"/sales-training-for-teams\">sales training for teams</a>.</p>")),
        section("How a roleplay round works", cards([
            ("Voice", "Your rep picks up and sells, out loud. In Arabic or English."),
            ("Response", "The AI customer answers back. It doubts, it haggles, and it can hang up."),
            ("Progress", "Every call ends with a score. Then your rep plays again to beat it."),
            ("Competition", "Scores land on a live leaderboard. The whole team sees who is on top."),
        ], cols=4, numbered=True)),
    ]),
    "faq": [
        ("Is AI sales roleplay the same as AI sales simulation?",
         "Mostly, yes. Both mean practising a sales conversation with an AI customer. “Simulation” is often used when the goal is to assess a rep; “roleplay” when the goal is practice. Leadish does both: every roleplay is scored."),
        ("Can the AI customer hang up?",
         "Yes. If the rep loses the customer's interest, a hostile customer can end the call, just like in real life."),
        ("Can we roleplay our own product and customers?",
         "Yes. We set up the AI customer around what you sell, including the objections your reps actually hear."),
        ("Does the roleplay work in Arabic?",
         "Yes. The AI customer speaks Gulf, Egyptian and Sudanese Arabic and more, or English. <a href=\"/arabic-sales-training\">More on Arabic sales training</a>."),
        ("How long is a roleplay call?",
         "A few minutes. Reps usually play several rounds in a row to beat their score."),
        ("What feedback do reps get?",
         "A score after every call, plus rapport, the transcript, the recording and an analysis. Managers see all of it for every rep."),
    ],
    "related": [
        ("/ai-sales-training", "AI sales training", "What AI sales training is", "How it works, why teams need it, and how it compares to traditional training."),
        ("/sales-training-for-teams", "For teams", "Run it with your whole team", "A 30-minute team challenge with a live leaderboard."),
        ("/arabic-sales-training", "Arabic", "Roleplay in Arabic", "Practise in the dialect your customers speak."),
    ],
    "close": ("Start practising against AI.",
              "Book a free 30-minute team challenge. We build the AI customer around what you sell, and your team plays.",
              BOOK),
}

# ─────────────────────────────── 3. Sales Training for Teams ───────────────────────────────

SALES_TRAINING_TEAMS = {
    "file": "sales-training-for-teams.html",
    "url": "/sales-training-for-teams",
    "lang": "en",
    "title": "Sales Training for Teams: Practice, Scores and a Live Leaderboard | Leadish",
    "description": "Train your whole sales team with AI practice calls, a score for every rep and a live leaderboard. Run a free 30-minute team challenge with Leadish.",
    "crumbs": [("Home", "/"), ("Sales training for teams", None)],
    "kicker": "Sales training for teams",
    "h1": "Train the whole team, not one rep at a time.",
    "lede": "A team challenge puts every rep in the same game at the same time: the same AI customer, three tries each, and one live leaderboard. You get every call.",
    "note": "Free first challenge · 30 minutes · Online or at your office",
    "answer": ("How do you train a sales team with Leadish?",
               "You run a team challenge. We build an AI customer around what you sell. Your reps join with a code, each rep gets three tries to sell to the AI customer, "
               "and scores land on a live leaderboard. You get every score, transcript and recording, so you know who is ready and who needs coaching."),
    "panel": panel(f'<div class="u-grid u-grid--2">{TEAM_TABLE}{LEADERBOARD}</div>'),
    "body": "".join([
        section("The problems it solves", cards([
            ("Onboarding takes months", RAMP),
            ("No time to listen to calls", "Managers can't sit in on every call. Leadish records and scores every practice call, so you can review the ones that matter."),
            ("Training doesn't stick", "A workshop is forgotten within weeks. Short, regular rounds keep the skills fresh, and reps come back because it's a game."),
            ("You can't see who's ready", "Every rep sells to the same customer, so the leaderboard is a fair comparison. You see who wins the call and who gets hung up on."),
        ], cols=4)),
        section("How a team challenge works", cards([
            ("Tell us what you sell", "A short onboarding call: your industry, your customers, the objections your reps hear."),
            ("We build the AI customer", "Your challenge is set up from a ready-made template, tuned to your business."),
            ("Reps join with a code", "They open play.leadish.app and enter the code, or use a link or QR code. Nothing to install."),
            ("Thirty minutes, one leaderboard", "Every rep gets three tries. Scores land on the live leaderboard for the whole team to see."),
            ("You get the results", "Every score, rapport, transcript, recording and analysis, for each rep."),
        ], cols=3, numbered=True), lede="Thirty minutes from start to leaderboard."),
        section("Use it for", cards([
            ("Onboarding new reps", "New reps practise your real objections before they meet real customers, and you can see when they're ready."),
            ("Weekly practice", "New challenges every few days keep the team coming back without anyone having to chase them."),
            ("Before a launch", "Practise a new product, price or pitch with the whole team before it reaches customers."),
            ("Performance check", "The same AI customer for everyone makes the scores comparable. Spot who needs coaching, and on what."),
        ], cols=4)),
        section("What managers get", prose("""<ul>
<li><strong>A score for every call</strong>, and how it changes from try 1 to try 3.</li>
<li><strong>Rapport</strong>: how well the rep connected with the customer.</li>
<li><strong>The transcript and recording</strong> of each call, so you can hear exactly what was said.</li>
<li><strong>The outcome</strong>: won, completed, or hung up on.</li>
<li><strong>A live leaderboard</strong> that you and your team both see during the challenge.</li>
</ul>
<p>You know who is ready for real customers and who needs one more round, without sitting in on a single call.</p>""")),
        section("Teams already play", cards([
            ("250 people", "played Leadish at a single event."),
            ("~30 challenges a day", "from one sales team in Doha."),
        ], cols=2), lede="Leadish is built in Doha for sales teams in Qatar, Saudi Arabia and across the GCC."),
    ]),
    "faq": [
        ("How many reps can play?",
         "The whole team plays at the same time. The free team challenge works best for a team of about ten reps."),
        ("Do reps need to download anything?",
         "No. Leadish runs in the browser at play.leadish.app. Reps join with a code, a link or a QR code."),
        ("Can we do it at our office?",
         "Yes. A team challenge can run online or in person at your office."),
        ("How long does a team challenge take?",
         "30 minutes, plus a short onboarding call beforehand so we can set up the AI customer for what you sell."),
        ("What does it cost?",
         "Your first team challenge is free. After it, we'll suggest a plan that fits your team size."),
        ("Does it work for Arabic-speaking teams?",
         "Yes. Reps can practise in Arabic (Gulf, Egyptian, Sudanese and more) or English. <a href=\"/arabic-sales-training\">More on Arabic sales training</a>."),
    ],
    "related": [
        ("/ai-sales-roleplay", "AI sales roleplay", "Example roleplay scenarios", "The AI customers your reps practise with, and what they learn."),
        ("/ai-sales-training", "AI sales training", "What AI sales training is", "And how it compares to workshops and peer roleplay."),
        ("/arabic-sales-training", "Arabic", "For teams across the GCC", "Practice in Gulf, Egyptian and Sudanese Arabic."),
    ],
    "close": ("Experience Leadish with your team.",
              "Book a free 30-minute team challenge. Your team plays, you get every score and recording.",
              BOOK),
}

# ─────────────────────────────── 4. Arabic AI Sales Training (English) ───────────────────────────────

DIALECTS = [
    ("Gulf Arabic", "السعر غالي شوي.", "“The price is a bit high.”"),
    ("Egyptian Arabic", "الكلام ده حلو، بس السعر عالي أوي.", "“That sounds nice, but the price is really high.”"),
    ("Sudanese Arabic", "والله السعر دا غالي شديد.", "“Honestly, this price is very expensive.”"),
]


def dialect_cards(lang="en"):
    out = []
    for name, ar, en in DIALECTS:
        label = {"Gulf Arabic": "خليجي", "Egyptian Arabic": "مصري", "Sudanese Arabic": "سوداني"}[name] if lang == "ar" else name
        trans = "" if lang == "ar" else f'<p style="margin-top:8px;font-size:13px;color:rgba(12,25,32,.6)">{en}</p>'
        out.append(f"""<div class="u-card">
  <div class="u-title">{label} <span class="u-pill u-pill--p">{'العميل' if lang == 'ar' else 'AI customer'}</span></div>
  <p class="u-say" lang="ar" dir="rtl">{ar}</p>{trans}
</div>""")
    return f'<div class="u-grid">{"".join(out)}</div>'


ARABIC_EN = {
    "file": "arabic-sales-training.html",
    "url": "/arabic-sales-training",
    "lang": "en",
    "alternates": [("en", "/arabic-sales-training"), ("ar", "/ar/sales-training")],
    "title": "Arabic AI Sales Training for GCC Sales Teams | Leadish",
    "description": "AI sales roleplay in Arabic: reps practise with an AI customer in Gulf, Egyptian or Sudanese Arabic, or English. Built in Doha for teams in Qatar, Saudi Arabia and the GCC.",
    "crumbs": [("Home", "/"), ("Arabic sales training", None)],
    "kicker": "Arabic AI sales training",
    "h1": "Sales practice in the Arabic your customers speak.",
    "lede": "Leadish's AI customer speaks Gulf, Egyptian and Sudanese Arabic and more, and English. Your reps practise the same conversations they have with real customers, in the same dialect.",
    "note": "Built in Doha for teams in Qatar, Saudi Arabia and the GCC",
    "actions": [("Run a free team challenge", "/book", "primary"), ("اقرأ بالعربية", "/ar/sales-training", "glass")],
    "answer": ("What is Arabic AI sales training?",
               "It's sales practice where the AI customer speaks Arabic. With Leadish, reps talk out loud to an AI customer in Gulf, Egyptian or Sudanese Arabic (and other dialects), or in English. "
               "The customer pushes back like a real buyer, and every call is scored. Leadish is built in Doha, Qatar, for sales teams across the GCC."),
    "panel": panel(dialect_cards("en")),
    "body": "".join([
        section("Why dialect matters in sales", prose(
            "<p>Customers in Riyadh, Doha or Cairo don't speak textbook Arabic, and they don't buy in it either. "
            "A rep who has only practised in English, or in formal Arabic, hears a different conversation on the real call: different words for “expensive”, different ways of saying “not now”.</p>"
            "<p>Practising in the dialect is practising the real call. With Leadish the AI customer speaks the way your customers do, so the objections your reps practise are the ones they will hear.</p>")),
        section("Built for Qatar, Saudi Arabia and the GCC", cards([
            ("Qatar", "Leadish is built in Doha. Challenges can run at your office or online, for teams in real estate, cars, insurance, telecom, retail and more."),
            ("Saudi Arabia", "Practise with an AI customer that speaks Gulf Arabic. Challenges run online, so teams anywhere in the Kingdom can play."),
            ("Mixed teams", "Many GCC sales teams mix Arabic and English speakers. Each rep can practise in Arabic or in English."),
        ])),
        section("What your reps can practise in Arabic", prose("""<ul>
<li><strong>Price objections:</strong> “السعر غالي شوي” and every other way of saying it.</li>
<li><strong>Competitor objections:</strong> “We already have a supplier.”</li>
<li><strong>Timing:</strong> “Not now”, “Call me next month”, “Send me the details.”</li>
<li><strong>Cold calls and openers:</strong> the first 30 seconds with a busy customer.</li>
<li><strong>Closing:</strong> asking for the meeting, the viewing or the order.</li>
</ul>
<p>See all the situations reps practise on <a href="/ai-sales-roleplay">AI sales roleplay</a>.</p>""")),
        section("Arabic sales training options",
                table(["", "Classroom courses", "English-first AI roleplay tools", "Leadish"], [
                    ("Language", "Arabic, often formal", "Mainly English", "Gulf, Egyptian, Sudanese Arabic and more, or English"),
                    ("Practice per rep", "Little", "Yes", "Yes, out loud, three tries per challenge"),
                    ("Feedback", "From the trainer", "Scores and reports", "Score, rapport, transcript, recording and analysis"),
                    ("Team format", "A class", "Usually individual", "A team challenge with a live leaderboard"),
                    ("Built in the region", "Often", "Rarely", "Built in Doha"),
                ], us_col=3)),
    ]),
    "faq": [
        ("Which Arabic dialects does Leadish speak?",
         "Gulf (Khaleeji), Egyptian and Sudanese Arabic, and other dialects. Reps can also practise in English."),
        ("Is Leadish available in Saudi Arabia?",
         "Yes. Leadish is based in Doha, and team challenges can run online, so teams anywhere in Saudi Arabia and the GCC can play."),
        ("Can Arabic- and English-speaking reps play in the same challenge?",
         "Each rep can practise in Arabic or English, and everyone's score lands on the same leaderboard."),
        ("How do we start?",
         "Book a free 30-minute team challenge. Tell us what you sell and which language or dialect your customers speak, and we set up the AI customer. <a href=\"/book\">Book it here</a>."),
    ],
    "related": [
        ("/ar/sales-training", "العربية", "اقرأ هذه الصفحة بالعربية", "تدريب المبيعات بالذكاء الاصطناعي باللغة العربية."),
        ("/ai-sales-roleplay", "AI sales roleplay", "Example roleplay scenarios", "The AI customers your reps practise with."),
        ("/sales-training-for-teams", "For teams", "Run it with your whole team", "A 30-minute team challenge with a live leaderboard."),
    ],
    "close": ("Practise in Arabic with your team.",
              "Book a free 30-minute team challenge. Tell us what you sell and which dialect your customers speak.",
              BOOK),
}

# ─────────────────────────────── 4b. Arabic version ───────────────────────────────

ARABIC_AR = {
    "file": "ar/sales-training.html",
    "url": "/ar/sales-training",
    "lang": "ar",
    "alternates": [("en", "/arabic-sales-training"), ("ar", "/ar/sales-training")],
    "title": "تدريب المبيعات بالذكاء الاصطناعي باللغة العربية | Leadish",
    "description": "تدريب مبيعات بالذكاء الاصطناعي باللهجات العربية: يتدرّب فريقك على مكالمات حقيقية مع عميل افتراضي يتحدث الخليجية والمصرية والسودانية. من الدوحة لفرق المبيعات في قطر والسعودية والخليج.",
    "crumbs": [("الرئيسية", "/"), ("تدريب المبيعات بالعربية", None)],
    "kicker": "تدريب المبيعات بالذكاء الاصطناعي",
    "h1": "تدرّب على البيع باللهجة التي يتحدث بها عملاؤك.",
    "lede": "العميل الافتراضي في Leadish يتحدث الخليجية والمصرية والسودانية ولهجات أخرى، والإنجليزية أيضاً. يتدرّب مندوبوك على نفس المحادثات التي يخوضونها مع العملاء الحقيقيين، وبنفس اللهجة.",
    "note": "صُنع في الدوحة لفرق المبيعات في قطر والسعودية والخليج",
    "actions": [("احجز تحدياً مجانياً لفريقك", "/book", "primary"), ("Read in English", "/arabic-sales-training", "glass")],
    "answer": ("ما هو تدريب المبيعات بالذكاء الاصطناعي باللغة العربية؟",
               "هو تدريب على البيع يكون فيه العميل ذكاءً اصطناعياً يتحدث العربية. مع Leadish يتحدث المندوب بصوته مع عميل افتراضي باللهجة الخليجية أو المصرية أو السودانية أو غيرها، أو بالإنجليزية. "
               "يعترض العميل ويفاوض مثل أي مشترٍ حقيقي، وتحصل كل مكالمة على تقييم. تم تطوير Leadish في الدوحة لفرق المبيعات في قطر والسعودية ودول الخليج."),
    "panel": panel(dialect_cards("ar")),
    "body": "".join([
        section("لماذا تهمّ اللهجة في البيع؟", prose(
            "<p>العملاء في الرياض والدوحة والقاهرة لا يتحدثون العربية الفصحى، ولا يشترون بها أيضاً. "
            "المندوب الذي تدرّب بالإنجليزية أو بالفصحى فقط يسمع محادثة مختلفة في المكالمة الحقيقية: كلمات مختلفة لكلمة «غالي»، وطرق مختلفة لقول «مو الحين».</p>"
            "<p>التدريب باللهجة هو تدريب على المكالمة الحقيقية. مع Leadish يتحدث العميل الافتراضي مثل عملائك تماماً، فتكون الاعتراضات التي يتدرّب عليها مندوبوك هي نفسها التي سيسمعونها.</p>")),
        section("كيف يعمل التدريب؟", cards([
            ("نجهّز العميل", "نبني عميلاً افتراضياً حول ما تبيعه: نوع نشاطه، وما يهمّه، ومزاجه (محايد أو متحفّظ أو عدائي)."),
            ("المندوب يتصل ويبيع", "بصوته، مثل مكالمة هاتفية حقيقية، بالعربية أو بالإنجليزية."),
            ("العميل يرد ويعترض", "يشكّك ويفاوض على السعر، وقد يُنهي المكالمة."),
            ("تقييم بعد كل مكالمة", "مع نسبة التواصل والنص الكامل والتسجيل وتحليل للمكالمة. لكل مندوب ثلاث محاولات."),
        ], cols=4, numbered=True)),
        section("مصمَّم لقطر والسعودية والخليج", cards([
            ("قطر", "تم تطوير Leadish في الدوحة. يمكن تنظيم التحديات في مكتبك أو عبر الإنترنت، لفرق العقارات والسيارات والتأمين والاتصالات والتجزئة وغيرها."),
            ("السعودية", "تدرّب مع عميل افتراضي يتحدث اللهجة الخليجية. التحديات تعمل عبر الإنترنت، فيمكن لأي فريق في المملكة المشاركة."),
            ("الفرق المختلطة", "كثير من فرق المبيعات في الخليج تجمع متحدثين بالعربية والإنجليزية. كل مندوب يتدرّب باللغة التي تناسبه."),
        ])),
        section("على ماذا يتدرّب مندوبوك؟", prose("""<ul>
<li><strong>اعتراضات السعر:</strong> «السعر غالي شوي» وكل الطرق الأخرى لقولها.</li>
<li><strong>اعتراضات المنافسين:</strong> «عندنا مورّد من زمان».</li>
<li><strong>التوقيت:</strong> «مو الحين»، «كلمني الشهر الجاي»، «أرسل لي التفاصيل».</li>
<li><strong>المكالمات الباردة:</strong> أول ٣٠ ثانية مع عميل مشغول.</li>
<li><strong>الإغلاق:</strong> طلب الاجتماع أو المعاينة أو الطلب.</li>
</ul>""")),
        section("ما الذي يحصل عليه المدير؟", prose("""<ul>
<li><strong>تقييم لكل مكالمة</strong>، وكيف يتحسّن من المحاولة الأولى إلى الثالثة.</li>
<li><strong>النص الكامل والتسجيل</strong> لكل مكالمة، لتسمع بالضبط ما قيل.</li>
<li><strong>لوحة صدارة مباشرة</strong> يراها الفريق كله أثناء التحدي.</li>
</ul>
<p>تعرف من هو جاهز للعملاء الحقيقيين ومن يحتاج جولة أخرى، دون أن تحضر أي مكالمة.</p>""")),
    ]),
    "faq": [
        ("ما اللهجات العربية التي يتحدثها Leadish؟",
         "الخليجية والمصرية والسودانية ولهجات أخرى. ويمكن للمندوبين التدرّب بالإنجليزية أيضاً."),
        ("هل Leadish متاح في السعودية؟",
         "نعم. مقرّنا في الدوحة، والتحديات الجماعية تعمل عبر الإنترنت، فيمكن لأي فريق في السعودية والخليج المشاركة."),
        ("كم تستغرق المكالمة الواحدة؟",
         "بضع دقائق. والتحدي الجماعي، حيث يلعب الفريق كله في نفس الوقت، يستغرق ٣٠ دقيقة."),
        ("هل يحتاج المندوبون إلى تثبيت تطبيق؟",
         "لا. يفتح المندوب play.leadish.app في المتصفح وينضم إلى التحدي برمز أو رابط أو رمز QR."),
        ("كيف نبدأ؟",
         "احجز تحدياً جماعياً مجانياً مدته ٣٠ دقيقة. أخبرنا بما تبيعه وباللهجة التي يتحدث بها عملاؤك، ونحن نجهّز العميل الافتراضي. <a href=\"/book\">احجز من هنا</a>."),
    ],
    "related": [
        ("/arabic-sales-training", "English", "Read this page in English", "Arabic AI sales training for GCC sales teams."),
        ("/ai-sales-roleplay", "AI roleplay", "AI sales roleplay", "Example scenarios (in English)."),
        ("/sales-training-for-teams", "For teams", "Sales training for teams", "How a team challenge works (in English)."),
    ],
    "close": ("جرّب Leadish مع فريقك.",
              "التحدي الجماعي الأول مجاني: ٣٠ دقيقة، فريقك كله، ولوحة صدارة مباشرة.",
              "احجز تحدياً مجانياً"),
}

PAGES = [AI_SALES_TRAINING, AI_SALES_ROLEPLAY, SALES_TRAINING_TEAMS, ARABIC_EN, ARABIC_AR]
