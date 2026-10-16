import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  list: () => ipcRenderer.invoke('list'),
  save: (name: string, scenes: unknown, lib: unknown, brief: unknown) => ipcRenderer.invoke('save', name, scenes, lib, brief),
  calGet: () => ipcRenderer.invoke('calGet'),
  calSet: (cal: unknown) => ipcRenderer.invoke('calSet', cal),
  load: (name: string) => ipcRenderer.invoke('load', name),
  remove: (name: string) => ipcRenderer.invoke('remove', name),
  folder: () => ipcRenderer.invoke('folder'),
  exportFile: (name: string, project: string) => ipcRenderer.invoke('export', name, project),
  lang: (l: string) => ipcRenderer.send('lang', l),
  slackOn: () => ipcRenderer.invoke('slackOn'),
  slackSet: (token: string) => ipcRenderer.invoke('slackSet', token),
  pdf: (w: number, h: number, project: string) => ipcRenderer.invoke('pdf', w, h, project),
});
