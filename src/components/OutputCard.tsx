"use client";

import { useState } from "react";

export default function OutputCard({
  title,
  text,
  status,
}: {
  title: string;
  text: string;
  status: "idle" | "streaming" | "done";
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-5 min-h-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wide text-white/80 uppercase">
          {title}
        </h2>
        <button
          onClick={handleCopy}
          disabled={!text}
          className="text-xs px-2.5 py-1 rounded-md border border-white/15 text-white/70 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-white/90">
        {text || (
          <span className="text-white/30">
            {status === "streaming" ? "Generating…" : "Waiting…"}
          </span>
        )}
        {status === "streaming" && (
          <span className="inline-block w-2 h-4 ml-0.5 bg-white/60 align-middle animate-pulse" />
        )}
      </div>
    </div>
  );
}
