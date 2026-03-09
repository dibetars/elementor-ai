import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElementBuddy — Build WordPress sites from a prompt",
  description:
    "Generate complete Elementor site structures from a text prompt, URL, or wireframe. Powered by AI.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="noise">{children}</body>
    </html>
  );
}
