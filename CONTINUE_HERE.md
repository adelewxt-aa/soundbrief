# 接着修改 SoundBrief

这是截至 2026-09-28 的项目交接说明。请先阅读 README.md，再按用户的新要求编辑已有项目。

## 产品与设计

面向短视频创作者的 AI 配乐助手：根据视频内容、情绪、用途和预算规划音乐，未来匹配多个生成模型。语言温柔、亲近，避免幼稚或满屏“喵”。

六只猫及各自四种造型已经完成：绵绵（布偶/紫）、摩卡（暹罗/杏）、松松（缅因/绿）、花卷（三花/珊瑚）、云朵（白色长毛/蓝）、奥利奥（黑白/粉）。保留这些已有素材。

## 已有能力与边界

- 首页、外观切换、六支约 15 秒示例视频和六步工作台已经实现。
- 六步为：选择视频、配乐计划、模型与方向、试听比较、继续修改、保存结果。
- 用户可以导入本地视频或音乐、同步试听、编辑计划和时间点、记录修改需求，并对导入音乐做基础音量处理。
- 尚无视频理解、音乐生成 API、真实模型路由、真实报价或局部音乐重新生成。示例使用外部制作的成片原声。不要把模拟计划描述成真实 AI 输出。

## 关键文件

- `components/Welcome.tsx`：首页；`app/companion.css`：猫咪主题、卡片和相关布局。
- `components/CatFilmStudio.tsx`：当前六步工作台。`components/StoryStudio.tsx` 的默认入口使用它，旧实现还保留着。
- `lib/cat-films.ts`：六支视频及场景；`public/media/cat-films/`：配套成片与封面。
- `components/CreativeWorkspace.tsx`、`lib/creative-plan.ts`：模型和创作方向规划界面。
- `lib/audio-mix.ts`：本地音频处理；`lib/cat-companions.ts`：猫咪配置。
- `components/SiteLink.tsx`：站内链接。这里使用原生链接与之前的线上导航修复有关，修改时需验证跳转。

## 已修复的问题

首页封面原来因固定高度加 16:9 比例撑出白框。当前采用容器 width:100%、height:auto、aspect-ratio:16/9，图片绝对定位填充，卡片有裁切和 min-width:0。保留这些约束。

2026-09-17 已发布此修复（Sites 第 11 版），之后访问权限改为 public。线上地址：
https://soundbrief-video-music.wangxuanting2023.chatgpt.site/

`.openai/hosting.json` 保存现有站点 ID，是恢复后继续发布到同一网站的重要配置，不含 API Key。发布时使用用户有权限的原账号、原工作区和 Sites 工具，保留现有站点身份，不创建替代站点。网页本身可公开访问不代表访客有编辑权限。

## 在新电脑启动

先执行 `node scripts/verify-project.mjs` 检查转移文件。安装 Node.js 22.13+ 和 pnpm 后，执行 `pnpm install --frozen-lockfile`。Windows 本地预览可用 `pnpm exec next dev`；构建用 `pnpm build`。根据新电脑情况恢复依赖，不依赖旧电脑的 node_modules。

`scripts/optimize-cat-films.mjs`、`scripts/inspect-cat-films.mjs` 等历史素材工具可能引用旧电脑的 Downloads 或临时 FFmpeg 路径。它们不是启动或编辑网站的必要步骤；网站直接使用已包含的 public 素材。重新制作素材时再配置输入路径。

## 后续方向

继续改善六步说明与示例配乐计划；之后先接入一个视频理解模型和一个音乐模型，再评估多模型扩展。关注首次获得可用配乐的时间、修改轮数和采纳情况。用户希望低成本、国内方便访问，但尚未购买域名或迁移到阿里云，先使用现有网站。

仓库保留本地 Git 开发历史，并在 archive/ 中保留可确认属于本项目的原始视频和已导出的创作资料。本文件不包含旧聊天全文、账号凭据或未导出的浏览器草稿。接手任务应基于实际代码和用户最新需求，不假设已恢复所有旧会话。

## 2026-09-28 迁移整理

已纳入当前未提交的界面调整、components/ModelPlanner.tsx、lib/model-catalog.ts 和完整素材。FILE_CHECKSUMS.json 对迁移快照中的项目与归档文件做完整性检查；主动修改后校验不一致是正常现象。GitHub 同步不会自动更新线上网站。
