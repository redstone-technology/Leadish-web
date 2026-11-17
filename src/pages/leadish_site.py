"""Shared template for Leadish topic pages and resources.

Every page is static HTML built from the data in pages_*.py, in the homepage's
design (styles.css + pages.css). Run:  python3 src/pages/build.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = "https://leadish.app"
SYMBOLS = (Path(__file__).parent / "symbols.svg").read_text()

ORG_ID = SITE + "/#org"
APP_ID = SITE + "/#app"
SITE_ID = SITE + "/#website"


def esc(s):
    return html.escape(s, quote=True)


def text_of(h):
    """Plain text from a small HTML snippet (for structured data)."""
    t = re.sub(r"<[^>]+>", "", h)
    return re.sub(r"\s+", " ", html.unescape(t)).strip()


RIBBON = (
    '<svg class="ribbon" viewBox="0 0 1600 800" aria-hidden="true"><path class="line" pathLength="1" '
    'stroke-width="74" d="M-900 540 C -600 450, -380 690, -90 640 C 200 590, 380 520, 640 565 S 1000 700, '
    '1240 620 S 1500 480, 1700 550 S 2100 700, 2500 600"/></svg>'
)
PANEL_RIBBON = (
    '<svg class="ribbon" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true"><path class="line" '
    'pathLength="1" stroke-width="46" d="M-80 330 C 120 160, 300 400, 520 300 S 860 60, 1280 170"/></svg>'
)

# Flip on when /resources is published (stage 2)
HAS_RESOURCES = False

NAV = {
    "en": [("/ai-sales-training", "AI sales training"), ("/ai-sales-roleplay", "AI roleplay"),
           ("/sales-training-for-teams", "For teams"), ("/resources", "Resources")],
    "ar": [("/ai-sales-training", "AI sales training"), ("/ai-sales-roleplay", "AI roleplay"),
           ("/sales-training-for-teams", "For teams"), ("/resources", "Resources")],
}
FOOT = [("/ai-sales-training", "AI sales training"), ("/ai-sales-roleplay", "AI sales roleplay"),
        ("/sales-training-for-teams", "Sales training for teams"), ("/arabic-sales-training", "Arabic sales training"),
        ("/ar/sales-training", "العربية"), ("/resources", "Resources"), ("mailto:tayeb@leadish.app", "Contact")]

UI = {
    "en": {"signin": "Sign in", "book": "Book a free challenge", "home": "Home", "skip": "Skip to content",
           "short": "In short", "faq": "Questions people ask", "related": "Keep reading",
           "mail": "Or write to", "made": "© 2026 Leadish. Made in Doha."},
    "ar": {"signin": "تسجيل الدخول", "book": "احجز تحدياً مجانياً", "home": "الرئيسية", "skip": "انتقل إلى المحتوى",
           "short": "باختصار", "faq": "أسئلة شائعة", "related": "اقرأ أيضاً",
           "mail": "أو راسلنا على", "made": "© 2026 Leadish. صُنع في الدوحة."},
}


def nav_html(lang, active):
    u = UI[lang]
    items = [x for x in NAV[lang] if HAS_RESOURCES or x[0] != "/resources"]
    links = "".join(
        f'<a href="{h}"{" aria-current=\"page\"" if h == active else ""}>{esc(t)}</a>' for h, t in items
    )
    return f"""<header class="nav glass glass--thick">
  <a class="nav__logo" href="/" aria-label="Leadish home"><svg aria-hidden="true"><use href="#logo"/></svg></a>
  <nav class="nav__links" aria-label="Main">{links}</nav>
  <div class="nav__end">
    <a class="btn btn--glass btn--s nav__signin" href="https://play.leadish.app">{u['signin']}</a>
    <a class="btn btn--primary btn--s" href="/book">{u['book']}</a>
  </div>
</header>"""


def foot_html(lang):
    items = [x for x in FOOT if HAS_RESOURCES or x[0] != "/resources"]
    links = "".join(f'<a href="{h}"{" lang=\"ar\"" if t == "العربية" else ""}>{esc(t)}</a>' for h, t in items)
    return f"""<footer class="foot">
  <div class="wrap foot__row">
    <a class="foot__logo" href="/" aria-label="Leadish home"><svg aria-hidden="true"><use href="#logo"/></svg></a>
    <nav class="foot__links" aria-label="Footer">{links}</nav>
    <div class="foot__finish"><span>{UI[lang]['made']}</span></div>
  </div>
