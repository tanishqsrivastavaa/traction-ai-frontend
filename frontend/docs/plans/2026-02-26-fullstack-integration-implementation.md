# Full-Stack Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect the Next.js frontend to the FastAPI backend with real AI agents, replacing all mock data, implementing the dual-mode chat system (doc extraction → design generation), and restructuring URLs to `/:username/:project_name` patterns.

**Architecture:** Single chat endpoint (`POST /projects/{id}/chat`) with `mode` parameter routes between doc-extraction and design-generation pydantic_ai agents. Doc mode progressively extracts structured fields into ProjectDocument.fields JSON columns. Design mode generates full_html (pitch deck + summary), document contents, llms.txt, and ai.json. Frontend routes restructured to GitHub-style `/:username/:project_name`.

**Tech Stack:** FastAPI, SQLModel, Alembic, pydantic_ai (openai:gpt-4o-mini), Next.js 16, React 19, TypeScript, Tailwind CSS 4

---

## Task 1: Add New Columns to Database Models

**Files:**
- Modify: `traction-backend/backend/app/models/project.py`
- Modify: `traction-backend/backend/app/models/user.py`

**Step 1: Add columns to Project model**

In `traction-backend/backend/app/models/project.py`, add new columns to the `Project` class (after line 25):

```python
from sqlalchemy import Column, JSON, UniqueConstraint, Text

class Project(BaseUUIDModel, table=True):
    __tablename__ = "projects"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_user_project_name"),)

    user_id: UUID = Field(foreign_key="users.id", index=True)
    name: str = Field(max_length=255)
    prompt: str = Field(default="", sa_column=Column(Text, default=""))
    status: str = Field(default="draft", max_length=50)
    mode: str = Field(default="doc", max_length=20)  # "doc" or "design"

    slides_html: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    full_html: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    thumbnail_url: str | None = Field(default=None, max_length=500)
    llms_txt: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    ai_json: dict | None = Field(default=None, sa_column=Column(JSON, nullable=True))
    last_generation_fields_hash: str | None = Field(default=None, max_length=64)

    # Relationships (unchanged)
    ...
```

**Step 2: Add `fields` column to ProjectDocument**

```python
class ProjectDocument(BaseUUIDModel, table=True):
    __tablename__ = "project_documents"

    project_id: UUID = Field(foreign_key="projects.id", index=True)
    type: str = Field(max_length=100)
    title: str = Field(max_length=255)
    content: str = Field(default="", sa_column=Column(Text, default=""))
    status: str = Field(default="pending", max_length=50)
    fields: dict | None = Field(default=None, sa_column=Column(JSON, nullable=True))

    project: "Project" = Relationship(back_populates="documents")
```

**Step 3: Fix User model — remove stale `conversations` relationship**

In `traction-backend/backend/app/models/user.py`, the `conversations` relationship references a deleted model. Replace it with `projects`:

```python
from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship
from app.models.base import BaseUUIDModel

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.oauth_account import OAuthAccount
    from app.models.refresh_token import RefreshToken

class User(BaseUUIDModel, table=True):
    __tablename__ = "users"

    email: str = Field(max_length=320, unique=True, index=True)
    username: str = Field(max_length=50, unique=True, index=True)
    display_name: str | None = Field(default=None, max_length=100)
    avatar_url: str | None = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)

    oauth_accounts: list["OAuthAccount"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    projects: list["Project"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    refresh_tokens: list["RefreshToken"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
```

**Step 4: Generate and apply Alembic migration**

```bash
cd traction-backend/backend
alembic revision --autogenerate -m "add mode llms_txt ai_json fields columns"
alembic upgrade head
```

**Step 5: Commit**

```bash
git add traction-backend/backend/app/models/ traction-backend/backend/alembic/
git commit -m "feat(models): add mode, llms_txt, ai_json, fields columns and fix user relationship"
```

---

## Task 2: Create Document Field Extraction Schemas

**Files:**
- Create: `traction-backend/backend/app/schemas/extraction.py`

**Step 1: Create the extraction field models**

