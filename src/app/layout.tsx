import type { Metadata } from "next";

// Self-hosted fonts (fontsource) — weights used across the design
import "@fontsource/fraunces/300.css";
import "@fontsource/fraunces/400.css";
import "@fontsource/fraunces/400-italic.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "SARA — Visual Archive",
  description:
    "Where systems thinking meets visual storytelling. A photography archive by Sara.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-ink text-bone overflow-x-hidden">{children}</body>
    </html>
  );
}