</footer>"""


def crumbs_html(lang, crumbs):
    parts = []
    for i, (name, href) in enumerate(crumbs):
        if i:
            parts.append('<span aria-hidden="true">/</span>')
        parts.append(f'<a href="{href}">{esc(name)}</a>' if href else f'<span aria-current="page">{esc(name)}</span>')
    return f'<nav class="crumbs" aria-label="Breadcrumb">{"".join(parts)}</nav>'


def faq_html(lang, faq):
    if not faq:
        return ""
    items = "".join(
        f'<details class="glass glass--thin"><summary>{esc(q)}</summary><div>{a}</div></details>' for q, a in faq
    )
    return f"""<section class="p-sec" id="faq">
  <div class="wrap">
    <div class="p-sec__head p-sec__head--c"><h2 class="p-h2">{UI[lang]['faq']}</h2></div>
    <div class="faq">{items}</div>
  </div>
</section>"""


def related_html(lang, related):
    if not related:
        return ""
    cards = "".join(
        f'<a class="card glass glass--thin" href="{h}"><span class="card__tag">{esc(tag)}</span>'
        f'<h3>{esc(t)}</h3><p>{esc(d)}</p></a>' for h, tag, t, d in related
    )
    return f"""<section class="p-sec">
  <div class="wrap">
    <div class="p-sec__head"><h2 class="p-h2">{UI[lang]['related']}</h2></div>
    <div class="related">{cards}</div>
  </div>
</section>"""


def close_html(lang, close):
    h2, lede, btn = close
    return f"""<section class="close" id="book">
  {RIBBON}
  <div class="wrap">
    <div class="close__card glass">
      <div class="close__face" aria-hidden="true"><svg><use href="#face"/></svg></div>
      <h2 class="h2">{esc(h2)}</h2>
      <p class="lede">{esc(lede)}</p>
      <a class="btn btn--primary btn--l" href="/book">{esc(btn)}</a>
      <p class="close__mail">{UI[lang]['mail']} <a href="mailto:tayeb@leadish.app">tayeb@leadish.app</a></p>
    </div>
  </div>
</section>"""


def schema(p):
    url = SITE + p["url"]
    crumbs = [
        {"@type": "ListItem", "position": i + 1, "name": n, **({"item": SITE + h} if h else {"item": url})}
        for i, (n, h) in enumerate(p["crumbs"])
    ]
    graph = [
        {"@type": "BreadcrumbList", "@id": url + "#crumbs", "itemListElement": crumbs},
    ]
    main = {
        "@type": p.get("schema_type", "WebPage"),
        "@id": url + "#page",
        "url": url,
        "name": p["title"],
        "headline": text_of(p["h1"]),
        "description": p["description"],
        "inLanguage": p["lang"],
        "isPartOf": {"@id": SITE_ID},
        "about": {"@id": APP_ID},
        "publisher": {"@id": ORG_ID},
        "breadcrumb": {"@id": url + "#crumbs"},
    }
    if p.get("schema_type") == "Article":
        main.update({
            "author": {"@type": "Person", "name": "Eltayeb Abdalla", "jobTitle": "Founder of Leadish",
                       "worksFor": {"@id": ORG_ID}},
            "datePublished": p["date"], "dateModified": p.get("modified", p["date"]),
            "mainEntityOfPage": url,
            "image": SITE + "/assets/og.jpg",
        })
    graph.append(main)
    if p.get("faq"):
        graph.append({
            "@type": "FAQPage", "@id": url + "#faq", "inLanguage": p["lang"],
            "mainEntity": [{"@type": "Question", "name": q,
                            "acceptedAnswer": {"@type": "Answer", "text": text_of(a)}} for q, a in p["faq"]],
        })
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=1)


def render(p):
    lang = p["lang"]
    u = UI[lang]
    url = SITE + p["url"]
    dirattr = ' dir="rtl"' if lang == "ar" else ""
    alts = "".join(f'\n<link rel="alternate" hreflang="{l}" href="{SITE + h}">' for l, h in p.get("alternates", []))
    if p.get("alternates"):
        alts += f'\n<link rel="alternate" hreflang="x-default" href="{SITE + p["alternates"][0][1]}">'
    stage_css = '\n<link rel="stylesheet" href="/css/ld-stage.css">' if p.get("stage") else ""
    stage_js = '\n<script src="/js/ld-stage.js" defer></script>' if p.get("stage") else ""

    hero_note = f'<p class="p-note">{esc(p["note"])}</p>' if p.get("note") else ""
    byline = p.get("byline", "")
    answer = ""
    if p.get("answer"):
        q, a = p["answer"]
        answer = f'<div class="p-answer glass glass--thick"><h2>{esc(q)}</h2><p>{a}</p></div>'
    panel = p.get("panel", "")
    actions = p.get("actions") or [(u["book"], "/book", "primary")]
    btns = "".join(f'<a class="btn btn--{k} btn--l" href="{h}">{esc(t)}</a>' for t, h, k in actions)

    return f"""<!doctype html>
