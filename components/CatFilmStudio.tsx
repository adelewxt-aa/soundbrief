"use client";
import { useEffect, useRef, useState } from "react";
import Link from "@/components/SiteLink";
import { ArrowLeft, ArrowRight, Check, Download, Film, Music2, Pause, Play, Upload } from "lucide-react";
import { AppearancePicker, CatAvatar, useAppearance } from "@/components/Companion";
import { DirectionLibrary, ModelPlanner, RevisionPlanner, VideoPreferences } from "@/components/CreativeWorkspace";
import { catFilms, catFilmUrl, sampleSteps } from "@/lib/cat-films";
import { initialPlan, type ImportedTrack, type Revision } from "@/lib/creative-plan";
import { downloadBlob, mixGain, renderAdjustedWav, type MixSettings } from "@/lib/audio-mix";
import CatFilmCard from "@/components/CatFilmCard";

const stamp = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
type Cue = { at: string; visual: string; music: string };
const defaultMix = (): MixSettings => ({ opening: 1, peak: 1, ending: 1, peakAt: 8 });

export default function CatFilmStudio() {
  const appearance = useAppearance();
  const [id, setId] = useState<string>(catFilms[0].id);
  const film = catFilms.find(f => f.id === id) || catFilms[0];
  const [sourceTab, setSourceTab] = useState("examples");
  const [file, setFile] = useState<{ name: string; url: string } | null>(null);
  const [category, setCategory] = useState("全部");
  const [step, setStep] = useState(0);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(.8);
  const [mode, setMode] = useState<"original" | "silent" | "custom">("original");
  const [intent, setIntent] = useState<string>(catFilms[0].brief);
  const [plan, setPlan] = useState(initialPlan);
  const [cues, setCues] = useState<Cue[]>([]);
  const [tracks, setTracks] = useState<Record<string, ImportedTrack>>({});
  const [active, setActive] = useState<string | null>(null);
  const custom = active ? tracks[active] : undefined;
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [mix, setMix] = useState(defaultMix);
  const [request, setRequest] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const urls = useRef(new Set<string>());
  const importEpoch = useRef(0);
  const src = file?.url || catFilmUrl(film.id);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const aliases: Record<string, string> = { brand: "oreo", animals: "huajuan", daily: "mianmian", people: "cloud" };
    const wanted = params.get("example") || "";
    const found = catFilms.find(f => f.id === (aliases[wanted] || wanted));
    if (found) { setId(found.id); setIntent(found.brief); }
    if (params.has("upload")) setSourceTab("upload");
    const current = urls.current;
    return () => { importEpoch.current++; current.forEach(URL.revokeObjectURL); };
  }, []);
  useEffect(() => {
    setCues((file ? ["开场", "重要变化", "结尾"] : film.ideas).map(music => ({ at: "", visual: "", music })));
    setTime(0); setDuration(0); setPlaying(false); setMode("original"); setError("");
    setMix(defaultMix()); setActive(null); setRevisions([]); setTracks({}); setFavorites([]); setCompare([]);
    importEpoch.current++;
    audio.current?.pause();
  }, [src]);
  useEffect(() => { if (video.current) video.current.volume = volume; sync(); }, [volume, mix]);
  useEffect(() => {
    if (mode !== "custom") audio.current?.pause(); else startAudio();
  }, [mode, custom?.url]);

  function sync(force = false) {
    const v = video.current, a = audio.current;
    if (!v || !a || !Number.isFinite(v.duration) || !Number.isFinite(a.duration) || v.duration <= 0) return;
    // Keep the existing length-fit behavior explicit in the import UI.
    const rate = a.duration / v.duration;
    a.playbackRate = Math.max(.25, Math.min(4, rate)); a.preservesPitch = false;
    const target = Math.max(0, Math.min(a.duration - .01, v.currentTime * rate));
    if (force || Math.abs(a.currentTime - target) > .2) a.currentTime = target;
    a.volume = Math.min(1, volume * mixGain(v.currentTime, v.duration, mix));
  }
  function startAudio() {
    const v = video.current, a = audio.current;
    if (mode !== "custom" || !custom || !v || !a || v.paused || v.readyState < 2 || a.readyState < 2) return;
    sync(true); void a.play().catch(() => setError("配乐未能播放，请再点一次播放。"));
  }
  async function toggle() {
    const v = video.current; if (!v) return;
    if (!v.paused) { v.pause(); return; }
    if (v.ended) v.currentTime = 0;
    setError(""); try { await v.play(); } catch { setError("视频暂时无法播放，请检查网络后重试。"); }
  }
  function seek(t: number) { if (video.current && duration) { video.current.currentTime = Math.max(0, Math.min(duration, t)); setTime(video.current.currentTime); sync(true); } }
  function choose(nextId: string) {
    video.current?.pause(); audio.current?.pause(); setFile(null); setId(nextId);
    const selected = catFilms.find(f => f.id === nextId)!;
    setIntent(selected.brief); setPlan({ ...initialPlan }); setMessage(`已选「${selected.title}」。点击右侧播放，六步都会沿用这支视频。`);
  }
  function uploadVideo(upload?: File) {
    if (!upload) return;
    if (!/\.(mp4|mov|webm|m4v)$/i.test(upload.name) || upload.size > 250 * 1024 * 1024) { setMessage("请选择 250 MB 以内的 MP4、MOV 或 WebM 视频。"); return; }
    video.current?.pause(); audio.current?.pause();
    const url = URL.createObjectURL(upload); urls.current.add(url); setFile({ name: upload.name, url }); setIntent("");
    setMessage("视频只在当前浏览器里预览，不会上传；请在下一步填写实际画面。");
  }
  function importMusic(direction: string, upload: File) {
    if (!/\.(mp3|wav|m4a|ogg)$/i.test(upload.name) || upload.size > 25 * 1024 * 1024) { setMessage("请选择 25 MB 以内的 MP3、WAV、M4A 或 OGG。"); return; }
    const url = URL.createObjectURL(upload); urls.current.add(url);
    const epoch = importEpoch.current; const probe = new Audio(); probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (epoch !== importEpoch.current) { URL.revokeObjectURL(url); urls.current.delete(url); return; }
      if (!Number.isFinite(probe.duration) || probe.duration < 4 || probe.duration > 60) { URL.revokeObjectURL(url); urls.current.delete(url); setMessage("请选择 4–60 秒的音乐，建议与视频等长。"); return; }
      audio.current?.pause();
      setTracks(prev => ({ ...prev, [direction]: { name: upload.name, url, type: upload.type || "audio/mpeg", provider: "本地导入 · 来源未核验" } }));
      setActive(direction); setMode("custom"); setMix(defaultMix()); setMessage("已导入独立音乐。切换成片原声与导入配乐，播放位置保持不变。");
    };
    probe.onerror = () => { URL.revokeObjectURL(url); urls.current.delete(url); setMessage("音频无法读取，请换成 MP3 或 WAV。"); };
    probe.src = url;
  }
  function selectDirection(direction: string) {
    audio.current?.pause(); setActive(direction); setMode(tracks[direction] ? "custom" : "original");
    if (!tracks[direction]) setMessage("这个方向还没有音频。当前保留成片原声，不会假装已生成新音乐。");
  }
  function adjust() {
    if (!custom) return;
    const changes: Partial<MixSettings> = {};
    if (/开头|开场/.test(request)) changes.opening = /强|响|大声/.test(request) ? 1.25 : .45;
    if (/结尾|收尾/.test(request)) changes.ending = /强|响|大声/.test(request) ? 1.2 : .35;
    const match = request.match(/(\d+(?:\.\d+)?)\s*秒/);
    if (match || /重点|高潮/.test(request)) { changes.peakAt = match ? Math.max(0, Math.min(duration, Number(match[1]))) : mix.peakAt; changes.peak = /轻|弱|小声/.test(request) ? .6 : 1.4; }
    if (!Object.keys(changes).length) { setMessage("这里仅能调整开头、结尾或指定秒数的音量。更换乐器、旋律请记在上方修改计划中。"); return; }
    setMix(previous => ({ ...previous, ...changes })); setMode("custom"); setMessage("已调整导入音乐的音量包络；没有改写旋律或乐器。"); setRequest("");
  }
  async function exportAudio() {
    if (!custom || !duration) return; setExporting(true);
    try { downloadBlob(await renderAdjustedWav(custom.url, duration, mix), `SoundBrief-${film.id}-adjusted.wav`); setMessage("已导出调整后的 WAV。与视频合成 MP4 请使用剪辑工具。"); }
    catch { setMessage("音频导出失败，请尝试 MP3 或 WAV 格式的源文件。"); }
    finally { setExporting(false); }
  }
  function savePlan() {
    downloadBlob(new Blob([JSON.stringify({ version: 3, title: file?.name || film.title, source: file ? "local-upload" : "user-provided-prerendered-film", video: file ? file.name : src, duration, intent, plan, cues, revisions, selectedAudio: mode, selectedDirection: active, mix, favorites, compare, importedTracks: Object.fromEntries(Object.entries(tracks).map(([key, value]) => [key, { name: value.name, provider: value.provider }])), note: "时间点与画面由用户确认；不含本地音视频文件；未调用生成或分析 API。" }, null, 2)], { type: "application/json" }), `SoundBrief-${film.id}-plan.json`);
  }
  function go(next: number) { setStep(next); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return <div className="studio-page sb-app" data-theme={appearance.theme.toLowerCase().replaceAll(" ", "-")}>
    <header className="sb-header"><Link href="/" className="brand">SoundBrief<span className="sb-wordmark-tag">创作工作台</span></Link><div className="sb-header-actions"><span className="sb-demo-tag">预制示例 · AI 待接入</span><AppearancePicker {...appearance}/></div></header>
    <nav className="sb-steps" aria-label="配乐制作步骤">{sampleSteps.map((item, index) => <button key={item.title} className={step === index ? "active" : step > index ? "complete" : ""} aria-current={step === index ? "step" : undefined} onClick={() => go(index)}><span className="sb-step-number">{step > index ? <Check size={15}/> : index + 1}</span><span><strong>{item.title}</strong><small>{item.description}</small></span></button>)}</nav>
    <main className="sb-layout"><section className="sb-workspace">
      <div className="studio-companion"><CatAvatar cat={appearance.cat} pose={step === 5 ? 3 : appearance.outfit}/><div><p>{file ? "带着你自己的故事，我们一起找感觉。" : `这次陪你看「${film.title}」。`}</p><small>六步沿用同一视频 · 原声保留 · 无付费 API 调用</small></div></div>
      <div className="sb-section-heading"><span className="sb-eyebrow">STEP {String(step + 1).padStart(2, "0")} / 06</span><h1>{sampleSteps[step].heading}</h1><p>{sampleSteps[step].help}</p></div>
      {step === 0 && <><div className="sb-source-tabs"><button className={sourceTab === "examples" ? "active" : ""} onClick={() => setSourceTab("examples")}><Film size={16}/>六只猫的故事</button><button className={sourceTab === "upload" ? "active" : ""} onClick={() => setSourceTab("upload")}><Upload size={16}/>上传我的视频</button></div>
        {sourceTab === "examples" ? <><div className="sb-category-tabs">{["全部", ...catFilms.map(f => f.category)].map(label => <button key={label} aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}</div><div className="sb-example-grid">{catFilms.filter(f => category === "全部" || f.category === category).map(f => <button key={f.id} className={`sb-example-card ${!file && id === f.id ? "selected" : ""}`} aria-pressed={!file && id === f.id} onClick={() => choose(f.id)}><div className="sb-example-image"><CatFilmCard id={f.id} title={f.title}/><span className="sb-category-label">{f.category}</span></div><div className="sb-example-copy"><h2>{f.title}</h2><p>{f.subtitle}</p><span>预制成片 · 自带原声</span></div></button>)}</div><p className="sb-note">这六支短片由项目创作者在外部平台制作并提供，不是 SoundBrief 在线生成。每支目前只有一个成片版本。</p></> : <><label className="sb-upload" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); uploadVideo(e.dataTransfer.files[0]); }}><Upload size={26}/><strong>{file?.name || "把视频拖到这里，或点击选择"}</strong><input type="file" accept="video/mp4,video/webm,video/quicktime,.m4v" aria-label="上传视频" onChange={e => { uploadVideo(e.target.files?.[0]); e.target.value = ""; }}/><small>4–60 秒 · 最大 250 MB · 仅本地预览</small></label>{file && <button onClick={() => choose(film.id)}>返回猫咪示例</button>}</>}
        <VideoPreferences plan={plan} onChange={setPlan}/></>}
      {step === 1 && <><div className="sb-explainer"><span>这个案例要练习什么？</span><p>{file ? "先看画面，再写下想突出的位置。" : film.focus}</p></div><p className="creative-caption">下面只预填音乐创作建议，实际画面与秒数请边看边确认。没有生成匹配分数，也没有自动识别镜头。</p><div className="cat-cue-list">{cues.map((cue, index) => <article key={index}><h2>{["开场", "重要变化", "收尾"][index]} <small>待你确认</small></h2><div className="cat-cue-time"><label>时间（秒）<input type="number" min={0} max={duration || 60} step=".1" value={cue.at} placeholder="待填写" onChange={e => setCues(old => old.map((c, i) => i === index ? { ...c, at: e.target.value } : c))}/></label><button onClick={() => setCues(old => old.map((c, i) => i === index ? { ...c, at: time.toFixed(1) } : c))}>记下当前时间</button><button disabled={cue.at === "" || !duration} onClick={() => seek(Number(cue.at))}>跳到这里</button></div><label>实际画面<input value={cue.visual} placeholder="看完后写下这里发生了什么" onChange={e => setCues(old => old.map((c, i) => i === index ? { ...c, visual: e.target.value } : c))}/></label><label>希望音乐怎么配<textarea rows={2} value={cue.music} onChange={e => setCues(old => old.map((c, i) => i === index ? { ...c, music: e.target.value } : c))}/></label></article>)}</div></>}
      {step === 2 && <><label className="sb-field-label">整体配乐要求<textarea rows={3} value={intent} onChange={e => setIntent(e.target.value)}/></label><ModelPlanner plan={plan} onChange={setPlan} duration={duration} context={`${file ? "" : film.category} ${intent}`}/></>}
      {step === 3 && <><div className="sb-explainer"><span>目前能听到什么？</span><p>成片原声就是视频自带的完整声音，可能同时包含音乐与音效，没有分离音轨。下面四个是待制作方向，不是四个已生成结果。</p><button className="sb-primary" onClick={() => { setMode("original"); if (video.current?.paused) void toggle(); }}>试听成片原声</button></div><DirectionLibrary plan={plan} tracks={tracks} active={active} onSelect={selectDirection} onImport={importMusic} intent={`${intent}\n已确认的配乐计划：${cues.filter(c => c.at !== "" || c.visual).map(c => `${c.at || "待定"}秒：${c.visual}；${c.music}`).join("\n")}`} favorites={favorites} setFavorites={setFavorites} compare={compare} setCompare={setCompare}/></>}
      {step === 4 && <><RevisionPlanner key={src} duration={duration || 15} revisions={revisions} onSave={r => setRevisions(old => [...old, r])} onSeek={seek}/><h2 className="actual-mix-title">调整独立音乐的音量</h2>{!custom && <p className="sb-note">成片音乐与音效尚未分离。先在第 4 步导入一条独立音乐，才能只调配乐，不影响环境声。右侧可调整成片整体试听音量。</p>}<fieldset className="actual-mix-controls" disabled={!custom}><p>{custom?.name || "尚未导入独立配乐"}</p><form className="sb-adjust-form" onSubmit={e => { e.preventDefault(); adjust(); }}><label>用一句话调整音量<div><input value={request} onChange={e => setRequest(e.target.value)} placeholder="例如：开头轻一点，8 秒更明显"/><button type="submit">应用</button></div></label></form>{(["opening", "peak", "ending"] as const).map((key, index) => <label className="sb-mix-control" key={key}><strong>{["开头", `重点 · ${mix.peakAt} 秒`, "结尾"][index]}</strong><input aria-label={`${key}音量`} type="range" min={.2} max={1.4} step={.05} value={mix[key]} onChange={e => { setMix(old => ({ ...old, [key]: Number(e.target.value) })); setMode("custom"); }}/><output>{Math.round(mix[key] * 100)}%</output></label>)}<button onClick={() => setMix(defaultMix())}>恢复原始强弱</button><p>只改变音量，不改变旋律与乐器。导出 WAV 可保存调整。</p></fieldset></>}
      {step === 5 && <><div className="sb-export-summary"><Check/><div><h2>{file?.name || film.title}</h2><p>{duration ? stamp(duration) : "正在读取时长"} · {mode === "custom" ? custom?.name : mode === "silent" ? "静音试听" : "成片原声"}</p></div></div><div className="sb-export-grid"><a href={src} download={file?.name || `SoundBrief-${film.name}.mp4`}><Film/><strong>下载示例成片</strong><span>网页播放版 · 自带声音 · 不含调整</span><Download size={17}/></a>{custom && <><a href={custom.url} download={custom.name}><Music2/><strong>导入的原始音乐</strong><span>未包含音量调整</span></a><button onClick={exportAudio} disabled={exporting || !duration}><Music2/><strong>{exporting ? "正在导出…" : "调整后的音乐 WAV"}</strong><span>包含音量与长度适配</span></button></>}<button onClick={savePlan}><Download/><strong>保存创作计划</strong><span>JSON · 视频、方向、时间点与修改要求</span></button></div><p className="sb-note">下载示例成片不会包含静音或音量设置。替换音乐后的新 MP4 尚不能在这里合成；可将 WAV 与视频带到剪辑工具中完成。计划文件不包含本地媒体，请保留原文件。</p></>}
      <p className="sb-status" role="status">{message}</p><footer className="sb-step-footer"><button disabled={step === 0} onClick={() => go(step - 1)}><ArrowLeft size={15}/>上一步</button><span>{step + 1} / 6</span>{step < 5 ? <button className="sb-primary" onClick={() => go(step + 1)}>{["记下配乐重点", "选择模型与方向", "去试听比较", "再调一点细节", "保存这一版"][step]}<ArrowRight size={15}/></button> : <Link href="/">回到首页</Link>}</footer>
    </section><aside className="sb-preview"><div className="sb-preview-heading"><strong>{file?.name || film.title}</strong><small>{file ? "本地视频" : "预制示例"}</small></div><div className="sb-video-wrap"><video key={src} ref={video} src={src} poster={file ? undefined : `/media/cat-films/${film.id}.jpg`} playsInline preload="metadata" muted={mode !== "original"} onLoadedMetadata={e => { const d = e.currentTarget.duration; if (!Number.isFinite(d) || d <= 0 || (file && (d < 4 || d > 60))) { setError("请选择 4–60 秒的有效视频。"); if (file) setFile(null); return; } setDuration(d); setMix(old => ({ ...old, peakAt: Math.min(old.peakAt, d - .1) })); e.currentTarget.volume = volume; }} onTimeUpdate={e => { setTime(e.currentTarget.currentTime); sync(); }} onSeeking={() => sync(true)} onPlay={() => setPlaying(true)} onPlaying={startAudio} onPause={() => { setPlaying(false); audio.current?.pause(); }} onWaiting={() => audio.current?.pause()} onEnded={() => { setPlaying(false); audio.current?.pause(); }} onError={() => setError("视频无法加载，请重试。建议使用 H.264 编码 MP4。")} onClick={toggle}/>{!playing && <button className="sb-big-play" onClick={toggle} aria-label="播放视频"><Play size={26}/></button>}<span className="sb-video-badge">{file ? "本地预览" : "预制成片 · 保留原声"}</span></div>
      <audio ref={audio} src={custom?.url} preload="metadata" onLoadedMetadata={() => { sync(true); startAudio(); }} onCanPlay={startAudio} onError={() => { if (custom) setError("导入音乐无法播放，请换成 MP3 或 WAV。"); }}/><div className="sb-transport"><button onClick={toggle} aria-label={playing ? "暂停" : "播放"}>{playing ? <Pause size={17}/> : <Play size={17}/>}</button><span>{stamp(time)}</span><input aria-label="视频进度" type="range" min={0} max={duration || 1} step={.05} value={Math.min(time, duration)} disabled={!duration} onChange={e => seek(Number(e.target.value))}/><span>{stamp(duration)}</span></div><div className="sb-ab-switch" aria-label="试听声音"><button className={mode === "original" ? "active" : ""} aria-pressed={mode === "original"} onClick={() => setMode("original")}>成片原声</button><button className={mode === "silent" ? "active" : ""} aria-pressed={mode === "silent"} onClick={() => setMode("silent")}>只看画面</button><button disabled={!custom} className={mode === "custom" ? "active" : ""} aria-pressed={mode === "custom"} onClick={() => setMode("custom")}>导入配乐</button></div><label className="sb-volume">试听音量<input aria-label="试听音量" type="range" min={0} max={1} step={.05} value={volume} onChange={e => setVolume(Number(e.target.value))}/></label>{error && <p className="sb-media-error" role="alert">{error}</p>}<div className="sb-now-note"><small>{mode === "custom" ? "正在试听导入音乐" : mode === "silent" ? "已静音" : "正在使用视频自带声音"}</small><p>{mode === "custom" ? custom?.name : file ? "当前视频仅在本地预览。" : film.focus}</p></div><p className="sb-preview-footnote">切换步骤不会替换视频。新增配乐需要导入或后续接入音乐模型。</p></aside></main>
    <div className="sb-bottom-note"><span>SoundBrief · 陪你的故事，找到声音。</span><a href="/media/cat-films/CREDITS.md">示例来源与能力说明</a></div>
  </div>;
}
