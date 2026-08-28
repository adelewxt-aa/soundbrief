export type WorkflowStep = "upload" | "analyze" | "brief" | "generate" | "refine" | "export";

export type TimelineSegment = {
  id: string;
  start: number;
  end: number;
  label: string;
  note: string;
  color: string;
};

export type MusicBrief = {
  moods: string[];
  genre: string;
  bpm: number;
  vocal: string;
  instruments: string[];
  build: string;
  mainPeak: string;
  secondaryPeak: string;
  ending: string;
  version: number;
};

export type MusicCandidate = {
  id: string;
  title: string;
  score: number;
  duration: string;
  bpm: number;
  tags: string[];
  reason: string;
  gradient: string;
};

export interface VideoUnderstandingProvider {
  analyze(input: { fileName: string; duration: number; userBrief: string }): Promise<{ segments: TimelineSegment[]; summary: string }>;
}

export interface MusicGenerationProvider {
  generate(brief: MusicBrief): Promise<MusicCandidate[]>;
}

export interface MusicEvaluationProvider {
  evaluate(candidate: MusicCandidate, brief: MusicBrief): Promise<{ score: number; findings: string[] }>;
}

export const timelineSegments: TimelineSegment[] = [
  { id: "hook", start: 0, end: 4, label: "Hook", note: "低能量开场", color: "#79b8ff" },
  { id: "build", start: 4, end: 12, label: "Build", note: "逐渐推进", color: "#8c7cff" },
  { id: "reveal", start: 12, end: 18, label: "Product Reveal", note: "12.4s 主峰", color: "#ff7657" },
  { id: "detail", start: 18, end: 24, label: "Details", note: "保持律动", color: "#f1aa4b" },
  { id: "transition", start: 24, end: 29, label: "Transition", note: "24.8s 次峰", color: "#e265bd" },
  { id: "ending", start: 29, end: 32, label: "Logo Ending", note: "自然收束", color: "#57b896" },
];

export const initialBrief: MusicBrief = {
  moods: ["Playful", "Premium", "Energetic"],
  genre: "Electro Pop",
  bpm: 108,
  vocal: "Instrumental",
  instruments: ["Soft Synth", "Muted Bass", "Light Percussion"],
  build: "4–12s gradual build",
  mainPeak: "12.4s Product Reveal",
  secondaryPeak: "24.8s Transition",
  ending: "29–32s natural ending",
  version: 1,
};

export const candidates: MusicCandidate[] = [
  {
    id: "warm-momentum",
    title: "Warm Momentum",
    score: 89,
    duration: "0:32",
    bpm: 104,
    tags: ["Warm", "Organic synth", "Soft lift"],
    reason: "开场留白和叙事感更好，但 24.8 秒的转场提升较温和。",
    gradient: "linear-gradient(145deg,#ffad67,#ef5b49 52%,#542ca8)",
  },
  {
    id: "chrome-pulse",
    title: "Chrome Pulse",
    score: 93,
    duration: "0:32",
    bpm: 108,
    tags: ["Polished", "Electro pop", "Tight sync"],
    reason: "12.4 秒主峰与产品揭示精准对齐，结尾也为 Logo 保留了呼吸感。",
    gradient: "linear-gradient(145deg,#8af4e4,#5f64ec 52%,#fa6d96)",
  },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockVideoUnderstandingProvider implements VideoUnderstandingProvider {
  async analyze(input: { fileName: string; duration: number; userBrief: string }) {
    await wait(720);
    return {
      segments: timelineSegments,
      summary: `已理解 ${input.fileName} 的画面节奏：前 4 秒建立氛围，12.4 秒产品揭示，24.8 秒转场，29 秒进入品牌收尾。`,
    };
  }
}

export class MockMusicGenerationProvider implements MusicGenerationProvider {
  async generate(_brief: MusicBrief) {
    await wait(900);
    return candidates;
  }
}

export class MockMusicEvaluationProvider implements MusicEvaluationProvider {
  async evaluate(candidate: MusicCandidate, _brief: MusicBrief) {
    await wait(460);
    return {
      score: candidate.score,
      findings: ["长度与视频一致", "主峰与产品揭示对齐", candidate.id === "chrome-pulse" ? "次峰清晰" : "次峰可进一步增强"],
    };
  }
}

export const providers = {
  video: new MockVideoUnderstandingProvider(),
  music: new MockMusicGenerationProvider(),
  evaluation: new MockMusicEvaluationProvider(),
};

// Future adapters should implement the same three interfaces here:
// Zhipu/Volcengine -> VideoUnderstandingProvider
// Fal/Eleven Music/ACE-Step -> MusicGenerationProvider
// Custom audio analysis -> MusicEvaluationProvider
