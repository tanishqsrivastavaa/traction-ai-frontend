# Traction Frontend

AI-powered pitch deck and document builder for founders. Create, refine, and share investor-ready presentations with real-time collaboration and AI assistance.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Presentations:** Reveal.js, PptxGenJS
- **React:** v19 with React Compiler

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated routes (dashboard, workspace, settings)
│   ├── (auth)/         # Login and signup
│   └── (public)/       # Landing page, shareable project views
├── components/
│   ├── chat/           # AI chat interface
│   ├── deck/           # Slide viewer and strip
│   ├── documents/      # Document list and viewer
│   ├── feedback/       # Feedback panel and items
│   ├── layout/         # App header and sidebar
│   ├── projects/       # Project cards and grid
│   └── ui/             # Reusable UI primitives
├── lib/                # Utilities and mock data
└── types/              # Shared TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
