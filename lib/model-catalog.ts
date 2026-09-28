import type { CreativePlan } from "./creative-plan";

export const PRICE_CHECKED_AT = "2026-09-28";
// Planning assumptions, not a live exchange rate or a payable quote.
export const ESTIMATE_USD_CNY = 7.2;
export const SERVICE_RATE = 0.2;

export const providers = [
  { id: "auto", name: "帮我挑更适合这支视频的模型", note: "根据你填写的用途、配乐要求和预算偏好，先给出一个可解释的候选方案。" },
  { id: "eleven", name: "Eleven Music", maker: "ElevenLabs", note: "支持纯音乐、歌词演唱与分段创作计划，适合先尝试有明确段落要求的配乐。", status: "规划接入", official: "$0.15 / 分钟", source: "https://elevenlabs.io/pricing/api", caveat: "API 使用需付费订阅；商用范围需按所选套餐及音乐条款确认。订阅成本未摊入此处。", billing: "minute", usd: 0.15 },
  { id: "stable", name: "Stable Audio 3.0", maker: "Stability AI", note: "面向纯音乐与声音设计，可用文字描述音色、情绪和时长，适合氛围与背景配乐的候选测试。", status: "规划接入", official: "$0.26 / 次（26 credits）", source: "https://platform.stability.ai/pricing", caveat: "按次计价，不因片段较短而同比降价。没有读取视频，精确卡点仍需后期调整和验证。", billing: "generation", usd: 0.26 },
  { id: "minimax", name: "MiniMax Music 3.0", maker: "MiniMax", note: "支持纯音乐与歌曲生成，保留为后续音乐模型候选。接入渠道确认后再参与自动推荐。", status: "接入受限", official: "$0.15 / 次，最长 5 分钟（存量接口参考）", source: "https://platform.minimax.io/docs/guides/pricing-paygo", caveat: "官方自 2026-08-20 起不再向新用户开放音乐付费 API。中转或自部署成本需另核，目前不提供平台报价。", billing: "unavailable", usd: 0.15 },
] as const;

export type MusicProvider = Exclude<(typeof providers)[number], { id: "auto" }>;
export const musicProviders = providers.filter((p): p is MusicProvider => p.id !== "auto");
export function estimateMusic(id: string, seconds: number) {
  const model = musicProviders.find(p => p.id === id);
  if (!model || model.billing === "unavailable" || !Number.isFinite(seconds) || seconds <= 0) return null;
  const officialUsd = model.billing === "minute" ? model.usd * seconds / 60 : model.usd;
  const baseCny = officialUsd * ESTIMATE_USD_CNY;
  const totalCny = Math.ceil((baseCny * (1 + SERVICE_RATE) - 1e-9) * 100) / 100;
  return { officialUsd, baseCny, totalCny };
}

export function recommendMusic(plan: CreativePlan, context: string, seconds: number) {
  const wantsVocals = ["需要歌词演唱", "少量哼唱"].includes(plan.vocals);
  const material = `${plan.purpose} ${context}`;
  const brand = /品牌|广告|产品|发布会/.test(material);
  const narration = /口播|教程|讲解|测评/.test(material);
  const atmosphere = /氛围|门店|咖啡|安静|治愈/.test(`${material} ${plan.feeling}`);
  const structured = plan.beatSync !== "整体顺畅就好";
  let id = "stable";
  let reason = "你选择了无人声或待确认的人声偏好，可以先测试纯音乐与音色氛围；最终以视频同步试听为准。";
  if (wantsVocals) {
    id = "eleven";
    reason = "你希望加入演唱或哼唱，先选择明确提供人声歌曲能力的候选，再检查它会不会抢走画面的注意力。";
  } else if (plan.preference === "预算优先") {
    const eleven = estimateMusic("eleven", seconds);
    const stable = estimateMusic("stable", seconds);
    id = eleven && stable && eleven.totalCny <= stable.totalCny ? "eleven" : "stable";
    reason = "按当前片段时长，先比较已核实的按分钟与按次报价，选择本次生成预估较低的候选；这不是全市场最低价排名。";
  } else if (brand || structured) {
    id = "eleven";
    reason = brand ? "你的内容涉及广告或产品表达，可以先用分段创作计划安排铺垫、亮相和收尾；具体秒点是否吻合仍需试听。" : "你希望音乐回应关键画面或转场，可以先用分段创作计划表达节奏变化；不承诺逐帧自动卡点。";
  } else if (narration) {
    reason = "你的内容涉及讲解或口播，先尝试稀疏、无人声的背景配乐，再同步试听是否影响语音清晰度。";
  } else if (atmosphere) {
    reason = "你希望突出氛围或安静的情绪，可以先尝试纯音乐与音色设计，让音乐连续地托住画面。";
  }
  return { id, reason, model: musicProviders.find(p => p.id === id)! };
}
