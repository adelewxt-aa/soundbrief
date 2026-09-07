export type CatCompanion = {
  id: string; theme: string; name: string; breed: string; room: string;
  colorName: string; color: string; soft: string; personality: string; greeting: string;
  image: string; poses: readonly string[]; crops?: number[][];
};

export const cats: CatCompanion[] = [
  { id:"ragdoll", theme:"Cat Studio", name:"绵绵", breed:"布偶猫", room:"布偶猫的音乐房", colorName:"奶油紫", color:"#7456af", soft:"#ece5f8", personality:"温柔认真，偶尔有一点小得意。", greeting:"我是绵绵，陪你找到刚刚好的感觉。", image:"ragdoll-sheet.png", poses:["耳机挥爪","星星灵感","唱片边小憩","蝴蝶结庆祝"], crops:[[0,0,620/1254,640/1254],[700/1254,0,554/1254,625/1254],[0,700/1254,700/1254,554/1254],[705/1254,625/1254,549/1254,629/1254]] },
  { id:"siamese", theme:"Siamese Studio", name:"摩卡", breed:"暹罗猫", room:"暹罗猫的音乐房", colorName:"焦糖杏", color:"#9b5c25", soft:"#f8e5ce", personality:"机灵又黏人，耳朵里藏着小节拍。", greeting:"我是摩卡，好听的小细节交给我。", image:"siamese-sheet.png", poses:["单耳认真听","拨弄节拍器","软垫伸懒腰","翘尾眨眨眼"] },
  { id:"maine", theme:"Maine Studio", name:"松松", breed:"缅因猫", room:"缅因猫的音乐房", colorName:"森林绿", color:"#38674e", soft:"#e0eee3", personality:"沉稳可靠，大尾巴里装着安全感。", greeting:"我是松松，慢慢来，我陪着你。", image:"maine-sheet.png", poses:["抱吉他倾听","研究小乐谱","尾巴围着睡","大爪来击掌"], crops:[[0,0,590/1254,630/1254],[590/1254,130/1254,664/1254,500/1254],[0,660/1254,650/1254,540/1254],[650/1254,625/1254,604/1254,629/1254]] },
  { id:"calico", theme:"Calico Studio", name:"花卷", breed:"三花猫", room:"三花猫的音乐房", colorName:"珊瑚红", color:"#b54d47", soft:"#f9e1da", personality:"好奇又活泼，总有一点新点子。", greeting:"我是花卷，给你的故事添点小惊喜！", image:"calico-sheet.png", poses:["迷你鼓开演","唱片后探头","抱铃鼓躺平","彩带转圈圈"] },
  { id:"cloud", theme:"Cloud Studio", name:"云朵", breed:"纯白长毛猫", room:"白猫的音乐房", colorName:"晴空蓝", color:"#366d9d", soft:"#dfedf9", personality:"轻盈爱幻想，喜欢留一点呼吸。", greeting:"我是云朵，一起听听画面的心情。", image:"cloud-sheet.png", poses:["闭眼弹钢琴","看音符发呆","云靠垫侧躺","吹音符泡泡"] },
  { id:"oreo", theme:"Oreo Studio", name:"奥利奥", breed:"黑白奶牛猫", room:"奶牛猫的音乐房", colorName:"草莓粉", color:"#a64670", soft:"#f8e0eb", personality:"俏皮有主见，今天也想当小明星。", greeting:"我是奥利奥，你的专属试听搭子！", image:"oreo-sheet.png", poses:["打碟小 DJ","整理耳机线","唱片箱躲猫","麦克风明星"] },
];
export const defaultCat = cats[0];
export const catForTheme = (theme: string) => cats.find(cat => cat.theme === theme) || defaultCat;
export const validPose = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 0 && Number(value) < 4;
