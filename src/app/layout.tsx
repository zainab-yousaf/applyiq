import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApplyIQ — Resume Roaster & Cold Email",
  description:
    "Upload your resume, paste a job description, get a roast, tailored improvements, and a cold outreach message.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
