"use client";

import { useRef, useState } from "react";
import OutputCard from "@/components/OutputCard";

type Section = "roast" | "improvements" | "outreach";
type SectionStatus = "idle" | "streaming" | "done";

const SECTION_ORDER: Section[] = ["roast", "improvements", "outreach"];
const SECTION_TITLES: Record<Section, string> = {
  roast: "Resume Roast",
  improvements: "Tailored Improvements",
  outreach: "Cold Outreach Message",
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [texts, setTexts] = useState<Record<Section, string>>({
    roast: "",
    improvements: "",
    outreach: "",
  });
  const [statuses, setStatuses] = useState<Record<Section, SectionStatus>>({
    roast: "idle",
    improvements: "idle",
    outreach: "idle",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = !!file && jobDescription.trim().length > 0 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !jobDescription.trim()) return;

    setLoading(true);
    setError(null);
    setTexts({ roast: "", improvements: "", outreach: "" });
    setStatuses({ roast: "idle", improvements: "idle", outreach: "idle" });

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Try again.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const msg = JSON.parse(line);

          if (msg.type === "error") {
            setError(msg.error);
            continue;
          }
          const section = msg.section as Section;
          if (msg.type === "start") {
            setStatuses((s) => ({ ...s, [section]: "streaming" }));
          } else if (msg.type === "delta") {
            setTexts((t) => ({ ...t, [section]: t[section] + msg.text }));
          } else if (msg.type === "done") {
            setStatuses((s) => ({ ...s, [section]: "done" }));
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">ApplyIQ</h1>
        <p className="text-white/50 mt-2">
          Upload your resume + paste a job description → get roasted,
          improved, and ready to send.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-2 mb-10 rounded-xl border border-white/10 bg-white/[0.03] p-6"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">
            Resume (PDF)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-white/70 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-white/10 file:text-white file:text-sm hover:file:bg-white/20 file:cursor-pointer cursor-pointer"
          />
          {file && (
            <span className="text-xs text-white/40 truncate">
              {file.name}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:row-span-2">
          <label className="text-sm font-medium text-white/70">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here…"
            className="flex-1 min-h-[120px] resize-none rounded-md border border-white/10 bg-black/30 p-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-md bg-white text-black font-medium py-2.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition"
          >
            {loading ? "Generating…" : "Roast me"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-4">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {SECTION_ORDER.map((section) => (
          <OutputCard
            key={section}
            title={SECTION_TITLES[section]}
            text={texts[section]}
            status={statuses[section]}
          />
        ))}
      </div>
    </div>
  );
}
