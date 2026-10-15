import { app, BrowserWindow, dialog, ipcMain, Menu, safeStorage, Tray } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Cal, deleteProject, Lib, listProjects, projectDir, readCal, readProject, Scene, writeCal, writeProject } from './project';
import { check, readToken, startBot, tokenFile } from './slack';

let win: BrowserWindow;
const M: Record<string, { unsaved: string; leave: string; cancel: string; file: string }> = {
  it: { unsaved: 'Ci sono modifiche non salvate.', leave: 'Esci senza salvare', cancel: 'Annulla', file: 'progetto' },
  en: { unsaved: 'There are unsaved changes.', leave: 'Quit without saving', cancel: 'Cancel', file: 'project' },
  es: { unsaved: 'Hay cambios sin guardar.', leave: 'Salir sin guardar', cancel: 'Cancelar', file: 'proyecto' },
};
let m = M.it;

const archive = () => path.join(app.isPackaged ? path.dirname(process.env.APPIMAGE ?? process.execPath) : app.getAppPath(), 'archivio');

// one copy only, otherwise the Slack bot would answer twice
if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => { win?.show(); win?.focus(); });

app.whenReady().then(() => {
  win = new BrowserWindow({ width: 1400, height: 900, autoHideMenuBar: true, show: !process.argv.includes('--hidden'), webPreferences: { preload: path.join(__dirname, 'preload.js') } });
  win.webContents.on('will-prevent-unload', e => {
    const choice = dialog.showMessageBoxSync(win, { type: 'warning', message: m.unsaved, buttons: [m.leave, m.cancel], defaultId: 1, cancelId: 1 });
    if (choice === 0) e.preventDefault(); else quitting = false;
  });
  // with the bot on, closing the window only hides it: the bot keeps answering from the tray
  win.on('close', e => { if (tray && !quitting) { e.preventDefault(); win.hide(); } });
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  readToken(app.getPath('userData'), b => safeStorage.decryptString(b)).then(bot);
});

// Slack bot "Xi Jinping": runs in the tray and starts with Windows while a token is set, token kept encrypted by the OS
let stopBot = () => {}, tray: Tray | null = null, quitting = false;
async function bot(token: string) {
  stopBot();
  stopBot = token ? startBot(archive(), token) : () => {};
  app.setLoginItemSettings({ openAtLogin: !!token, path: process.execPath, args: [...(app.isPackaged ? [] : [app.getAppPath()]), '--hidden'] });
  if (!token) { tray?.destroy(); tray = null; return; }
  if (!tray) { tray = new Tray(await app.getFileIcon(process.execPath)); tray.on('click', () => win.show()); }
  tray.setToolTip('Storyboard · Xi Jinping');
  tray.setContextMenu(Menu.buildFromTemplate([{ label: 'Storyboard', click: () => win.show() }, { label: 'Esci', click: () => { quitting = true; win.close(); } }]));
}
ipcMain.handle('slackOn', () => fs.access(tokenFile(app.getPath('userData'))).then(() => true, () => false));
ipcMain.handle('slackSet', async (_e, token: string) => {
  const file = tokenFile(app.getPath('userData'));
  if (!token) { await fs.rm(file, { force: true }); return bot(''); }
  await check(token);
  await fs.writeFile(file, safeStorage.encryptString(token));
  await bot(token);
});

app.on('window-all-closed', () => app.quit());

ipcMain.handle('list', () => listProjects(archive()));
ipcMain.handle('save', (_e, name: string, scenes: Scene[], lib: Lib) => writeProject(projectDir(archive(), name), scenes, lib));
ipcMain.handle('load', (_e, name: string) => readProject(projectDir(archive(), name)));
ipcMain.handle('remove', (_e, name: string) => deleteProject(archive(), name));
ipcMain.handle('folder', () => archive());
ipcMain.handle('calGet', () => readCal(archive()));
ipcMain.handle('calSet', (_e, cal: Cal) => writeCal(archive(), cal));
ipcMain.on('lang', (_e, l: string) => { m = M[l] ?? M.it; });

ipcMain.handle('export', async (_e, name: string, project: string) => {
  const { filePath } = await dialog.showSaveDialog(win, { defaultPath: `${name || m.file}.storyboard`, filters: [{ name: 'Storyboard', extensions: ['storyboard'] }] });
  if (filePath) await fs.writeFile(filePath, project);
});

ipcMain.handle('pdf', async (_e, w: number, h: number, project: string) => {
  const { filePath } = await dialog.showSaveDialog(win, { defaultPath: 'storyboard.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (!filePath) return;
  await fs.writeFile(filePath, await win.webContents.printToPDF({ pageSize: { width: w / 96, height: h / 96 }, margins: { top: 0, bottom: 0, left: 0, right: 0 } }));
  await fs.appendFile(filePath, `\n%STORYBOARD ${project}\n`);
});
