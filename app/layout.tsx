import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ weight: ["600", "800"], variable: "--font-archivo", subsets: ["latin"] });
const inter = Inter({ weight: ["400", "500", "600"], variable: "--font-inter", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ weight: ["400", "500"], variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "swe/interview — voice mock interviews for software engineers",
  description: "Rehearse the interview out loud. A voice interviewer reads your resume, asks questions at your level, and scores you on a clear rubric.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-paper text-ink">{children}</body>
    </html>
  );
}
