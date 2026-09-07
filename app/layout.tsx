import type { Metadata } from "next";
import "./globals.css";
import "./studio.css";
import "./story-studio.css";
import "./companion.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://soundbrief-video-music.wangxuanting2023.chatgpt.site"),
  title: "SoundBrief — 陪你的故事，找到声音",
  description: "和布偶猫配乐搭档一起规划视频情绪、比较配乐方向、试听与调整。可交互创作原型。",
  openGraph: {
    url: "https://soundbrief-video-music.wangxuanting2023.chatgpt.site",
    title: "SoundBrief — 陪你的故事，找到声音",
    description: "把你的视频交给我，我去找一段刚刚好的音乐。",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SoundBrief — 陪你的故事，找到声音",
    description: "把你的视频交给我，我去找一段刚刚好的音乐。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
