# Relay

**Reply routing for personal assistants.** Relay reads the inboxes an assistant manages, decides who owes each reply, and gives both sides a view that only shows what they need to act on.

Full-stack prototype: React and Vite on the front end, Express on the API, and a deterministic routing engine. No external services or API keys are required.

---

## What it does

**For the assistant**

- An overview with the numbers that matter: needs you, needs the client, waiting, needs review, plus deadlines pulled from email.
- A three-pane inbox with search, client, segment and status filters, read, star, unread, archive and complete.
- Every conversation carries a brief: a summary, key points, a suggested next step, confidence, the signals behind the route, and the reasoning in plain English.
- Every route also exposes its evidence ledger: the three candidate scores, each rule that fired with its weight, the decision margin and the threshold it had to clear.
- A routing lab where you can edit any message, watch the verdict change, tune the evidence floor and margin, and see which conversations in your inbox would change hands.
- An evaluation page that scores the router against 51 hand-labeled messages: accuracy, per-route precision and recall, a confusion matrix, the cases it misses, and a threshold check that reruns the whole suite.
- Reply responsibility is visible everywhere (list chips, thread header, board) and can be changed in one click. Running the analysis again restores the evidence-based result. Low-confidence threads are flagged instead of guessed.
- Threads where the last word was yours carry a waiting state in the list, the board and a thread banner, so an answered conversation never reads like a new request. The banner offers a one-click follow-up draft that refers back to your last message, editable and unsent until you approve it.
- A responsibility board with drag and drop, plus a move menu for touch and keyboard, between Assistant, Client, Review and No reply.
- Draft replies in three tones, editable before approval. Nothing sends without an explicit approve.
- Ask Relay: natural-language search over clients, threads and deadlines, with a draft shortcut.
- A simulate menu with four sample emails, so you can watch routing happen live.

**For the client**

- A minimal view with only the conversations the client must answer. No internal notes, and no full history unless they open one.
- Each card shows the sender, subject, date, a short summary and a specific reason the client is needed.
- Two outcomes: mark handled, or hand it back to the assistant with an optional note. Both show up in the assistant's dashboard straight away.

**Onboarding**

- Account step, Gmail or Microsoft 365 choice, a simulated consent screen with scopes, an animated first sync, and a summary of the routed inbox.

---

## Stack

| Layer | Choice |
| --- | --- |
| Client | React 18, React Router 6, Vite 5, hand-written CSS design system |
| Server | Node.js (ESM), Express 4 |
| Routing | Deterministic weighted-signal engine in `server/src/ai/engine.js` |
| Evaluation | 51 labeled cases in `server/src/ai/eval-set.js`, scored by `server/src/ai/evaluate.js` |
| Data | In-memory store hydrated from `server/src/seed.js` |
| QA | Headless Chromium through Playwright, dev-only scripts in `.qa/` |

No database, no language model key, no real mailbox access.

---

## Run it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:4000 (Vite proxies `/api`)

Production-style single process:

```bash
npm run build   # builds client/dist
npm start       # Express serves the API and client/dist on :4000
```

Open http://localhost:4000.

The test suite covers the engine and the HTTP contract, no browser needed:

```bash
npm test        # 30 cases: routing, review fallback, policy, determinism,
                # evaluation and suite integrity, validation, 404s, audit
                # events, security headers, follow-ups
```

Reset the demo to its seed state at any time:

```bash
curl -X POST http://localhost:4000/api/reset
```

State lives in memory, so restarting the server also resets it. There are three client mailboxes, 24 seeded conversations and one already completed.

---

## A five-minute demo path

1. **Landing.** Read the thesis, then choose *Explore the demo*.
2. **Onboarding.** Create a workspace, choose a provider, approve the simulated scopes, watch the sync, then open the workspace.
3. **Overview.** The counts line up with the queue. The review callout explains what Relay would not guess.
4. **Inbox.** Open *Northwind: Series A term sheet*. The brief explains why Aarav must answer. Override to **Assistant**, then choose **Re-run analysis** to restore the client route. Draft a reply, switch tone, approve and send. Then open *Invoice #4471*, which is waiting on a reply, and choose **Draft a nudge** to see the follow-up draft.
5. **Responsibility board.** Drag a card from *Assistant* to *Client*. Refresh anything. It persisted through the API.
6. **Needs review.** Resolve an ambiguous intro with Client, Assistant or No reply, and watch the queue shrink.
7. **Client view.** Choose *Client experience* in the sidebar, or open `/client`. Open a thread and mark it handled. Return to the assistant overview and the counts have moved. Repeat with *Ask Ananya to handle* to see the reverse hand-off.
8. **Routing lab.** Open *Routing lab* in the sidebar. Pick a sample, edit the body, move the evidence floor, and watch the verdict and the inbox impact change.
9. **Evaluation.** Open *Evaluation*. The default policy scores 50 of 51 (98.0%) with no wrong auto-routes. Raise the evidence floor to 8 and the review rate climbs; reset to defaults.
10. **Simulate.** Send each of the four sample emails and watch them land in the right column.
11. **Ask Relay.** Press `⌘K` or `Ctrl+K`, then try *What's waiting on me?* or *Draft a reply*.

