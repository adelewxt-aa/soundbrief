import type { Metadata } from "next";
import "./globals.css";
import "./studio.css";

export const metadata: Metadata = {
  title: "SoundBrief — AI Video Soundtrack Agent",
  description: "理解视频节奏，规划音乐曲线，让关键画面与 BGM 精准对齐。",
  openGraph: {
    title: "SoundBrief — AI Video Soundtrack Agent",
    description: "让音乐，卡在画面最需要它的那一秒。",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SoundBrief — AI Video Soundtrack Agent",
    description: "让音乐，卡在画面最需要它的那一秒。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
