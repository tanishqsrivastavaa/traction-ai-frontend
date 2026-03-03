import type {
  User,
  Project,
  ProjectDocument,
  ChatMessage,
  ChatResponse,
  SharedProjectsResponse,
  PublicProjectResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.traction-ai.me";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getGoogleLoginUrl() {
  return `${API_URL}/api/v1/auth/google/login`;
}

// ---------- Auth ----------

export async function getMe(): Promise<User> {
  return apiFetch<User>("/api/v1/auth/me");
}

export async function logout(): Promise<void> {
  await apiFetch("/api/v1/auth/logout", { method: "POST" });
}

// ---------- Projects ----------

export async function createProject(name: string): Promise<Project> {
  return apiFetch<Project>("/api/v1/projects/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function listProjects(
  status: "all" | "draft" | "generating" | "shared" = "all",
  sort: "recent" | "name" | "status" = "recent"
): Promise<Project[]> {
  return apiFetch<Project[]>(`/api/v1/projects/?status=${status}&sort=${sort}`);
}

export async function getProject(projectId: string): Promise<Project> {
  return apiFetch<Project>(`/api/v1/projects/${projectId}`);
}

export async function getProjectByName(projectName: string): Promise<Project> {
  return apiFetch<Project>(`/api/v1/projects/by-name/${encodeURIComponent(projectName)}`);
}

export async function listSharedProjects(): Promise<SharedProjectsResponse> {
  return apiFetch<SharedProjectsResponse>("/api/v1/projects/shared");
}

export async function updateProject(
  projectId: string,
  data: { name?: string; status?: string; mode?: string }
): Promise<Project> {
  return apiFetch<Project>(`/api/v1/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiFetch(`/api/v1/projects/${projectId}`, { method: "DELETE" });
}

// ---------- Documents ----------

export async function getProjectDocuments(projectId: string): Promise<ProjectDocument[]> {
  return apiFetch<ProjectDocument[]>(`/api/v1/projects/${projectId}/documents`);
}

// ---------- Chat ----------

export async function getMessages(projectId: string): Promise<ChatMessage[]> {
  return apiFetch<ChatMessage[]>(`/api/v1/projects/${projectId}/messages`);
}

export async function sendMessage(
  projectId: string,
  content: string,
  mode: "doc" | "design" = "doc"
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>(`/api/v1/projects/${projectId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, mode }),
  });
}

// ---------- Public ----------

export async function getPublicProject(
  username: string,
  projectName: string
): Promise<PublicProjectResponse> {
  return apiFetch<PublicProjectResponse>(
    `/api/v1/public/users/${encodeURIComponent(username)}/projects/${encodeURIComponent(projectName)}`
  );
}

export async function getPublicLlmsTxt(
  username: string,
  projectName: string
): Promise<string> {
  const res = await fetch(
    `${API_URL}/api/v1/public/users/${encodeURIComponent(username)}/projects/${encodeURIComponent(projectName)}/llms.txt`
  );
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.text();
}

export async function getPublicAiJson(
  username: string,
  projectName: string
): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(
    `/api/v1/public/users/${encodeURIComponent(username)}/projects/${encodeURIComponent(projectName)}/ai.json`
  );
}
