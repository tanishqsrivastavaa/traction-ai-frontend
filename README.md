# Traction Frontend

The enterprise interface for AI-driven revenue operations.

Traction Frontend is a TypeScript web application that orchestrates and visualizes agentic AI workflows. It serves as the command center for the Traction platform, enabling RevOps teams to manage autonomous lead discovery, intent analysis, and multi-channel GTM strategies.

## Architecture and Tech Stack

| Layer               | Technology                                                        |
| ------------------- | ----------------------------------------------------------------- |
| Framework           | Next.js 16 (App Router, React Server Components)                 |
| Language            | TypeScript (strict mode)                                          |
| UI                  | Tailwind CSS 4 with a custom enterprise design system             |
| Presentation        | Reveal.js for slide rendering, PptxGenJS for PowerPoint export    |
| Runtime             | React 19                                                          |

## Key Engineering Implementations

### Real-time Agentic Streams

The frontend implements specialized handlers for Server-Sent Events (SSE) and streaming LLM responses. Partial JSON parsing updates the UI incrementally as agents complete sub-tasks (e.g., Lead Enrichment, Personality Analysis).

### High-Concurrency Data Handling

Designed for environments with 10k+ concurrent entities:

- **Windowing/Virtualization** -- Renders massive lead lists without DOM bloat.
- **Optimistic Updates** -- Immediate UI feedback for agent triggers while maintaining backend consistency.
- **Race Condition Mitigation** -- `AbortController`-based cancellation of stale API requests during rapid navigation or agent state changes.

### Production Resilience

- **Dependency Injection** -- Modular service layers decoupling UI components from API logic.
- **Schema Synchronization** -- Direct integration with Pydantic-AI backend schemas to prevent breakage from upstream data changes.
- **Error Boundaries** -- Granular isolation of AI service failures without crashing the workspace.

## Getting Started

### Prerequisites

- Node.js v20.x or higher
- npm (ships with Node.js)

### Installation

```bash
git clone https://github.com/traction-ai/traction-frontend.git
cd traction-frontend/frontend
```

```bash
npm install
```

```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL and auth provider config
```

```bash
npm run dev
```

## Testing and Quality Assurance

Every pull request goes through a CI/CD pipeline:

- **Static Analysis** -- ESLint and Prettier for code consistency.
- **Unit Testing** -- Vitest for business logic and utility functions.
- **Integration Testing** -- Playwright for critical user paths (agent deployment, lead export).

## Roadmap

- [ ] Advanced Visualization -- Graph Neural Network (GNN) visualization for lead-to-account mapping.
- [ ] Local LLM Integration -- WebGPU-based processing for client-side data filtering.
- [ ] Multi-Agent Canvas -- Drag-and-drop interface for building custom agentic workflows.
