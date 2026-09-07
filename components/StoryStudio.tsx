"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "@/components/SiteLink";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Download, FileJson, Film, Headphones, Info, Music2, Palette, Pause, Play, RotateCcw, SlidersHorizontal, Sparkles, Upload, Volume2, X } from "lucide-react";
import { examples, mediaPath, workflow, type TrackVersion } from "@/lib/examples";
import { downloadBlob, mixGain, renderAdjustedWav, type MixSettings } from "@/lib/audio-mix";
import { AppearancePicker, Ragdoll, useAppearance } from "@/components/Companion";
import { DirectionLibrary, ModelPlanner, RevisionPlanner, VideoPreferences } from "@/components/CreativeWorkspace";
import { directions, initialPlan, type ImportedTrack, type Revision } from "@/lib/creative-plan";

const stamp = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
const defaults = (peakAt: number): MixSettings => ({ opening: 1, peak: 1, ending: 1, peakAt });

export default function StoryStudio() {
  const [exampleId, setExampleId] = useState("brand");
  const example = examples.find(item => item.id === exampleId) || examples[0];
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("全部");
  const [sourceTab, setSourceTab] = useState("upload");
  const [file, setFile] = useState<{ name: string; url: string } | null>(null);
  const [duration, setDuration] = useState(30);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [trackId, setTrackId] = useState<TrackVersion | "original">("a");
  const appearance = useAppearance();
  const { theme } = appearance;
  const [plan, setPlan] = useState(initialPlan);
  const [importedTracks, setImportedTracks] = useState<Record<string, ImportedTrack>>({});
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const importedUrls = useRef(new Set<string>());
  const [intent, setIntent] = useState(example.brief);
  const [sceneEdits, setSceneEdits] = useState<Record<string, string>>({});
  const [mix, setMix] = useState<MixSettings>(defaults(example.mainPeak));
  const [request, setRequest] = useState("");
  const [message, setMessage] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [volume, setVolume] = useState(.9);
  const [audioUrl, setAudioUrl] = useState<string>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playAfterLoad = useRef(false);
  const playAfterTrack = useRef(false);
  const musicVersion: TrackVersion = trackId === "original" ? "a" : trackId;
  const track = example.tracks.find(item => item.id === musicVersion)!;
  const customTrack = activeDirection ? importedTracks[activeDirection] : undefined;
  const audioPath = customTrack?.url || mediaPath(example.id, `${musicVersion}.mp3`);
  const audioName = customTrack?.name || track.name;
  const videoUrl = file?.url || mediaPath(example.id, "video.webm");
  const scenes = useMemo(() => example.scenes.map(scene => ({ ...scene, start: scene.start / 30 * duration, end: scene.end / 30 * duration })), [example, duration]);
  const sceneIndex = scenes.findIndex(scene => time >= scene.start && time < scene.end);
  const activeScene = sceneIndex < 0 ? scenes.length - 1 : sceneIndex;
  const changed = mix.opening !== 1 || mix.peak !== 1 || mix.ending !== 1;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const found = examples.find(item => item.id === params.get("example"));
    if (found) { setSourceTab("examples"); setExampleId(found.id); setIntent(found.brief); setMix(defaults(found.mainPeak)); }
    if (params.has("demo")) setSourceTab("examples");
    if (params.has("upload")) setSourceTab("upload");
  }, []);
  useEffect(() => { const urls = importedUrls.current; return () => { urls.forEach(url => URL.revokeObjectURL(url)); }; }, []);
  useEffect(() => () => { if (file) URL.revokeObjectURL(file.url); }, [file]);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    setAudioUrl(undefined);
    audioRef.current?.pause();
    // A complete, typed Blob remains seekable even when a host omits byte-range support.
    void fetch(audioPath, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("配乐未能载入，请刷新后重试。");
      const bytes = await response.arrayBuffer();
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(new Blob([bytes], { type: customTrack?.type || "audio/mpeg" }));
      setAudioUrl(objectUrl);
    }).catch(error => { if (!controller.signal.aborted) setMediaError(error instanceof Error ? error.message : "配乐未能载入，请重试。"); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [audioPath]);
  useEffect(() => { setPlaying(false); setTime(0); setMediaError(""); audioRef.current?.pause(); }, [videoUrl]);
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && trackId === "original") audio.pause();
    if (videoRef.current) videoRef.current.volume = volume;
  }, [trackId, volume]);
  useEffect(() => {
    if (playAfterTrack.current) { playAfterTrack.current = false; void togglePlay(); }
    else if (trackId !== "original" && audioRef.current && audioRef.current.readyState >= 1) startMusic();
  }, [trackId]);

  function syncMusic(force = false) {
    const video = videoRef.current, audio = audioRef.current;
    if (!video || !audio || !Number.isFinite(audio.duration) || !Number.isFinite(video.duration)) return;
    const rate = audio.duration / video.duration;
    audio.playbackRate = Math.max(.25, Math.min(4, rate));
    audio.preservesPitch = false;
    const target = Math.min(audio.duration - .01, video.currentTime * rate);
    if (force || Math.abs(audio.currentTime - target) > .2) audio.currentTime = Math.max(0, target);
    audio.volume = volume * mixGain(video.currentTime, video.duration, mix);
  }
  function startMusic() {
    const video = videoRef.current, audio = audioRef.current;
    if (!video || !audio || !audioUrl || trackId === "original" || video.paused || video.readyState < 2 || audio.readyState < 2 || !Number.isFinite(video.duration)) return;
    syncMusic();
    void audio.play().catch(() => setMediaError("配乐未能播放，请再点一次播放，或刷新后重试。"));
  }
  function chooseTrack(id: TrackVersion | "original") {
    setActiveDirection(null);
    setMediaError("");
    if (id === trackId) { if (videoRef.current?.paused) void togglePlay(); return; }
    audioRef.current?.pause(); playAfterTrack.current = id !== "original" && !!videoRef.current?.paused; setTrackId(id);
  }
  function selectDirection(id: string) {
    audioRef.current?.pause(); setActiveDirection(id); setMediaError("");
    if (importedTracks[id]) { setTrackId("a"); if (activeDirection === id && videoRef.current?.paused) void togglePlay(); }
    else { setTrackId("original"); setMessage(`已选「${directions.find(d => d.id === id)?.name}」。这版还没有音频，可以先导入已有配乐，或复制提示词去音乐平台制作。`); }
  }
  function importMusic(id: string, upload: File) {
    if (!/\.(mp3|wav|m4a|ogg)$/i.test(upload.name) || upload.size > 25 * 1024 * 1024) { setMessage("请选择 25 MB 以内的 MP3、WAV、M4A 或 OGG 音频。"); return; }
    const url = URL.createObjectURL(upload); importedUrls.current.add(url);
    audioRef.current?.pause();
    const extension = upload.name.split(".").pop()?.toLowerCase();
    const type = upload.type || ({mp3:"audio/mpeg",wav:"audio/wav",m4a:"audio/mp4",ogg:"audio/ogg"}[extension || ""] || "audio/mpeg");
    const probe = new Audio(); probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (!Number.isFinite(probe.duration) || probe.duration < 15 || probe.duration > 60) { URL.revokeObjectURL(url); importedUrls.current.delete(url); setMessage("请选择 15–60 秒的配乐片段。建议先裁剪成与视频等长的音频，以保持音高。"); return; }
      const previous = importedTracks[id]; if (previous) { URL.revokeObjectURL(previous.url); importedUrls.current.delete(previous.url); }
      setImportedTracks(prev => ({ ...prev, [id]: { name: upload.name, url, type, provider: "本地导入 · 来源未标注" } })); setActiveDirection(id); setTrackId("a");
      setMessage(`「${upload.name}」已放入这个方向。点右侧播放即可试配，当前页面关闭后需重新导入。`);
    };
    probe.onerror = () => { URL.revokeObjectURL(url); importedUrls.current.delete(url); setMessage("这个音频无法读取，请换成 MP3 或 WAV 后重试。"); };
    probe.src = url;
  }
  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) { video.pause(); return; }
    if (Number.isFinite(video.duration) && video.currentTime >= video.duration - .05) video.currentTime = 0;
    setMediaError("");
    try { await video.play(); } catch { setMediaError("视频暂时无法播放，请检查网络，或重新选择视频。"); }
  }
  function seek(value: number) {
    if (videoRef.current) { videoRef.current.currentTime = value; setTime(value); syncMusic(true); }
  }
  function selectExample(id: string) {
    const selected = examples.find(item => item.id === id)!;
    if (!file && id === exampleId) { void togglePlay(); return; }
    playAfterLoad.current = true;
    videoRef.current?.pause(); audioRef.current?.pause();
    setFile(null); setExampleId(id); setDuration(30); setIntent(selected.brief); setSceneEdits({}); setActiveDirection(null); setRevisions([]);
    setMix(defaults(selected.mainPeak)); setTrackId("a"); setMessage(`已选择「${selected.title}」。右侧可以直接播放，也可以继续看分段安排。`);
  }
  function acceptFile(upload: File | undefined) {
    if (!upload) return;
    if (!/\.(mp4|mov|webm|m4v)$/i.test(upload.name)) { setMessage("请选择 MP4、MOV 或 WebM 视频文件。推荐 MP4，兼容性最好。"); return; }
    if (upload.size > 250 * 1024 * 1024) { setMessage("视频超过 250 MB，请压缩后再试。"); return; }
    videoRef.current?.pause(); setFile({ name: upload.name, url: URL.createObjectURL(upload) });
    setTrackId("original"); setIntent(""); setSceneEdits({}); setDuration(30); setMix(defaults(10)); setActiveDirection(null); setRevisions([]);
    setMessage("视频只在你的浏览器里预览，不会上传。下一步请手动写出画面内容；当前未接入 AI 视频分析。");
  }
  function go(next: number) { setStep(next); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function adjust(text: string) {
    if (!text.trim()) { setMessage("可以试试：开头轻一点，或者 12 秒更明显。"); return; }
    const update: Partial<MixSettings> = {}; const parts: string[] = [];
    if (/开头|开场|开始/.test(text)) { update.opening = /强|响|大声/.test(text) ? 1.25 : .45; parts.push("开头强弱"); }
    if (/重点|高潮|产品|明显|\d+\s*秒/.test(text)) {
      const match = text.match(/(\d+(?:\.\d+)?)\s*秒/);
      update.peakAt = match ? Math.min(duration - 1, Math.max(1, Number(match[1]))) : mix.peakAt;
      update.peak = /弱|轻|小声/.test(text) && !/开头/.test(text) ? .6 : 1.4; parts.push(`${Math.round(update.peakAt)} 秒附近的强弱`);
    }
    if (/结尾|收尾|结束|尾巴/.test(text)) { update.ending = /强|响|大声/.test(text) ? 1.2 : .35; parts.push("最后 5 秒的强弱"); }
    if (!parts.length) { setMessage("这版能调整开头、某一秒附近、结尾的音量。改旋律、换乐器或自动修歌，需要后续接音乐模型；暂时不会假装已经改好。"); return; }
    setMix(previous => ({ ...previous, ...update })); setMessage(`已调整${parts.join("、")}。播放对应段落即可比较；下载“调整后的 WAV”会包含这些修改。`); setRequest("");
  }
  async function exportWav() {
    setExporting(true); setMessage("正在把整段配乐和强弱调整一起保存…");
    try {
      if (activeDirection && !customTrack) throw new Error("这个方向还没有音频，请先导入配乐，或选择旧版示例音乐。");
      const blob = await renderAdjustedWav(audioPath, duration, mix);
      downloadBlob(blob, `SoundBrief-${example.id}-${musicVersion}-adjusted.wav`);
      setMessage("已生成包含强弱调整的完整 WAV 文件。");
    } catch (error) { setMessage(error instanceof Error ? error.message : "导出失败，请重试。"); }
    finally { setExporting(false); }
  }
  function exportProject() {
    const project = { version: 1, title: file?.name || example.title, source: file ? "local-upload-manual-plan" : "prepared-demo", exampleId, duration, intent, scenes: scenes.map((scene, index) => ({ ...scene, visual: file ? sceneEdits[`visual-${index}`] || "" : scene.visual, customMusicPlan: sceneEdits[`music-${index}`] || "" })), selectedTrack: musicVersion, mix, provenance: "预制动态插画与原创程序编曲；未调用在线音乐模型。" };
    const creativeProject = { ...project, version: 2, creativePlan: plan, activeDirection, revisions, favorites, compare, importedTracks: Object.fromEntries(Object.entries(importedTracks).map(([id, value]) => [id, { name:value.name, provider:value.provider }])), audioSource: activeDirection ? customTrack ? "local-import" : "not-prepared" : "prepared-demo", note: "本地音视频不包含在计划文件中；模型选择和修改要求尚未提交生成。" };
    downloadBlob(new Blob([JSON.stringify(creativeProject, null, 2)], { type: "application/json" }), `SoundBrief-${example.id}-project.json`);
  }

  return <div className="studio-page sb-app" data-theme={theme.toLowerCase().replaceAll(" ", "-")}>
    <header className="sb-header">
      <Link href="/" className="brand"><span className="brand-mark"><i/><i/><i/></span>SoundBrief<span className="sb-wordmark-tag">创作工作台</span></Link>
      <div className="sb-header-actions"><span className="sb-demo-tag"><span/>创作体验版 · AI 待接入</span><AppearancePicker {...appearance}/></div>
    </header>
    <nav className="sb-steps" aria-label="配乐制作步骤">{workflow.map((item, index) => <button key={item.title} className={step === index ? "active" : step > index ? "complete" : ""} aria-current={step === index ? "step" : undefined} onClick={() => go(index)}><span className="sb-step-number">{step > index ? <Check size={15}/> : index + 1}</span><span><strong>{item.title}</strong><small>{item.description}</small></span>{index < 5 && <ChevronRight className="sb-step-arrow" size={15}/>}</button>)}</nav>
    <main className="sb-layout">
      <section className="sb-workspace">
        <div className="studio-companion">{theme === "Cat Studio" && <Ragdoll pose={step === 2 ? 1 : step === 5 ? 3 : appearance.outfit}/>}<div><p>{["把视频交给我吧，我们先看看它的故事。","最想让观众记住哪一秒？我们一起把它找出来。","先告诉我更在意什么，我把选择替你摆清楚。","我准备了四种创作方向，你也可以带着喜欢的音乐来试。","哪里还差一点点？告诉我，我们再调一调。","把喜欢的声音和创作想法，一起带走吧。"][step]}</p><small>当前：计划编辑、旧版示例试听与本地音频试配</small></div></div>
        <div className="sb-section-heading"><span className="sb-eyebrow">STEP {String(step + 1).padStart(2, "0")} / 06</span><h1>{workflow[step].heading}</h1><p>{workflow[step].help}</p></div>
        {step === 0 && <>
          <div className="sb-source-tabs"><button className={sourceTab === "examples" ? "active" : ""} onClick={() => setSourceTab("examples")}><Film size={16}/>先用示例试试</button><button className={sourceTab === "upload" ? "active" : ""} onClick={() => setSourceTab("upload")}><Upload size={16}/>上传我的视频</button></div>
          {sourceTab === "examples" ? <>
            <div className="sb-category-tabs" aria-label="示例分类">{["全部", "商务", "动物", "日常", "人物"].map(item => <button key={item} aria-pressed={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
            <div className="sb-example-grid">{examples.filter(item => category === "全部" || item.category === category).map(item => <button className={`sb-example-card ${!file && exampleId === item.id ? "selected" : ""}`} key={item.id} onClick={() => selectExample(item.id)} aria-pressed={!file && exampleId === item.id}>
              <div className="sb-example-image"><img src={mediaPath(item.id, "poster.jpg")} alt={item.title} loading="lazy"/><span className="sb-category-label">{item.category}</span><span className="sb-image-play"><Play size={18} fill="currentColor"/></span><span className="sb-duration">00:30</span>{!file && exampleId === item.id && <span className="sb-selected-check"><Check size={15}/></span>}</div>
              <div className="sb-example-copy"><h2>{item.title}</h2><p>{item.subtitle}</p><span><Music2 size={13}/>两版完整配乐 <span>· 动态插画短片</span></span></div>
            </button>)}</div>
            <div className="sb-note"><Info size={16}/><p>旧版流程素材：AI 插画剪辑与程序配乐，不代表音乐模型效果。新样片将单独制作和试听筛选；你也可以在第 4 步导入更喜欢的音乐试配。</p></div>
          </> : <>
            <label className={`sb-upload ${dragging ? "dragging" : ""}`} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files[0]); }}>
              <input type="file" accept="video/mp4,video/quicktime,video/webm,.m4v" aria-label="选择本地视频" onChange={event => { acceptFile(event.target.files?.[0]); event.target.value = ""; }}/><span className="sb-upload-icon"><Upload size={28}/></span><strong>{file ? file.name : "把你的视频拖到这里"}</strong><span>或点击选择文件</span><small>15–60 秒 · MP4 / MOV / WebM · 最大 250 MB</small>
            </label>
            <div className="sb-note"><Info size={18}/><p>你的文件不会离开浏览器。当前支持本地预览、手动分段计划，以及用示例音乐试配；不包含自动识别视频或生成专属配乐。推荐 15–60 秒，超出范围不会加载。</p></div>
            {file && <div className="sb-ready"><Check size={18}/><span>已载入：{file.name}</span><button onClick={() => { setFile(null); setDuration(30); setIntent(example.brief); setMix(defaults(example.mainPeak)); setTrackId("a"); }}>返回示例</button></div>}
          </>}
        </>}
        {step === 0 && <VideoPreferences plan={plan} onChange={setPlan}/>}
        {step === 1 && <>
          <div className="sb-explainer"><span>这一步在做什么？</span><p>{file ? "你来告诉我们画面发生了什么。下面只是等比例分段的填写框，不是 AI 对你视频的分析结果。" : "先找出视频的开场、推进、重点和收尾，再决定音乐在哪一秒变化。下面是这支示例预先整理好的分镜。"}</p></div>
          <div className="sb-scene-list">{scenes.map((scene, index) => <article className={`sb-scene-row ${activeScene === index ? "current" : ""}`} key={index}><button className="sb-time-link" onClick={() => seek(scene.start)} aria-label={`跳到 ${stamp(scene.start)}`}><Play size={12}/>{stamp(scene.start)}<small>— {stamp(scene.end)}</small></button><div><h3>{file ? `第 ${index + 1} 段 · 请描述画面` : scene.title}{!file && scene.start === example.mainPeak && <em>全片重点</em>}</h3>{file ? <input value={sceneEdits[`visual-${index}`] || ""} onChange={event => setSceneEdits(previous => ({ ...previous, [`visual-${index}`]: event.target.value }))} placeholder="例如：产品被拿到镜头前，特写包装" aria-label={`第 ${index + 1} 段画面`}/> : <p>{scene.visual}</p>}</div></article>)}</div>
          <div className="sb-takeaway"><Sparkles size={19}/><p>{file ? "先写清楚最想让观众记住的那一秒。音乐的重点，应该服务画面的重点。" : <>这支片子的配乐重点在 <strong>{example.mainPeak} 秒</strong>。不是整首歌一直很热闹，而是在这里让观众“感觉到变化”。</>}</p></div>
        </>}
        {step === 2 && <>
          <ModelPlanner plan={plan} onChange={setPlan}/>
          <details className="legacy-plan"><summary>编辑整体配乐要求与旧版分段参考</summary>
          <label className="sb-field-label" htmlFor="music-intent">你希望观众感受到什么？<span>不用写音乐术语，像对剪辑师说话就好。</span></label><textarea id="music-intent" value={intent} onChange={event => setIntent(event.target.value)} placeholder="例如：整体温暖，开头安静一点，产品出现时亮起来…" rows={3}/>
          <div className="sb-plan-title"><h2>每一段，音乐怎么安排</h2><span>两种不同表达，不是好坏排名</span></div>
          <div className="sb-plan-head"><span>画面 / 时间</span><span>A · {example.tracks[0].name}</span><span>B · {example.tracks[1].name}</span></div>
          <div className="sb-plan-table">{scenes.map((scene, index) => <div className="sb-plan-row" key={index}><button onClick={() => seek(scene.start)}><span>{stamp(scene.start)}–{stamp(scene.end)}</span><strong>{file ? sceneEdits[`visual-${index}`] || `第 ${index + 1} 段（待描述）` : scene.title}</strong></button><p><span className="sb-mobile-label">A</span>{scene.musicA}</p><p><span className="sb-mobile-label">B</span>{scene.musicB}</p><details><summary>写下这一段的修改想法</summary><input aria-label={`第 ${index + 1} 段配乐想法`} value={sceneEdits[`music-${index}`] || ""} onChange={event => setSceneEdits(previous => ({ ...previous, [`music-${index}`]: event.target.value }))} placeholder="例如：这里不要鼓点，保留轻轻的旋律"/></details></div>)}</div>
          <div className="sb-note"><Info size={16}/><p>{file ? "A/B 是所选示例的编曲参考，不是为你的上传视频生成的结果。" : "以上安排对应预制配乐的编曲段落。"}修改文字会保存到项目计划，不会自动改写音乐；第 5 步可以实际调整音量强弱。</p></div></details>
        </>}
        {step === 3 && <>
          <DirectionLibrary plan={plan} tracks={importedTracks} active={activeDirection} onSelect={selectDirection} onImport={importMusic} intent={intent} favorites={favorites} setFavorites={setFavorites} compare={compare} setCompare={setCompare}/>
          <details className="legacy-plan"><summary>试听旧版示例的两条配乐</summary>
          <div className="sb-explainer"><span>怎么比较？</span><p>先播放右侧视频，再切换 A / B。留意开头有没有抢画面、重点有没有被托起来、最后是不是自然结束。</p></div>
          <div className="sb-track-list">{example.tracks.map(item => <article className={`sb-track-card ${trackId === item.id ? "selected" : ""}`} key={item.id}><div className="sb-track-top"><span className={`sb-track-letter ${item.id}`}>{item.id.toUpperCase()}</span><div><h2>{item.name}</h2><p>{item.style} <span>· {item.bpm} BPM</span></p></div><button aria-pressed={trackId === item.id} onClick={() => chooseTrack(item.id)}>{trackId === item.id ? <Check size={17}/> : <Headphones size={17}/>} {trackId === item.id ? "已选择 · 点击试听" : "选择这版"}</button></div><div className="sb-track-description"><span>{item.instruments}</span><p>{item.reason}</p></div><div className="sb-track-footer"><span>完整 30 秒 · 无人声</span><button onClick={() => { chooseTrack(item.id); seek(example.mainPeak / 30 * duration); }}>从重点段听起 <ArrowRight size={14}/></button></div></article>)}</div>
          {file && <div className="sb-note"><Info size={16}/><p>试配的是所选示例的音乐，会调整播放速度与音高以对齐你的视频长度；并非为上传内容生成的专属音乐。</p></div>}</details>
        </>}
        {step === 4 && <>
          <RevisionPlanner key={`${videoUrl}-${duration}`} duration={duration} revisions={revisions} onSave={value=>setRevisions(previous=>[...previous,value])} onSeek={seek}/>
          <h2 className="actual-mix-title">现在就能调整：音量与强弱</h2>
          <fieldset className="actual-mix-controls" disabled={!!activeDirection && !customTrack}>
          <div className="sb-current-track"><span className={`sb-track-letter ${musicVersion}`}>{musicVersion.toUpperCase()}</span><div><small>正在调整</small><strong>{activeDirection && !customTrack ? "这个方向还没有音频" : audioName}</strong></div><button onClick={() => go(3)}>换一版</button></div>
          <form className="sb-adjust-form" onSubmit={event => { event.preventDefault(); if (trackId === "original") setTrackId("a"); adjust(request); }}><label htmlFor="adjust-request">用一句话告诉我，你想改哪里？</label><div><input id="adjust-request" value={request} onChange={event => setRequest(event.target.value)} placeholder={`例如：开头轻一点，${Math.round(mix.peakAt)} 秒更明显`}/><button type="submit" className="sb-primary"><Sparkles size={16}/>应用</button></div></form>
          <div className="sb-chips">{["开头轻一点", `${Math.round(mix.peakAt)} 秒更明显`, "结尾柔和一点"].map(text => <button key={text} onClick={() => { if (trackId === "original") setTrackId("a"); adjust(text); }}>{text}</button>)}</div>
          <div className="sb-mix-panel"><div className="sb-plan-title"><h2><SlidersHorizontal size={17}/>也可以自己拖动</h2><button onClick={() => { setMix(defaults(example.mainPeak / 30 * duration)); setMessage("已恢复原始强弱。"); }}><RotateCcw size={14}/>恢复原始</button></div>{([{ key: "opening", title: "开头", note: "前 5 秒，慢慢回到正常音量" }, { key: "peak", title: `重点 · ${Math.round(mix.peakAt)} 秒`, note: "这一秒前后，局部抬升或降低" }, { key: "ending", title: "结尾", note: "最后 5 秒，渐变到新的强弱" }] as const).map(item => <label className="sb-mix-control" key={item.key}><div><strong>{item.title}</strong><small>{item.note}</small></div><input type="range" min=".2" max="1.4" step=".05" value={mix[item.key]} onChange={event => { setMix(previous => ({ ...previous, [item.key]: Number(event.target.value) })); if (trackId === "original") setTrackId("a"); }} aria-label={`${item.title}音量`}/><output>{Math.round(mix[item.key] * 100)}%</output></label>)}</div>
          <div className="sb-note"><Info size={16}/><p>这里改变配乐的音量强弱。更换乐器、局部重写旋律需要接入支持这些操作的模型。已有音频的强弱调整可以下载为完整 WAV。</p></div></fieldset>
        </>}
        {step === 5 && <>
          <div className="sb-export-summary"><span className="sb-export-check"><Check size={24}/></span><div><h2>你的这一版</h2><p>{file?.name || example.title} · {stamp(duration)} · {activeDirection && !customTrack ? "音乐待准备" : audioName}{changed ? " · 已调整强弱" : ""}</p></div></div>
          <div className="sb-export-grid">{(!activeDirection || customTrack) && <><a href={audioPath} download={customTrack?.name || `SoundBrief-${example.id}-${musicVersion}.mp3`}><Music2/><strong>原版音乐文件</strong><span>原始音频 · 不含你的调整</span><Download size={17}/></a><button onClick={exportWav} disabled={exporting}><SlidersHorizontal/><strong>{exporting ? "正在导出…" : "调整后的音乐 WAV"}</strong><span>{stamp(duration)} · 含强弱调整与长度适配</span><Download size={17}/></button></>}{!file && !activeDirection && <a href={mediaPath(example.id, `film-${musicVersion}.mp4`)} download={`SoundBrief-${example.id}-${musicVersion}.mp4`}><Film/><strong>旧版已配乐短片 MP4</strong><span>预先合成 · 未含强弱调整</span><Download size={17}/></a>}<button onClick={exportProject}><FileJson/><strong>保存创作计划</strong><span>JSON · 含模型偏好、方向、分段想法与调整参数</span><Download size={17}/></button></div>
          <div className="sb-note"><Info size={16}/><p>{file || activeDirection ? "本地音视频暂不支持在此合成为 MP4。有音频后可下载调整后的 WAV，放入剪映等剪辑工具与原视频合并。" : "旧版 MP4 是提前配好音乐的短片。若你调整过强弱，请下载 WAV，再在剪辑工具中替换音轨。"}创作计划不包含本地媒体文件，请保留原文件。</p></div>
          <button className="sb-text-button" onClick={() => go(0)}><ArrowLeft size={15}/>再试一种视频场景</button>
        </>}
        <div className="sb-status" role="status" aria-live="polite">{message}</div>
        <footer className="sb-step-footer"><button disabled={step === 0} onClick={() => go(step - 1)}><ArrowLeft size={15}/>上一步</button><span>{step + 1} / 6</span>{step < 5 ? <button className="sb-primary" onClick={() => go(step + 1)}>{["看看画面怎么安排", "选模型和配乐方向", "去比较几种感觉", "再调一点细节", "保存这一版"][step]}<ArrowRight size={16}/></button> : <Link href="/" className="sb-text-button">回到首页<ArrowRight size={16}/></Link>}</footer>
      </section>
      <aside className="sb-preview"><Ragdoll pose={2} className="cat-corner" label="小猫陪你试听"/><div className="sb-preview-heading"><span><span className="sb-live-dot"/>同步试听</span><small>{file ? "本地视频" : "旧版 30 秒示例"}</small></div>
        <div className="sb-video-wrap"><video ref={videoRef} src={videoUrl} poster={file ? undefined : mediaPath(example.id, "poster.jpg")} playsInline preload="metadata" muted={trackId !== "original"} onLoadedMetadata={event => {
          const length = event.currentTarget.duration;
          if (!Number.isFinite(length) || length <= 0 || (file && (length < 15 || length > 60))) { setFile(null); setDuration(30); setTrackId("a"); setMessage("请选择 15–60 秒的视频。本次文件未载入，已回到示例。"); return; }
          setDuration(length); setMix(previous => ({ ...previous, peakAt: Math.min(length - 1, previous.peakAt) })); syncMusic(true);
          if (playAfterLoad.current) { playAfterLoad.current = false; void togglePlay(); }
        }} onTimeUpdate={event => { setTime(event.currentTarget.currentTime); syncMusic(); }} onSeeking={() => syncMusic(true)} onPlay={() => { setPlaying(true); startMusic(); }} onPlaying={startMusic} onPause={() => { setPlaying(false); audioRef.current?.pause(); }} onWaiting={() => audioRef.current?.pause()} onEnded={() => { setPlaying(false); audioRef.current?.pause(); }} onError={() => setMediaError("视频未能加载。请重试；本地文件建议转为 H.264 编码的 MP4。")} onClick={togglePlay}/>{!playing && <button className="sb-big-play" onClick={togglePlay} aria-label="播放视频与配乐"><Play size={26} fill="currentColor"/></button>}<span className="sb-video-badge">{file ? "本地预览" : "MOTION STORY"}</span></div>
        <audio ref={audioRef} src={audioUrl} preload="auto" onLoadedMetadata={() => { syncMusic(true); startMusic(); }} onCanPlay={startMusic} onError={() => { if (audioUrl) setMediaError("配乐文件未能加载，请检查网络后重试。"); }}/>
        <div className="sb-transport"><button onClick={togglePlay} aria-label={playing ? "暂停" : "播放"}>{playing ? <Pause size={17}/> : <Play size={17}/>}</button><span>{stamp(time)}</span><input type="range" aria-label="视频进度" min="0" max={duration} step=".05" value={Math.min(time, duration)} onChange={event => seek(Number(event.target.value))}/><span>{stamp(duration)}</span></div>
        {activeDirection ? <div className="custom-audio-now"><strong>{directions.find(d=>d.id===activeDirection)?.name}</strong><span>{customTrack?.name || "这个方向还没有音频 · 可在第 4 步导入"}</span>{customTrack && <button onClick={()=>{if(trackId==="original"){setTrackId("a");startMusic();}else setTrackId("original");}}>{trackId==="original"?"打开配乐":"只听原声"}</button>}</div> : <div className="sb-ab-switch" aria-label="旧版示例音轨">{(["original", "a", "b"] as const).map(id => <button key={id} className={trackId === id ? "active" : ""} aria-pressed={trackId === id} onClick={() => chooseTrack(id)}>{id === "original" ? "仅视频" : `${id.toUpperCase()} · ${example.tracks[id === "a" ? 0 : 1].name}`}</button>)}</div>}
        <label className="sb-volume"><Volume2 size={15}/><span>试听音量</span><input aria-label="试听音量" type="range" min="0" max="1" step=".05" value={volume} onChange={event => setVolume(Number(event.target.value))}/></label>
        {mediaError && <p className="sb-media-error" role="alert">{mediaError}</p>}
        <div className="sb-now-note"><small>{stamp(time)} · {activeDirection ? "你的配乐方向" : file ? "示例音乐的段落参考" : "这一秒，音乐在做什么？"}</small><p>{activeDirection ? customTrack ? "本地配乐跟随视频播放，可到第 5 步调整音量强弱。" : "先准备一条这个方向的音乐；当前没有播放任何生成配乐。" : trackId === "original" ? file ? "当前只播放视频自己的声音。选 A / B 可以试配示例音乐。" : "这支示例原片没有原声。选 A / B，就能听到完整配乐。" : (musicVersion === "a" ? scenes[activeScene].musicA : scenes[activeScene].musicB)}</p></div>
        <div className="sb-energy"><div><strong>配乐强弱安排</strong><span>编曲示意 · 非音频检测</span></div><svg viewBox="0 0 300 72" role="img" aria-label="各段落配乐强弱示意"><path d="M0 60H300" stroke="currentColor" opacity=".12"/><polyline points={scenes.map(scene => `${(scene.start + scene.end) / 2 / duration * 300},${65 - (musicVersion === "a" ? scene.energyA : scene.energyB) * .54 * mixGain((scene.start + scene.end) / 2, duration, mix) / .7}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round"/><line x1={time / duration * 300} x2={time / duration * 300} y1="5" y2="66" stroke="currentColor" strokeDasharray="3 3" opacity=".5"/></svg><div className="sb-scene-markers">{scenes.map((scene, index) => <button key={index} onClick={() => seek(scene.start)} className={activeScene === index ? "active" : ""}>{stamp(scene.start)}</button>)}</div></div>
        <p className="sb-preview-footnote" role="status">{!audioUrl ? "配乐载入中，稍后会对齐当前画面…" : file ? "本地预览 · 手动计划 · 示例音乐试配" : "预制内容，真实播放 · 不调用付费 API"}</p>
      </aside>
    </main>
    <div className="sb-bottom-note"><span>SoundBrief / Let music understand your story.</span><a href="/media/CREDITS.md" target="_blank" rel="noreferrer">示例素材与能力说明</a></div>
  </div>;
}
