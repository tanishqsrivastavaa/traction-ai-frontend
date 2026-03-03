"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { listSharedProjects } from "@/lib/api";
import type { Project } from "@/types";

export default function SharedProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    listSharedProjects()
      .then((res) => {
        setProjects(res.projects);
        setCount(res.count);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load shared projects"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full">
      {/* Header */}
      <div
        className="border-b hairline bg-white"
        style={{ padding: "clamp(24px, 3vw, 40px) clamp(32px, 4vw, 64px)" }}
      >
        <p className="swiss-label text-gray-200" style={{ marginBottom: "10px" }}>
          Published
        </p>
        <h1 className="text-display font-black uppercase tracking-tight leading-none">
          Shared
        </h1>
        <p className="text-body-lg text-gray-300 leading-relaxed" style={{ marginTop: "10px" }}>
          {count} {count === 1 ? "project" : "projects"} shared publicly
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: "clamp(24px, 3vw, 48px) clamp(32px, 4vw, 64px)" }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: "64px 0" }}>
            <p className="text-[13px] text-gray-200 uppercase tracking-[0.08em]">Loading...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center" style={{ padding: "64px 0" }}>
            <p className="text-[14px] text-red-500">{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: "80px 0" }}>
            <p className="text-[16px] text-gray-300">
              No shared projects yet. Share a project to see it here.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: "clamp(20px, 2.5vw, 40px)" }}
          >
            {projects.map((project) => {
              const slug = project.name.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={project.id}
                  href={`/${user.username}/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-gray-100 hover:border-black transition-colors"
                >
                  <div className="aspect-[4/3] bg-[#fafafa] border-b hairline flex items-center justify-center">
                    <span className="text-[11px] text-gray-200 font-mono uppercase tracking-wider">
                      {project.full_html ? "FULL" : `${project.slides_html.length} slides`}
                    </span>
                  </div>
                  <div style={{ padding: "clamp(16px, 2vw, 24px)" }}>
                    <p className="text-[14px] font-bold text-black truncate">{project.name}</p>
                    <div className="flex items-center justify-between" style={{ marginTop: "12px" }}>
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-green-600">
                        Shared
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
    </div>
  );
}
