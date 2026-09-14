import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const sources = {mianmian:'布偶-绵绵.mp4',huajuan:'三花-花卷.mp4',oreo:'奶牛-奥利奥.mp4',mocha:'暹罗-摩卡.mp4',cloud:'长毛-云朵.mp4',songsong:'缅因-松松.mp4'};
for (const [id, original] of Object.entries(sources)) {
  const bytes = fs.readFileSync(path.join('public/media/cat-films', `${id}.mp4`));
  let duration, videoCodec, audioCodec;
  function boxes(start, end) {
    for(let p=start;p+8<=end;) {
      let size=bytes.readUInt32BE(p), header=8;const type=bytes.toString('ascii',p+4,p+8);
      if(size===1){size=Number(bytes.readBigUInt64BE(p+8));header=16;}
      if(size===0)size=end-p;
      if(size<header||p+size>end)throw Error(`Invalid MP4 box ${id}`);
      const q=p+header;
      if(type==='mvhd'){const version=bytes[q];const timescale=bytes.readUInt32BE(q+(version===1?20:12));duration=(version===1?Number(bytes.readBigUInt64BE(q+24)):bytes.readUInt32BE(q+16))/timescale;}
      if(type==='stsd') {const codec=bytes.toString('ascii',q+12,q+16);if(['avc1','hvc1','hev1','av01'].includes(codec))videoCodec=codec;if(['mp4a','Opus'].includes(codec))audioCodec=codec;}
      if(['moov','trak','mdia','minf','stbl'].includes(type))boxes(q,p+size);
      p+=size;
    }
  }
  boxes(0,bytes.length);
  const digest = b => createHash('sha256').update(b).digest('hex');
  const identical = digest(bytes)===digest(fs.readFileSync(path.join('C:/Users/wang.xuanting/Downloads',original)));
  if(!duration||!videoCodec||!audioCodec||bytes.length>25*1024*1024)throw Error(`Invalid media ${id}`);
  console.log(JSON.stringify({id,duration,videoCodec,audioCodec,bytes:bytes.length,identical}));
}
