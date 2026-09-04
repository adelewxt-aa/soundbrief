"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "@/components/SiteLink";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Check, ChevronRight, CircleCheck, Clock, Copy, Download,
  FileJson, Film, Headphones, Info, Music, Palette, Pause, Play,
  SlidersHorizontal, Sparkles, Upload, Video, X,
} from "lucide-react";
import {
  candidates as mockCandidates,
  initialBrief,
  providers,
  timelineSegments,
  type MusicBrief,
  type MusicCandidate,
  type WorkflowStep,
} from "@/lib/soundbrief";

const steps: { id: WorkflowStep; label: string }[] = [
  { id: "upload", label: "Upload" }, { id: "analyze", label: "Analyze" },
  { id: "brief", label: "Brief" }, { id: "generate", label: "Generate" },
  { id: "refine", label: "Refine" }, { id: "export", label: "Export" },
];

const themes = ["Soft Editorial", "Cat Studio", "Liquid Chrome", "Neon Club", "Paper Collage", "Pixel Pop"];
const vibeOptions = ["轻快高级", "温暖松弛", "潮流科技", "克制电影感"];
const waveform = [24,42,32,58,47,66,39,72,48,87,56,75,45,63,84,53,71,38,61,46,78,59,88,64,49,68,37,54,31,22];

function readPreference(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function savePreference(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Preferences are optional. */ }
}

function Brand() {
  return <Link className="brand studio-brand" href="/"><span className="brand-mark"><i/><i/><i/></span><span>SoundBrief</span></Link>;
}

function VisualPreview({ currentTime, uploadedUrl, isPlaying }: { currentTime:number; uploadedUrl:string; isPlaying:boolean }) {
  if (uploadedUrl) {
    return <video id="uploaded-video" src={uploadedUrl} className="uploaded-video" muted playsInline />;
  }
  const phase = currentTime < 4 ? "THE OPEN" : currentTime < 12.4 ? "THE BUILD" : currentTime < 24.8 ? "PRODUCT REVEAL" : currentTime < 29 ? "SECOND WAVE" : "LOGO ENDING";
  return (
    <div className={`sample-film ${isPlaying ? "is-playing" : ""}`}>
      <div className="sample-noise" />
      <div className="sample-orbit orbit-a"/><div className="sample-orbit orbit-b"/>
      <div className="sample-product"><span>SB</span><small>SPARKLING<br/>MOMENT</small></div>
      <div className="sample-label"><span>{phase}</span><b>{currentTime.toFixed(1)}s</b></div>
    </div>
  );
}

