# CrucibleAI Frontend Client

Production-quality, research-oriented React + TypeScript + Tailwind CSS client for the **CrucibleAI** materials science research agent platform.

## Features

- **Autonomous Research Pipeline Integration**: Communicates with the FastAPI backend (`POST /api/research`) to submit research queries, receive candidate material screening tables, ML property predictions, literature evidence chunks, and synthesized research hypotheses.
- **Real-Time Agent Progress Streaming**: Consumes Server-Sent Events (`GET /api/stream`) to visualize the 4 execution phases (`LITERATURE_SEARCH`, `MATERIALS_PROJECT_LOOKUP`, `KRR_PREDICTION`, `SYNTHESIS`) with live terminal log output.
- **Screened Material Candidates Data Grid**: Displays candidate formulas, known Materials Project bandgaps, formation energies, densities, direct/indirect gap badges, and expandable property details.
- **Machine Learning Bandgap Predictor**: Displays Kernel Ridge Regression (RBF kernel) predictions side-by-side with known physical bandgaps, confidence ratings, and descriptor notes.
- **Retrieved Literature Evidence**: Renders ChromaDB paper chunk citations with ArXiv metadata, direct paper links, similarity score meters, and text snippet toggles.
- **Direct Backend Tools Drawer**: Standalone slide-over utility drawer for testing direct KRR property prediction (`POST /api/predict`) and Materials Project lookup (`GET /api/materials/lookup`).
- **Backend Health & Corpus Monitoring**: Polls system status (`/api/health`) and paper corpus indexing statistics (`/api/corpus`).

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Testing**: Vitest

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

```bash
# Navigate to the frontend directory
cd CrucibleAI-Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will start at `http://localhost:3000` and automatically proxy `/api/*` requests to `http://localhost:8000`.

### Environment Configuration

By default, the client requests backend endpoints at `http://localhost:8000`. To target a custom backend instance, set `VITE_API_BASE_URL` in a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Scripts

- `npm run dev`: Start Vite dev server.
- `npm run build`: Type-check and build production bundle.
- `npm run lint`: Run TypeScript type checking (`tsc --noEmit`).
- `npm run test`: Run Vitest unit tests.