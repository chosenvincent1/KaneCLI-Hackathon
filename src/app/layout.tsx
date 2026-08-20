import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KaneGuard",
  description: "Verify AI-generated changes before they ship.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#080b10] text-white">{children}</body>
    </html>
  );
}
