export type MixSettings = { opening: number; peak: number; ending: number; peakAt: number };

export function mixGain(time: number, duration: number, settings: MixSettings) {
  const opening = 1 + (settings.opening - 1) * Math.max(0, 1 - time / Math.min(5, duration / 4));
  const peak = 1 + (settings.peak - 1) * Math.max(0, 1 - Math.abs(time - settings.peakAt) / 2.5);
  const ending = 1 + (settings.ending - 1) * Math.max(0, 1 - (duration - time) / 5);
  return Math.min(1, .7 * opening * peak * ending);
}

export async function renderAdjustedWav(url: string, duration: number, settings: MixSettings) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("音乐文件暂时无法读取，请稍后重试。");
  const context = new OfflineAudioContext(2, Math.ceil(duration * 44100), 44100);
  const audio = await context.decodeAudioData(await response.arrayBuffer());
  const source = context.createBufferSource();
  source.buffer = audio;
  source.playbackRate.value = audio.duration / duration;
  const gain = context.createGain();
  source.connect(gain).connect(context.destination);
  for (let t = 0; t < duration; t += .05) gain.gain.linearRampToValueAtTime(mixGain(t, duration, settings), t);
  gain.gain.linearRampToValueAtTime(0, duration);
  source.start();
  const rendered = await context.startRendering();
  const data = new ArrayBuffer(44 + rendered.length * 4);
  const view = new DataView(data);
  const write = (offset: number, text: string) => { for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i)); };
  write(0, "RIFF"); view.setUint32(4, data.byteLength - 8, true); write(8, "WAVEfmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 2, true);
  view.setUint32(24, 44100, true); view.setUint32(28, 176400, true); view.setUint16(32, 4, true); view.setUint16(34, 16, true);
  write(36, "data"); view.setUint32(40, rendered.length * 4, true);
  for (let c = 0; c < 2; c++) {
    const channel = rendered.getChannelData(c);
    for (let i = 0; i < rendered.length; i++) view.setInt16(44 + i * 4 + c * 2, Math.max(-1, Math.min(1, channel[i])) * 32767, true);
  }
  return new Blob([data], { type: "audio/wav" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
