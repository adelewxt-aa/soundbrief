"use client";
import { catFilmUrl } from "@/lib/cat-films";

// Native metadata and the first decoded frame come from the real supplied clip.
export default function CatFilmCard({ id, title }: { id: string; title: string }) {
  return <video className="cat-film-thumbnail" src={`${catFilmUrl(id)}#t=0.1`} aria-label={`${title}预览画面`} muted playsInline preload="metadata" />;
}
