import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Cal, listProjects, readCal } from './project';

// shortcut: one fixed channel (#product-yours-ideasss), make it a setting if the bot goes to other teams
export const CHANNEL = 'C0BTTHRNU9J';

export const NUDGE = '⚠️ *Compagni, il calendario è vuoto.* Nessun contenuto fissato.\nOgnuno risponda qui: *su cosa state lavorando?* Se non state lavorando a niente, ditelo.';

const day = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;

// cal keys: "s YYYY-MM-DD HH" = stories planned, "YYYY-MM-DD HH" = flags
export function report(cal: Cal, projects: string[], now: Date) {
  const hour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
  const stories: string[] = [], flags: string[] = [], planned = new Set<string>();
  for (const key of Object.keys(cal).sort((a, b) => a.replace(/^s /, '').localeCompare(b.replace(/^s /, '')))) {
    const [y, m, d, h] = key.replace(/^s /, '').split(/[- ]/).map(Number);
    const when = new Date(y, m - 1, d, h);
    if (isNaN(+when) || when < hour) continue;
    const line = `• ${day(when)} — ${cal[key].join(', ')}`;
    if (key.startsWith('s ')) { stories.push(line); cal[key].forEach(n => planned.add(n)); } else flags.push(line);
  }
  if (!stories.length) return NUDGE;
  const missing = projects.filter(p => !planned.has(p)).sort();
  return ['📅 *Fissato in calendario*', ...stories,
    ...(missing.length ? ['', '🕳️ *Progetti senza data*', ...missing.map(p => `• ${p}`)] : []),
    ...(flags.length ? ['', '🚩 *Flag*', ...flags] : [])].join('\n');
}

export const wantsReport = (text: string) => { const t = text.toLowerCase().replace(/\s+/g, ' '); return t.includes('xi jinping') && t.includes('che punto'); };

export async function slack(token: string, method: string, params: Record<string, string>) {
  const r = await fetch(`https://slack.com/api/${method}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: new URLSearchParams(params) });
  const data = await r.json();
  if (!data.ok) throw new Error(data.error);
  return data;
}

// checks token, invite and scopes in one go so the app can show what is missing
export const check = (token: string) => slack(token, 'conversations.history', { channel: CHANNEL, limit: '1' });

// shortcut: polls every 5 s (Tier 3 ~50/min); move to Socket Mode if Slack rate-limits it
export function startBot(root: string, token: string, api = slack) {
  let last = String(Date.now() / 1000), stop = false;
  (async () => {
    while (!stop) {
      try {
        const { messages } = await api(token, 'conversations.history', { channel: CHANNEL, oldest: last, limit: '50' });
        for (const msg of [...messages].reverse()) {
          if (+msg.ts > +last) last = msg.ts;
          if (!msg.bot_id && !msg.subtype && wantsReport(msg.text ?? '')) {
            const projects = (await listProjects(root)).map(p => p.name);
            await api(token, 'chat.postMessage', { channel: CHANNEL, text: report(await readCal(root), projects, new Date()) });
          }
        }
      } catch (e) { console.error('slack:', e); } // network blips must not kill the bot
      await new Promise(r => setTimeout(r, 5000));
    }
  })();
  return () => { stop = true; };
}

export const tokenFile = (dir: string) => path.join(dir, 'slack-token');
export const readToken = (dir: string, decrypt: (b: Buffer) => string) => fs.readFile(tokenFile(dir)).then(decrypt, () => '');