```python
"""Pydantic models for structured field extraction from chat conversations."""

from pydantic import BaseModel


class ProductDescriptionFields(BaseModel):
    product_name: str | None = None
    one_liner: str | None = None
    problem_statement: str | None = None
    solution_description: str | None = None
    target_audience: str | None = None
    key_features: list[str] | None = None
    unique_value_proposition: str | None = None
    is_complete: bool = False


class TimelineFields(BaseModel):
    milestones: list[dict] | None = None  # [{name, target_date, description}]
    current_stage: str | None = None  # idea / mvp / beta / launched
    launch_date: str | None = None
    is_complete: bool = False


class SwotFields(BaseModel):
    strengths: list[str] | None = None
    weaknesses: list[str] | None = None
    opportunities: list[str] | None = None
    threats: list[str] | None = None
    is_complete: bool = False


class MarketResearchFields(BaseModel):
    tam: str | None = None
    sam: str | None = None
    som: str | None = None
    target_demographics: str | None = None
    market_trends: list[str] | None = None
    market_growth_rate: str | None = None
    is_complete: bool = False


class FinancialProjectionsFields(BaseModel):
    revenue_model: str | None = None
    year1_revenue: str | None = None
    year2_revenue: str | None = None
    year3_revenue: str | None = None
    monthly_burn_rate: str | None = None
    break_even_timeline: str | None = None
    key_cost_drivers: list[str] | None = None
    is_complete: bool = False


class FundingRequirementsFields(BaseModel):
    funding_stage: str | None = None
    amount_seeking: str | None = None
    use_of_funds: list[dict] | None = None  # [{category, percentage, description}]
    current_funding: str | None = None
    runway_months: int | None = None
    is_complete: bool = False


class ProductForecastFields(BaseModel):
    year1_users: str | None = None
    year2_users: str | None = None
    year3_users: str | None = None
    conversion_rate: str | None = None
    customer_acquisition_cost: str | None = None
    lifetime_value: str | None = None
    growth_strategy: str | None = None
    is_complete: bool = False


class CompetitiveAnalysisFields(BaseModel):
    direct_competitors: list[dict] | None = None  # [{name, description, differentiator}]
    indirect_competitors: list[str] | None = None
    competitive_advantage: str | None = None
    market_positioning: str | None = None
    is_complete: bool = False


class ExecutiveSummaryFields(BaseModel):
    company_name: str | None = None
    mission_statement: str | None = None
    vision_statement: str | None = None
    founding_team: list[dict] | None = None  # [{name, role, background}]
    business_model_summary: str | None = None
    traction_to_date: str | None = None
    is_complete: bool = False


class ExtractionResult(BaseModel):
    """The structured output from the doc-mode agent. Contains conversational response + extracted fields."""
    response: str
    product_description: ProductDescriptionFields | None = None
    timeline: TimelineFields | None = None
    swot_analysis: SwotFields | None = None
    market_research: MarketResearchFields | None = None
    financial_projections: FinancialProjectionsFields | None = None
    funding_requirements: FundingRequirementsFields | None = None
    product_forecast: ProductForecastFields | None = None
    competitive_analysis: CompetitiveAnalysisFields | None = None
    executive_summary: ExecutiveSummaryFields | None = None


# Mapping from document type slug to field model class
DOCUMENT_TYPE_FIELDS = {
    "product-description": ProductDescriptionFields,
    "timeline": TimelineFields,
    "swot-analysis": SwotFields,
    "market-research": MarketResearchFields,
    "financial-projections": FinancialProjectionsFields,
    "funding-requirements": FundingRequirementsFields,
    "product-forecast": ProductForecastFields,
    "competitive-analysis": CompetitiveAnalysisFields,
    "executive-summary": ExecutiveSummaryFields,
}

# Mapping from document type slug to ExtractionResult field name
DOCUMENT_TYPE_TO_ATTR = {
    "product-description": "product_description",
    "timeline": "timeline",
    "swot-analysis": "swot_analysis",
    "market-research": "market_research",
    "financial-projections": "financial_projections",
    "funding-requirements": "funding_requirements",
    "product-forecast": "product_forecast",
    "competitive-analysis": "competitive_analysis",
    "executive-summary": "executive_summary",
}

# Human-readable titles for document types
DOCUMENT_TYPE_TITLES = {
    "product-description": "Product Description",
    "timeline": "Timeline",
    "swot-analysis": "SWOT Analysis",
    "market-research": "Market Research",
    "financial-projections": "Financial Projections",
    "funding-requirements": "Funding Requirements",
    "product-forecast": "Product Forecast",
    "competitive-analysis": "Competitive Analysis",
    "executive-summary": "Executive Summary",
}
```

**Step 2: Commit**

```bash
git add traction-backend/backend/app/schemas/extraction.py
git commit -m "feat(schemas): add document field extraction models for pydantic_ai"
```

---

## Task 3: Update Project Schemas for New Fields

**Files:**
- Modify: `traction-backend/backend/app/schemas/project.py`
- Modify: `traction-backend/backend/app/schemas/chat.py`

**Step 1: Update ProjectCreate to accept name only (no prompt)**

```python
class ProjectCreate(BaseModel):
    name: str
```

**Step 2: Add mode, llms_txt, ai_json to ProjectRead and ProjectBase**

```python
class ProjectBase(BaseModel):
    name: str
    prompt: str = ""
    status: str = "draft"
    mode: str = "doc"
    slides_html: list[str] = []
    full_html: str | None = None
    thumbnail_url: str | None = None
    llms_txt: str | None = None
    ai_json: dict | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    status: str | None = None
    mode: str | None = None
```

**Step 3: Add `fields` to ProjectDocumentRead**

```python
class ProjectDocumentBase(BaseModel):
    type: str
    title: str
    content: str = ""
    status: str = "pending"
    fields: dict | None = None


class ProjectDocumentRead(ProjectDocumentBase):
    id: UUID
    project_id: UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime | None

    model_config = {"from_attributes": True}
```

**Step 4: Update ChatMessageCreate to include mode**

In `traction-backend/backend/app/schemas/chat.py`:

```python
from typing import Literal

class ChatMessageCreate(BaseModel):
    content: str
    mode: Literal["doc", "design"] = "doc"
```

**Step 5: Add ChatResponse schema**

```python
class ChatResponse(BaseModel):
    message: ChatMessageRead
    extraction_state: dict  # {doc_type: {is_complete, fields}}
    all_complete: bool
    design_generation_triggered: bool
    project: "ProjectRead | None" = None

    model_config = {"from_attributes": True}
```

Add forward reference import at top:

```python
from __future__ import annotations
```

**Step 6: Commit**

```bash
git add traction-backend/backend/app/schemas/
git commit -m "feat(schemas): update project/chat schemas for mode, extraction, and new fields"
```

---

## Task 4: Rewrite the AI Agent System

**Files:**
- Rewrite: `traction-backend/backend/app/core/ai_generators.py`

**Step 1: Implement the doc-mode and design-mode agents**

Replace the entire file with a comprehensive agent system:

