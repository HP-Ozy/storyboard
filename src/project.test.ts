import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { deleteProject, listProjects, projectDir, readProject, writeProject } from './project';

(async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'storyboard-'));
  const img = (mime: string, data: string, kind = 'image') => `data:${kind}/${mime};base64,${Buffer.from(data).toString('base64')}`;
  await mkdir(path.join(dir, 'images'));
  await writeFile(path.join(dir, 'images', 'foto.jpg'), 'utente');

  const scenes = [
    { img: img('png', 'a'), title: 'Apertura', text: 'uno', sound: 'pioggia, synth cupo', audio: img('mpeg', 'm', 'audio'), x: 10, y: 20, links: [{ to: 1 }, { to: 2, bx: 30, by: -15 }], tags: [0, 6], chars: [3], feels: [1, 5] },
    { img: img('jpeg', 'b'), text: 'due\nriga', sound: '', x: 300, y: 40, links: [{ to: 2 }] },
    { img: img('png', 'a'), text: 'tre', sound: '', audio: img('wav', 'w', 'audio'), x: 1, y: 2, links: [] },
  ];
  await writeProject(dir, scenes);
  assert.deepEqual(await readProject(dir), scenes);
  assert.equal((await readdir(path.join(dir, 'images'))).length, 3);
  assert.equal((await readdir(path.join(dir, 'audio'))).length, 2);
  await assert.rejects(writeProject(dir, [{ img: img('png', 'a'), text: '', audio: img('png', 'a') }]));
  await writeProject(dir, scenes);

  await writeProject(dir, scenes.slice(1, 2));
  assert.deepEqual(await readProject(dir), scenes.slice(1, 2));
  assert.equal((await readdir(path.join(dir, 'audio'))).length, 0);
  const left = await readdir(path.join(dir, 'images'));
  assert.equal(left.length, 2);
  assert.ok(left.includes('foto.jpg'));

  const root = path.join(dir, 'archivio');
  assert.deepEqual(await listProjects(root), []);
  await writeProject(projectDir(root, 'Spot caffè'), scenes);
  await writeProject(projectDir(root, 'Schema 2'), scenes.slice(0, 1));
  assert.deepEqual((await listProjects(root)).map(p => [p.name, p.scenes]).sort(), [['Schema 2', 1], ['Spot caffè', 3]]);
  for (const bad of ['', '.', '..', '../x', 'a/b', 'a\\b', 'x.', 'c:', 'CON', 'nul.txt']) assert.throws(() => projectDir(root, bad));
  await deleteProject(root, 'Spot caffè');
  assert.deepEqual((await listProjects(root)).map(p => p.name), ['Schema 2']);

  await rm(dir, { recursive: true });
  console.log('ok');
})();
