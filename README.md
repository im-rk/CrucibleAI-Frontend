# CrucibleAI Frontend

React + TypeScript + Tailwind web UI for **CrucibleAI**, a multi-agent materials-discovery assistant. It streams the agents' progress
live and shows a ranked, cited report. The agents, architecture, results and screenshots are documented in the
[backend repository](https://github.com/im-rk/CrucibleAI-Backend).

**What it shows:** an editable research plan, the eight-stage agent pipeline running live (with a Stop button), ranked candidates with
per-criterion verdicts, hypotheses checked by the critic, the investigator's tool calls, a run trace, grounded follow-up Q&A, and the
backend's evaluation results.

## Run it

Start the backend first (`uv run uvicorn matsci_agent.api.server:app --port 8000` in the backend repo), then:

```bash
npm install
npm run dev          # http://localhost:3000, proxies /api to http://127.0.0.1:8000
```

| Variable | Purpose |
|---|---|
| `VITE_PROXY_TARGET` | Where the dev server proxies `/api` (default `http://127.0.0.1:8000`) |
| `VITE_API_BASE_URL` | Call a backend on another origin directly (add this UI's origin to the backend's `CORS_ORIGINS`) |

## Scripts

`npm run dev` · `npm run lint` (type-check) · `npm test` (Vitest) · `npm run build` (production build into `dist/`)

## Docker

```bash
docker build -t crucible-frontend .
docker run -p 80:80 -e API_UPSTREAM=http://backend:8000 crucible-frontend
```

nginx serves the build and proxies `/api/` to `API_UPSTREAM` with response buffering off, which the streaming endpoint needs.
