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
  mode: "doc" | "design";
  status: "generating" | "draft" | "shared";
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

export interface ShareLink {
  id: string;
  project_id: string;
  slug: string;
  is_password_protected: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
}

export interface AiSuggestion {
  id: string;
  projectId: string;
  target: "slide" | "document" | "general";
  targetId: string | null;
  description: string;
  status: "pending" | "applied" | "dismissed";
}

// Extraction state returned by chat endpoint
export interface ExtractionDocState {
  is_complete: boolean;
  fields: Record<string, unknown>;
}

export interface ExtractionState {
  [docType: string]: ExtractionDocState;
}

// Chat response from POST /projects/{id}/messages
export interface ChatResponse {
  message: ChatMessage;
  extraction_state: ExtractionState;
  all_complete: boolean;
  design_generation_triggered: boolean;
  project: Project | null;
}

// Shared projects response from GET /projects/shared
export interface SharedProjectsResponse {
  projects: Project[];
  count: number;
}

// Public project response from GET /public/users/{username}/projects/{project_name}
export interface PublicProjectResponse {
  project: Project;
  documents: ProjectDocument[];
  user: {
    username: string;
    display_name: string | null;
  };
}
