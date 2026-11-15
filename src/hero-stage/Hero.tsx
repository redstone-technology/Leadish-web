import { Check } from '@phosphor-icons/react/dist/csr/Check'
import { CrownSimple } from '@phosphor-icons/react/dist/csr/CrownSimple'
import { PhoneX } from '@phosphor-icons/react/dist/csr/PhoneX'
import { Bar, Count, Fly, Stage, States, Window, type Act, type Rect } from './kit'
import { BLOBS, type Face } from './blobs'
import './leadish.css'

// Leadish, variant C. A system story, no cursor (built from the
// `subscriptions` gold). One live leaderboard for the whole challenge; the
// call card beside it is what changes, one rep and one AI customer at a time.
// Only a call's result touches the board: a close sends its points flying
// into that rep's row, the score rolls, and the rep moves up only if the new
// score passes someone (the crown moves only if #1 changes). A hang-up gives
// nothing: the face turns sad and the board stays put.
//
// Beats: Sara closes (+6), passes Noor, the crown moves to her. Maha's
// customer hangs up: no points. Omar closes (+9), passes Noor into 2nd, the
// crown stays. Time's up: "Challenge over · Sara wins". The reset has a seen
// cause: the board clears and a fresh challenge starts.
//
// Plan
// - Place: the hero of leadish.app under the headline, full width on the
//   brand purple. Desktop 880 x 424 (fills to the column), phone 358 x 520.
// - Look: the real product (play.leadish.app) is black with one neon green.
// - Focal object: the leaderboard. Satellite: the call card, straddling the
//   window's sidebar, so it covers chrome, never a row.

type Tag = 'call' | 'closed' | 'hung'
type Name = 'Noor' | 'Sara' | 'Omar' | 'Maha'
const NAMES: Name[] = ['Noor', 'Sara', 'Omar', 'Maha']

type Call = {
  rep: Name
  result: 'closed' | 'hung'
  points: number
  customer: { name: string; role: string; img: string }
  lines: [string, string]
}

const CALLS: Call[] = [
  {
    rep: 'Sara',
    result: 'closed',
    points: 6,
    customer: { name: 'Khalid Aziz', role: 'Restaurant owner', img: 'assets/customer-cap.webp' },
    lines: ['Too expensive. Why should I pay more?', 'Fine. Thursday, after lunch.'],
  },
  {
    rep: 'Maha',
    result: 'hung',
    points: 0,
    customer: { name: 'Adel Rasheed', role: 'Property buyer', img: 'assets/customer-neutral.webp' },
    lines: ['Why this building and not the one next door?', 'Not interested. Goodbye.'],
  },
  {
    rep: 'Omar',
    result: 'closed',
    points: 9,
    customer: { name: 'Mariam Saleh', role: 'Gym owner', img: 'assets/customer-hat.webp' },
    lines: ['We already have a supplier.', "Send me the price. I'll switch."],
  },
]

const SCORES: Record<Name, number> = { Noor: 21, Sara: 18, Omar: 14, Maha: 9 }

type Clock = 't3' | 't2' | 't1' | 'up'
type CallState = 'talk' | 'closed' | 'hung'
type S = {
  scores: Record<Name, number>
  tags: Record<Name, Tag>
  order: Name[]
  crown: boolean
  // which call card is showing (-1: none), its line, its status, its budding chip
  card: number
  line: 0 | 1
  call: CallState
  chip: boolean
  clock: Clock
  over: boolean
  clear: boolean
  fly: null | { k: number; from: Rect; to: Rect; go: boolean }
}

const byScore = (s: Record<Name, number>) => NAMES.slice().sort((a, b) => s[b] - s[a])
// Who is on top when time runs out, worked out from the calls themselves
const FINAL = CALLS.reduce((t, c) => ({ ...t, [c.rep]: t[c.rep] + c.points }), { ...SCORES })
const WINNER = byScore(FINAL)[0]

const START: S = {
  scores: { ...SCORES },
  tags: { Noor: 'closed', Sara: 'call', Omar: 'hung', Maha: 'closed' },
  order: byScore(SCORES),
  crown: true,
  card: 0,
  line: 0,
  call: 'talk',
  chip: false,
  clock: 't3',
  over: false,
  clear: false,
  fly: null,
}

// The poster: Sara's close has landed, she's on top under the crown
const POSTER_SCORES = { ...SCORES, Sara: 24 }
const POSTER: S = { ...START, scores: POSTER_SCORES, order: byScore(POSTER_SCORES), tags: { ...START.tags, Sara: 'closed' }, line: 1, call: 'closed' }

// The script keeps its own copy of the board (it is deterministic), so it
// knows before it moves anything whether a close is a pass and a new #1
type Mirror = { scores: Record<Name, number>; order: Name[] }

