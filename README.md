# CrucibleAI Frontend

React + TypeScript + Tailwind client for the **CrucibleAI** materials-discovery agent
([backend repo](https://github.com/im-rk/CrucibleAI-Backend)). Give it a research goal in plain
English; it streams the agents' progress live and shows a ranked, cited, grounded report.

## What you see

- **Live agent pipeline.** The five real stages (Search → Extraction → Screening → Hypotheses →
  Grounding) light up as the backend runs them, with a running log, per-stage timings, retry
  counts when a weak search is re-run, and a **Stop** button that cancels the run server-side.
- **Run mode banner.** Says plainly whether the run used an LLM and live Materials Project data,
  or the degraded heuristic mode / offline reference table, and lists every warning.
- **Ranked candidates** with a per-criterion verdict (met / not met / no data / ML-estimated),
  the value and source behind each verdict, sortable columns, and links to the supporting papers.
  Values predicted by Kernel Ridge Regression are always marked as estimates, with their
  cross-validated uncertainty.
- **Testable hypotheses** with the evidence each one cites, a suggested experiment, a confidence
  level, and a grounding check result. Hypotheses that are only templates, or that are not
  supported by their evidence, are labelled as such.
- **Knowledge gaps**, the criteria parsed from your goal, and the search queries tried.
- **References** with clickable arXiv/DOI links and which hypotheses/candidates cite each.
- Evidence passages, property charts, a radar profile, a direct tools drawer (KRR prediction,
  Materials Project lookup), and Markdown / JSON export of the full report.

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
