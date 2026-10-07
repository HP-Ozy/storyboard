import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  list: () => ipcRenderer.invoke('list'),
  save: (name: string, scenes: unknown) => ipcRenderer.invoke('save', name, scenes),
  load: (name: string) => ipcRenderer.invoke('load', name),
  remove: (name: string) => ipcRenderer.invoke('remove', name),
  folder: () => ipcRenderer.invoke('folder'),
  pdf: (w: number, h: number) => ipcRenderer.invoke('pdf', w, h),
});
