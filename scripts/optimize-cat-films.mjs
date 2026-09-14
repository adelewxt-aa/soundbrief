import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = process.cwd();
const ffmpeg = path.join(root, 'work/ffmpeg-win32-4.1.0/package/ffmpeg.exe');
const sources = {mianmian:'布偶-绵绵.mp4',huajuan:'三花-花卷.mp4',oreo:'奶牛-奥利奥.mp4',mocha:'暹罗-摩卡.mp4',cloud:'长毛-云朵.mp4',songsong:'缅因-松松.mp4'};
const output = path.join(root, 'work/optimized-cat-films');
fs.mkdirSync(output, {recursive:true});
for (const [id, name] of Object.entries(sources)) {
  const src = path.join('C:/Users/wang.xuanting/Downloads', name);
  const dest = path.join(output, `${id}.mp4`);
  const result = spawnSync(ffmpeg, ['-hide_banner','-loglevel','error','-y','-i',src,'-map','0:v:0','-map','0:a:0','-map_metadata','0','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',dest], {encoding:'utf8'});
  if(result.status!==0) throw Error(result.stderr || 'Transcode failed');
  const poster = path.join(output, `${id}.jpg`);
  const still = spawnSync(ffmpeg, ['-hide_banner','-loglevel','error','-y','-ss','0.5','-i',dest,'-frames:v','1','-q:v','3',poster], {encoding:'utf8'});
  if(still.status!==0)throw Error(still.stderr);
  fs.copyFileSync(dest,path.join(root,'public/media/cat-films',`${id}.mp4`));
  fs.copyFileSync(poster,path.join(root,'public/media/cat-films',`${id}.jpg`));
  console.log(JSON.stringify({id,originalBytes:fs.statSync(src).size,webBytes:fs.statSync(dest).size}));
}