export default function Studio() {
  const [step, setStep] = useState<WorkflowStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [userBrief, setUserBrief] = useState("希望是轻快、有质感的电子流行，不要人声；产品出现时音乐要明显抬起来。");
  const [vibe, setVibe] = useState("轻快高级");
  const [analysisPhase, setAnalysisPhase] = useState(0);
  const [currentTime, setCurrentTime] = useState(12.4);
  const [isPlaying, setIsPlaying] = useState(false);
  const [brief, setBrief] = useState<MusicBrief>(initialBrief);
  const [generated, setGenerated] = useState<MusicCandidate[]>([]);
  const [generating, setGenerating] = useState(false);
  const [chosen, setChosen] = useState<MusicCandidate | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [refineText, setRefineText] = useState("");
  const [refining, setRefining] = useState(false);
  const [refined, setRefined] = useState(false);
  const [modal, setModal] = useState<"export" | "model" | null>(null);
  const [theme, setTheme] = useState("Soft Editorial");
  const [themeOpen, setThemeOpen] = useState(false);
  const [showThemeTip, setShowThemeTip] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const stepIndex = steps.findIndex((item) => item.id === step);
  const activeSegment = timelineSegments.find((item) => currentTime >= item.start && currentTime < item.end) ?? timelineSegments.at(-1)!;

  useEffect(() => {
    const stored = readPreference("soundbrief-theme");
    const saved = stored && themes.includes(stored) ? stored : "Soft Editorial";
    setTheme(saved);
    document.documentElement.dataset.theme = saved.toLowerCase().replaceAll(" ", "-");
    if (!readPreference("soundbrief-theme-seen")) setShowThemeTip(true);
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true") setIsDemo(true);
  }, []);

  useEffect(() => {
    if (!isPlaying || fileUrl) return;
    timerRef.current = setInterval(() => {
      setCurrentTime((value) => value >= 31.9 ? 0 : Math.min(32, value + .1));
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, fileUrl]);

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  useEffect(() => {
    const video = document.getElementById("uploaded-video") as HTMLVideoElement | null;
    if (!video) return;
    if (isPlaying) video.play().catch(() => undefined); else video.pause();
    const onTime = () => setCurrentTime(Math.min(video.currentTime, 32));
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [isPlaying, fileUrl]);

  const selectTheme = (name: string) => {
    setTheme(name); savePreference("soundbrief-theme", name);
    savePreference("soundbrief-theme-seen", "yes"); setShowThemeTip(false);
    document.documentElement.dataset.theme = name.toLowerCase().replaceAll(" ", "-");
  };

  const loadFile = (nextFile: File) => {
    if (!/\.(mp4|mov|webm)$/i.test(nextFile.name)) {
      setUploadError("请选择 MP4、MOV 或 WebM 视频文件。"); return;
    }
    if (nextFile.size > 250 * 1024 * 1024) {
      setUploadError("这个视频超过 250 MB，请先压缩后再试。"); return;
    }
    setUploadError(""); setIsPlaying(false);
    setFile(nextFile); setFileUrl(URL.createObjectURL(nextFile)); setIsDemo(false); setCurrentTime(0);
  };

  const runAnalysis = async (demo = isDemo) => {
    setIsDemo(demo); setStep("analyze"); setAnalysisPhase(1);
    for (let phase = 2; phase <= 4; phase++) {
      await new Promise((resolve) => setTimeout(resolve, 620)); setAnalysisPhase(phase);
    }
    await providers.video.analyze({ fileName: file?.name || "SoundBrief_Product_32s.mp4", duration: 32, userBrief });
    setAnalysisPhase(5); await new Promise((resolve) => setTimeout(resolve, 350)); setStep("brief");
  };

  const generateMusic = async () => {
    setGenerating(true); setStep("generate");
    const tracks = await providers.music.generate(brief);
    await providers.evaluation.evaluate(tracks[1], brief);
    setGenerated(tracks); setGenerating(false);
  };

  const playTrack = (id: string, bpm: number) => {
    setPlayingTrack(id);
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    audioRef.current?.close().catch(() => undefined);
    const ctx = new AudioCtor(); audioRef.current = ctx;
    const gain = ctx.createGain(); gain.gain.setValueAtTime(.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.075, ctx.currentTime + .06); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + 2.5); gain.connect(ctx.destination);
    [220, 277, 330].forEach((freq, i) => { const osc = ctx.createOscillator(); osc.type = i === 0 ? "sine" : "triangle"; osc.frequency.value = freq * (bpm / 108); osc.connect(gain); osc.start(ctx.currentTime + i * .05); osc.stop(ctx.currentTime + 2.6); });
    window.setTimeout(() => setPlayingTrack(null), 2550);
  };

  const applyTrack = (track: MusicCandidate) => { setChosen(track); setStep("refine"); setRefineText(""); };

  const applyRefinement = async (text = refineText) => {
    if (!text.trim()) return; setRefineText(text); setRefining(true);
    await new Promise((resolve) => setTimeout(resolve, 820));
    setBrief((old) => ({ ...old, secondaryPeak: "24.8s Transition — stronger +18%", version: 2 }));
    setRefined(true); setRefining(false); setChosen((old) => old ? { ...old, score: 94 } : { ...mockCandidates[1], score: 94 });
  };

  const downloadJson = () => {
    const report = { product: "SoundBrief", mode: "prototype", source: file?.name || "sample-video.mp4", duration: 32, brief, selectedTrack: chosen || mockCandidates[1], timeline: timelineSegments, matchReport: { score: refined ? 94 : 93, mainPeak: 12.4, secondaryPeak: 24.8 } };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = "soundbrief-project.json";
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  };

  const copyPrompt = async () => {
    const text = `Instrumental ${brief.genre}, ${brief.bpm} BPM, ${brief.moods.join(", ")}. ${brief.instruments.join(", ")}. Sparse 0–4s, gradual build 4–12s, emotional lift at 12.4s, stronger secondary peak at 24.8s, natural ending 29–32s.`;
    await navigator.clipboard.writeText(text);
  };

  const seek = (time: number) => {
    setCurrentTime(time); const video = document.getElementById("uploaded-video") as HTMLVideoElement | null;
    if (video) video.currentTime = time;
  };

  const canAnalyze = Boolean(file || isDemo);
  const analysisLabels = ["", "提取镜头边界", "识别主体与叙事", "绘制情绪曲线", "定位关键画面", "完成 Music Brief"];

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <Brand />
        <div className="stepper" aria-label="工作流进度">
          {steps.map((item, index) => <button key={item.id} onClick={() => index <= stepIndex && setStep(item.id)} className={index === stepIndex ? "active" : index < stepIndex ? "done" : ""}><span>{index < stepIndex ? <Check size={11}/> : index + 1}</span>{item.label}</button>)}
        </div>
        <div className="studio-tools">
          <button className="prototype-pill" onClick={()=>setModal("model")}><span/> Prototype mode</button>
          <div className="theme-wrap">
            <button className="icon-button" onClick={() => { setThemeOpen(!(themeOpen || showThemeTip)); setShowThemeTip(false); }} aria-label="切换主题" aria-expanded={themeOpen || showThemeTip}><Palette size={17}/></button>
            <AnimatePresence>{(themeOpen || showThemeTip) && <motion.div className="theme-popover" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <div className="popover-head"><div><b>Choose your creative skin.</b><span>当前：{theme}</span></div><button aria-label="关闭主题面板" onClick={()=>{setThemeOpen(false);setShowThemeTip(false);savePreference("soundbrief-theme-seen","yes")}}><X size={14}/></button></div>
              <div className="theme-grid">{themes.map((name) => <button key={name} className={theme===name?"selected":""} onClick={()=>selectTheme(name)}><i className={`theme-swatch swatch-${name.toLowerCase().replaceAll(" ", "-")}`}/><span>{name}</span>{theme===name&&<Check size={12}/>}</button>)}</div>
            </motion.div>}</AnimatePresence>
          </div>
        </div>
      </header>

      <div className="studio-content">
        <aside className="studio-sidebar">
          <Link className="back-link" href="/"><ArrowLeft size={14}/> 返回首页</Link>
          <div className="project-label">CURRENT PROJECT</div>
          <h2>{file?.name?.replace(/\.[^.]+$/, "") || "Sparkling Product Cut"}</h2>
          <div className="project-meta"><span><Clock size={13}/> 00:32</span><span>9:16</span><span>{file ? `${(file.size/1024/1024).toFixed(1)} MB` : "Demo"}</span></div>
          <div className="sidebar-divider"/>
          <p className="mini-label">AI OBSERVATIONS</p>
          <div className="observation"><span className="obs-time">12.4s</span><div><b>Product Reveal</b><p>主视觉第一次完整出现，适合作为音乐主峰。</p></div></div>
          <div className="observation"><span className="obs-time violet">24.8s</span><div><b>Scene Transition</b><p>快速转场，建议增加一次次级能量提升。</p></div></div>
          <button className="detail-button" onClick={()=>setModal("model")}><SlidersHorizontal size={14}/> 查看模型与 Provider</button>
          <div className="honesty-note"><Info size={14}/><p>视频预览、时间轴与 JSON 下载真实可用；AI 理解、音乐与导出结果为 Wizard-of-Oz 模拟。</p></div>
        </aside>

        <section className="workspace">
          <AnimatePresence mode="wait">
            {step === "upload" && <motion.div key="upload" className="panel upload-panel" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
              <div className="panel-kicker">STEP 01 · START WITH VIDEO</div><h1>把画面交给 SoundBrief。</h1><p className="panel-lede">上传 15–60 秒视频，或用我们的 32 秒产品示例快速体验完整流程。</p>
              <label className={`drop-zone ${file ? "has-file" : ""} ${dragging ? "is-dragging" : ""}`}
                onDragOver={(e)=>{e.preventDefault();setDragging(true);}}
                onDragLeave={(e)=>{if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);}}
                onDrop={(e)=>{e.preventDefault();setDragging(false);const dropped=e.dataTransfer.files[0];if(dropped)loadFile(dropped);}}>
                <input aria-label="选择视频文件" type="file" accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm" onChange={(e)=>{if(e.target.files?.[0])loadFile(e.target.files[0]);e.target.value="";}}/>
                {file ? <><CircleCheck size={28}/><b>{file.name}</b><span>{(file.size/1024/1024).toFixed(2)} MB · 本地安全预览</span></> : <><span className="upload-icon"><Upload size={24}/></span><b>拖拽视频到这里，或点击选择</b><span>MP4 / MOV / WebM · 建议 15–60 秒</span></>}
              </label>
              {uploadError && <p className="upload-error" role="alert">{uploadError}</p>}
              {fileUrl && <div className="upload-local-preview"><video key={fileUrl} src={fileUrl} controls playsInline preload="metadata" onError={()=>setUploadError("浏览器无法播放这个视频编码，请改用 H.264 MP4 或 WebM。")}/><span>已载入本地视频 · 文件不会上传到服务器</span></div>}
              <div className="or-line"><span>或者</span></div>
              <button className="sample-button" aria-pressed={isDemo} onClick={()=>{setIsDemo(true);setFile(null);setFileUrl("");setUploadError("");setIsPlaying(false);setCurrentTime(12.4);}}><span className="sample-thumb"><i/></span><span><b>{isDemo ? "已选择示例视频" : "使用示例视频"}</b><small>32s · 竖屏产品短片 · 无需上传</small></span>{isDemo?<CircleCheck className="sample-check" size={20}/>:<ChevronRight size={18}/>}</button>
              <div className="brief-inputs"><label><span>你希望音乐给人什么感觉？</span><textarea value={userBrief} onChange={(e)=>setUserBrief(e.target.value)} /></label><div className="vibe-row">{vibeOptions.map((item)=><button key={item} onClick={()=>setVibe(item)} className={vibe===item?"active":""}>{item}</button>)}</div></div>
              <button disabled={!canAnalyze} className="primary-action" onClick={()=>runAnalysis()}><Sparkles size={16}/> 分析视频并规划音乐 <ChevronRight size={16}/></button>
            </motion.div>}

            {step === "analyze" && <motion.div key="analyze" className="panel analysis-panel" initial={{opacity:0}} animate={{opacity:1}}>
              <div className="panel-kicker">STEP 02 · VIDEO UNDERSTANDING</div><h1>正在读懂这支片子的呼吸。</h1><p className="panel-lede">我们在找镜头边界、主体动作和真正需要音乐抬升的瞬间。</p>
              <div className="scan-stage"><VisualPreview currentTime={currentTime} uploadedUrl={fileUrl} isPlaying={true}/><motion.div className="scan-line" animate={{top:["8%","88%","8%"]}} transition={{duration:2.1,repeat:Infinity,ease:"easeInOut"}}/><div className="scan-time">00:{String(Math.min(32,analysisPhase*6+2)).padStart(2,"0")}.4 / 00:32.0</div></div>
              <div className="analysis-status"><div className="analysis-ring"><span>{Math.min(100,analysisPhase*20)}%</span></div><div><b>{analysisLabels[analysisPhase]}</b><p>{analysisPhase<5?"画面、节奏和故事正在被转换成可执行的音乐指令。":"Music Brief 已准备好。"}</p></div></div>
              <div className="analysis-steps">{analysisLabels.slice(1).map((label,index)=><span key={label} className={analysisPhase>index?"done":""}>{analysisPhase>index?<Check size={12}/>:index+1}{label}</span>)}</div>
            </motion.div>}

            {(step === "brief" || step === "generate" || step === "refine" || step === "export") && <motion.div key="work" className="production-workspace" initial={{opacity:0}} animate={{opacity:1}}>
              <div className="preview-column">
                <div className="preview-card"><div className="preview-header"><span>VIDEO PREVIEW</span><b>{currentTime.toFixed(1)}s / 32.0s</b></div><div className="preview-viewport"><VisualPreview currentTime={currentTime} uploadedUrl={fileUrl} isPlaying={isPlaying}/><button className="big-play" onClick={()=>setIsPlaying(!isPlaying)}>{isPlaying?<Pause size={22}/>:<Play size={22} fill="currentColor"/>}</button></div><div className="preview-controls"><button onClick={()=>setIsPlaying(!isPlaying)}>{isPlaying?<Pause size={14}/>:<Play size={14}/>}</button><input aria-label="播放位置" type="range" min="0" max="32" step=".1" value={currentTime} onChange={(e)=>seek(Number(e.target.value))}/><span>{activeSegment.label}</span></div></div>
              </div>

              <div className="main-column">
                <Timeline currentTime={currentTime} onSeek={seek} refined={refined}/>

                {step === "brief" && <BriefEditor brief={brief} setBrief={setBrief} onGenerate={generateMusic}/>} 

                {step === "generate" && <div className="flow-card"><div className="flow-head"><div><span>STEP 04 · GENERATE & EVALUATE</span><h2>两条不同的音乐方向。</h2></div><button className="ghost-action" onClick={()=>setStep("brief")}>返回 Brief</button></div>
                  {generating ? <div className="generation-loading"><div className="equalizer">{[1,2,3,4,5,6,7].map(i=><i key={i}/>)}</div><b>正在生成并评估两条候选音乐…</b><span>Mock provider · 预计 2 秒</span></div> : <div className="candidate-grid">{generated.map((track)=><Candidate key={track.id} track={track} playing={playingTrack===track.id} onPlay={()=>playTrack(track.id,track.bpm)} onApply={()=>applyTrack(track)}/>)}</div>}
                </div>}

                {step === "refine" && <div className="flow-card"><div className="flow-head"><div><span>STEP 05 · REFINE WITH LANGUAGE</span><h2>不需要懂音乐术语。</h2></div><div className="version-pill">Version {refined?2:1}</div></div>
                  <div className="selected-track"><div className="mini-cover" style={{background:chosen?.gradient||mockCandidates[1].gradient}}><Music size={18}/></div><div><b>{chosen?.title||"Chrome Pulse"}</b><span>{chosen?.bpm||108} BPM · Instrumental</span></div><strong>{chosen?.score||93}<small>MATCH</small></strong></div>
                  <div className="refine-box"><label>告诉 SoundBrief 哪里需要调整。</label><div><input value={refineText} onChange={(e)=>setRefineText(e.target.value)} placeholder="比如：25 秒再强一点，但别影响结尾…" onKeyDown={(e)=>e.key==="Enter"&&applyRefinement()}/><button disabled={!refineText||refining} onClick={()=>applyRefinement()}>{refining?<span className="spinner"/>:<Sparkles size={16}/>} 调整</button></div><div className="suggestion-row">{["25 秒再强一点","开头更安静","结尾再自然一点"].map(text=><button key={text} onClick={()=>{setRefineText(text);applyRefinement(text)}}>{text}</button>)}</div></div>
                  <AnimatePresence>{refined&&<motion.div className="refine-result" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}><div className="before-after"><span><small>BEFORE</small><b>次峰 +6%</b><i>Match 89</i></span><ChevronRight/><span className="after"><small>AFTER</small><b>次峰 +18%</b><i>Match 94</i></span></div><p><Check size={15}/> 已增强 24.8 秒附近的打击乐与低频，并保持 29–32 秒自然收尾。</p></motion.div>}</AnimatePresence>
                  <button className="primary-action bottom-action" onClick={()=>setStep("export")}>确认版本并导出 <ChevronRight size={16}/></button>
                </div>}

                {step === "export" && <ExportPanel brief={brief} chosen={chosen} refined={refined} onJson={downloadJson} onCopy={copyPrompt} onDemo={()=>setModal("export")}/>} 
              </div>
            </motion.div>}
          </AnimatePresence>
        </section>
      </div>

      <AnimatePresence>{modal&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setModal(null)}><motion.div className="modal-card" initial={{scale:.96,y:12}} animate={{scale:1,y:0}} onClick={(e)=>e.stopPropagation()}><button className="modal-close" onClick={()=>setModal(null)}><X size={17}/></button>{modal==="export"?<><span className="modal-icon"><Film/></span><h2>这是可演示的产品原型</h2><p>当前版本没有购买音乐生成或视频合成 API，所以 BGM 与最终 MP4 按钮展示完整产品反馈，但不会伪装成真实导出。</p><div className="api-roadmap"><b>接入 API 后</b><span>音乐生成 → Fal / Eleven Music / ACE-Step</span><span>视频合成 → FFmpeg / 云端渲染服务</span></div></>:<><span className="modal-icon"><SlidersHorizontal/></span><h2>Provider 路由</h2><p>当前由集中式 Mock Provider 驱动。产品 UI 不直接依赖具体模型，后续只需替换适配器。</p><div className="provider-list"><span><b>Video Understanding</b><i>Mock → 智谱 / 火山引擎</i></span><span><b>Music Generation</b><i>Mock → Fal / Eleven / ACE-Step</i></span><span><b>Evaluation</b><i>Mock → 自建音频分析</i></span></div></>}</motion.div></motion.div>}</AnimatePresence>
    </main>
  );
}

