import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quartz · Segundo Cerebro",
  description: "Mapa de conocimiento publicado con Next.js, Three.js y anime.js",
  openGraph: {
    title: "Quartz · Segundo Cerebro",
    description: "Mapa de conocimiento publicado con Next.js, Three.js y anime.js",
    url: "https://segundo-cerebro-e4v.pages.dev",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