```python
"""AI agent system using pydantic_ai for doc extraction and design generation."""

import json
import hashlib

from pydantic_ai import Agent
from sqlmodel.ext.asyncio.session import AsyncSession

from app.schemas.extraction import (
    ExtractionResult,
    DOCUMENT_TYPE_TO_ATTR,
    DOCUMENT_TYPE_TITLES,
)


# ── Doc-mode agent: extracts structured fields from conversation ──

DOC_AGENT_SYSTEM_PROMPT = """\
You are an expert product strategist and startup advisor called the Traction Agent.

Your job is to conduct a structured interview with founders to extract key business information \
across 9 document categories. Be conversational, insightful, and probing. Ask clarifying questions. \
Challenge weak assumptions. Be honest about gaps.

The 9 document categories and the fields you need to extract:

1. Product Description: product_name, one_liner, problem_statement, solution_description, target_audience, key_features (list), unique_value_proposition
2. Timeline: milestones (list of {name, target_date, description}), current_stage (idea/mvp/beta/launched), launch_date
3. SWOT Analysis: strengths (list), weaknesses (list), opportunities (list), threats (list)
4. Market Research: tam (Total Addressable Market), sam (Serviceable Addressable Market), som (Serviceable Obtainable Market), target_demographics, market_trends (list), market_growth_rate
5. Financial Projections: revenue_model, year1_revenue, year2_revenue, year3_revenue, monthly_burn_rate, break_even_timeline, key_cost_drivers (list)
6. Funding Requirements: funding_stage (pre-seed/seed/series-a/etc), amount_seeking, use_of_funds (list of {category, percentage, description}), current_funding, runway_months
7. Product Forecast: year1_users, year2_users, year3_users, conversion_rate, customer_acquisition_cost, lifetime_value, growth_strategy
8. Competitive Analysis: direct_competitors (list of {name, description, differentiator}), indirect_competitors (list), competitive_advantage, market_positioning
9. Executive Summary: company_name, mission_statement, vision_statement, founding_team (list of {name, role, background}), business_model_summary, traction_to_date

IMPORTANT RULES:
- In your response field, write your conversational reply to the user.
- In each document category field, populate ONLY fields the user has explicitly mentioned or that you can confidently infer from what they said. Leave everything else as null.
- Set is_complete=true for a category ONLY when ALL its required fields have substantive values.
- Do NOT make up data. Only extract what the user has actually shared.
- Guide the conversation toward uncovered fields naturally. Don't interrogate — be conversational.
- When the user shares information relevant to multiple categories, extract into all applicable ones.
"""

doc_agent = Agent(
    model="openai:gpt-4o-mini",
    result_type=ExtractionResult,
    system_prompt=DOC_AGENT_SYSTEM_PROMPT,
)


# ── Design-mode agent: generates pitch deck HTML ──

DESIGN_AGENT_SYSTEM_PROMPT = """\
You are an expert pitch deck designer and technical writer. You create stunning, \
bespoke pitch deck presentations as self-contained HTML documents with inline CSS and JS.

Design Guidelines:
- Font: Plus Jakarta Sans (import from Google Fonts)
- Dark/black theme, all text white
- All font sizes use responsive clamp() values
- All spacing uses percentage-based values
- No shadows — use "liquid glass" aesthetic: backdrop-filter: blur(24px) saturate(1.4), \
  translucent white backgrounds, thin semi-transparent borders
- Full-screen slide-based presentation with keyboard navigation (arrows, F for fullscreen)
- Smooth slide transitions: 500ms ease-in-out opacity + subtle scale
- Auto-hiding controls with dot navigation
- Each slide should have a video background placeholder (use solid dark gradients as fallback)

Output Structure:
The HTML must contain TWO major sections:
1. PITCH DECK SECTION: Creative, immersive slides telling the startup's story. \
   Include cover, problem, solution, market, traction, team, ask slides.
2. SUMMARY SECTION: After the pitch slides, a scrollable summary region with strict formatting:
   - Investor verdict (1-2 sentences)
   - Key metrics grid (TAM, revenue projections, funding ask, team size)
   - Risk assessment (bullet points)
   - Document links section (cards for each of the 9 documents)
   - Contact/CTA section

Output ONLY the raw HTML string. No markdown wrapping, no code fences.
"""

design_agent = Agent(
    model="openai:gpt-4o-mini",
    result_type=str,
    system_prompt=DESIGN_AGENT_SYSTEM_PROMPT,
)


# ── Document content generation agent ──

DOCUMENT_CONTENT_SYSTEM_PROMPT = """\
You are an expert business document writer. Given extracted field data about a startup, \
write a polished, professional document in markdown format. Use the extracted numbers and \
claims to create compelling, detailed content. Make the numbers prominent and back claims \
with the data provided.

Output ONLY raw markdown content. No code fences or wrapping.
"""

document_content_agent = Agent(
    model="openai:gpt-4o-mini",
    result_type=str,
    system_prompt=DOCUMENT_CONTENT_SYSTEM_PROMPT,
)


# ── LLMs.txt generation agent ──

LLMS_TXT_SYSTEM_PROMPT = """\
You are writing a plaintext description of a startup for AI agents and web crawlers. \
This will be served at a /llms.txt endpoint. Write a clear, structured, factual summary \
of the startup that an AI agent can parse to understand what this startup does, its market, \
traction, and key metrics. Use markdown-like formatting but keep it simple plaintext.

Format:
# Startup: [Name]
## One-liner: [tagline]
## Problem: [what problem they solve]
## Solution: [how they solve it]
## Market: TAM [X], SAM [Y], SOM [Z]
## Traction: [key metrics]
## Team: [founders]
## Funding: [stage, amount seeking]
## Verdict: [honest 1-sentence assessment]
## Risks: [top 3 risks]
"""

llms_txt_agent = Agent(
    model="openai:gpt-4o-mini",
    result_type=str,
    system_prompt=LLMS_TXT_SYSTEM_PROMPT,
)


# ── Utility functions ──

def compute_fields_hash(documents_fields: list[dict | None]) -> str:
    """Compute SHA-256 hash of all document fields for diff checking."""
    serialized = json.dumps(documents_fields, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode()).hexdigest()


def build_extraction_state(documents: list) -> dict:
    """Build the extraction_state dict from ProjectDocument records."""
    state = {}
    for doc in documents:
        fields = doc.fields or {}
        state[doc.type] = {
            "is_complete": fields.get("is_complete", False),
            "fields": fields,
        }
    return state


def check_all_complete(extraction_state: dict) -> bool:
    """Check if all 9 document types have is_complete=True."""
    if len(extraction_state) < 9:
        return False
    return all(v.get("is_complete", False) for v in extraction_state.values())


async def generate_document_content(doc_type: str, project_name: str, fields: dict) -> str:
    """Generate polished markdown content for a specific document type using extracted fields."""
    title = DOCUMENT_TYPE_TITLES.get(doc_type, doc_type)
    prompt = (
        f"Write the '{title}' document for the startup '{project_name}'.\n"
        f"Use these extracted fields as the source of truth:\n{json.dumps(fields, indent=2)}\n"
        f"Create a professional, detailed document using these numbers and claims."
    )
    result = await document_content_agent.run(prompt)
    return result.data


async def generate_full_html(project_name: str, all_fields: dict) -> str:
    """Generate the complete pitch deck + summary HTML."""
    prompt = (
        f"Create a pitch deck for '{project_name}' using this startup data:\n"
        f"{json.dumps(all_fields, indent=2)}\n\n"
        f"Generate a complete, self-contained HTML document with the pitch deck slides "
        f"and the investor summary section below."
    )
    result = await design_agent.run(prompt)
    return result.data


async def generate_llms_txt(project_name: str, all_fields: dict) -> str:
    """Generate plaintext llms.txt content."""
    prompt = (
        f"Write the llms.txt for '{project_name}' using this data:\n"
        f"{json.dumps(all_fields, indent=2)}"
    )
    result = await llms_txt_agent.run(prompt)
    return result.data


async def generate_ai_json(project_name: str, all_fields: dict) -> dict:
    """Generate structured ai.json content."""
    return {
        "name": project_name,
        "documents": all_fields,
        "generated_at": None,  # Will be set by caller
    }
```

