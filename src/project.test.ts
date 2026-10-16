import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { deleteProject, listProjects, projectDir, readCal, readProject, Scene, writeCal, writeProject } from './project';

(async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'storyboard-'));
  const img = (mime: string, data: string, kind = 'image') => `data:${kind}/${mime};base64,${Buffer.from(data).toString('base64')}`;
  await mkdir(path.join(dir, 'images'));
  await writeFile(path.join(dir, 'images', 'foto.jpg'), 'utente');

  const scenes: Scene[] = [
    { img: img('png', 'a'), title: 'Apertura', text: 'uno', sound: 'pioggia, synth cupo', audio: img('mpeg', 'm', 'audio'), x: 10, y: 20, links: [{ to: 1 }, { to: 2, bx: 30, by: -15 }], tags: [0, 6], chars: [3], feels: [1, 5] },
    { img: img('jpeg', 'b'), text: 'due\nriga', sound: '', x: 300, y: 40, links: [{ to: 2 }] },
    { img: img('png', 'a'), text: 'tre', sound: '', audio: img('wav', 'w', 'audio'), x: 1, y: 2, links: [{ to: 3 }] },
    { title: 'Nota', text: 'solo testo', sound: '', x: 5, y: 6, links: [], model: 0, dialog: 'ADA: Chi è?', dur: 4.5 },
  ];
  const lib = { actors: [{ img: img('png', 'c'), name: 'Ada', text: 'capelli rossi' }], gestures: [{ name: 'saluta', text: '' }], places: [{ name: 'Bar', text: 'insegna al neon' }] };
  scenes[0] = { ...scenes[0], actors: [0], gestures: [0], does: { 0: 'apre la porta e sorride' }, places: [0] };
  const brief = { goal: 'vendere caffè', audience: '25-40', message: 'sveglia vera', style: 'noir' };
  await writeProject(dir, scenes, lib, brief);
  assert.deepEqual(await readProject(dir), { scenes, lib, cal: {}, brief });
  assert.equal((await readdir(path.join(dir, 'images'))).length, 4);
  assert.equal((await readdir(path.join(dir, 'audio'))).length, 2);
  await assert.rejects(writeProject(dir, [{ img: img('png', 'a'), text: '', audio: img('png', 'a') }]));
  await writeProject(dir, scenes);

  await writeProject(dir, scenes.slice(1, 2));
  assert.deepEqual(await readProject(dir), { scenes: scenes.slice(1, 2), lib: {}, cal: {}, brief: {} });
  assert.equal((await readdir(path.join(dir, 'audio'))).length, 0);
  const left = await readdir(path.join(dir, 'images'));
  assert.equal(left.length, 2);
  assert.ok(left.includes('foto.jpg'));

  const root = path.join(dir, 'archivio');
  assert.deepEqual(await listProjects(root), []);
  await writeProject(projectDir(root, 'Spot caffè'), scenes);
  await writeProject(projectDir(root, 'Schema 2'), scenes.slice(0, 1));
  assert.deepEqual((await listProjects(root)).map(p => [p.name, p.scenes]).sort(), [['Schema 2', 1], ['Spot caffè', 4]]);
  for (const bad of ['', '.', '..', '../x', 'a/b', 'a\\b', 'x.', 'c:', 'CON', 'nul.txt']) assert.throws(() => projectDir(root, bad));
  assert.deepEqual(await readCal(root), {});
  const cal = { '2026-10-14 09': ['sopralluogo', 'casting'], '2026-10-14': ['Spot caffè'] };
  await writeCal(root, cal);
  assert.deepEqual(await readCal(root), cal);
  assert.equal((await listProjects(root)).length, 2);
  await deleteProject(root, 'Spot caffè');
  assert.deepEqual((await listProjects(root)).map(p => p.name), ['Schema 2']);

  await rm(dir, { recursive: true });
  console.log('ok');
})();
