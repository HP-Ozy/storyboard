import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  list: () => ipcRenderer.invoke('list'),
  save: (name: string, scenes: unknown) => ipcRenderer.invoke('save', name, scenes),
  load: (name: string) => ipcRenderer.invoke('load', name),
  remove: (name: string) => ipcRenderer.invoke('remove', name),
  folder: () => ipcRenderer.invoke('folder'),
  exportFile: (name: string, project: string) => ipcRenderer.invoke('export', name, project),
  lang: (l: string) => ipcRenderer.send('lang', l),
  pdf: (w: number, h: number, project: string) => ipcRenderer.invoke('pdf', w, h, project),
});
