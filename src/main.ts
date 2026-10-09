import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { deleteProject, listProjects, projectDir, readProject, Scene, writeProject } from './project';

let win: BrowserWindow;
const M: Record<string, { unsaved: string; leave: string; cancel: string; file: string }> = {
  it: { unsaved: 'Ci sono modifiche non salvate.', leave: 'Esci senza salvare', cancel: 'Annulla', file: 'progetto' },
  en: { unsaved: 'There are unsaved changes.', leave: 'Quit without saving', cancel: 'Cancel', file: 'project' },
  es: { unsaved: 'Hay cambios sin guardar.', leave: 'Salir sin guardar', cancel: 'Cancelar', file: 'proyecto' },
};
let m = M.it;

const archive = () => path.join(app.isPackaged ? path.dirname(process.env.APPIMAGE ?? process.execPath) : app.getAppPath(), 'archivio');

app.whenReady().then(() => {
  win = new BrowserWindow({ width: 1400, height: 900, autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.js') } });
  win.webContents.on('will-prevent-unload', e => {
    const choice = dialog.showMessageBoxSync(win, { type: 'warning', message: m.unsaved, buttons: [m.leave, m.cancel], defaultId: 1, cancelId: 1 });
    if (choice === 0) e.preventDefault();
  });
  win.loadFile(path.join(__dirname, '..', 'index.html'));
});

app.on('window-all-closed', () => app.quit());

ipcMain.handle('list', () => listProjects(archive()));
ipcMain.handle('save', (_e, name: string, scenes: Scene[]) => writeProject(projectDir(archive(), name), scenes));
ipcMain.handle('load', (_e, name: string) => readProject(projectDir(archive(), name)));
ipcMain.handle('remove', (_e, name: string) => deleteProject(archive(), name));
ipcMain.handle('folder', () => archive());
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
