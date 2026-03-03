# Full-Stack Integration Design — Traction AI

**Date:** 2026-02-26
**Status:** Approved

## Overview

Connect the Next.js frontend to the FastAPI backend, replacing all mock data with real API calls. Implement the dual-mode AI agent system (doc extraction → design generation), restructure frontend URLs to GitHub-style `/:username/:project_name` patterns, and add all missing backend endpoints.

## Architecture Summary

- **Single chat endpoint** (`POST /projects/{id}/chat`) with `mode` parameter (`doc` | `design`)
- **pydantic_ai agents** for both modes — doc mode extracts structured fields, design mode generates pitch deck + documents + llms.txt + ai.json
- **Field diff checking** to avoid unnecessary regeneration when toggling modes
- **URL pattern:** `/:username/:project_name` (public share) and `/:username/:project_name/ideation` (auth workspace)

---

## 1. Database Model Changes

### Project Model — New Columns

| Column | Type | Purpose |
|---|---|---|
| `mode` | `str(20), default "doc"` | Current agent mode: `"doc"` or `"design"` |
| `llms_txt` | `TEXT, nullable` | Plaintext pitch explanation for LLM agents |
| `ai_json` | `JSON, nullable` | Structured JSON representation of startup data |
| `last_generation_fields_hash` | `str(64), nullable` | SHA-256 hash of extracted fields at last generation |

### Project Model — Constraints

- Add `UNIQUE(user_id, name)` — prevents same user creating duplicate project names
- Project name used directly in URLs (lowercased, spaces→hyphens for URL display, case-insensitive lookup on backend)

### ProjectDocument Model — New Column

| Column | Type | Purpose |
|---|---|---|
| `fields` | `JSON, nullable` | Extracted structured fields for this document type |

### User Model

- Ensure `username` is URL-safe (lowercase alphanumeric + hyphens)

---

## 2. Document Type Field Definitions

9 document types, each with a Pydantic model. `is_complete` is computed when all required fields are non-null.

### Product Description
- product_name, one_liner, problem_statement, solution_description, target_audience, key_features (list), unique_value_proposition, is_complete

### Timeline
- milestones (list of {name, target_date, description}), current_stage, launch_date, is_complete

### SWOT Analysis
- strengths (list), weaknesses (list), opportunities (list), threats (list), is_complete

### Market Research
- tam, sam, som, target_demographics, market_trends (list), market_growth_rate, is_complete

### Financial Projections
- revenue_model, year1_revenue, year2_revenue, year3_revenue, monthly_burn_rate, break_even_timeline, key_cost_drivers (list), is_complete

### Funding Requirements
- funding_stage, amount_seeking, use_of_funds (list of {category, percentage, description}), current_funding, runway_months, is_complete

### Product Forecast
- year1_users, year2_users, year3_users, conversion_rate, customer_acquisition_cost, lifetime_value, growth_strategy, is_complete

### Competitive Analysis
- direct_competitors (list of {name, description, differentiator}), indirect_competitors (list), competitive_advantage, market_positioning, is_complete

### Executive Summary
- company_name, mission_statement, vision_statement, founding_team (list of {name, role, background}), business_model_summary, traction_to_date, is_complete

---

## 3. API Endpoints

