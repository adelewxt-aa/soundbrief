# 换电脑恢复 SoundBrief

目标仓库：https://github.com/adelewxt-aa/soundbrief
迁移快照日期：2026-09-28。

## 新电脑恢复

1. 登录 GitHub，克隆仓库：

   git clone https://github.com/adelewxt-aa/soundbrief.git

   也可以使用仓库 Code → Download ZIP；ZIP 包含文件，但不包含 Git 历史。需要开发历史时请选择克隆。
2. 在 Codex 中打开 soundbrief 文件夹，先阅读 CONTINUE_HERE.md 和 README.md。
3. 安装 Node.js 22.13+ 和 pnpm，执行 node scripts/verify-project.mjs 检查本次迁移文件。
4. 执行 pnpm install --frozen-lockfile，Windows 可用 pnpm exec next dev 本地预览，正式构建用 pnpm build。
5. 如需更新原网站，恢复有权限的原账号、工作区与 Sites 连接，并保留 .openai/hosting.json 中的站点身份。

可以直接把这段话发给新电脑上的 Codex：

> 请阅读 CONTINUE_HERE.md 和 README.md，运行文件完整性检查并恢复本地运行环境，然后继续修改 SoundBrief。保留六只猫、六支示例和现有 Sites 网站关联。原始视频和已导出的创作资料在 archive/。

## 迁移范围

- app、components、lib、scripts：现有代码、脚本和未提交的新组件。
- public：全部网页图片、视频、音频和封面。
- archive：六支原始短片、三支明确关联项目的早期视频、已导出的三个项目 JSON 和一份 WAV。
- 项目配置、依赖锁文件、站点关联、交接说明与校验清单。
- Git 开发历史及本地原片开发分支，通过 Git 克隆和远程分支获取。

不包含可以重新安装或生成的 node_modules、构建缓存、临时发布包；也不包含账号登录状态、API Key、旧聊天全文或浏览器里未导出的编辑状态。下载目录中归属不明的视频及其他项目素材未混入仓库。

## 本地保险备份

outputs/SoundBrief-migration-2026-09-28/ 中另有完整项目 ZIP 与 Git bundle，可拷到 U 盘或私人网盘。Git bundle 保存本地历史，ZIP 保存本次完整文件快照。请以实际远程核验结果判断上传完成，不要仅凭本说明删除旧电脑文件。
