// Deterministic original demo compositions and 30-second motion-illustration edits.
// Usage: node scripts/create-demo-media.mjs [audio|video|webm|all] [example-id]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const moduleSource = ts.transpileModule(fs.readFileSync('lib/examples.ts','utf8'), { compilerOptions:{module:ts.ModuleKind.ES2022} }).outputText;
const { examples } = await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
const mode = process.argv[2] || 'all';
const chosen = process.argv[3];
const SR = 44100, DURATION = 30, LEN = SR * DURATION;
fs.mkdirSync('work/render',{recursive:true});

function run(args) {
  const p = spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit',windowsHide:true});
  if(p.status!==0) throw new Error(`Media encoding failed (${p.status})`);
}

function compose(example, track, dest) {
  const L = new Float32Array(LEN), R = new Float32Array(LEN);
  let seed = 173 + examples.indexOf(example)*100 + (track.id==='a'?1:67);
  const random = () => {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const freq = midi => 440*Math.pow(2,(midi-69)/12);
  const beat = 60/track.bpm;
  const soft = /电钢琴|抒情/.test(track.style);
  const bright = track.id==='a' && ['brand','animals'].includes(example.id);
  const root = ({brand:60,animals:65,daily:60,people:62})[example.id];
  const chords = [[0,4,7,11],[9,12,16,19],[5,9,12,16],[7,11,14,17]];
  function add(time, length, midi, amp, type='keys',pan=0) {
    const start=Math.round(time*SR), n=Math.min(Math.round(length*SR), LEN-start), f=freq(midi);
    const pL=Math.sqrt((1-pan)/2),pR=Math.sqrt((1+pan)/2),phase=random()*Math.PI*2;
    for(let i=0;i<n;i++) {
      const t=i/SR, s=t/length, attack=Math.min(1,t/(type==='pad'?.12:.009));
      const release=Math.min(1,(length-t)/.12); let v;
      const w=2*Math.PI*f*t;
      if(type==='bell') v=(Math.sin(w)+.26*Math.sin(w*2.76)*Math.exp(-t*5)+.10*Math.sin(w*5.4)*Math.exp(-t*8))*Math.exp(-t*3.2);
      else if(type==='pluck') v=(Math.sin(w)+.38*Math.sin(w*2)+.17*Math.sin(w*3)+.09*Math.sin(w*4))*Math.exp(-t*5);
      else if(type==='bass') v=(Math.sin(w)+.13*Math.sin(w*2))*Math.exp(-t*2);
      else if(type==='pad') v=(Math.sin(w)+.32*Math.sin(w*1.002+phase)+.2*Math.sin(w*2))*.65*Math.sin(Math.PI*Math.min(1,s));
      else v=(Math.sin(w)+.32*Math.sin(w*2)*Math.exp(-t*3)+.12*Math.sin(w*3)*Math.exp(-t*5))*Math.exp(-t*1.8);
      const x=v*amp*attack*Math.max(0,release); L[start+i]+=x*pL; R[start+i]+=x*pR;
    }
  }
  function drum(time,type,amp) {
    const start=Math.round(time*SR),length=type==='hat'?.07:type==='kick'?.28:.16,n=Math.min(Math.round(length*SR),LEN-start);let last=0;
    for(let i=0;i<n;i++){
      const t=i/SR,noise=random()*2-1;let v=0;
      if(type==='kick')v=Math.sin(2*Math.PI*(46*t+5*(1-Math.exp(-t*28))))*Math.exp(-t*18);
      else if(type==='hat'){v=(noise-last)*.4*Math.exp(-t*65);last=noise;}
      else v=(noise*.5+Math.sin(2*Math.PI*190*t)*.2)*Math.exp(-t*26);
      const x=v*amp;L[start+i]+=x;R[start+i]+=x*(type==='hat'?.8:1);
    }
  }
  function energy(t){ const scene=example.scenes.find(s=>t>=s.start&&t<s.end)||example.scenes.at(-1);return (track.id==='a'?scene.energyA:scene.energyB)/100; }
  // Harmony changes every two bars; notes are original, not sourced from songs.
  for(let t=0;t<27;t+=beat*8){
    const index=Math.floor(t/(beat*8))%4,notes=chords[index],e=energy(t);
    notes.forEach((note,j)=>add(t+j*.016,beat*7.5,root+note,.043+(e*.032),soft?'pad':'keys',(j-1.5)*.32));
  }
  // Resolve on the tonic at the outro instead of cutting a loop mid-phrase.
  [0,4,7,12].forEach((n,j)=>add(27+j*.025,2.8,root+n,.10,soft?'keys':'pad',(j-1.5)*.2));
  const motif = track.id==='a'?[0,4,7,12,11,7,4,2]:[7,12,14,16,14,12,9,7];
  for(let t=0,b=0;t<27;t+=beat/2,b++){
    const e=energy(t),chord=chords[Math.floor(t/(beat*8))%4];
    if(b%2===0 && (e>.3 || b%4===0)) add(t,beat*.65,root+12+chord[(b/2)%4],.07+e*.06,bright?'pluck':'keys',b%4===0?-.25:.25);
    if(t>=example.mainPeak && (b%2===0 || (e>.8&&b%8===7))) add(t+.012,beat*.8,root+12+motif[Math.floor(b/2)%8],.11+e*.045,bright?'bell':soft?'keys':'pluck',.08);
    if(b%4===0&&e>.28) add(t,beat*1.3,root-24+chord[0],.18, 'bass');
    if(e>.34 && b%4===0)drum(t,'kick',soft?.17:.25);
    if(e>.38 && b%4===2)drum(t,'snare',soft?.065:.10);
    if(e>.25 && (b%2===1||e>.75))drum(t,'hat',soft?.035:.055);
  }
  // Exact editorial accents coincide with the visual main / secondary reveal.
  [example.mainPeak,example.secondaryPeak].forEach((t,j)=>{
    drum(t,'kick',soft?.22:.32);[0,4,7,12].forEach((note,i)=>add(t+i*.045,1.35,root+12+note,(j===0?.095:.07),bright?'bell':'keys',(i-1.5)*.2));
    if(!soft)[0,.125,.25,.375].forEach((v,i)=>drum(Math.max(0,t-.5+v),'snare',.035+i*.01));
  });
  // Subtle stereo delay, slow energy contour, soft saturation, and clean tails.
  for(let i=0;i<LEN;i++){
    for(const [delay,level] of [[.113,.10],[.229,.055]]){const d=Math.round(delay*SR);if(i>=d){L[i]+=R[i-d]*level;R[i]+=L[i-d]*level;}}
    const t=i/SR,fade=Math.min(1,t/.25,Math.max(0,(30-t)/1.05));L[i]=Math.tanh(L[i]*1.5)*fade;R[i]=Math.tanh(R[i]*1.5)*fade;
  }
  let peak=0;for(let i=0;i<LEN;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));
  const normalize=.83/Math.max(peak,.01),pcm=Buffer.alloc(44+LEN*4);pcm.write('RIFF',0);pcm.writeUInt32LE(pcm.length-8,4);pcm.write('WAVEfmt ',8);pcm.writeUInt32LE(16,16);pcm.writeUInt16LE(1,20);pcm.writeUInt16LE(2,22);pcm.writeUInt32LE(SR,24);pcm.writeUInt32LE(SR*4,28);pcm.writeUInt16LE(4,32);pcm.writeUInt16LE(16,34);pcm.write('data',36);pcm.writeUInt32LE(LEN*4,40);
  for(let i=0;i<LEN;i++){pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,L[i]*normalize))*32767),44+i*4);pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,R[i]*normalize))*32767),46+i*4);}
  const wav=`work/render/${example.id}-${track.id}.wav`;fs.writeFileSync(wav,pcm);
  run(['-i',wav,'-codec:a','libmp3lame','-b:a','192k',`${dest}/${track.id}.mp3`]);
  console.log(`Audio ready: ${example.id}/${track.id} (30s, stereo)`);
}