### Auth (No Changes)
- `GET /auth/google/login`
- `GET /auth/google/callback`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`

### Projects (Auth Required)

| Method | Path | Description | Body/Params | Response |
|---|---|---|---|---|
| `POST /projects/` | Create project | `{ name }` | ProjectRead |
| `GET /projects/` | List user's projects | `?status=&sort=` | `[ProjectRead]` |
| `GET /projects/{project_id}` | Get single project | — | ProjectRead |
| `GET /projects/by-name/{project_name}` | Get own project by name | — | ProjectRead |
| `GET /projects/shared` | Shared projects + count | — | `{ projects, count }` |
| `PATCH /projects/{project_id}` | Update project | `{ name?, status?, mode? }` | ProjectRead |
| `DELETE /projects/{project_id}` | Delete project | — | 204 |

### Chat (Auth Required)

| Method | Path | Description |
|---|---|---|
| `POST /projects/{project_id}/chat` | Send message, get AI response |
| `GET /projects/{project_id}/messages` | Get chat history |

**Chat Request:** `{ content: str, mode: "doc" | "design" }`

**Chat Response:**
```json
{
  "message": { "id", "role", "content", "created_at" },
  "extraction_state": {
    "product_description": { "is_complete": bool, "fields": {...} },
    ...
  },
  "all_complete": bool,
  "design_generation_triggered": bool,
  "project": ProjectRead | null
}
```

### Documents (Auth Required)

| Method | Path | Description |
|---|---|---|
| `GET /projects/{project_id}/documents` | List documents with fields |
| `GET /documents/{doc_id}` | Get single document |

### Public Endpoints (No Auth)

| Method | Path | Description |
|---|---|---|
| `GET /users/{username}/projects/{project_name}` | Shared project page data |
| `GET /users/{username}/projects/{project_name}/llms.txt` | Plaintext (text/plain) |
| `GET /users/{username}/projects/{project_name}/ai.json` | JSON (application/json) |

### Pages (Auth Required)

| Method | Path | Description |
|---|---|---|
| `GET /pages/workspace/{project_id}` | Aggregated project + docs + messages |

---

## 4. Agent Architecture

### Doc Mode Agent (pydantic_ai)
- Model: `openai:gpt-4o-mini`
- Result type: `ExtractionResult` (response + all 9 field models)
- System prompt: Expert product strategist conducting structured interviews
- On each call: load history + current fields → run agent → merge non-null extractions → save → return state
- First user message becomes project.prompt

### Design Mode Agent (pydantic_ai)
- Model: `openai:gpt-4o-mini`
- Triggers when mode switches to "design" (or fields changed since last generation)
- Generates 3 things:
  1. `full_html` — pitch deck (creative) + summary section (strict template using extracted data). Single self-contained HTML with inline CSS/JS.
  2. Document contents — polished markdown for all 9 ProjectDocuments using extracted fields
  3. `llms_txt` + `ai_json` — plaintext and structured JSON summaries

### Field Diff Check
- On design mode entry: compute SHA-256 of all ProjectDocument.fields
- Compare with project.last_generation_fields_hash
- Same → skip regeneration
- Different → regenerate all, update hash

---

## 5. Frontend Route Changes

### Before → After

| Before | After | Access |
|---|---|---|
| `/projects` | `/dashboard` | Auth |
| `/shared` | `/dashboard/shared` | Auth |
| `/projects/[projectId]` | `/:username/:proj_name/ideation` | Auth (owner) |
| `/share/[projectId]` | `/:username/:proj_name` | Public |
| `/dashboard` (old create) | `/dashboard` (project list + new button) | Auth |
| `/settings` | `/settings` | Auth (unchanged) |

### New Components/Changes
- **Project name popup modal** on "New Project" click
- **Chat panel** — real API calls, mode toggle, extraction progress
- **Document list** — real data, field completion status
- **Dashboard** — real project list from API
- **Share page** — fetch by username/project_name, render full_html

---

## 6. Generation Pipeline (Design Mode)

When design mode triggers:

1. Check field diff → skip if unchanged
2. Generate pitch deck HTML (agent call with demo.html-style prompt + extracted fields)
3. Generate 9 document contents (agent call per document using extracted fields)
4. Generate llms.txt (plaintext pitch explanation)
5. Generate ai.json (structured JSON)
6. Store all in DB, update last_generation_fields_hash
7. Return updated project to frontend

---

## Key Decisions Made

1. **Single chat endpoint with mode** — simplest integration
2. **No slug column** — use project name directly, unique per user
3. **Fields on ProjectDocument** — each doc tracks its own extracted fields
4. **Field diff for regen check** — compare extracted values, not timestamps
5. **full_html includes deck + summary** — one HTML string, frontend renders in iframe
6. **Project create = name only** — first chat message becomes the prompt
7. **GET for project listing** — standard REST with query params
8. **Username + project name URLs** — GitHub-style, no separate share slug system
