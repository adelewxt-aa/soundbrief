export type ExampleCategory = "商务" | "动物" | "日常" | "人物";
export type TrackVersion = "a" | "b";
export type ScenePlan = {
  start: number; end: number; panel: number; title: string; caption: string;
  visual: string; musicA: string; musicB: string; energyA: number; energyB: number;
};
export type ExampleProject = {
  id: string; category: ExampleCategory; title: string; subtitle: string; color: string;
  description: string; brief: string; mainPeak: number; secondaryPeak: number;
  tracks: { id: TrackVersion; name: string; style: string; bpm: number; instruments: string; reason: string }[];
  scenes: ScenePlan[];
};

export const examples: ExampleProject[] = [
  {
    id: "brand", category: "商务", title: "给画面一点魔法", subtitle: "SoundBrief 的 30 秒自我介绍", color: "#ff805b",
    description: "一只小猫创作者，从配乐选择困难，到找到画面的节奏。可爱的网站介绍短片。",
    brief: "可爱、有记忆点，不要人声；介绍 SoundBrief 时亮起来，最后让品牌安静落下。",
    mainPeak: 10, secondaryPeak: 22,
    tracks: [
      { id: "a", name: "橘子汽水", style: "俏皮钟琴 · 轻电子", bpm: 120, instruments: "钟琴、拨弦、圆润贝斯、轻鼓组", reason: "旋律更有记忆点，10 秒加入钟琴主题，适合可爱品牌介绍。" },
      { id: "b", name: "小小发射台", style: "明亮合成器 · 电子流行", bpm: 112, instruments: "合成器、柔和电钢琴、贝斯、电子鼓", reason: "节奏推进更明显，22 秒的鼓点回归强调“调整音乐”的转折。" },
    ],
    scenes: [
      { start: 0, end: 4, panel: 0, title: "画面有了，音乐呢？", caption: "一个小小的创作难题", visual: "小猫面对待配乐的视频，开场先让人看懂问题。", musicA: "只有轻拨弦，给字幕留白。", musicB: "电钢琴铺底，先不进鼓。", energyA: 22, energyB: 18 },
      { start: 4, end: 10, panel: 1, title: "把视频交给 SoundBrief", caption: "从画面开始，而不是从术语开始", visual: "小猫把视频放入工作台，故事开始推进。", musicA: "加入贝斯与沙锤，轻轻向前走。", musicB: "合成器脉冲渐入，建立期待。", energyA: 44, energyB: 40 },
      { start: 10, end: 16, panel: 2, title: "每个重点，都有节奏", caption: "先看懂，再安排音乐", visual: "画面和音符汇合，这是产品价值第一次被揭示。", musicA: "钟琴主旋律进入，10 秒点亮主峰。", musicB: "完整鼓组进入，和弦打开。", energyA: 85, energyB: 92 },
      { start: 16, end: 22, panel: 2, title: "两种感觉，亲耳比较", caption: "同一支视频，也能有两种表达", visual: "靠近音乐工作台的细节，展示 A/B 选择。", musicA: "保留旋律，减少鼓点密度。", musicB: "鼓点减半，为下一段蓄力。", energyA: 62, energyB: 55 },
      { start: 22, end: 27, panel: 3, title: "再可爱一点？没问题", caption: "用你的话，调整音乐的强弱", visual: "小猫戴上耳机，调整完成，情绪再次抬升。", musicA: "高八度短句回应，形成小高潮。", musicB: "鼓点回归，加一次明亮上行。", energyA: 78, energyB: 86 },
      { start: 27, end: 30, panel: 3, title: "SoundBrief", caption: "让音乐，懂你的画面。", visual: "品牌收尾，给名称和口号停留时间。", musicA: "鼓组退出，主和弦自然衰减。", musicB: "留下长和弦，不突然截断。", energyA: 18, energyB: 22 },
    ],
  },
  {
    id: "animals", category: "动物", title: "小猫今天也很忙", subtitle: "晒太阳、发现毛线、认真玩耍", color: "#efb04c",
    description: "从午睡到扑向毛线球，再回到柔软的安静。适合萌宠、治愈和轻喜剧内容。",
    brief: "轻巧、可爱，扑向毛线球时有一个小惊喜；睡着以后慢慢安静下来。",
    mainPeak: 12, secondaryPeak: 18,
    tracks: [
      { id: "a", name: "猫爪棉花糖", style: "音乐盒 · 俏皮拨弦", bpm: 100, instruments: "音乐盒、木质拨弦、轻贝斯、沙锤", reason: "颗粒感音色对应小猫动作，12 秒的高音短句突出扑跳的惊喜。" },
      { id: "b", name: "午后打个盹", style: "温暖电钢琴 · 慢拍", bpm: 84, instruments: "电钢琴、柔和音垫、低音、轻拍手", reason: "更像温柔的陪伴，保留扑跳重点，但不把安静的萌宠片变成广告。" },
    ],
    scenes: [
      { start: 0, end: 6, panel: 0, title: "今天的计划：晒太阳", caption: "先从一个很长的午觉开始", visual: "小猫蜷在窗边，画面松弛。", musicA: "音乐盒零星落下，几乎没有鼓。", musicB: "低音量电钢琴，长和弦呼吸。", energyA: 18, energyB: 16 },
      { start: 6, end: 12, panel: 1, title: "等一下，那是什么？", caption: "一颗毛线球，打破了平静", visual: "视线转向毛线球，建立一点好奇。", musicA: "拨弦一问一答，慢慢变密。", musicB: "轻沙锤进入，但保持温柔。", energyA: 42, energyB: 34 },
      { start: 12, end: 18, panel: 2, title: "小猫，出动！", caption: "认真玩耍也是正经工作", visual: "扑向毛线球，整个短片最活泼的画面。", musicA: "12 秒钟琴跳高音，轻鼓一起进入。", musicB: "12 秒打开和弦，加入轻拍手。", energyA: 88, energyB: 65 },
      { start: 18, end: 24, panel: 2, title: "这场比赛，我赢了", caption: "再玩最后一下，真的", visual: "靠近猫爪与毛线的细节，保持趣味。", musicA: "变奏旋律，小小的节奏回应。", musicB: "保持稳定律动，不继续加速。", energyA: 73, energyB: 56 },
      { start: 24, end: 27, panel: 3, title: "忙完了，休息一下", caption: "把快乐抱在怀里", visual: "小猫重新蜷起，情绪回落。", musicA: "鼓退出，音乐盒回到开场。", musicB: "只留电钢琴与柔软尾音。", energyA: 32, energyB: 28 },
      { start: 27, end: 30, panel: 3, title: "晚安，小小冒险家", caption: "明天还会有新的毛线球", visual: "安静结束，不需要最后一个重鼓点。", musicA: "最后一个温柔主和弦。", musicB: "长音自然淡出到安静。", energyA: 12, energyB: 12 },
    ],
  },
  {
    id: "daily", category: "日常", title: "把周末过慢一点", subtitle: "咖啡、散步和一小片日落", color: "#83ad83",
    description: "一支有起承转合的周末生活记录。配乐陪着生活走，不抢画面的注意力。",
    brief: "像周末散步一样轻松，野餐时变得开阔，日落时慢慢收住。",
    mainPeak: 12, secondaryPeak: 20,
    tracks: [
      { id: "a", name: "周末慢半拍", style: "Lo-fi 电钢琴 · 松弛律动", bpm: 88, instruments: "电钢琴、柔和贝斯、刷鼓、铃声点缀", reason: "节奏比较松，12 秒才打开和弦，适合不赶时间的日常 Vlog。" },
      { id: "b", name: "散步去见风", style: "清新拨弦 · 轻快流行", bpm: 104, instruments: "木质拨弦、钟琴、轻鼓组、贝斯", reason: "脚步感更强，适合街景剪辑；日落段主动减鼓，让结尾留下余味。" },
    ],
    scenes: [
      { start: 0, end: 6, panel: 0, title: "今天，没有闹钟", caption: "一杯咖啡，慢慢醒来", visual: "晨光落在咖啡和早餐上，安静开场。", musicA: "只放电钢琴，让早餐有呼吸感。", musicB: "轻拨弦开场，不急着打鼓。", energyA: 22, energyB: 27 },
      { start: 6, end: 12, panel: 1, title: "出门，给自己买花", caption: "不赶路，也能遇见好风景", visual: "走上街道，画面开始有移动感。", musicA: "加入松弛的轻鼓和低音。", musicB: "拨弦变密，沙锤跟随脚步。", energyA: 47, energyB: 62 },
      { start: 12, end: 20, panel: 2, title: "把时间摊在草地上", caption: "书翻到哪里，就在哪里停下", visual: "公园野餐，空间与情绪一起打开。", musicA: "12 秒铺开温暖和弦，加入铃声。", musicB: "12 秒进入主旋律，轻快但不喧闹。", energyA: 74, energyB: 88 },
      { start: 20, end: 26, panel: 3, title: "日落也是今天的礼物", caption: "回家以后，再泡一杯茶", visual: "傍晚回到窗边，画面从明亮走向柔和。", musicA: "旋律上行一次，随后慢慢减鼓。", musicB: "20 秒温柔回应，收起高频打击乐。", energyA: 57, energyB: 60 },
      { start: 26, end: 30, panel: 3, title: "普通的一天，也很好", caption: "留一点空白，留给生活", visual: "停留在日落与茶杯上，自然收尾。", musicA: "用长尾音告别，结束前留一点安静。", musicB: "拨弦落回主音，自然衰减。", energyA: 17, energyB: 20 },
    ],
  },
  {
    id: "people", category: "人物", title: "今天，为自己出发", subtitle: "一段关于出门和找回自己的记录", color: "#9c91d9",
    description: "从系好鞋带到河边迎风，再到日落时的安静。两种配乐讲出不同的人物情绪。",
    brief: "开头克制，走出去时渐进；河边张开双臂时有力量，最后留下温柔。",
    mainPeak: 13, secondaryPeak: 21,
    tracks: [
      { id: "a", name: "风会给我答案", style: "抒情钢琴 · 氛围流行", bpm: 96, instruments: "钢琴、温暖音垫、深低音、轻鼓", reason: "更关注人物内心，13 秒和声打开，衬托河边张开双臂的画面。" },
      { id: "b", name: "我的城市节拍", style: "明亮电子 · 都市律动", bpm: 116, instruments: "合成器、拨弦、电子鼓、贝斯", reason: "更有向前走的行动感，13 秒鼓组完整进入，适合积极的个人故事。" },
    ],
    scenes: [
      { start: 0, end: 5, panel: 0, title: "给自己一点勇气", caption: "从系好鞋带开始", visual: "人物在家准备出门，从细节建立情绪。", musicA: "单音钢琴，先听见安静。", musicB: "柔和合成器脉冲，暂不进鼓。", energyA: 20, energyB: 24 },
      { start: 5, end: 13, panel: 1, title: "走出去，世界会回应", caption: "熟悉的街，也有新的光", visual: "人物走进街道，叙事从犹豫变成行动。", musicA: "音垫与贝斯逐渐加入。", musicB: "加入步伐一样的稳定鼓点。", energyA: 44, energyB: 62 },
      { start: 13, end: 21, panel: 2, title: "这一刻，只属于我", caption: "让风把心事吹远一点", visual: "人物在河边张开双臂，是全片情绪主峰。", musicA: "13 秒和弦展开，钢琴旋律抬高。", musicB: "13 秒完整节拍进入，旋律明亮上扬。", energyA: 90, energyB: 94 },
      { start: 21, end: 27, panel: 3, title: "不必一直向前跑", caption: "停下来，也是在靠近自己", visual: "日落中的人物侧脸，力量转为温柔。", musicA: "保持温暖和声，逐步撤掉鼓。", musicB: "21 秒作一次回应，随后转为空拍。", energyA: 58, energyB: 63 },
      { start: 27, end: 30, panel: 3, title: "明天，也为自己出发", caption: "愿每一步，都有自己的节奏", visual: "人物停留在落日里，完成情绪闭环。", musicA: "钢琴落在主和弦，尾音自然结束。", musicB: "鼓组退出，合成器缓缓收尾。", energyA: 18, energyB: 23 },
    ],
  },
];