---

## How routing works

`classify(thread, client)` scores each message against four outcomes using readable signals, then applies confidence and margin thresholds.

Signals include:

- who the message is addressed to: the client by name or address, the assistant, both, or a group,
- whether it asks for a decision, approval, signature or opinion that only the client can give,
- financial or legal commitments, contract language, term sheets and invoices,
- scheduling and logistics that the assistant normally owns,
- automated, newsletter and notification markers,
- sensitivity: press, legal, hiring, personal,
- thread history and who spoke last,
- explicit requests to hand the thread over.

Scoring is weighted, and the top candidate becomes the route. If the top two scores are too close, or the best score is below the evidence floor, the thread goes to **Needs review** instead of being guessed. Every decision stores its label, confidence, candidate scores, the full evidence ledger, the margin, the policy used and a human-readable reason, so the UI can explain itself. The defaults are an evidence floor of `4.5` and a required margin of `1.6`. The routing lab can test other values against the live inbox without changing them.

Manual overrides set `ai.manual = true`, append an audit event and keep the candidate scores. Running the analysis again clears the manual flag and recomputes from the conversation, so demos are repeatable. New messages re-run classification and record a "moved from X to Y" event.

Drafts, summaries and Ask Relay answers use the same conversation data and intent parsing. They are deterministic, not model calls.

`evaluateRouter()` runs a fixed suite of 51 hand-labeled messages through the same `classify` function and reports accuracy, per-route precision and recall, a confusion matrix and every miss. The suite is the regression gate: accuracy must stay at or above 90%, and no miss may be auto-routed. Today it scores 50 of 51, and the remaining miss lands in review rather than going out on its own. That case stays in the set so tuning cannot quietly forget it. The evaluation page reruns the suite with different thresholds before anything is changed for live routing.

---

## Decisions and tradeoffs

These are the calls that shaped the build. Each one follows from how assistants actually work, not from a dashboard template.

**A deterministic router, not a language model.** An assistant has to explain a route to a client at 7pm. A weighted rule engine lets the interface show the exact evidence, and the same message always produces the same route. The cost is nuance: a model would read tone and context better. So uncertainty is treated as a first-class outcome instead of being hidden.

**Review is a route, not an error.** Below the evidence floor or the required margin, a conversation goes to Needs review. Guessing wrong in front of a client is worse than a short manual triage. The review count stays visible on the overview and in the sidebar.

**Show the ledger, not just the label.** Every thread stores candidate scores, the rules that fired, the margin and the thresholds it had to clear. That makes a route auditable and the engine testable. The tradeoff is density, so the plain-English reason comes first and the ledger stays compact.

**Overrides are reversible.** A manual route is marked, logged and kept, but Re-run analysis restores the evidence-based answer. Assistants can correct the router without losing the reasoning.

**The client gets a smaller product, not a shared inbox.** The client view shows only conversations that need them, with a reason and a deadline. No internal notes, and no full thread history until they open one. The assistant does more navigation, but the client is never exposed to the assistant's workspace.

**In-memory state on purpose.** One command runs the whole demo with no database or keys. State resets on restart, which is acceptable for a prototype and stated in the UI. A production version would swap the store for Postgres and move reclassification to a queue.

**A real hosted link.** The public build runs on Vercel: the client is served as static files and the Express API runs as a serverless function, so the hosted app calls the live API. A second build mode compiles the same seed data and routing engine into the browser with sessionStorage for offline demos. Both call the same core module, so the paths cannot silently diverge. The accounts screen labels browser-only demo data as such.

---

## Architecture

The behavior lives in one place. `server/src/core.js` holds every operation (override, reply, draft, client action, simulate, accounts) and throws typed `HttpError`s for bad input. Two thin adapters call it:

