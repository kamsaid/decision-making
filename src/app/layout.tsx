import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Initialize Inter font
const inter = Inter({ subsets: ["latin"] });

// Define metadata for the application
export const metadata: Metadata = {
  title: "Decision Making Assistant",
  description: "AI-powered personal decision making assistant to help you make better choices",
};

// Root layout component that wraps all pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-bg-base dark:bg-bg-base-dark`}>
        {children}
      </body>
    </html>
  );
}