function Timeline({currentTime,onSeek,refined}:{currentTime:number;onSeek:(n:number)=>void;refined:boolean}) {
  return <div className="timeline-card"><div className="timeline-head"><div><span>32 SEC STORY MAP</span><b>{currentTime.toFixed(1)}s · {timelineSegments.find(s=>currentTime>=s.start&&currentTime<s.end)?.label||"Ending"}</b></div><div className="timeline-legend"><span><i/>Video</span><span><i/>Energy</span></div></div><div className="timeline-scroll"><div className="timeline-inner" onClick={(e)=>{const r=e.currentTarget.getBoundingClientRect();onSeek(((e.clientX-r.left)/r.width)*32)}}>
    <div className="thumb-track">{timelineSegments.map((seg,index)=><div key={seg.id} className={`story-thumb thumb-${index}`} style={{width:`${((seg.end-seg.start)/32)*100}%`}}><i/><span>{seg.label}</span></div>)}</div>
    <div className="segment-track">{timelineSegments.map(seg=><div key={seg.id} className={currentTime>=seg.start&&currentTime<seg.end?"active":""} style={{width:`${((seg.end-seg.start)/32)*100}%`,background:seg.color}}><span>{seg.start}s</span></div>)}</div>
    <div className="wave-track">{waveform.map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div>
    <svg viewBox="0 0 800 82" preserveAspectRatio="none" className={`studio-energy ${refined?"refined":""}`}><path d={refined?"M0 72 C75 74 102 59 162 60 C220 60 255 21 310 24 C390 42 445 62 520 55 C587 51 602 8 635 13 C690 22 716 60 800 62":"M0 72 C75 74 102 59 162 60 C220 60 255 21 310 24 C390 42 445 62 520 55 C590 52 602 33 635 38 C690 43 716 60 800 62"} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><circle cx="310" cy="24" r="6"/><circle className="secondary-dot" cx="635" cy={refined?13:38} r="6"/></svg>
    <div className={`peak-marker main-peak`} style={{left:"38.75%"}}><b>12.4</b><span>MAIN PEAK</span></div><div className={`peak-marker second-peak ${refined?"glow":""}`} style={{left:"77.5%"}}><b>24.8</b><span>SECONDARY</span></div><div className="timeline-playhead" style={{left:`${(currentTime/32)*100}%`}}><i/><span>{currentTime.toFixed(1)}</span></div>
  </div></div></div>;
}

function BriefEditor({brief,setBrief,onGenerate}:{brief:MusicBrief;setBrief:(b:MusicBrief)=>void;onGenerate:()=>void}) {
  const update = <K extends keyof MusicBrief>(key:K,value:MusicBrief[K])=>setBrief({...brief,[key]:value});
  return <div className="flow-card brief-card"><div className="flow-head"><div><span>STEP 03 · MUSIC BRIEF</span><h2>把“感觉”变成可执行的音乐计划。</h2></div><span className="editable-badge">所有字段可编辑</span></div><div className="brief-summary"><Sparkles size={17}/><p>轻快但有高级感的电子流行纯音乐；开头克制，4–12 秒渐进，12.4 秒产品出现时形成主峰，24.8 秒再次抬升，最后自然收束。</p></div>
    <div className="brief-grid"><label><span>MOOD</span><div className="chip-edit">{brief.moods.map(item=><button key={item} onClick={()=>update("moods",brief.moods.filter(x=>x!==item))}>{item}<X size={10}/></button>)}</div></label><label><span>GENRE</span><input value={brief.genre} onChange={e=>update("genre",e.target.value)}/></label><label><span>TEMPO</span><div className="number-input"><input type="number" value={brief.bpm} onChange={e=>update("bpm",Number(e.target.value))}/><i>BPM</i></div></label><label><span>VOCALS</span><select value={brief.vocal} onChange={e=>update("vocal",e.target.value)}><option>Instrumental</option><option>Vocal chops</option><option>Female vocal</option></select></label><label className="wide"><span>INSTRUMENTS</span><input value={brief.instruments.join(" · ")} onChange={e=>update("instruments",e.target.value.split(" · "))}/></label></div>
    <div className="arc-grid"><span><small>BUILD</small><input value={brief.build} onChange={e=>update("build",e.target.value)}/></span><span><small>MAIN PEAK</small><input value={brief.mainPeak} onChange={e=>update("mainPeak",e.target.value)}/></span><span><small>SECONDARY</small><input value={brief.secondaryPeak} onChange={e=>update("secondaryPeak",e.target.value)}/></span><span><small>ENDING</small><input value={brief.ending} onChange={e=>update("ending",e.target.value)}/></span></div>
    <button className="primary-action bottom-action" onClick={onGenerate}><Headphones size={16}/> 生成两条候选音乐 <ChevronRight size={16}/></button>
  </div>;
}

function Candidate({track,playing,onPlay,onApply}:{track:MusicCandidate;playing:boolean;onPlay:()=>void;onApply:()=>void}) {
  return <article className="candidate"><div className="candidate-cover" style={{background:track.gradient}}><div className="cover-orbit"/><button onClick={onPlay}>{playing?<Pause/>:<Play fill="currentColor"/>}</button><span>{track.id==="chrome-pulse"?"B":"A"}</span></div><div className="candidate-body"><div className="candidate-title"><div><span>DIRECTION {track.id==="chrome-pulse"?"B":"A"}</span><h3>{track.title}</h3></div><div className="candidate-score"><b>{track.score}</b><span>MATCH</span></div></div><div className="candidate-wave">{waveform.slice(0,20).map((h,i)=><i key={i} style={{height:`${Math.max(15,h-(i%3)*7)}%`}}/>)}</div><div className="track-meta"><span>{track.duration}</span><span>{track.bpm} BPM</span><span>Instrumental</span></div><div className="candidate-tags">{track.tags.map(tag=><span key={tag}>{tag}</span>)}</div><div className="why"><Info size={14}/><p><b>Why it matches</b>{track.reason}</p></div><button className="apply-button" onClick={onApply}>使用这条音乐 <ChevronRight size={15}/></button></div></article>;
}

function ExportPanel({brief,chosen,refined,onJson,onCopy,onDemo}:{brief:MusicBrief;chosen:MusicCandidate|null;refined:boolean;onJson:()=>void;onCopy:()=>void;onDemo:()=>void}) {
  const [copied,setCopied]=useState(false);
  return <div className="flow-card export-card"><div className="export-success"><span><Check size={24}/></span><div><small>STEP 06 · READY TO DELIVER</small><h2>这支视频的音乐方案已经就位。</h2><p>Version {brief.version} · {chosen?.title||"Chrome Pulse"} · Match {refined?94:93}</p></div></div><div className="match-report"><div className="report-score"><b>{refined?94:93}</b><span>OVERALL MATCH</span></div><div className="report-bars">{[["时长匹配",100],["情绪曲线",refined?96:91],["主峰对齐",98],["次峰对齐",refined?95:86]].map(([label,value])=><div key={String(label)}><span>{label}<b>{value}%</b></span><i><em style={{width:`${value}%`}}/></i></div>)}</div></div><div className="export-grid"><button onClick={onJson}><span><FileJson/></span><b>下载项目 JSON</b><small>真实可用 · brief、时间轴与评分</small><Download size={16}/></button><button onClick={onDemo}><span><Music/></span><b>导出 BGM</b><small>Demo · 需要音乐模型 API</small><Download size={16}/></button><button onClick={onDemo}><span><Film/></span><b>导出配乐 MP4</b><small>Demo · 需要渲染服务</small><Download size={16}/></button><button onClick={async()=>{await onCopy();setCopied(true);setTimeout(()=>setCopied(false),1600)}}><span><Copy/></span><b>{copied?"Prompt 已复制":"复制生成 Prompt"}</b><small>可粘贴到 Suno / ACE-Step</small>{copied?<Check size={16}/>:<Copy size={16}/>}</button></div><div className="deliver-note"><Video size={16}/><p><b>作品集展示建议</b> 用 JSON 导出证明数据链路，用 Demo 导出说明真实 API 边界；这比伪造一段“已生成音乐”更可信。</p></div></div>;
}
