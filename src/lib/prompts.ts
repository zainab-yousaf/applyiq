export type Section = "roast" | "improvements" | "outreach";

export const SECTION_LABELS: Record<Section, string> = {
  roast: "Resume Roast",
  improvements: "Tailored Improvements",
  outreach: "Cold Outreach Message",
};

export function roastPrompt(resumeText: string, jobDescription: string) {
  return `You are a brutally honest, sharp-tongued hiring manager who has read 10,000 resumes and is tired of vague fluff. Roast the resume below AGAINST this specific job description. Be harsh but specific and actionable — every jab should point at an exact line, section, or omission. No generic "add more keywords" filler. Use short punchy paragraphs or a bulleted list. End with a one-line brutal verdict.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}`;
}

export function improvementsPrompt(resumeText: string, jobDescription: string) {
  return `You are an expert resume coach. Compare the resume below to the job description and produce a bullet-point list of TAILORED improvements — each bullet must map to a specific requirement or keyword in the job description, and each bullet must be concrete enough that the candidate could paste it directly into their resume (rewrite weak bullets into strong ones showing before → after where useful). Group into sections if helpful: "Missing keywords/skills", "Bullet rewrites", "Structure/formatting", "What to cut". Do not restate the roast — focus purely on fixes.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}`;
}

export function outreachPrompt(
  resumeText: string,
  jobDescription: string,
) {
  return `You are a job seeker writing a short, personalized cold outreach message (for LinkedIn or email) to a hiring manager or recruiter about the role described below. Use specifics from the resume (real skills/experience, not generic claims) and specifics from the job description (role title, company if named, what the team likely needs). Keep it under 120 words, confident but not cocky, no clichés like "I am writing to express my interest." End with a clear, low-friction call to action. Output ONLY the message text, ready to send — no preamble, no explanation.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}`;
}
