import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { alreadyConfigured } from '../src/install.js';

test('安装检测按 MCP 服务名判断，不把项目路径或注释当作已安装', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ichrome-install-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'config');
  const check = (kind, content) => {
    fs.writeFileSync(file, content);
    return alreadyConfigured({ kind, file });
  };
  assert.equal(check('json', JSON.stringify({ projects: ['D:/work/ichrome'], mcpServers: { other: {} } })), false);
  assert.equal(check('json', JSON.stringify({ mcpServers: { ichrome: { command: 'node' } } })), true);
  assert.equal(check('toml', '# ichrome\n[projects."D:/work/ichrome"]\ntrusted = true\n'), false);
  for (const key of ['ichrome', '"ichrome"', "'ichrome'"]) {
    assert.equal(check('toml', `[mcp_servers.${key}] # local\ncommand = "node"\n`), true);
  }
});