async function play(a: Act<S>, k: number, m: Mirror) {
  const c = CALLS[k]
  await a.wait(800)
  a.mark(`line-${k}`)
  await a.set({ line: 1 })
  await a.wait(1100)
  if (c.result === 'hung') {
    // No points: the card and the row say it, and the board doesn't move
    a.mark(`hung-${k}`)
    await a.set((s) => ({ call: 'hung', tags: { ...s.tags, [c.rep]: 'hung' } }))
    await a.wait(1400)
    return
  }
  // The call ends: the card says it on its own status, and the points bud off it
  a.mark(`closed-${k}`)
  await a.set({ call: 'closed', chip: true })
  await a.wait(320)
  // Measured where they show: rows are placed by a transform (their rank),
  // so a layout rect would aim every flight at the top row
  const from = a.rect(`chip-${k}`)
  const to = a.rect(`score-${c.rep}`)
  await a.set({ chip: false, fly: { k, from, to, go: false } })
  await a.wait(60)
  await a.set((s) => ({ fly: { ...s.fly!, go: true } }))
  await a.wait(900)
  // Landed: the score rolls, the row's face and tag change with it
  a.mark(`landed-${k}`)
  m.scores = { ...m.scores, [c.rep]: m.scores[c.rep] + c.points }
  await a.set((s) => ({ fly: null, scores: m.scores, tags: { ...s.tags, [c.rep]: 'closed' } }))
  await a.wait(450)
  // Only a pass moves anyone; only a new #1 moves the crown
  const order = byScore(m.scores)
  const moved = order.some((n, i) => n !== m.order[i])
  if (moved) {
    const newLead = order[0] !== m.order[0]
    m.order = order
    if (newLead) {
      await a.set({ crown: false })
      await a.wait(200)
    }
    a.mark(`swap-${k}`)
    await a.set({ order })
    await a.wait(800)
    if (newLead) await a.set({ crown: true })
  }
  await a.wait(1300)
}

// The next rep's card comes in; their row shows they're on a call
async function next(a: Act<S>, k: number, clock: Clock) {
  await a.set({ card: -1 })
  await a.wait(380)
  await a.snap({ line: 0, call: 'talk' })
  await a.set((s) => ({ card: k, clock, tags: { ...s.tags, [CALLS[k].rep]: 'call' } }))
}

async function script(a: Act<S>) {
  const m: Mirror = { scores: { ...SCORES }, order: byScore(SCORES) }
  await play(a, 0, m)
  await next(a, 1, 't2')
  await play(a, 1, m)
  await next(a, 2, 't1')
  await play(a, 2, m)
  // Time's up: the card leaves, the board names the winner
  a.mark('over')
  await a.set({ card: -1, clock: 'up', over: true })
  await a.wait(2400)
  // A fresh challenge: the rows clear and reset while clear; they come back
  // with the first card, as the title and the clock turn back
  a.mark('fresh')
  await a.set({ clear: true, over: false, clock: 't3', card: 0, line: 0, call: 'talk' })
  await a.wait(380)
  await a.snap({ scores: START.scores, tags: START.tags, order: START.order, crown: true, chip: false })
  await a.set({ clear: false })
  await a.wait(300)
}

const FACE: Record<Tag, Face> = { closed: 'happy', hung: 'sad', call: 'thinking' }
const TAG: Record<Tag, string> = { closed: 'Closed', call: 'On a call', hung: 'Hung up' }
const CLOCK: Record<Clock, string> = { t3: '3 min left', t2: '2 min left', t1: '1 min left', up: "Time's up" }

function Blob({ name, face, className }: { name: Name; face: Face; className?: string }) {
  return (
    <span className={'ld-av ' + (className ?? '')}>
      {(['idle', 'happy', 'sad', 'thinking'] as Face[]).map((f) => (
        <span key={f} className="ld-face" data-on={f === face || undefined} dangerouslySetInnerHTML={{ __html: BLOBS[name][f] }} />
      ))}
    </span>
  )
}

