import Link from "@/components/SiteLink";

const bars = [18, 32, 24, 46, 36, 58, 44, 70, 54, 82, 64, 42, 58, 76, 48, 66, 38, 52, 28, 20];

export default function Home() {
  return (
    <main className="landing-shell">
      <nav className="site-nav" aria-label="主导航">
        <Link className="brand" href="/" aria-label="SoundBrief 首页">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>SoundBrief</span>
        </Link>
        <div className="nav-actions">
          <span className="prototype-pill"><span /> 可交互体验版</span>
          <Link className="nav-link" href="/studio">打开工作台 <span aria-hidden="true">↗</span></Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span>AI VIDEO SOUNDTRACK AGENT</span><b>4 STORIES · 30 SEC</b></div>
          <h1>让音乐，卡在画面<br />最需要它的那一秒。</h1>
          <p>从一支短视频开始，看懂故事、安排配乐、试听两种感觉。先用四支完整示例，体验音乐如何托起画面的重点。</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/studio?demo=true">用示例视频试试 <span>→</span></Link>
            <Link className="button button-secondary" href="/studio?upload=true">上传我的视频</Link>
          </div>
          <div className="trust-row"><span>无需 API Key</span><span>4 支短片 · 8 条配乐</span><span>预制示例，真实试听</span></div>
        </div>

        <div className="hero-visual" aria-label="视频与音乐关键帧对齐预览">
          <div className="visual-note visual-note-left"><span>再一次小高潮</span><b>22s</b></div>
          <div className="phone-stage">
            <div className="phone-top"><span>9:41</span><span>● ● ●</span></div>
            <div className="video-scene">
              <img src="/media/brand/poster.jpg" alt="戴着耳机的小猫，SoundBrief 的可爱介绍短片" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}/>
            </div>
            <div className="phone-caption"><span>给画面一点魔法</span><span>完整 00:30</span></div>
          </div>

          <div className="music-map">
            <div className="map-head">
              <div><span>配乐方向 · 编曲示意</span><strong>可爱轻巧 · 明亮电子</strong></div>
              <div className="score-orb"><b>2</b><span>VERSIONS</span></div>
            </div>
            <div className="waveform" aria-hidden="true">
              {bars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
              <span className="playhead" />
            </div>
            <div className="time-row"><span>安静开场</span><span>轻轻推进</span><span>重点出现</span><span>再次抬升</span><span>自然收尾</span></div>
            <svg className="energy-curve" viewBox="0 0 640 92" preserveAspectRatio="none" aria-label="音乐能量曲线">
              <defs><linearGradient id="energy" x1="0" x2="1"><stop offset="0" stopColor="#ff6a3d"/><stop offset="1" stopColor="#6557ff"/></linearGradient></defs>
              <path d="M0 78 C70 80 92 60 145 63 C200 67 208 20 254 28 C320 45 350 62 405 56 C454 52 474 18 510 22 C563 27 571 59 640 65" fill="none" stroke="url(#energy)" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="254" cy="28" r="6" fill="#fff" stroke="#ff6a3d" strokeWidth="3"/><circle cx="510" cy="22" r="6" fill="#fff" stroke="#6557ff" strokeWidth="3"/>
            </svg>
          </div>
          <div className="visual-note visual-note-right"><span>A / B 完整试听</span><b>橘子汽水</b><small>120 BPM · 无人声</small></div>
        </div>
      </section>

      <footer className="landing-footer"><span>选视频 → 看懂画面 → 安排配乐 → 试听两版 → 调整细节 → 保存结果</span><span>视频理解与音乐模型尚未接入</span></footer>
    </main>
  );
}