<html lang="{lang}"{dirattr} data-theme="mist">
<head>
<meta charset="utf-8">
<meta http-equiv="content-language" content="{lang}">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(p['title'])}</title>
<meta name="description" content="{esc(p['description'])}">
<link rel="canonical" href="{url}">{alts}
<meta name="theme-color" content="#E4E4EC">
<meta property="og:title" content="{esc(p.get('og_title', p['title']))}">
<meta property="og:description" content="{esc(p['description'])}">
<meta property="og:type" content="{'article' if p.get('schema_type') == 'Article' else 'website'}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/assets/og.jpg">
<meta property="og:site_name" content="Leadish">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/sora-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/styles.css">
<link rel="stylesheet" href="/css/pages.css">{stage_css}
<script>document.documentElement.classList.add('js');</script>
<script type="application/ld+json">
{schema(p)}
</script>
</head>
<body>
{SYMBOLS}
<div class="grain" aria-hidden="true"></div>
<a class="skip skip--d" href="#main">{u['skip']}</a>
{nav_html(lang, p['url'])}
<main id="main" class="page">
<section class="p-hero">
  <div class="wrap">
    {crumbs_html(lang, p['crumbs'])}
    <span class="p-kicker">{esc(p['kicker'])}</span>
    <h1 class="p-h1">{p['h1']}</h1>
    <p class="lede">{p['lede']}</p>
    {byline}
    <div class="p-actions">{btns}</div>
    {hero_note}
    {answer}
    {panel}
  </div>
</section>
{p['body']}
{faq_html(lang, p.get('faq'))}
{related_html(lang, p.get('related'))}
{close_html(lang, p['close'])}
</main>
{foot_html(lang)}
<script src="/js/ref.js"></script>
<script src="/js/main.js" defer></script>{stage_js}
</body>
</html>
"""


def write(p):
    out = ROOT / p["file"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(render(p))
    return out


# ── Small building blocks for page bodies ──

def section(title, inner, lede="", center=False, sid=""):
    head_cls = "p-sec__head p-sec__head--c" if center else "p-sec__head"
    lede_html = f'<p class="lede">{lede}</p>' if lede else ""
    idattr = f' id="{sid}"' if sid else ""
    only_prose = (inner.startswith('<div class="prose">') and inner.count('<div class="prose">') == 1
                  and not any(k in inner for k in ('class="cards', 'p-table', 'p-panel', 'u-grid')))
    if only_prose and not center:
        return f"""<section class="p-sec"{idattr}>
  <div class="wrap p-split">
    <div class="{head_cls}"><h2 class="p-h2">{title}</h2>{lede_html}</div>
    {inner}
  </div>
</section>"""
    return f"""<section class="p-sec"{idattr}>
  <div class="wrap">
    <div class="{head_cls}"><h2 class="p-h2">{title}</h2>{lede_html}</div>
    {inner}
  </div>
</section>"""


def cards(items, cols=3, numbered=False):
    cls = {2: "cards cards--2", 3: "cards", 4: "cards cards--4"}[cols]
    out = []
    for i, it in enumerate(items):
        t, d = it[0], it[1]
        tag = f'<span class="card__tag">{esc(it[2])}</span>' if len(it) > 2 and it[2] else ""
        n = f'<span class="card__n">{i + 1}</span>' if numbered else ""
        out.append(f'<div class="card glass glass--thin">{n}{tag}<h3>{t}</h3><p>{d}</p></div>')
    return f'<div class="{cls}">{"".join(out)}</div>'


def prose(h):
    return f'<div class="prose">{h}</div>'


def table(head, rows, us_col=None):
    th = "".join(f'<th scope="col"{" class=\"is-us\"" if i == us_col else ""}>{h}</th>' for i, h in enumerate(head))
    body = ""
    for r in rows:
        cells = f'<th scope="row">{r[0]}</th>' + "".join(
            f'<td{" class=\"is-us\"" if i + 1 == us_col else ""}>{c}</td>' for i, c in enumerate(r[1:]))
        body += f"<tr>{cells}</tr>"
    return (f'<div class="p-table-wrap glass glass--thin"><div class="u-scroll"><table class="p-table">'
            f'<thead><tr>{th}</tr></thead><tbody>{body}</tbody></table></div></div>')


def panel(inner, stage=False):
    if stage:
        return f'<div class="p-panel p-panel--stage reveal">{inner}</div>'
    return f'<div class="p-panel reveal">{PANEL_RIBBON}<div class="p-panel__in">{inner}</div></div>'
