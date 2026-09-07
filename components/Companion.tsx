"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Palette, X } from "lucide-react";
export const themes = ["Soft Editorial", "Cat Studio", "Liquid Chrome", "Neon Club", "Paper Collage", "Pixel Pop"];
const names = ["温柔日常", "布偶猫的音乐房", "液态金属", "霓虹俱乐部", "纸间拼贴", "像素派对"];
const colors = ["#c25d37", "#7961b9", "#747b8c", "#adff63", "#d6623d", "#7555e8"];
export function useAppearance() {
  const [theme, setTheme] = useState("Cat Studio");
  const [outfit, setOutfit] = useState(0);
  useEffect(() => { try { const saved = localStorage.getItem("soundbrief-theme"); if (saved && themes.includes(saved)) setTheme(saved); const accessory = Number(localStorage.getItem("soundbrief-outfit")); if ([0, 1, 2, 3].includes(accessory)) setOutfit(accessory); } catch {} }, []);
  function changeTheme(value: string) { setTheme(value); try { localStorage.setItem("soundbrief-theme", value); } catch {} }
  function changeOutfit(value: number) { setOutfit(value); try { localStorage.setItem("soundbrief-outfit", String(value)); } catch {} }
  return { theme, outfit, changeTheme, changeOutfit };
}
const crops = [[0,0,620,640],[700,0,554,625],[0,700,700,554],[705,625,549,629]];
export function Ragdoll({ pose = 0, className = "", label = "蓝眼睛布偶猫配乐搭档" }: { pose?: number; className?: string; label?: string }) {
  const [x,y,w,h]=crops[pose] || crops[0];
  return <span className={`ragdoll ${className}`} role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={!label} style={{aspectRatio:`${w}/${h}`}}><img src="/media/companion/ragdoll-sheet.png" alt="" style={{ width:`${1254/w*100}%`,height:`${1254/h*100}%`,left:`${-x/w*100}%`,top:`${-y/h*100}%` }}/></span>;
}
export function AppearancePicker({ theme, outfit, changeTheme, changeOutfit }: ReturnType<typeof useAppearance>) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <><button className="appearance-trigger" onClick={() => dialog.current?.showModal()}><Palette size={17}/><span>切换外观</span>{theme === "Cat Studio" && <Ragdoll pose={outfit} label=""/>}</button><dialog className="appearance-dialog" ref={dialog} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}><div className="appearance-heading"><div><small>MAKE YOURSELF AT HOME</small><h2>今天，想在哪种心情里创作？</h2></div><button aria-label="关闭外观选择" onClick={() => dialog.current?.close()}><X/></button></div><div className="appearance-grid">{themes.map((name, i) => <button key={name} aria-pressed={theme === name} className={theme === name ? "selected" : ""} onClick={() => changeTheme(name)}><span className="appearance-swatch" style={{ background: colors[i] }}>{i === 1 ? <Ragdoll pose={outfit} label=""/> : <Palette size={24}/>}</span><strong>{names[i]}</strong><small>{name}</small>{theme === name && <Check className="appearance-check" size={18}/>}</button>)}</div>{theme === "Cat Studio" && <fieldset className="outfit-picker"><legend>给你的布偶猫挑个小装扮</legend>{["耳机搭档", "星星灵感", "休息一下", "蝴蝶结"].map((name, i) => <button key={name} aria-pressed={outfit === i} className={outfit === i ? "selected" : ""} onClick={() => changeOutfit(i)}><Ragdoll pose={i}/><span>{name}</span></button>)}</fieldset>}<button className="new-primary" onClick={() => dialog.current?.close()}>就用这个，开工啦 <Check size={17}/></button></dialog></>;
}
