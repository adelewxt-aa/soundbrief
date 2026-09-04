import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { strict as assert } from 'node:assert';
const require=createRequire(import.meta.url);
const ffmpeg=require('@ffmpeg-installer/ffmpeg').path;
for(const id of ['brand','animals','daily','people']) {
  for(const version of ['a','b']) {
    const input=`public/media/${id}/${version}.mp3`;
    const p=spawnSync(ffmpeg,['-v','error','-i',input,'-f','f32le','-ac','2','-ar','22050','pipe:1'],{windowsHide:true,maxBuffer:16*1024*1024});
    assert.equal(p.status,0,`${input} decodes`);
    const audio=new Float32Array(p.stdout.buffer,p.stdout.byteOffset,p.stdout.length/4);
    const duration=audio.length/22050/2; assert.ok(Math.abs(duration-30)<.1,`${input} duration ${duration}`);
    let sum=0,peak=0;for(const value of audio){sum+=value*value;peak=Math.max(peak,Math.abs(value));}
    const rms=Math.sqrt(sum/audio.length);assert.ok(rms>.01 && peak<1,`${input} audible, no digital clipping`);
    console.log(`${id}/${version}: ${duration.toFixed(2)}s, RMS=${rms.toFixed(3)}, peak=${peak.toFixed(3)}`);
    const film=spawnSync(ffmpeg,['-v','error','-i',`public/media/${id}/film-${version}.mp4`,'-f','null','-'],{windowsHide:true,maxBuffer:1024*1024});
    assert.equal(film.status,0,`${id}/film-${version} fully decodes`);
  }
  const webm=spawnSync(ffmpeg,['-v','error','-i',`public/media/${id}/video.webm`,'-f','null','-'],{windowsHide:true,maxBuffer:1024*1024});
  assert.equal(webm.status,0,`${id}/video.webm fully decodes`);
}
console.log('PASS: 8 full audio tracks, 8 scored MP4 films and 4 browser videos.');