function Board({ s, compact }: { s: S; compact: boolean }) {
  return (
    <div className="ld-scene" data-on>
      <div className="ld-head">
        <div className="ld-title">
          <States value={s.over ? 'over' : 'live'} align="start" states={{ live: 'Live leaderboard', over: compact ? `${WINNER} wins` : `Challenge over · ${WINNER} wins` }} />
        </div>
        <span className="ld-round" data-up={s.clock === 'up' || undefined}>
          <States value={s.clock} states={CLOCK} />
        </span>
      </div>
      <div className="ld-list" role="list" data-clear={s.clear || undefined}>
        <span className="ld-crown" data-on={s.crown || undefined} aria-hidden>
          <CrownSimple weight="fill" size={22} />
        </span>
        {/* The ranks belong to the slots, not the people: the rows slide past them */}
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className="ld-pos" data-lead={n === 1 || undefined} style={{ ['--rank' as string]: n - 1 }} aria-hidden>
            {n}
          </span>
        ))}
        {NAMES.map((n) => {
          const rank = s.order.indexOf(n)
          const tag = s.tags[n]
          return (
            <div role="listitem" key={n} className="ld-row" data-rank={rank} data-lead={rank === 0 || undefined} data-win={(s.over && rank === 0) || undefined} style={{ ['--rank' as string]: rank }}>
              <span className="ld-slot" />
              <Blob name={n} face={s.over && rank === 0 ? 'happy' : FACE[tag]} />
              <span className="ld-name">{n}</span>
              <span className="ld-tag" data-t={tag}>
                <States value={tag} states={TAG} />
              </span>
              <span className="ld-score" data-target={`score-${n}`}>
                <Count value={s.scores[n]} duration={800} />
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CallCard({ k, s }: { k: number; s: S }) {
  const c = CALLS[k]
  const on = s.card === k
  // A card that isn't showing keeps its opening look, so it never enters mid-story
  const line = on ? s.line : 0
  const call: CallState = on ? s.call : 'talk'
  return (
    <section className="ld-call" data-in={on || undefined} aria-hidden={!on || undefined}>
      <div className="ld-call__who">
        <img className="ld-photo" src={c.customer.img} alt="" width={36} height={36} />
        <span className="ld-call__lines">
          <span className="ld-call__name">{c.customer.name}</span>
          <span className="ld-call__role">AI customer · {c.customer.role}</span>
        </span>
      </div>
      <div className="ld-quote">
        {/* Both lines held in one box, crossfaded, so the card never changes size */}
        <States value={line === 0 ? 'a' : 'b'} align="start" states={{ a: '“' + c.lines[0] + '”', b: '“' + c.lines[1] + '”' }} />
      </div>
      <div className="ld-call__foot">
        <Blob name={c.rep} face={call === 'closed' ? 'happy' : call === 'hung' ? 'sad' : 'thinking'} className="ld-av--s" />
        <span className="ld-call__rep">{c.rep}</span>
        <span className="ld-status" data-state={call}>
          <States
            value={call}
            states={{
              talk: (
                <span className="ld-status__in">
                  <i className="ld-live" />
                  On the call
                </span>
              ),
              closed: (
                <span className="ld-status__in">
                  <Check weight="bold" size={12} />
                  Deal closed
                </span>
              ),
              hung: (
                <span className="ld-status__in">
                  <PhoneX weight="fill" size={12} />
                  Hung up
                </span>
              ),
            }}
          />
        </span>
        {c.points > 0 && (
          <span className="ld-chip ld-chip--held" data-target={`chip-${k}`} data-on={(on && s.chip) || undefined}>
            +{c.points}
          </span>
        )}
      </div>
    </section>
  )
}

export default function LeadishHero() {
  return (
    <Stage<S>
      width={880}
      height={440}
      compact={{ below: 640, width: 358, height: 528 }}
      theme="dark"
      fill
      initial={START}
      poster={POSTER}
      script={script}
      className="ld"
    >
      {(s, _rect, layout) => (
        <>
          <Ribbon compact={layout === 'compact'} />
          <Window url="play.leadish.app/challenge/4821" className="ld-window" sidebarWidth={156} sidebar={layout === 'compact' ? undefined : <Side />}>
            <div className="ld-scenes">
              <Board s={s} compact={layout === 'compact'} />
            </div>
          </Window>
          {CALLS.map((_, k) => (
            <CallCard key={k} k={k} s={s} />
          ))}
          {s.fly && (
            <Fly from={s.fly.from} to={s.fly.to} go={s.fly.go} held duration={900}>
              <span className="ld-chip ld-chip--fly">+{CALLS[s.fly.k].points}</span>
            </Fly>
          )}
        </>
      )}
    </Stage>
  )
}

// The page's footer ribbon, the same one: the same wave, the same weight
// (26 in a 400-wide box on the phone card; scaled to the desktop footer's
// thickness here), drawn in from the left on the footer's own curve. Looped:
// it draws in, holds, slides out to the right the same way, and goes again.
const RIBBON = {
  // The phone footer's path (viewBox 0 0 400 200), as is
  compact: { box: '0 0 400 200', w: 26, d: 'M-60 178 C 40 138, 110 204, 200 170 S 330 128, 460 156' },
  // The same wave at 2.2x for the 880-wide stage
  wide: { box: '0 0 880 440', w: 57, d: 'M-132 392 C 88 304, 242 449, 440 374 S 726 282, 1012 343' },
}

function Ribbon({ compact }: { compact: boolean }) {
  const r = RIBBON[compact ? 'compact' : 'wide']
  return (
    <svg className="ld-ribbon" data-l={compact ? 'c' : 'w'} viewBox={r.box} aria-hidden>
      <path d={r.d} pathLength={1} strokeWidth={r.w} />
    </svg>
  )
}

function Side() {
  return (
    <div className="ld-side">
      <span className="ld-brand">Leadish</span>
      {[52, 64, 44, 58].map((w, i) => (
        <div key={i} className="ld-nav" data-on={i === 0 || undefined}>
          <Bar w={10} h={10} r={3} tone={i === 0 ? 4 : 2} />
          <Bar w={w} h={5} tone={i === 0 ? 4 : 2} />
        </div>
      ))}
    </div>
  )
}