- `server/src/routes/api.js` maps Express requests to core calls and JSON responses.
- `client/src/lib/demoApi.js` runs the same calls in the browser for the offline static build, then saves the store to sessionStorage.

The hosted app and the local app cannot drift: validation, audit events and routing run the same code in both. `server/src/app.js` builds the Express app (security headers, JSON 404s, error middleware, static client) separately from `index.js`, which only owns the listener and shutdown, so tests can mount the app on an ephemeral port.

Errors stay in one shape. Throw a 400 or 404 from the core, and the adapter either returns the message or shows a toast. There is no second implementation of the rules in the client.

---

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Liveness and thread count |
| GET | `/api/bootstrap` | User, clients, accounts, threads |
| GET | `/api/threads/:id` | One hydrated thread |
| PATCH | `/api/threads/:id` | Classification, star, unread, archive, status |
| POST | `/api/threads/:id/reclassify` | Run the routing analysis again |
| POST | `/api/threads/:id/draft` | Generate a draft by tone |
| POST | `/api/threads/:id/follow-up` | Draft a nudge for a thread waiting on the client |
| POST | `/api/threads/:id/reply` | Approve and "send" a reply |
| POST | `/api/threads/:id/client-action` | `handled` or `takeover`, with an optional note |
| POST | `/api/threads/:id/messages` | Add an inbound message and reclassify |
| POST | `/api/ask` | Natural-language query |
| POST | `/api/simulate` | Add a sample email and classify it |
| POST | `/api/evaluate` | Score the labeled suite, optionally with a different policy |
| PATCH | `/api/accounts/:id` | Disconnect or reconnect |
| POST | `/api/accounts/:id/sync` | Simulate a sync |
| POST | `/api/accounts` | Connect a new mailbox |
| POST | `/api/reset` | Restore the seed |

Every endpoint answers in JSON. Invalid input returns a `400` with a plain message, unknown IDs return a `404`, and malformed JSON returns a JSON `400` instead of an HTML error page. Responses set `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`, and `X-Powered-By` is disabled.

---

## Project structure

```
client/
  src/
    components/     UI primitives, thread detail, brief cards, ask modal, toasts
    layouts/        App shell, rail, mobile tabs
    lib/            API client, browser demo adapter, selectors, formatting, event bus
    pages/          Landing, Connect, Overview, Inbox, Board, Lab, Evaluation,
                    Review, Accounts, ClientHome, ClientThread
    store/          AppStore (actions, optimistic replace, toasts)
    styles/         tokens, app, landing, connect, client, lab, eval
server/
  src/
    ai/engine.js    Classification, summaries, drafts, Ask Relay
    ai/eval-set.js  51 labeled messages and the three clients used for scoring
    ai/evaluate.js  Confusion matrix, per-route scores and failure list
    core.js         Framework-free operations shared by the API and the browser demo
    app.js          Express app: headers, JSON 404s, error middleware, static client
    routes/api.js   REST handlers, a thin mapping over core.js
    seed.js         Clients, mailboxes, 24 conversations, events, deadlines
    store.js        In-memory state, derived fields, demo actions
    index.js        Listener, port and graceful shutdown
  test/
    engine.test.js  Routing, policy, determinism and the evaluation gate
    api.test.js     Contract: validation, 404s, audit events, headers
api/
  index.mjs         Vercel function entry, mounts the Express app without static serving
vercel.json         Build command, output directory, API and SPA rewrites
.qa/                Playwright screenshot, interaction and accessibility scripts
```

---

## What is simulated

- Sign-in consent, token exchange and provider screens.
- Mailbox sync. Message counts and timestamps come from seed data.
- Sending. An approved reply is appended to the thread and marked sent, but no email leaves the process.
- Routing. A deterministic engine, not a language model. Summaries, drafts, confidence and answers are generated from message content and signals, so the same input always produces the same output.
- Connecting a mailbox adds a local account with zero messages.

Everything else is real application behavior: persistence through the API, classification, manual overrides, reclassification, client hand-offs, filters, drag and drop, and app states.

---

## Deployment

**Vercel (live)**

Public build: https://relay-inbox-demo.vercel.app

Vercel builds the client, serves it from the CDN, and runs `api/index.mjs` as a Node function for every `/api` request. The function mounts the same Express app with static serving turned off. `vercel.json` defines the build, the output directory and the two rewrites: API paths to the function, everything else to `index.html` for client-side routing. `api/index.mjs` is the only Vercel-specific file.

