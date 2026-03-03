"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { listProjects, createProject } from "@/lib/api";
import type { Project } from "@/types";

export function DashboardClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const project = await createProject(newName.trim());
      const slug = project.name.toLowerCase().replace(/\s+/g, "-");
      router.push(`/${user.username}/${slug}/ideation`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  }, [newName, router, user.username]);

  return (
    <div className="h-full">
      {/* Header */}
      <div
        className="border-b hairline bg-white"
        style={{ padding: "clamp(24px, 3vw, 40px) clamp(32px, 4vw, 64px)" }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="swiss-label text-gray-200" style={{ marginBottom: "10px" }}>
              Overview
            </p>
            <h1 className="text-display font-black uppercase tracking-tight leading-none">
              Projects
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group inline-flex items-center bg-black text-white text-[13px] font-bold uppercase tracking-[0.1em] hover:bg-accent transition-colors flex-shrink-0"
            style={{ padding: "18px 36px" }}
          >
            New Project
            <span className="inline-block ml-5 transition-transform group-hover:translate-x-1" style={{ fontSize: "18px" }}>
              &rarr;
            </span>
          </button>
        </div>
      </div>

      {/* Project Grid */}
      <div style={{ padding: "clamp(24px, 3vw, 48px) clamp(32px, 4vw, 64px)" }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: "64px 0" }}>
            <p className="text-[13px] text-gray-200 uppercase tracking-[0.08em]">Loading...</p>
          </div>
        ) : error && projects.length === 0 ? (
          <div className="flex items-center justify-center" style={{ padding: "64px 0" }}>
            <p className="text-[14px] text-red-500">{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: "80px 0" }}>
            <p className="text-[16px] text-gray-300" style={{ marginBottom: "24px" }}>
              No projects yet. Create your first pitch.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-black text-white text-[13px] font-bold uppercase tracking-[0.1em] hover:bg-accent transition-colors"
              style={{ padding: "18px 36px" }}
            >
              Create Project
            </button>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            style={{ gap: "clamp(20px, 2.5vw, 40px)" }}
          >
            {/* New Pitch Card */}
            <button
              onClick={() => setShowModal(true)}
              className="border border-dashed border-gray-100 bg-[#fafafa] hover:border-black transition-colors flex flex-col items-center justify-center aspect-[4/3]"
            >
              <span className="text-[28px] text-gray-200 font-light" style={{ marginBottom: "12px" }}>+</span>
              <span className="text-[12px] text-gray-200 uppercase tracking-[0.1em] font-bold">
                New Pitch
              </span>
            </button>

            {/* Project Cards */}
            {projects.map((project) => {
              const slug = project.name.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={project.id}
                  href={`/${user.username}/${slug}/ideation`}
                  className="group border border-gray-100 hover:border-black transition-colors"
                >
                  {/* Thumbnail area */}
                  <div className="aspect-[4/3] bg-[#fafafa] border-b hairline flex items-center justify-center">
                    {project.full_html ? (
                      <span className="text-[11px] text-gray-200 font-mono uppercase tracking-wider">FULL</span>
                    ) : (
                      <span className="text-[11px] text-gray-200 font-mono uppercase tracking-wider">
                        {project.slides_html.length} slides
                      </span>
                    )}
                  </div>
                  {/* Meta */}
                  <div style={{ padding: "clamp(16px, 2vw, 24px)" }}>
                    <p className="text-[14px] font-bold text-black truncate">{project.name}</p>
                    {project.prompt && (
                      <p className="text-[12px] text-gray-300 truncate" style={{ marginTop: "6px" }}>
                        {project.prompt}
                      </p>
                    )}
                    <div className="flex items-center justify-between" style={{ marginTop: "12px" }}>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${
                        project.status === "shared" ? "text-green-600" :
                        project.status === "generating" ? "text-accent" :
                        "text-gray-200"
                      }`}>
                        {project.status}
                      </span>
                      <span className="text-[11px] text-gray-200">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-[480px] mx-4">
            <div className="border-b hairline" style={{ padding: "24px 32px" }}>
              <h2 className="text-[18px] font-bold uppercase tracking-[0.04em]">New Project</h2>
            </div>
            <div style={{ padding: "32px" }}>
              <label className="block text-[12px] text-gray-200 uppercase tracking-[0.08em] font-bold" style={{ marginBottom: "12px" }}>
                Project Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setShowModal(false);
                }}
                placeholder="My Startup Pitch"
                autoFocus
                className="w-full border-b-2 border-gray-100 bg-transparent focus:outline-none focus:border-black transition-colors"
                style={{ padding: "16px 0", fontSize: "16px" }}
              />
              {error && (
                <p className="text-[12px] text-red-500" style={{ marginTop: "12px" }}>
                  {error}
                </p>
              )}
            </div>
            <div className="flex justify-end border-t hairline" style={{ padding: "20px 32px", gap: "12px" }}>
              <button
                onClick={() => { setShowModal(false); setNewName(""); setError(""); }}
                className="text-[13px] font-bold uppercase tracking-[0.1em] text-gray-300 hover:text-black transition-colors"
                style={{ padding: "14px 24px" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="bg-black text-white text-[13px] font-bold uppercase tracking-[0.1em] hover:bg-accent transition-colors disabled:opacity-30"
                style={{ padding: "14px 32px" }}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
