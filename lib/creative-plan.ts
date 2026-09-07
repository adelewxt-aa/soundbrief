export const providers = [
  { id: "auto", name: "交给小猫匹配", note: "先记下偏好，接入后按实测效果和报价推荐。" },
  { id: "eleven", name: "Eleven Music", note: "候选模型 · 等待接入与样片测试" },
  { id: "minimax", name: "MiniMax Music", note: "候选模型 · 等待接入与样片测试" },
  { id: "mureka", name: "Mureka", note: "候选模型 · 等待接入与样片测试" },
  { id: "ace", name: "ACE-Step", note: "候选模型 · 等待部署与成本测试" },
];
export const directions = [
  { id:"fit", label:"A", name:"刚刚好", badge:"综合匹配方向", style:"温暖轻流行 · 吉他 / 轻打击乐", reason:"先服务画面重点，让开场有呼吸，在关键镜头适度抬升。", prompt:"温暖的纯音乐短视频配乐，柔和吉他与轻打击乐。开头稀疏，关键画面加强节奏，结尾自然淡出。避免喧宾夺主。" },
  { id:"mood", label:"B", name:"氛围再多一点", badge:"情绪优先方向", style:"氛围电子 · 钢琴 / 空间合成器", reason:"适合希望观众慢下来、感受故事的表达，留出环境声和旁白的空间。", prompt:"有呼吸感的氛围纯音乐，柔和钢琴、空间合成器、克制的鼓点。情绪缓慢推进，高潮温柔展开，结尾留白。" },
  { id:"creative", label:"C", name:"来点小惊喜", badge:"记忆点方向", style:"俏皮律动 · 拨弦 / 弹跳贝斯", reason:"用鲜明节奏和一个短小动机强调转场，尝试更有个性的表达。", prompt:"俏皮、有记忆点的纯音乐，拨弦与弹跳贝斯，轻巧律动。转场有清晰重拍，关键画面加入一个简短旋律动机。" },
  { id:"budget", label:"D", name:"简单也好听", badge:"预算优先方向", style:"极简轻节奏 · 键盘 / 简单鼓组", reason:"以较少乐器和简洁结构满足基本配乐需求；实际是否更便宜，要以模型报价为准。", prompt:"简洁完整的纯音乐配乐，温暖键盘与简单鼓组，稳定节奏，清晰起承转合，重点段适度增强，避免复杂层叠。" },
];
export type CreativePlan = { preference: string; provider: string; directions: string[]; purpose: string; feeling: string; vocals: string; beatSync: string; usage: string };
export const initialPlan: CreativePlan = {preference:"平衡一点",provider:"auto",directions:["fit","mood"],purpose:"帮我判断",feeling:"温暖自然",vocals:"不要人声",beatSync:"关键画面卡点",usage:"个人使用"};
export type ImportedTrack = {name:string;url:string;type:string;provider:string};
export type Revision = {start:number;end:number;text:string;locked:number[]};