**Step 2: Commit**

```bash
git add traction-backend/backend/app/core/ai_generators.py
git commit -m "feat(ai): rewrite agent system with doc extraction and design generation"
```

---

## Task 5: Rewrite Chat Controller with Dual-Mode Logic

**Files:**
- Rewrite: `traction-backend/backend/app/controllers/chat_controller.py`

**Step 1: Implement the dual-mode chat controller**

```python
"""Chat controller — handles doc-mode extraction and design-mode generation."""

import uuid
import json
from datetime import datetime, timezone

from fastapi import HTTPException
from pydantic_ai.messages import ModelMessage, ModelRequest, ModelResponse, UserPromptPart, TextPart
from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.controllers import project_controller
from app.core.ai_generators import (
    doc_agent,
    compute_fields_hash,
    build_extraction_state,
    check_all_complete,
    generate_full_html,
    generate_document_content,
    generate_llms_txt,
    generate_ai_json,
    DOCUMENT_TYPE_TO_ATTR,
    DOCUMENT_TYPE_TITLES,
)
from app.models.chat_message import ChatMessage
from app.models.project import Project, ProjectDocument
from app.models.user import User
from app.schemas.extraction import DOCUMENT_TYPE_FIELDS


async def get_project_messages(
    user: User,
    project_id: uuid.UUID,
    db: AsyncSession,
) -> list[ChatMessage]:
    """Get all messages for a specific project, verifying ownership."""
    project = await project_controller.get_project(user, project_id, db)
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.project_id == project.id)
        .order_by(ChatMessage.created_at.asc())
    )
    return list(result.scalars().all())


async def _ensure_documents_exist(project: Project, db: AsyncSession) -> list[ProjectDocument]:
    """Ensure all 9 document types exist for a project. Create if missing."""
    result = await db.execute(
        select(ProjectDocument).where(ProjectDocument.project_id == project.id)
    )
    existing = {doc.type: doc for doc in result.scalars().all()}

    for doc_type, title in DOCUMENT_TYPE_TITLES.items():
        if doc_type not in existing:
            doc = ProjectDocument(
                project_id=project.id,
                type=doc_type,
                title=title,
                content="",
                status="pending",
                fields=None,
            )
            db.add(doc)
            existing[doc_type] = doc

    await db.flush()
    # Re-fetch to get all with IDs
    result = await db.execute(
        select(ProjectDocument).where(ProjectDocument.project_id == project.id)
    )
    return list(result.scalars().all())


def _build_history_messages(messages: list[ChatMessage]) -> list[ModelMessage]:
    """Convert DB chat messages to pydantic_ai message format for context."""
    history: list[ModelMessage] = []
    for msg in messages:
        if msg.role == "user":
            history.append(ModelRequest(parts=[UserPromptPart(content=msg.content)]))
        else:
            history.append(ModelResponse(parts=[TextPart(content=msg.content)]))
    return history


async def _handle_doc_mode(
    project: Project,
    content: str,
    db: AsyncSession,
) -> dict:
    """Handle doc-mode: extract fields from conversation."""
    documents = await _ensure_documents_exist(project, db)

    # Build current extraction state for context
    current_state = {}
    for doc in documents:
        if doc.fields:
            attr_name = DOCUMENT_TYPE_TO_ATTR.get(doc.type)
            if attr_name:
                current_state[attr_name] = doc.fields

    # Build message history
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.project_id == project.id)
        .order_by(ChatMessage.created_at.asc())
    )
    all_messages = list(result.scalars().all())
    history = _build_history_messages(all_messages)

    # Set project prompt from first user message if empty
    if not project.prompt:
        project.prompt = content
        db.add(project)
        await db.flush()

    # Build context-enriched prompt
    context = f"Current extraction state:\n{json.dumps(current_state, indent=2)}\n\nUser message: {content}"

    # Call doc agent
    try:
        ai_result = await doc_agent.run(context, message_history=history)
        extraction = ai_result.data
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI agent error: {str(e)}")

    # Save assistant message
    assistant_message = ChatMessage(
        project_id=project.id,
        role="assistant",
        content=extraction.response,
    )
    db.add(assistant_message)
    await db.flush()
    await db.refresh(assistant_message)

    # Merge extracted fields into documents
    for doc in documents:
        attr_name = DOCUMENT_TYPE_TO_ATTR.get(doc.type)
        if not attr_name:
            continue
        new_fields = getattr(extraction, attr_name, None)
        if new_fields is None:
            continue

        new_fields_dict = new_fields.model_dump(exclude_none=True)
        if not new_fields_dict:
            continue

        existing = doc.fields or {}
        # Merge: new non-null values overwrite, existing non-null preserved
        merged = {**existing, **new_fields_dict}
        doc.fields = merged
        doc.status = "ready" if merged.get("is_complete", False) else "pending"
        db.add(doc)

    await db.flush()

    # Re-fetch documents for response
    documents = await _ensure_documents_exist(project, db)
    extraction_state = build_extraction_state(documents)
    all_complete = check_all_complete(extraction_state)

    return {
        "message": assistant_message,
        "extraction_state": extraction_state,
        "all_complete": all_complete,
        "design_generation_triggered": False,
        "project": None,
    }


async def _handle_design_mode(
    project: Project,
    content: str,
    db: AsyncSession,
) -> dict:
    """Handle design-mode: generate pitch deck, documents, llms.txt, ai.json."""
    documents = await _ensure_documents_exist(project, db)

    # Save user message
    user_msg = ChatMessage(project_id=project.id, role="user", content=content)
    db.add(user_msg)
    await db.flush()

    # Check field diff — should we regenerate?
    current_fields = [doc.fields for doc in documents]
    current_hash = compute_fields_hash(current_fields)
    needs_generation = current_hash != project.last_generation_fields_hash

    if needs_generation:
        # Gather all fields
        all_fields = {}
        for doc in documents:
            all_fields[doc.type] = doc.fields or {}

        project.status = "generating"
        db.add(project)
        await db.flush()

        try:
            # 1. Generate pitch deck HTML
            full_html = await generate_full_html(project.name, all_fields)
            project.full_html = full_html

            # 2. Generate document contents
            for doc in documents:
                if doc.fields:
                    doc.content = await generate_document_content(
                        doc.type, project.name, doc.fields
                    )
                    doc.status = "ready"
                    db.add(doc)

            # 3. Generate llms.txt
            project.llms_txt = await generate_llms_txt(project.name, all_fields)

            # 4. Generate ai.json
            ai_data = await generate_ai_json(project.name, all_fields)
            ai_data["generated_at"] = datetime.now(timezone.utc).isoformat()
            project.ai_json = ai_data

            # 5. Update hash and status
            project.last_generation_fields_hash = current_hash
            project.status = "draft"
            project.mode = "design"

        except Exception as e:
            project.status = "error"
            db.add(project)
            await db.flush()
            raise HTTPException(status_code=502, detail=f"Generation error: {str(e)}")

        db.add(project)
        await db.flush()
        await db.refresh(project)

        assistant_content = "Your pitch deck, documents, and discoverability files have been generated! You can now view your deck and share it."
    else:
        assistant_content = "No changes detected since last generation. Your existing pitch deck is up to date. Continue chatting to make changes, then switch back to design mode to regenerate."

    # Save assistant message
    assistant_message = ChatMessage(
        project_id=project.id,
        role="assistant",
        content=assistant_content,
    )
    db.add(assistant_message)
    await db.flush()
    await db.refresh(assistant_message)

    extraction_state = build_extraction_state(documents)

    return {
        "message": assistant_message,
        "extraction_state": extraction_state,
        "all_complete": check_all_complete(extraction_state),
        "design_generation_triggered": needs_generation,
        "project": project if needs_generation else None,
    }


async def send_message(
    user: User,
    project_id: uuid.UUID,
    content: str,
    mode: str,
    db: AsyncSession,
) -> dict:
    """Main entry point: routes to doc or design mode handler."""
    project = await project_controller.get_project(user, project_id, db)

    # Update project mode if changed
    if project.mode != mode:
        project.mode = mode
        db.add(project)
        await db.flush()

    if mode == "doc":
        # Save user message first
        user_message = ChatMessage(
            project_id=project.id,
            role="user",
            content=content,
        )
        db.add(user_message)
        await db.flush()

        return await _handle_doc_mode(project, content, db)
    elif mode == "design":
        return await _handle_design_mode(project, content, db)
    else:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {mode}")
```