Pushes to `main` deploy automatically. To deploy from this machine without a push:

```bash
npx vercel deploy --prod
```

Serverless functions do not keep a single long-lived process, so a cold start resets the in-memory demo to its seed data.

**Render, Railway or Fly (generic)**

The server can also be the only process in production. It serves `/api` and the built client with a history fallback.

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Node 20 or newer. `PORT` is read from the environment.
- Health check: `/api/health`

`render.yaml` in the repo defines the same setup for Render. A `Dockerfile` is included for container hosts:

```bash
docker build -t relay .
docker run -p 4000:4000 relay
```

State is in memory, so a restart or redeploy resets the demo. That is intentional for a prototype. A production version would swap `store.js` for a database and move reclassification to a queue.

**Offline static build**

For a link with no server at all, the same interface and engine can be compiled into the browser. State is kept in sessionStorage for the tab, so a change survives a refresh but resets when the tab closes:

```bash
VITE_STATIC_DEMO=1 npm --workspace client run build
```

Without that variable, the client talks to the Express API. `client/src/lib/demoApi.js` calls the same core operations as the REST handlers, so the static build runs the real rules rather than a copy.

---

## Accessibility

Dialogs trap and restore focus, close on Escape and are labelled by their heading. Icon-only buttons carry accessible names, toggles expose pressed state, and the workspace starts with a skip link. Focus rings stay visible in both themes, and `prefers-reduced-motion` removes animation. `.qa/a11y.js` checks the skip link, document titles, popover state, the focus trap and every page for unnamed controls.

---

## Demo video script (about 100 seconds)

Trim the sync animation for a 75-second cut.

| Time | Shot | Narration |
| --- | --- | --- |
| 0:00 to 0:08 | Landing hero | "Assistants manage other people's inboxes, but every thread ends with the same question: who owes the reply?" |
| 0:08 to 0:22 | Connect flow, quick cuts | "Relay connects Gmail or Outlook with read and send access, syncs history and routes everything on arrival." |
| 0:22 to 0:35 | Overview | "Twenty-three open conversations: nine in your queue, eight only the client can answer, three answered and waiting, and two that Relay would not guess." |
| 0:35 to 0:55 | Open the term sheet thread; show the brief, override, re-run | "A term sheet needs the founder, not the assistant. The brief says why. One click moves it, and running the analysis again restores the evidence-based route." |
| 0:55 to 1:05 | Draft, tone switch, approve | "Drafts are generated, editable and never sent without approval." |
| 1:05 to 1:15 | Board drag and review resolution | "The board is the same decision, spatial. Low-confidence threads get a human call instead of a guess." |
| 1:15 to 1:28 | Client view: open, mark handled; back to overview | "The client sees only what needs them, with a plain reason. The assistant's dashboard updates the moment they act." |
| 1:28 to 1:40 | Simulate menu, four emails | "Any new email is analyzed on arrival. That is the whole product: ownership stays current." |

---

## QA scripts

`.qa/` holds the headless Chromium checks used while building this. `check.js` captures every page, and `mobiletest.js` covers the phone layouts. `interactions.js` and `interactions2.js` drive the core flows: override, re-run analysis, draft and send, board drag, review resolution, client hand-offs, onboarding, and the empty, loading and error states. `refine.js` covers the board move menu, keyboard opening, and token renewal. `lab.js` covers the routing lab, threshold tuning, inbox impact and the thread evidence ledger. `eval.js` covers the evaluation page, the matrix, the misses list and the threshold check at desktop and phone widths. `static-demo.js` runs the full flow against the browser-only build with no API calls. `fit.js` checks every page for horizontal overflow between 390 and 1280px. `a11y.js` covers focus management, labels, titles and unnamed controls.

They expect the dev servers on ports 5173 and 4000, plus a local `playwright-core` install with Chromium. Screenshot paths are absolute Windows paths and need adjusting on another machine. They are not part of the build.

---

## Known limitations

- Single in-memory tenant. No auth or multi-user roles beyond the demo persona.
- The routing engine is rule-based. It is intentionally readable rather than nuanced.
- The evaluation suite is 51 hand-built cases. It catches regressions, but it is not a held-out benchmark and it was written by the same person as the rules.
- No real provider webhooks, push notifications or background sync.
- Dates in seed data are relative to server start, so the demo always looks current.
