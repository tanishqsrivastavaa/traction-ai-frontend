"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getProjectByName, getProjectDocuments, getMessages, updateProject } from "@/lib/api";
import { ChatPanel } from "@/components/chat/chat-panel";
import { DocumentList } from "@/components/documents/document-list";
import { DeckViewer } from "@/components/deck/deck-viewer";
import type { Project, ProjectDocument, ChatMessage, ExtractionState } from "@/types";

interface IdeationClientProps {
  username: string;
  projectName: string;
}

export function IdeationClient({ username, projectName }: IdeationClientProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"doc" | "design">("doc");
  const [extractionState, setExtractionState] = useState<ExtractionState>({});
  const [allComplete, setAllComplete] = useState(false);
  const [deckFullscreen, setDeckFullscreen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Verify the user owns this project
  useEffect(() => {
    if (user.username.toLowerCase() !== username.toLowerCase()) {
      router.push("/dashboard");
    }
  }, [user.username, username, router]);

  // Load project data
  useEffect(() => {
    const name = projectName.replace(/-/g, " ");
    getProjectByName(name)
      .then((proj) =>
        Promise.all([getProjectDocuments(proj.id), getMessages(proj.id)]).then(
          ([docs, msgs]) => ({ proj, docs, msgs })
        )
      )
      .then(({ proj, docs, msgs }) => {
        setProject(proj);
        setDocuments(docs);
        setMessages(msgs.length > 0 ? msgs : [{
          id: "init",
          project_id: proj.id,
          role: "assistant" as const,
          content: "Hey there! I'm your Traction pitchdeck assistant. Tell me about your startup or business idea and I'll help you craft a compelling pitch.",
          created_at: new Date().toISOString(),
        }]);
        setMode(proj.mode as "doc" | "design");
        // Build initial extraction state from documents
        const state: ExtractionState = {};
        for (const doc of docs) {
          state[doc.type] = {
            is_complete: Boolean(doc.fields?.is_complete),
            fields: doc.fields || {},
          };
        }
        setExtractionState(state);
        setAllComplete(Object.values(state).length >= 9 && Object.values(state).every((v) => v.is_complete));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load project"))
      .finally(() => setLoading(false));
  }, [projectName]);

  const handleExtractionUpdate = useCallback((state: ExtractionState, complete: boolean) => {
    setExtractionState(state);
    setAllComplete(complete);
    // Backend creates documents during chat; re-fetch so the sidebar updates
    if (project) {
      getProjectDocuments(project.id).then(setDocuments).catch(() => {});
    }
  }, [project]);

  const handleDesignGenerated = useCallback((updatedProject: Partial<Project>) => {
    setProject((prev) => prev ? { ...prev, ...updatedProject } : prev);
    // Re-fetch documents after design generation updates their content
    if (project) {
      getProjectDocuments(project.id).then(setDocuments).catch(() => {});
    }
  }, [project]);

  const handleModeChange = useCallback(async (newMode: "doc" | "design") => {
    const previousMode = mode;
    setMode(newMode);
    if (project) {
      try {
        await updateProject(project.id, { mode: newMode });
      } catch {
        setMode(previousMode);
      }
    }
  }, [project, mode]);

  const handleShare = useCallback(async () => {
    if (!project) return;
    try {
      const updated = await updateProject(project.id, { status: "shared" });
      setProject(updated);
      const slug = project.name.toLowerCase().replace(/\s+/g, "-");
      const url = `${window.location.origin}/${username}/${slug}`;
      await navigator.clipboard.writeText(url);
      alert("Share link copied to clipboard!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share project");
    }
  }, [project, username]);

  const completedCount = useMemo(() => {
    return Object.values(extractionState).filter((v) => v.is_complete).length;
  }, [extractionState]);

  // Poll for project status when background generation is running
  useEffect(() => {
    if (!project || project.status !== "generating") return;

    const interval = setInterval(async () => {
      try {
        const updated = await getProjectByName(projectName.replace(/-/g, " "));
        if (updated.status !== "generating") {
          setProject(updated);
          // Refresh documents since generation may have populated their content
          getProjectDocuments(updated.id).then(setDocuments).catch(() => {});
          // Refresh messages to pick up the completion/error message
          getMessages(updated.id).then(setMessages).catch(() => {});
        }
      } catch {
        // Ignore transient polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [project?.status, projectName]);

  // Escape key closes fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeckFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[13px] text-gray-200 uppercase tracking-[0.08em]">Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[14px] text-gray-300">{error || "Project not found"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className="flex justify-between items-center border-b hairline bg-white flex-shrink-0"
          style={{ padding: "clamp(16px, 2vw, 28px) clamp(32px, 4vw, 64px)" }}
        >
          <div className="flex items-center" style={{ gap: "20px" }}>
            <h1 className="text-[18px] font-bold uppercase tracking-[0.04em]">{project.name}</h1>
            <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${
              project.status === "shared" ? "text-green-600" :
              project.status === "generating" ? "text-accent" :
              "text-gray-200"
            }`}>
              {project.status}
            </span>
            <span className="text-[11px] text-gray-200">
              {completedCount}/9 docs
            </span>
          </div>
          <div className="flex items-center" style={{ gap: "12px" }}>
            {project.full_html && (
              <button
                onClick={() => setDeckFullscreen(true)}
                className="group inline-flex items-center border border-black text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
                style={{ padding: "12px 24px" }}
              >
                Pitchdeck
                <span className="inline-block ml-4 transition-transform group-hover:translate-x-1" style={{ fontSize: "16px" }}>
                  &rarr;
                </span>
              </button>
            )}
            <button
              onClick={handleShare}
              disabled={!project.full_html}
              className="bg-black text-white text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ padding: "12px 24px" }}
            >
              Share
            </button>
          </div>
        </div>

        {/* Main layout: Chat (2/3) + Docs (1/3) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat */}
          <div className="w-full lg:w-2/3 border-r hairline">
            <ChatPanel
              projectId={project.id}
              initialMessages={messages}
              mode={mode}
              allComplete={allComplete}
              onExtractionUpdate={handleExtractionUpdate}
              onDesignGenerated={handleDesignGenerated}
              onModeChange={handleModeChange}
            />
          </div>

          {/* Document sidebar */}
          <div className="hidden lg:flex lg:flex-col lg:w-1/3 bg-white">
            <div
              className="border-b hairline flex-shrink-0"
              style={{ padding: "clamp(16px, 2vw, 24px) 20px" }}
            >
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-gray-200">
                Documents
              </p>
              {/* Progress bar */}
              <div className="bg-gray-100" style={{ height: "3px", marginTop: "12px" }}>
                <div
                  className="bg-black h-full transition-all duration-500"
                  style={{ width: `${(completedCount / 9) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-200" style={{ marginTop: "8px" }}>
                {completedCount} of 9 complete
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DocumentList documents={documents} extractionState={extractionState} />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Deck Overlay */}
      {deckFullscreen && project.full_html && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="relative w-full h-full">
            <DeckViewer slides={project.slides_html} fullHtml={project.full_html} readOnly />
            <button
              onClick={() => setDeckFullscreen(false)}
              className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur text-white text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-white/20 transition-colors"
              style={{ padding: "12px 24px" }}
            >
              &larr; Back
            </button>
          </div>
        </div>
      )}
    </>
  );
}
