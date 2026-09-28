import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = path.join(root, 'FILE_CHECKSUMS.json');
if (!fs.existsSync(manifest)) {
  console.error('缺少 FILE_CHECKSUMS.json，请从完整交付包恢复该文件。');
  process.exit(1);
}
const { files } = JSON.parse(fs.readFileSync(manifest, 'utf8'));
let failed = 0;
for (const { file, sha256, sha256Lf } of files) {
  const target = path.resolve(root, file);
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('校验清单路径无效');
  if (!fs.existsSync(target)) {
    console.error(`缺少文件：${file}`);
    failed++;
    continue;
  }
  const data = fs.readFileSync(target);
  const actual = crypto.createHash('sha256').update(data).digest('hex');
  const normalized = sha256Lf ? crypto.createHash('sha256').update(data.toString('utf8').replace(/\r\n/g, '\n')).digest('hex') : null;
  if (actual !== sha256 && (!sha256Lf || normalized !== sha256Lf)) {
    console.error(`文件有变化：${file}`);
    failed++;
  }
}
console.log(failed ? `${failed} 个文件缺失或有变化。若已主动修改代码，有变化是正常现象。` : `检查通过：${files.length} 个项目文件完整，与交付版本一致。`);
process.exitCode = failed ? 1 : 0;