**Step 2: Commit**

```bash
git add traction-backend/backend/app/controllers/chat_controller.py
git commit -m "feat(chat): implement dual-mode chat with doc extraction and design generation"
```

---

## Task 6: Update Project Controller

**Files:**
- Modify: `traction-backend/backend/app/controllers/project_controller.py`

**Step 1: Update create_project to accept name only, add shared listing and by-name lookup**

```python
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.project import Project, ProjectDocument
from app.models.user import User


async def create_project(user: User, name: str, db: AsyncSession) -> Project:
    """Create a new project with name only. Validates unique name per user."""
    # Check for duplicate name
    result = await db.execute(
        select(Project).where(Project.user_id == user.id, Project.name == name)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="You already have a project with this name."
        )

    project = Project(
        user_id=user.id,
        name=name,
        prompt="",
        status="draft",
        mode="doc",
        slides_html=[],
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


async def list_projects(
    user: User, db: AsyncSession, filter_status: str = "all", sort_by: str = "recent"
) -> list[Project]:
    query = select(Project).where(Project.user_id == user.id)

    if filter_status != "all":
        query = query.where(Project.status == filter_status)

    if sort_by == "recent":
        query = query.order_by(Project.created_at.desc())
    elif sort_by == "name":
        query = query.order_by(Project.name.asc())
    elif sort_by == "status":
        query = query.order_by(Project.status.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


async def list_shared_projects(user: User, db: AsyncSession) -> dict:
    """List user's shared projects and return count."""
    query = select(Project).where(
        Project.user_id == user.id, Project.status == "shared"
    ).order_by(Project.created_at.desc())
    result = await db.execute(query)
    projects = list(result.scalars().all())
    return {"projects": projects, "count": len(projects)}


async def get_project(user: User, project_id: uuid.UUID, db: AsyncSession) -> Project:
    project = await db.get(Project, project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


async def get_project_by_name(user: User, project_name: str, db: AsyncSession) -> Project:
    """Get a project by name for the given user."""
    result = await db.execute(
        select(Project).where(
            Project.user_id == user.id,
            func.lower(Project.name) == project_name.lower()
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


async def update_project(
    user: User, project_id: uuid.UUID, name: str | None, project_status: str | None,
    mode: str | None = None, db: AsyncSession = None
) -> Project:
    project = await get_project(user, project_id, db)
    if name is not None:
        project.name = name
    if project_status is not None:
        project.status = project_status
    if mode is not None:
        project.mode = mode

    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


async def delete_project(user: User, project_id: uuid.UUID, db: AsyncSession) -> None:
    project = await get_project(user, project_id, db)
    await db.delete(project)
    await db.flush()


async def get_project_documents(
    user: User, project_id: uuid.UUID, db: AsyncSession
) -> list[ProjectDocument]:
    project = await get_project(user, project_id, db)
    result = await db.execute(
        select(ProjectDocument).where(ProjectDocument.project_id == project.id)
    )
    return list(result.scalars().all())


async def get_document(user: User, doc_id: uuid.UUID, db: AsyncSession) -> ProjectDocument:
    doc = await db.get(ProjectDocument, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    project = await db.get(Project, doc.project_id)
    if not project or project.user_id != user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
```

**Step 2: Commit**

```bash
git add traction-backend/backend/app/controllers/project_controller.py
git commit -m "feat(projects): update controller with name-only create, shared listing, by-name lookup"
```

---

## Task 7: Update API Routers

**Files:**
- Modify: `traction-backend/backend/app/api/v1/routers/projects.py`
- Modify: `traction-backend/backend/app/api/v1/routers/chat.py`
- Create: `traction-backend/backend/app/api/v1/routers/public.py`
- Modify: `traction-backend/backend/app/api/v1/api.py`

