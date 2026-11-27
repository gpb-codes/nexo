import Link from "next/link";
import { notFound } from "next/navigation";
import contentIndex from "../../public/content-index.json";
import NoteAnim from "../note-anim";

type Entry = {
  slug: string;
  filePath: string;
  title: string;
  links: string[];
  tags: string[];
  content: string;
};

const index = contentIndex as unknown as Record<string, Entry>;

export function generateStaticParams() {
  return Object.keys(index).map((slug) => ({ slug: slug.split("/") }));
}

export function generateMetadata({ params }: { params: { slug: string[] } }) {
  const entry = index[params.slug.join("/")];
  return { title: entry ? `${entry.title} · Quartz Next` : "Nota no encontrada" };
}

export default function NotePage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join("/");
  const entry = index[slug];
  if (!entry) notFound();

  const lines = entry.content.split("\n").map((line) => line.trim()).filter(Boolean);
  const related = entry.links.filter((link) => index[link]);

  return (
    <NoteAnim>
      <article className="note-page">
        <Link href="/" className="note-back" data-animate>← Volver al inicio</Link>
        <header className="note-header">
          <span className="note-kicker" data-animate>{slug.split("/")[0]}</span>
          <h1 className="note-title" data-animate>{entry.title}</h1>
          <p className="note-file" data-animate>{entry.filePath}</p>
          {entry.tags.length > 0 && (
            <div className="note-tags" data-animate>
              {entry.tags.map((tag) => <span className="note-tag" key={tag}>#{tag}</span>)}
            </div>
          )}
        </header>

        <section className="note-body">
          {lines.map((line, i) => <p key={i} data-animate>{line}</p>)}
        </section>

        {related.length > 0 && (
          <section className="note-related" data-animate>
            <h2>Notas relacionadas</h2>
            <ul>
              {related.map((link) => (
                <li key={link}>
                  <Link href={`/${link}`}>{index[link].title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="note-footer" data-animate>
          <Link href="/grafo">Ver en el grafo 3D</Link>
        </footer>
      </article>
    </NoteAnim>
  );
}
