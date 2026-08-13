import { NextRequest } from "next/server";
import { getAnthropicClient, MODEL } from "@/lib/anthropic";
import {
  roastPrompt,
  improvementsPrompt,
  outreachPrompt,
  Section,
} from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

async function extractResumeText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    // dynamic import avoids pdf-parse's debug-mode file read at module load time
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return result.text;
  }

  // fall back: treat as plain text (.txt resumes)
  return buffer.toString("utf-8");
}

function encodeLine(obj: unknown) {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid form data" }), {
      status: 400,
    });
  }

  const resumeFile = formData.get("resume");
  const jobDescription = formData.get("jobDescription");

  if (!(resumeFile instanceof File) || resumeFile.size === 0) {
    return new Response(JSON.stringify({ error: "Resume file is required" }), {
      status: 400,
    });
  }
  if (typeof jobDescription !== "string" || !jobDescription.trim()) {
    return new Response(
      JSON.stringify({ error: "Job description is required" }),
      { status: 400 },
    );
  }

  let resumeText: string;
  try {
    resumeText = await extractResumeText(resumeFile);
    if (!resumeText.trim()) {
      throw new Error("empty");
    }
  } catch {
    return new Response(
      JSON.stringify({
        error:
          "Couldn't read that resume. Make sure it's a text-based PDF (not a scanned image) or a .txt file.",
      }),
      { status: 400 },
    );
  }

  const anthropic = getAnthropicClient();

  const stream = new ReadableStream({
    async start(controller) {
      const sections: { name: Section; prompt: string }[] = [
        { name: "roast", prompt: roastPrompt(resumeText, jobDescription) },
        {
          name: "improvements",
          prompt: improvementsPrompt(resumeText, jobDescription),
        },
        {
          name: "outreach",
          prompt: outreachPrompt(resumeText, jobDescription),
        },
      ];

      try {
        for (const { name, prompt } of sections) {
          controller.enqueue(encodeLine({ type: "start", section: name }));

          const messageStream = anthropic.messages.stream({
            model: MODEL,
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }],
          });

          messageStream.on("text", (delta) => {
            controller.enqueue(
              encodeLine({ type: "delta", section: name, text: delta }),
            );
          });

          await messageStream.finalMessage();

          controller.enqueue(encodeLine({ type: "done", section: name }));
        }
      } catch (err) {
        controller.enqueue(
          encodeLine({
            type: "error",
            error: err instanceof Error ? err.message : "Generation failed",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
