import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Generator - Create Next.js Projects Instantly",
  description: "Generate Next.js projects with custom packages and configurations. Download as ZIP or use CLI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}