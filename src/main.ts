import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { deleteProject, listProjects, projectDir, readProject, Scene, writeProject } from './project';

let win: BrowserWindow;

const archive = () => path.join(app.isPackaged ? path.dirname(process.env.APPIMAGE ?? process.execPath) : app.getAppPath(), 'archivio');

app.whenReady().then(() => {
  win = new BrowserWindow({ width: 1400, height: 900, autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.js') } });
  win.webContents.on('will-prevent-unload', e => {
    const choice = dialog.showMessageBoxSync(win, { type: 'warning', message: 'Ci sono modifiche non salvate.', buttons: ['Esci senza salvare', 'Annulla'], defaultId: 1, cancelId: 1 });
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

ipcMain.handle('pdf', async (_e, w: number, h: number) => {
  const { filePath } = await dialog.showSaveDialog(win, { defaultPath: 'storyboard.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (filePath) await fs.writeFile(filePath, await win.webContents.printToPDF({ pageSize: { width: w / 96, height: h / 96 }, margins: { top: 0, bottom: 0, left: 0, right: 0 } }));
});
