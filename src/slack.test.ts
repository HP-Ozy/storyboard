import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { NUDGE, report, startBot, wantsReport } from './slack';

(async () => {
  const now = new Date(2026, 0, 1, 12, 30);
  assert.equal(report({}, ['A'], now), NUDGE);
  assert.equal(report({ 's 2025-01-01 10': ['old'] }, ['old'], now), NUDGE);
  const r = report({ 's 2026-01-02 10': ['A'], '2026-01-03 08': ['flag'], 's 2026-01-01 12': ['now'] }, ['A', 'B', 'now'], now);
  assert.match(r, /01\/01 12:00 — now/);
  assert.match(r, /02\/01 10:00 — A/);
  assert.match(r, /senza data\*\n• B$/m);
  assert.match(r, /03\/01 08:00 — flag/);
  assert.ok(wantsReport('Xi  Jinping, a che punto siamo ?') && !wantsReport('xi jinping ciao'));
  assert.ok(wantsReport('<@UBOT> A che punto siamo ?', 'UBOT') && !wantsReport('<@UALTRO> a che punto siamo', 'UBOT'));

  // one question from a person -> one reply; bot's own messages and other text are ignored
  const root = await mkdtemp(path.join(os.tmpdir(), 'sbbot-'));
  await mkdir(path.join(root, 'P'));
  await writeFile(path.join(root, 'P', 'project.json'), '{"scenes":[]}');
  const sent: string[] = [];
  let polls = 0;
  const stop = startBot(root, 'x', async (_t, method, p) => {
    if (method === 'auth.test') return { user_id: 'UBOT' };
    if (method === 'chat.postMessage') { sent.push(p.text); return { ok: true }; }
    return { messages: polls++ ? [] : [{ ts: '9e9', text: 'Xi Jinping a che punto siamo?' }, { ts: '9e9', bot_id: 'B', text: 'Xi Jinping a che punto' }, { ts: '9e9', text: 'ciao' }, { ts: '9e9', text: '<@UBOT> a che punto siamo?' }] };
  });
  await new Promise(r => setTimeout(r, 200));
  stop();
  assert.deepEqual(sent, [NUDGE, NUDGE]);
  console.log('slack ok');
  process.exit(0);
})();