function video(example,dest){
  const image=`public/media/art/${example.id}.png`;if(!fs.existsSync(image))throw new Error(`Missing storyboard: ${image}`);
  const font=(process.env.SOUNDBRIEF_FONT||'C:/Windows/Fonts/msyhbd.ttc').replaceAll(':','\\:');
  const parts=[];
  for(const [i,scene] of example.scenes.entries()){
    const n=scene.end-scene.start, name=`work/render/${example.id}-${i}`;
    fs.writeFileSync(`${name}-title.txt`,scene.title);fs.writeFileSync(`${name}-caption.txt`,scene.caption);
    const x=scene.panel%2?'iw/2':'0', y=scene.panel>1?'ih/2':'0';
    const drift=i%2===0?'1.03+on*0.00022':'1.10-on*0.00020';
    const filters=[`crop=iw/2:ih/2:${x}:${y}`,`scale=1080:1440`,
      `zoompan=z='${drift}':x='iw/2-iw/zoom/2+12*sin(on/65)':y='ih/2-ih/zoom/2':d=1:s=720x960:fps=24`,
      'drawbox=x=0:y=0:w=iw:h=105:color=black@0.22:t=fill',
      `drawtext=fontfile='${font}':text='SOUNDBRIEF  /  SHORT STORIES':fontsize=20:fontcolor=white:x=36:y=34`,
      `drawtext=fontfile='${font}':text='0${i+1}':fontsize=25:fontcolor=white:x=w-tw-36:y=30`,
      'drawbox=x=0:y=745:w=iw:h=215:color=black@0.64:t=fill',
      `drawtext=fontfile='${font}':textfile='${name}-title.txt':fontsize=36:fontcolor=white:x=(w-tw)/2:y=792`,
      `drawtext=fontfile='${font}':textfile='${name}-caption.txt':fontsize=22:fontcolor=white@0.85:x=(w-tw)/2:y=853`,
      `drawbox=x=36:y=923:w=${Math.round((i+1)/example.scenes.length*648)}:h=4:color=0xffb07a:t=fill`,
      `fade=t=in:st=0:d=0.18`,`fade=t=out:st=${n-.18}:d=0.18`];
    const part=`${name}.mp4`;parts.push(`file '${path.basename(part)}'`);
    run(['-loop','1','-framerate','24','-i',image,'-t',String(n),'-vf',filters.join(','),'-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-an',part]);
  }
  fs.writeFileSync(`work/render/${example.id}-concat.txt`,parts.join('\n'));
  run(['-f','concat','-safe','0','-i',`work/render/${example.id}-concat.txt`,'-c','copy','-movflags','+faststart',`${dest}/video.mp4`]);
  run(['-ss','1','-i',`${dest}/video.mp4`,'-frames:v','1','-q:v','2',`${dest}/poster.jpg`]);
  for(const track of example.tracks)run(['-i',`${dest}/video.mp4`,'-i',`${dest}/${track.id}.mp3`,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t','30','-movflags','+faststart',`${dest}/film-${track.id}.mp4`]);
  console.log(`Video ready: ${example.id} (30s, 720x960, ${example.scenes.length} scenes, A/B exports)`);
}

for(const example of examples.filter(x=>!chosen||x.id===chosen)){
  const dest=`public/media/${example.id}`;fs.mkdirSync(dest,{recursive:true});
  if(mode==='audio'||mode==='all')for(const track of example.tracks)compose(example,track,dest);
  if(mode==='video'||mode==='all')video(example,dest);
  if(['webm','video','all'].includes(mode)) {
    run(['-i',`${dest}/video.mp4`,'-c:v','libvpx-vp9','-crf','33','-b:v','0','-deadline','realtime','-cpu-used','6','-an',`${dest}/video.webm`]);
    console.log(`Browser-compatible WebM ready: ${example.id}`);
  }
}
