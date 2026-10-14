import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface Link { to: number; bx?: number; by?: number }
const lists = ['tags', 'chars', 'feels', 'actors', 'gestures', 'actions'] as const;
export type Scene = { img?: string; title?: string; text: string; sound?: string; audio?: string; x?: number; y?: number; links?: Link[]; does?: Record<number, string>; model?: number } & { [K in typeof lists[number]]?: number[] };
// project-wide library (actors, gestures, actions) that scenes point to by index
export interface Item { img?: string; name: string; text: string }
export type Lib = Record<string, Item[]>;
// app-wide calendar: flags per hour slot ("YYYY-MM-DD HH") and saved project names planned per day ("YYYY-MM-DD")
export type Cal = Record<string, string[]>;
const calFile = (root: string) => path.join(root, 'calendar.json');
export const readCal = async (root: string): Promise<Cal> => JSON.parse(await fs.readFile(calFile(root), 'utf8').catch(() => '{}'));
export async function writeCal(root: string, cal: Cal) {
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(calFile(root) + '.tmp', JSON.stringify(cal, null, 2));
  await fs.rename(calFile(root) + '.tmp', calFile(root));
}

const extOf: Record<string, string> = { png: 'png', jpeg: 'jpg', gif: 'gif', webp: 'webp', 'svg+xml': 'svg', bmp: 'bmp', mpeg: 'mp3', wav: 'wav', ogg: 'ogg', flac: 'flac', webm: 'weba', 'x-m4a': 'm4a', mp4: 'm4a' };
const mimeOf: Record<string, string> = Object.fromEntries(Object.entries(extOf).map(([m, e]) => [e, m]));
const folder = { image: 'images', audio: 'audio' } as const;
const own = /^[0-9a-f]{16}\.\w+$/;

async function store(dir: string, data: string, kind: keyof typeof folder) {
  const [, k, mime, b64] = /^data:(image|audio)\/([^;]+);base64,(.*)$/s.exec(data) ?? [];
  if (k !== kind) throw new Error(kind === 'image' ? 'badImage' : 'badAudio');
  const buf = Buffer.from(b64, 'base64');
  const name = `${createHash('sha1').update(buf).digest('hex').slice(0, 16)}.${extOf[mime] ?? mime.replace(/\W/g, '')}`;
  const file = path.join(dir, folder[kind], name);
  await fs.access(file).catch(() => fs.writeFile(file, buf));
  return `${folder[kind]}/${name}`;
}

async function dataUrl(dir: string, rel: string, kind: keyof typeof folder) {
  const name = path.basename(rel);
  const ext = path.extname(name).slice(1).toLowerCase();
  return `data:${kind}/${mimeOf[ext] ?? ext};base64,${(await fs.readFile(path.join(dir, folder[kind], name))).toString('base64')}`;
}

export function projectDir(root: string, name: string) {
  if (!/^[^<>:"/\\|?*\x00-\x1f]+$/.test(name) || /^\.|[. ]$|^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(name)) throw new Error(`badName:${name}`);
  return path.join(root, name);
}

export async function listProjects(root: string) {
  const out = [];
  for (const name of await fs.readdir(root).catch(() => [] as string[])) {
    const json = path.join(root, name, 'project.json');
    const st = await fs.stat(json).catch(() => null);
    if (st) out.push({ name, date: st.mtimeMs, scenes: JSON.parse(await fs.readFile(json, 'utf8')).scenes.length });
  }
  return out.sort((a, b) => b.date - a.date);
}

export const deleteProject = (root: string, name: string) => fs.rm(projectDir(root, name), { recursive: true });

export async function writeProject(dir: string, scenes: Scene[], lib: Lib = {}) {
  for (const f of Object.values(folder)) await fs.mkdir(path.join(dir, f), { recursive: true });
  const out = [];
  for (const s of scenes) out.push({ image: s.img ? await store(dir, s.img, 'image') : undefined, title: s.title || undefined, text: s.text, sound: s.sound, audio: s.audio ? await store(dir, s.audio, 'audio') : undefined, x: s.x, y: s.y, links: s.links, model: s.model, does: s.does && Object.keys(s.does).length ? s.does : undefined, ...Object.fromEntries(lists.filter(f => s[f]?.length).map(f => [f, s[f]])) });
  const outLib: Record<string, { image?: string; name: string; text: string }[]> = {};
  for (const [k, items] of Object.entries(lib)) {
    outLib[k] = [];
    for (const x of items) outLib[k].push({ image: x.img ? await store(dir, x.img, 'image') : undefined, name: x.name, text: x.text });
  }
  const json = path.join(dir, 'project.json');
  await fs.writeFile(json + '.tmp', JSON.stringify({ version: 1, scenes: out, lib: outLib }, null, 2));
  await fs.rename(json + '.tmp', json);
  const keep = new Set([...out.flatMap(s => [s.image, s.audio]), ...Object.values(outLib).flat().map(x => x.image)].filter(Boolean).map(f => path.basename(f!)));
  for (const f of Object.values(folder)) for (const n of await fs.readdir(path.join(dir, f))) if (own.test(n) && !keep.has(n)) await fs.unlink(path.join(dir, f, n));
}

export async function readProject(dir: string): Promise<{ scenes: Scene[]; lib: Lib; cal: Cal }> {
  const { scenes, lib = {}, cal = {} } = JSON.parse(await fs.readFile(path.join(dir, 'project.json'), 'utf8'));
  const outLib: Lib = {};
  for (const [k, items] of Object.entries(lib as Record<string, { image?: string; name?: string; text?: string }[]>)) {
    outLib[k] = await Promise.all(items.map(async x => ({ ...(x.image && { img: await dataUrl(dir, x.image, 'image') }), name: x.name ?? '', text: x.text ?? '' })));
  }
  return { lib: outLib, cal, scenes: await Promise.all(scenes.map(async (s: Scene & { image?: string }) => ({
    ...(s.image && { img: await dataUrl(dir, s.image, 'image') }), ...(s.title && { title: s.title }), text: s.text ?? '', sound: s.sound ?? '', ...(s.audio && { audio: await dataUrl(dir, s.audio, 'audio') }), x: s.x, y: s.y, links: s.links, ...(s.model != null && { model: s.model }), ...(s.does && { does: s.does }), ...Object.fromEntries(lists.filter(f => s[f]).map(f => [f, s[f]])),
  }))) };
}
