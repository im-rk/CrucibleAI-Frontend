# CrucibleAI Frontend

React + TypeScript + Tailwind client for the **CrucibleAI** materials-discovery agent
([backend repo](https://github.com/im-rk/CrucibleAI-Backend)). Give it a research goal in plain
English; it streams the agents' progress live and shows a ranked, cited, grounded report.

## What you see

- **A plan you can edit.** Tick *Review the plan first* and the planner shows the criteria it parsed from your goal and the searches
  it intends to run. Untick a criterion or rewrite a query, then run with your version.
- **Live agent pipeline.** Eight real stages (Plan, Literature search, Extract values, Screen candidates, Investigate gaps,
  Hypotheses, Verify and revise, Report) light up as the backend runs them, with a running log of what each did (including the
  investigator's tool calls), retry counts, and a **Stop** button that cancels the run server-side.
- **Run mode banner.** Says plainly whether the run used a language model and live Materials Project data, or the degraded
  rule-based mode / offline reference table, and lists every warning.
- **Ranked candidates** with a per-criterion verdict (met / not met / no data / ML-estimated), the value and source behind each,
  sortable columns, and links to the supporting papers. Estimates from the ML model are always marked and cannot make a candidate qualify.
- **Hypotheses the system has checked.** Each cites its evidence, carries a confidence and a suggested experiment, and shows the critic's
  grounding result. When the critic sent weak hypotheses back to be rewritten, the score by round is shown ("0.10 → 0.60 → 0.70") and
  rewritten ones are marked.
- **Evidence gaps investigated**: the investigator agent's reasoning, each tool it chose and what came back.
- **Trace**: what the run cost. Model calls and cache hits, tokens, time spent waiting on a provider rate limit, time per agent, and a
  timeline of every model call, retrieval and tool call.
- **Ask**: follow-up questions about the run, answered only from that run's own evidence, with citations.
- **Evaluation**: the backend's measured results (retrieval, extraction, prompt-injection resistance, end-to-end invariants).
- Knowledge gaps, references with clickable arXiv/DOI links, evidence passages, property charts, a radar profile, a lookup-and-predict
  drawer, and Markdown / JSON export of the full report.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000, proxies /api to http://127.0.0.1:8000
```

Start the backend first (`uvicorn matsci_agent.api.server:app` in the backend repo).

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Call a backend at another origin directly (leave empty to use the dev proxy / nginx) |
| `VITE_PROXY_TARGET` | Where the dev server proxies `/api` (default `http://127.0.0.1:8000`) |

The proxy target is `127.0.0.1` on purpose: Node resolves `localhost` to IPv6 first, and Docker/WSL
often owns port 8000 there.

If the backend is on another origin, add the frontend's origin to the backend's `CORS_ORIGINS`.

## Scripts

- `npm run dev`: dev server
- `npm run lint`: type-check (`tsc --noEmit`)
- `npm test`: unit tests (Vitest)
- `npm run build`: type-check and production build into `dist/`

## Docker

```bash
docker build -t crucible-frontend .
docker run -p 80:80 -e API_UPSTREAM=http://backend:8000 crucible-frontend
```

nginx serves the built app and proxies `/api/` to `API_UPSTREAM`. The proxy config turns response
buffering off and allows long requests, which the streaming research endpoint needs.

## How streaming works

`EventSource` cannot send a POST body, so the client uses `fetch` with a streamed response and a
small SSE parser (`src/services/sse.ts`). Progress state is a pure reducer over the event stream
(`src/utils/progress.ts`), which is what the unit tests cover. Events and the report shape are
typed in `src/types/api.ts`.