**Step 1: Update projects router — add shared and by-name endpoints**

In `projects.py`, update the create endpoint to not require prompt, and add:

```python
@router.get("/shared")
async def list_shared_projects(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List shared projects with count."""
    return await project_controller.list_shared_projects(user, db)


@router.get("/by-name/{project_name}", response_model=ProjectRead)
async def get_project_by_name(
    project_name: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a project by name."""
    return await project_controller.get_project_by_name(user, project_name, db)
```

Update the create endpoint:

```python
@router.post("/", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new project from a name."""
    return await project_controller.create_project(user, payload.name, db)
```

IMPORTANT: The `/shared` and `/by-name/{project_name}` routes MUST be defined BEFORE `/{project_id}` to avoid FastAPI treating "shared" and "by-name" as a project_id UUID.

**Step 2: Update chat router — pass mode to controller**

```python
@router.post("/{project_id}/messages", status_code=status.HTTP_201_CREATED)
async def send_message(
    project_id: uuid.UUID,
    payload: ChatMessageCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message and get an AI response. Mode determines doc or design agent."""
    return await chat_controller.send_message(user, project_id, payload.content, payload.mode, db)
```

**Step 3: Create public router for /:username/:project_name endpoints**

Create `traction-backend/backend/app/api/v1/routers/public.py`:

```python
"""Public routes — no authentication required. Serves /:username/:project_name data."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse
from sqlalchemy import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.database import get_db
from app.models.user import User
from app.models.project import Project, ProjectDocument

router = APIRouter(prefix="/public", tags=["public"])


async def _resolve_project(username: str, project_name: str, db: AsyncSession) -> tuple[User, Project]:
    """Resolve a project by username + project name. Only returns shared projects."""
    result = await db.execute(
        select(User).where(func.lower(User.username) == username.lower())
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(
        select(Project).where(
            Project.user_id == user.id,
            func.lower(Project.name) == project_name.lower().replace("-", " "),
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.status != "shared":
        raise HTTPException(status_code=404, detail="Project not found")

    return user, project


@router.get("/users/{username}/projects/{project_name}")
async def get_public_project(
    username: str,
    project_name: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a shared project by username and project name. Public endpoint."""
    user, project = await _resolve_project(username, project_name, db)

    docs_result = await db.execute(
        select(ProjectDocument).where(ProjectDocument.project_id == project.id)
    )
    documents = docs_result.scalars().all()

    return {
        "project": project,
        "documents": list(documents),
        "user": {"username": user.username, "display_name": user.display_name},
    }


@router.get("/users/{username}/projects/{project_name}/llms.txt")
async def get_llms_txt(
    username: str,
    project_name: str,
    db: AsyncSession = Depends(get_db),
):
    """Get llms.txt for a shared project. Returns plaintext."""
    _, project = await _resolve_project(username, project_name, db)
    if not project.llms_txt:
        raise HTTPException(status_code=404, detail="llms.txt not generated yet")
    return PlainTextResponse(content=project.llms_txt)


@router.get("/users/{username}/projects/{project_name}/ai.json")
async def get_ai_json(
    username: str,
    project_name: str,
    db: AsyncSession = Depends(get_db),
):
    """Get ai.json for a shared project. Returns JSON."""
    _, project = await _resolve_project(username, project_name, db)
    if not project.ai_json:
        raise HTTPException(status_code=404, detail="ai.json not generated yet")
    return JSONResponse(content=project.ai_json)
```

**Step 4: Register public router in api.py**

```python
from app.api.v1.routers import auth, chat, users, projects, documents, pages, share, public

router = APIRouter()
router.include_router(auth.router)
router.include_router(chat.router)
router.include_router(users.router)
router.include_router(projects.router)
router.include_router(documents.router)
router.include_router(pages.router)
router.include_router(share.router)
router.include_router(public.router)
```

**Step 5: Commit**

```bash
git add traction-backend/backend/app/api/
git commit -m "feat(api): update routers with shared listing, by-name lookup, and public endpoints"
```

---

## Task 8: Add password_hash utilities to security.py

**Files:**
- Modify: `traction-backend/backend/app/core/security.py`

The share_controller imports `get_password_hash` and `verify_password` from security.py but they don't exist.

**Step 1: Add the missing functions**

Append to `traction-backend/backend/app/core/security.py`:

```python
import bcrypt

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
```

Note: Check if `bcrypt` is in pyproject.toml. If not, use hashlib instead:

```python
import hashlib
import secrets

def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    salt, hashed = hashed_password.split(":")
    return hashlib.sha256((salt + plain_password).encode()).hexdigest() == hashed
```

Use the hashlib approach since bcrypt is not in pyproject.toml dependencies.

**Step 2: Commit**

```bash
git add traction-backend/backend/app/core/security.py
git commit -m "fix(security): add missing password hash/verify functions for share links"
```

---

## Task 9: Update Frontend Types and API Client

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/lib/api.ts`

**Step 1: Update TypeScript types to match backend schemas**

```typescript
export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  status: "generating" | "draft" | "shared" | "error";
  mode: "doc" | "design";
  slides_html: string[];
  full_html: string | null;
  thumbnail_url: string | null;
  llms_txt: string | null;
  ai_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
}

export type DocumentType =
  | "product-description"
  | "timeline"
  | "swot-analysis"
  | "market-research"
  | "financial-projections"
  | "funding-requirements"
  | "product-forecast"
  | "competitive-analysis"
  | "executive-summary";

export interface ProjectDocument {
  id: string;
  project_id: string;
  type: DocumentType;
  title: string;
  content: string;
  status: "generating" | "ready" | "error" | "pending";
  fields: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
}

