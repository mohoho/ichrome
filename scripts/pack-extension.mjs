#!/usr/bin/env node
// Local package preserves its public key and trusted extension ID.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'extension/manifest.json')));
const out = path.join(root, 'dist', `ichrome-${manifest.version}.zip`);
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'ichrome-pack-'));
try {
  fs.cpSync(path.join(root, 'extension'), stage, { recursive: true });
  for (const file of ['LICENSE', 'PRIVACY.md']) fs.copyFileSync(path.join(root, file), path.join(stage, file));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (process.platform === 'win32') {
    execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      "$ErrorActionPreference = 'Stop'; Get-ChildItem -LiteralPath $env:ICHROME_PACK_STAGE | Compress-Archive -DestinationPath $env:ICHROME_PACK_OUT -Force"],
      {env:{...process.env, ICHROME_PACK_STAGE:stage, ICHROME_PACK_OUT:out}, windowsHide:true});
  } else {
    fs.rmSync(out, {force:true});
    execFileSync('zip', ['-qr', out, '.'], {cwd:stage});
  }
  console.log(`${out} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
  console.log('解压后，在 chrome://extensions 加载包含 manifest.json 的目录。');
  console.log('AI 控制能力还需要本项目的 Node.js 本地端，见 README.md。');
} finally {
  const actual = fs.realpathSync(stage);
  if (path.dirname(actual) !== fs.realpathSync(os.tmpdir()) || !path.basename(actual).startsWith('ichrome-pack-')) throw new Error('Unexpected staging directory');
  fs.rmSync(actual, {recursive:true, force:true});
}
