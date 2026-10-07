import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface Link { to: number; bx?: number; by?: number }
export interface Scene { img: string; text: string; x?: number; y?: number; links?: Link[] }

const extOf: Record<string, string> = { png: 'png', jpeg: 'jpg', gif: 'gif', webp: 'webp', 'svg+xml': 'svg', bmp: 'bmp' };
const mimeOf: Record<string, string> = Object.fromEntries(Object.entries(extOf).map(([m, e]) => [e, `image/${m}`]));
const ownImage = /^[0-9a-f]{16}\.\w+$/;

export function projectDir(root: string, name: string) {
  if (!/^[^<>:"/\\|?*\x00-\x1f]+$/.test(name) || /^\.|[. ]$|^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(name)) throw new Error(`Nome non valido: "${name}"`);
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

export async function writeProject(dir: string, scenes: Scene[]) {
  const imgDir = path.join(dir, 'images');
  await fs.mkdir(imgDir, { recursive: true });
  const out = [];
  for (const s of scenes) {
    const [, mime, b64] = /^data:image\/([^;]+);base64,(.*)$/s.exec(s.img) ?? [];
    if (!b64) throw new Error('Immagine non valida');
    const buf = Buffer.from(b64, 'base64');
    const name = `${createHash('sha1').update(buf).digest('hex').slice(0, 16)}.${extOf[mime] ?? mime.replace(/\W/g, '')}`;
    const file = path.join(imgDir, name);
    await fs.access(file).catch(() => fs.writeFile(file, buf));
    out.push({ image: `images/${name}`, text: s.text, x: s.x, y: s.y, links: s.links });
  }
  const json = path.join(dir, 'project.json');
  await fs.writeFile(json + '.tmp', JSON.stringify({ version: 1, scenes: out }, null, 2));
  await fs.rename(json + '.tmp', json);
  const keep = new Set(out.map(s => path.basename(s.image)));
  for (const f of await fs.readdir(imgDir)) if (ownImage.test(f) && !keep.has(f)) await fs.unlink(path.join(imgDir, f));
}

export async function readProject(dir: string): Promise<Scene[]> {
  const { scenes } = JSON.parse(await fs.readFile(path.join(dir, 'project.json'), 'utf8'));
  return Promise.all(scenes.map(async (s: { image: string; text?: string; x?: number; y?: number; links?: Link[] }) => {
    const name = path.basename(s.image);
    const ext = path.extname(name).slice(1).toLowerCase();
    const b64 = (await fs.readFile(path.join(dir, 'images', name))).toString('base64');
    return { img: `data:${mimeOf[ext] ?? `image/${ext}`};base64,${b64}`, text: s.text ?? '', x: s.x, y: s.y, links: s.links };
  }));
}
