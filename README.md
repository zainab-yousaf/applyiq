# ApplyIQ

Upload your resume + paste a job description → get **roasted**, **improved**, and handed a **ready-to-send cold outreach message**, all in one pass.

## What it does

1. You upload a resume (PDF) and paste a job description.
2. The app extracts the resume text and runs it through a 3-step prompt chain against that specific job description:
   - **Roast:** harsh, specific, actionable feedback on what's weak or missing
   - **Tailored Improvements:** bullet-point fixes mapped directly to the job's requirements
   - **Cold Outreach Message:** a short, personalized message ready to send to a recruiter or hiring manager
3. All three outputs stream into the UI live, each with its own copy button.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| PDF parsing | `pdf-parse` |
| LLM access | OpenRouter (OpenAI-compatible API) → `anthropic/claude-sonnet-4.5` |
| Streaming | NDJSON over a raw `ReadableStream` from `/api/generate` |

## Architecture

```
Input (upload PDF + JD textarea)
        │
        ▼
Parsing (/api/generate → pdf-parse extracts resume text)
        │
        ▼
Prompt chain (3 sequential streaming calls)
    1. Roast
    2. Tailored Improvements
    3. Cold Outreach Message
        │
        ▼
UI (three cards, streamed in live, copy-to-clipboard per card)
```

## Project structure

```
src/
  app/
    page.tsx              # main UI: upload, JD textarea, 3 output cards
    layout.tsx
    globals.css
    api/generate/route.ts # parses resume, runs the 3-call prompt chain, streams NDJSON
  components/
    OutputCard.tsx         # single result card with copy button + streaming state
  lib/
    ai.ts                  # OpenRouter client + model config
    prompts.ts              # the 3 prompt builders (roast / improvements / outreach)
  types/
    pdf-parse.d.ts          # type declaration for pdf-parse (no official types)
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set your API key

Copy the example env file and fill in your key:

```bash
cp .env.local.example .env.local
```

```
OPENROUTER_API_KEY=sk-or-v1-...
```

Get a key at [openrouter.ai/keys](https://openrouter.ai/keys). `.env` and `.env.local` are gitignored — your key never leaves your machine.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

## Notes

- Resume upload currently accepts text-based PDFs (and plain `.txt`) scanned/image-only PDFs won't extract text.
- The model is set in `src/lib/ai.ts` (`MODEL` constant) swap it there to try a different model on OpenRouter.
- No database, no auth, no persistence every request is stateless by design for this MVP.
