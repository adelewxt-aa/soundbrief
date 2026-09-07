"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Palette, X } from "lucide-react";
import { cats, catForTheme, defaultCat, validPose, type CatCompanion } from "@/lib/cat-companions";

const storageKey = "soundbrief-cat-rooms-v1";
type Appearance = { theme: string; poses: Record<string, number> };
export function useAppearance() {
  const [choice, setChoice] = useState<Appearance>({ theme: defaultCat.theme, poses: {} });
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        const theme = catForTheme(saved?.theme).theme;
        const poses = Object.fromEntries(cats.map(cat => [cat.id, validPose(saved?.poses?.[cat.id]) ? saved.poses[cat.id] : 0]));
        setChoice({ theme, poses });
      } else {
        const theme = catForTheme(localStorage.getItem("soundbrief-theme") || "").theme;
        const previous = Number(localStorage.getItem("soundbrief-outfit"));
        setChoice({ theme, poses: { [catForTheme(theme).id]: validPose(previous) ? previous : 0 } });
      }
    } catch { /* Preferences are optional when storage is unavailable. */ }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) { try { localStorage.setItem(storageKey, JSON.stringify(choice)); } catch {} } }, [choice, hydrated]);
  const cat = catForTheme(choice.theme);
  const outfit = choice.poses[cat.id] || 0;
  function changeTheme(theme: string) { setChoice(previous => ({ ...previous, theme: catForTheme(theme).theme })); }
  function changeOutfit(pose: number) { if (validPose(pose)) setChoice(previous => ({ ...previous, poses: { ...previous.poses, [catForTheme(previous.theme).id]: pose } })); }
  return { theme: choice.theme, cat, outfit, poses: choice.poses, changeTheme, changeOutfit };
}

export function CatAvatar({ cat = defaultCat, pose = 0, className = "", label }: { cat?: CatCompanion; pose?: number; className?: string; label?: string }) {
  const selected = validPose(pose) ? pose : 0;
  const [x, y, width, height] = cat.crops?.[selected] || [(selected % 2) / 2, Math.floor(selected / 2) / 2, .5, .5];
  const description = label ?? `${cat.name}，${cat.breed}，${cat.poses[selected]}`;
  return <span className={`ragdoll ${!["ragdoll", "siamese"].includes(cat.id) ? "cat-blended-art" : ""} ${className}`} role={description ? "img" : undefined} aria-label={description || undefined} aria-hidden={!description} style={{ aspectRatio: `${width}/${height}`, "--cat-ratio": width / height } as React.CSSProperties}><img src={`/media/companion/${cat.image}`} alt="" style={{ width: `${100 / width}%`, height: `${100 / height}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }}/></span>;
}

export function AppearancePicker({ theme, cat, outfit, poses, changeTheme, changeOutfit }: ReturnType<typeof useAppearance>) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button className="appearance-trigger" onClick={() => dialog.current?.showModal()}><Palette size={17}/><span>切换外观</span><CatAvatar cat={cat} pose={outfit} label=""/></button>
    <dialog className="appearance-dialog cat-room-dialog" aria-labelledby="cat-room-heading" ref={dialog} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="appearance-heading"><div><small>SIX CATS, SIX LITTLE WORLDS</small><h2 id="cat-room-heading">今天，想去谁的音乐房？</h2></div><button aria-label="关闭外观选择" onClick={() => dialog.current?.close()}><X/></button></div>
      <div className="appearance-grid cat-room-grid">{cats.map(room => <button key={room.id} aria-pressed={theme === room.theme} aria-label={`${room.name}，${room.room}，${room.colorName}`} className={theme === room.theme ? "selected" : ""} onClick={() => changeTheme(room.theme)} style={{ "--room-color": room.color, "--room-soft": room.soft } as React.CSSProperties}>
        <span className="appearance-swatch"><CatAvatar cat={room} pose={poses[room.id] || 0} label=""/></span><strong>{room.name}<span>{room.colorName}</span></strong><small>{room.room}</small>{theme === room.theme && <Check className="appearance-check" size={18}/>}
      </button>)}</div>
      <div className="cat-personality"><CatAvatar cat={cat} pose={outfit} label=""/><div><strong>{cat.name} · {cat.breed}</strong><p>{cat.personality}</p></div></div>
      <fieldset className="outfit-picker cat-pose-picker"><legend>选一个{cat.name}专属的小模样</legend>{cat.poses.map((name, index) => <button key={`${cat.id}-${index}`} aria-pressed={outfit === index} aria-label={`${cat.name}：${name}`} className={outfit === index ? "selected" : ""} onClick={() => changeOutfit(index)}><CatAvatar cat={cat} pose={index}/><span>{name}</span>{outfit === index && <Check size={14}/>}</button>)}</fieldset>
      <p className="cat-room-note">每位搭档都会记住你上次选的模样。</p>
      <button className="new-primary" onClick={() => dialog.current?.close()}>就和{cat.name}一起创作 <Check size={17}/></button>
    </dialog>
  </>;
}
