import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROOM 404 — The hotel remembers",
  description: "An interactive AI horror experience for Ghost in the Machine.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
