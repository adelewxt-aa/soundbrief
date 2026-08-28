import Link from "next/link";

const bars = [18, 32, 24, 46, 36, 58, 44, 70, 54, 82, 64, 42, 58, 76, 48, 66, 38, 52, 28, 20];

export default function Home() {
  return (
    <main className="landing-shell">
      <nav className="site-nav" aria-label="主导航">
        <Link className="brand" href="/" aria-label="SoundBrief 首页">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>SoundBrief</span>
        </Link>
        <div className="nav-actions">
          <span className="prototype-pill"><span /> Prototype mode</span>
          <Link className="nav-link" href="/studio">打开工作台 <span aria-hidden="true">↗</span></Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span>AI VIDEO SOUNDTRACK AGENT</span><b>01 — 32 SEC</b></div>
          <h1>让音乐，卡在画面<br />最需要它的那一秒。</h1>
          <p>上传一段短视频，SoundBrief 自动理解镜头节奏、规划音乐曲线，并生成与关键画面对齐的 BGM。</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/studio?demo=true">用示例视频试试 <span>→</span></Link>
            <Link className="button button-secondary" href="/studio?upload=true">上传我的视频</Link>
          </div>
          <div className="trust-row"><span>无需 API Key</span><span>真实本地视频预览</span><span>全流程可交互</span></div>
        </div>

        <div className="hero-visual" aria-label="视频与音乐关键帧对齐预览">
          <div className="visual-note visual-note-left"><span>SECONDARY PEAK</span><b>24.8s</b></div>
          <div className="phone-stage">
            <div className="phone-top"><span>9:41</span><span>● ● ●</span></div>
            <div className="video-scene">
              <div className="scene-glow" /><div className="product-orbit orbit-one" /><div className="product-orbit orbit-two" />
              <div className="product-can"><span>SB</span><small>sparkling<br />moment</small></div>
              <div className="scene-caption"><span>PRODUCT REVEAL</span><b>12.4s</b></div>
            </div>
            <div className="phone-caption"><span>SoundBrief cut 01</span><span>00:12 / 00:32</span></div>
          </div>

          <div className="music-map">
            <div className="map-head">
              <div><span>MUSIC DIRECTION</span><strong>Playful · Premium</strong></div>
              <div className="score-orb"><b>93</b><span>MATCH</span></div>
            </div>
            <div className="waveform" aria-hidden="true">
              {bars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
              <span className="playhead" />
            </div>
            <div className="time-row"><span>HOOK</span><span>BUILD</span><span>REVEAL</span><span>PEAK</span><span>END</span></div>
            <svg className="energy-curve" viewBox="0 0 640 92" preserveAspectRatio="none" aria-label="音乐能量曲线">
              <defs><linearGradient id="energy" x1="0" x2="1"><stop offset="0" stopColor="#ff6a3d"/><stop offset="1" stopColor="#6557ff"/></linearGradient></defs>
              <path d="M0 78 C70 80 92 60 145 63 C200 67 208 20 254 28 C320 45 350 62 405 56 C454 52 474 18 510 22 C563 27 571 59 640 65" fill="none" stroke="url(#energy)" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="254" cy="28" r="6" fill="#fff" stroke="#ff6a3d" strokeWidth="3"/><circle cx="510" cy="22" r="6" fill="#fff" stroke="#6557ff" strokeWidth="3"/>
            </svg>
          </div>
          <div className="visual-note visual-note-right"><span>GENERATION</span><b>Chrome Pulse</b><small>108 BPM · Instrumental</small></div>
        </div>
      </section>

      <footer className="landing-footer"><span>Understand → Plan → Generate → Evaluate → Revise → Deliver</span><span>Built for short-form creators</span></footer>
    </main>
  );
}