export interface ChatMessage {
  id: string;
  project_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ExtractionState {
  [docType: string]: {
    is_complete: boolean;
    fields: Record<string, unknown>;
  };
}

export interface ChatResponse {
  message: ChatMessage;
  extraction_state: ExtractionState;
  all_complete: boolean;
  design_generation_triggered: boolean;
  project: Project | null;
}

export interface SharedProjectsResponse {
  projects: Project[];
  count: number;
}

export interface PublicProjectResponse {
  project: Project;
  documents: ProjectDocument[];
  user: { username: string; display_name: string | null };
}
```

Remove the `Feedback`, `ShareLink`, and `AiSuggestion` interfaces (unused now) or keep for future use.

**Step 2: Expand the API client with typed helpers**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.traction-ai.me";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res;
}

export function getGoogleLoginUrl() {
  return `${API_URL}/api/v1/auth/google/login`;
}

// ── Project APIs ──

export async function createProject(name: string) {
  const res = await apiFetch("/api/v1/projects/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listProjects(status = "all", sort = "recent") {
  const res = await apiFetch(`/api/v1/projects/?status=${status}&sort=${sort}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getProject(projectId: string) {
  const res = await apiFetch(`/api/v1/projects/${projectId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getProjectByName(projectName: string) {
  const res = await apiFetch(`/api/v1/projects/by-name/${encodeURIComponent(projectName)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listSharedProjects() {
  const res = await apiFetch("/api/v1/projects/shared");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateProject(projectId: string, data: { name?: string; status?: string; mode?: string }) {
  const res = await apiFetch(`/api/v1/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteProject(projectId: string) {
  const res = await apiFetch(`/api/v1/projects/${projectId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

// ── Chat APIs ──

export async function sendMessage(projectId: string, content: string, mode: "doc" | "design" = "doc") {
  const res = await apiFetch(`/api/v1/projects/${projectId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, mode }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMessages(projectId: string) {
  const res = await apiFetch(`/api/v1/projects/${projectId}/messages`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Document APIs ──

export async function getProjectDocuments(projectId: string) {
  const res = await apiFetch(`/api/v1/projects/${projectId}/documents`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getDocument(docId: string) {
  const res = await apiFetch(`/api/v1/documents/${docId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Public APIs ──

export async function getPublicProject(username: string, projectName: string) {
  const res = await apiFetch(
    `/api/v1/public/users/${encodeURIComponent(username)}/projects/${encodeURIComponent(projectName)}`
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Share APIs ──

export async function createShareLink(projectId: string) {
  const res = await apiFetch(`/api/v1/share/projects/${projectId}`, {
    method: "POST",
    body: JSON.stringify({ is_password_protected: false }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

**Step 3: Commit**

```bash
git add frontend/src/types/index.ts frontend/src/lib/api.ts
git commit -m "feat(frontend): update types and API client for backend integration"
```

---

## Task 10: Restructure Frontend Routes

**Files:**
- Delete: `frontend/src/app/(app)/projects/` (entire directory)
- Delete: `frontend/src/app/(app)/shared/page.tsx`
- Delete: `frontend/src/app/(public)/share/` (entire directory)
- Create: `frontend/src/app/(app)/dashboard/shared/page.tsx`
- Create: `frontend/src/app/(app)/[username]/[projectName]/ideation/page.tsx`
- Create: `frontend/src/app/(public)/[username]/[projectName]/page.tsx`
- Modify: `frontend/src/app/(app)/dashboard/page.tsx`

**Step 1: Replace `/dashboard` page — project list with new project modal**

Rewrite `frontend/src/app/(app)/dashboard/page.tsx` to be the main project listing page with a "New Project" button that opens a name modal. When project is created, redirect to `/:username/:projectName/ideation`.

**Step 2: Create `/dashboard/shared` page**

Move shared projects logic to `frontend/src/app/(app)/dashboard/shared/page.tsx`. Call `listSharedProjects()` API instead of mock data.

**Step 3: Create `/:username/:projectName/ideation` page**

Create `frontend/src/app/(app)/[username]/[projectName]/ideation/page.tsx`. This is the workspace with the chat panel, document list, and deck viewer. Fetches project by name, displays chat, handles doc/design mode toggle.

**Step 4: Create `/:username/:projectName` public page**

Create `frontend/src/app/(public)/[username]/[projectName]/page.tsx`. This is the public share page that renders `full_html` in an iframe + shows documents. Calls `getPublicProject()`.

**Step 5: Update sidebar navigation**

Update `frontend/src/components/layout/app-sidebar.tsx`:
- "Dashboard" → `/dashboard` (the project list)
- "Shared" → `/dashboard/shared`
- "Settings" → `/settings`
- Remove "Documents" and "Projects" as separate nav items

**Step 6: Commit**

```bash
git add frontend/src/app/ frontend/src/components/layout/
git commit -m "feat(frontend): restructure routes to /:username/:projectName pattern"
```

---

## Task 11: Rewrite Dashboard Page (Project List + New Project Modal)

**Files:**
- Rewrite: `frontend/src/app/(app)/dashboard/page.tsx`
- Modify: `frontend/src/components/projects/projects-gallery.tsx`

**Step 1: Dashboard page**

The dashboard page imports ProjectsGallery and passes real API data. It includes a "New Project" modal with a text input for project name.

Key behaviors:
- On mount: call `listProjects()` to get all projects
- "New Project" button → opens modal → user enters name → `createProject(name)` → redirect to `/${user.username}/${project.name}/ideation`
- Pass projects to ProjectsGallery

**Step 2: Update ProjectsGallery**

Replace mock data imports with props. Project cards link to `/${username}/${projectName}/ideation` instead of `/projects/${id}`.

**Step 3: Commit**

```bash
git add frontend/src/app/(app)/dashboard/ frontend/src/components/projects/
git commit -m "feat(frontend): dashboard with real API data and new project modal"
```

---

## Task 12: Rewrite Chat Panel for Real API Integration

**Files:**
- Rewrite: `frontend/src/components/chat/chat-panel.tsx`
- Rewrite: `frontend/src/components/chat/dashboard-chat-panel.tsx`

**Step 1: Rewrite ChatPanel (workspace chat)**

Replace all mock logic with real API calls:
- On mount: `getMessages(projectId)` to load history
- On send: `sendMessage(projectId, content, mode)` → display response
- Track `extraction_state` from responses
- Show extraction progress (how many docs complete out of 9)
- Mode toggle button (disabled until all_complete)
- When in design mode and generation triggered, show loading state then update deck

**Step 2: Remove DashboardChatPanel**

The dashboard no longer has a chat — it's a project list. The chat lives at `/:username/:projectName/ideation`. Delete or repurpose `dashboard-chat-panel.tsx`.

**Step 3: Commit**

```bash
git add frontend/src/components/chat/
git commit -m "feat(frontend): rewrite chat panel for real API integration with mode toggle"
```

---

## Task 13: Rewrite Ideation (Workspace) Page

**Files:**
- Create: `frontend/src/app/(app)/[username]/[projectName]/ideation/page.tsx`

**Step 1: Implement the workspace page**

This page:
1. Gets username and projectName from URL params
2. Calls `getProjectByName(projectName)` to fetch the project
3. Calls `getProjectDocuments(projectId)` and `getMessages(projectId)` for initial data
4. Renders a 2-panel layout: ChatPanel (left 2/3) + DocumentList (right 1/3)
5. ChatPanel handles doc/design mode toggle
6. DocumentList shows extraction progress and document completion
7. "View Deck" button appears when `full_html` is available (after design generation)
8. "Share" button updates project status to "shared" and copies the public URL

**Step 2: Commit**

```bash
git add frontend/src/app/(app)/[username]/[projectName]/
git commit -m "feat(frontend): implement ideation workspace page with real API"
```

---

## Task 14: Rewrite Public Share Page

**Files:**
- Create: `frontend/src/app/(public)/[username]/[projectName]/page.tsx`

**Step 1: Implement the public share page**

This page:
1. Gets username and projectName from URL params
2. Calls `getPublicProject(username, projectName)` to fetch project + docs
3. Renders `full_html` in an iframe (the pitch deck + summary)
4. Below the iframe, shows document cards that expand to show content
5. SEO metadata (title, description, Open Graph)

**Step 2: Commit**

```bash
git add frontend/src/app/(public)/[username]/[projectName]/
git commit -m "feat(frontend): implement public share page at /:username/:projectName"
```

---

## Task 15: Update Shared Projects Page

**Files:**
- Create: `frontend/src/app/(app)/dashboard/shared/page.tsx`

**Step 1: Implement shared projects listing**

Calls `listSharedProjects()` and displays projects with their count. Links to `/:username/:projectName` (the public page).

**Step 2: Commit**

```bash
git add frontend/src/app/(app)/dashboard/shared/
git commit -m "feat(frontend): add shared projects page under dashboard"
```

---

## Task 16: Update Document List Component

**Files:**
- Modify: `frontend/src/components/documents/document-list.tsx`

**Step 1: Update to use real data**

Replace mock data with props. Show completion status from `fields.is_complete`. Display field names and their fill status. Click to view document content (only when status is "ready").

**Step 2: Commit**

```bash
git add frontend/src/components/documents/
git commit -m "feat(frontend): update document list for real API data and field tracking"
```

---

## Task 17: Update Sidebar Navigation

**Files:**
- Modify: `frontend/src/components/layout/app-sidebar.tsx`

**Step 1: Update nav items**

```
- Dashboard → /dashboard (project list)
- Shared → /dashboard/shared
- Settings → /settings
```

Remove "Documents" nav item (documents are per-project in the workspace).

**Step 2: Commit**

```bash
git add frontend/src/components/layout/app-sidebar.tsx
git commit -m "feat(frontend): update sidebar navigation for new route structure"
```

---

## Task 18: Clean Up Mock Data and Old Routes

**Files:**
- Delete: `frontend/src/lib/mock-data.ts`
- Delete: `frontend/src/app/(app)/projects/` (entire directory if still exists)
- Delete: `frontend/src/app/(app)/shared/page.tsx` (if still exists)
- Delete: `frontend/src/app/(public)/share/` (entire directory if still exists)

**Step 1: Remove mock-data.ts**

Delete the file entirely. Search for any remaining imports of `mock-data` across the codebase and remove them.

**Step 2: Remove old route directories**

Delete the old route directories that were replaced by the new structure.

**Step 3: Verify no broken imports**

Run `npx tsc --noEmit` from `frontend/` to check for TypeScript errors.

**Step 4: Commit**

```bash
git add -A frontend/src/
git commit -m "chore(frontend): remove mock data and old route structures"
```

---

## Task 19: Generate Final Alembic Migration and Test

**Step 1: Generate migration for any remaining model changes**

```bash
cd traction-backend/backend
alembic revision --autogenerate -m "final schema alignment"
alembic upgrade head
```

**Step 2: Start backend and verify endpoints**

```bash
cd traction-backend
uvicorn backend.app.main:app --reload --port 8000
```

Test endpoints with curl:
```bash
# Health check
curl http://localhost:8000/

# Auth (should redirect)
curl -v http://localhost:8000/api/v1/auth/google/login
```

**Step 3: Start frontend and verify**

```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:3000/dashboard` and verify:
- Login redirects work
- Dashboard shows (empty project list initially)
- "New Project" modal works
- Chat interface loads at `/username/project-name/ideation`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete full-stack integration — backend endpoints, frontend routes, AI agents"
```

---

## Execution Order Summary

| Task | Area | Dependencies |
|------|------|-------------|
| 1 | Backend: DB models + migration | None |
| 2 | Backend: Extraction schemas | None |
| 3 | Backend: Project/chat schemas | Task 2 |
| 4 | Backend: AI agent system | Task 2 |
| 5 | Backend: Chat controller | Tasks 1, 2, 3, 4 |
| 6 | Backend: Project controller | Task 1 |
| 7 | Backend: API routers | Tasks 5, 6 |
| 8 | Backend: Security fix | None |
| 9 | Frontend: Types + API client | Task 7 (schemas must match) |
| 10 | Frontend: Route restructure | Task 9 |
| 11 | Frontend: Dashboard rewrite | Tasks 9, 10 |
| 12 | Frontend: Chat panel rewrite | Tasks 9, 10 |
| 13 | Frontend: Ideation page | Tasks 11, 12 |
| 14 | Frontend: Public share page | Tasks 9, 10 |
| 15 | Frontend: Shared listing | Tasks 9, 10 |
| 16 | Frontend: Document list | Task 9 |
| 17 | Frontend: Sidebar update | Task 10 |
| 18 | Frontend: Cleanup | All frontend tasks |
| 19 | Integration: Final migration + test | All tasks |

Tasks 1, 2, 8 can run in parallel. Tasks 3, 4, 6 can run in parallel after 1+2. Tasks 9-17 are all frontend and depend on backend being done (Tasks 1-8).
