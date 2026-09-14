"use client";

// A frame extracted from the supplied clip avoids downloading six videos on the homepage.
export default function CatFilmCard({ id, title }: { id: string; title: string }) {
  return <img className="cat-film-thumbnail" src={`/media/cat-films/${id}.jpg`} alt={`${title}真实视频画面`} loading="lazy" width={1280} height={720} />;
}