export const workflow = [
  { title: "上传视频", description: "视频与创作偏好", heading: "你的故事，从这里开始。", help: "上传一支 15–60 秒的视频，或先选旧版示例。再告诉我用途和想要的感觉。" },
  { title: "画面计划", description: "确认情绪与关键时刻", heading: "你最想让观众记住哪一秒？", help: "目前由你填写画面内容；示例使用预先整理的分镜。自动视频分析将在接入后开放。" },
  { title: "模型与方向", description: "偏好、模型与费用", heading: "先选感觉，再决定怎么做。", help: "选择模型偏好与创作方向。当前保存计划，费用与真实推荐等待接入和测试。" },
  { title: "试听比较", description: "四种方向，慢慢选择", heading: "同一个故事，听听不同的可能。", help: "收藏喜欢的方向，挑两版比较。导入已有配乐即可同步试听，也可以展开旧版示例。" },
  { title: "继续修改", description: "保留、记下与调整", heading: "喜欢的留下，不满意的再调调。", help: "记录局部修改要求，或立即调整已有音频的音量。局部重做音乐尚未接入。" },
  { title: "保存结果", description: "带走配乐和你的安排", heading: "把这一版，带走。", help: "示例可下载完整配乐与预先合成的 MP4；你的编辑计划也可以保存为项目文件。" },
];

export const mediaPath = (id: string, file: string) => `/media/${id}/${file}`;
