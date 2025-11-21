const { contextBridge,ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('versions', {
  loadData:(message)=> ipcRenderer.invoke('data-change',message),
  selectSource: () => ipcRenderer.invoke('select-source'),
  selectDestination: () => ipcRenderer.invoke('select-destination'),
  startSync: (pathfile)=>ipcRenderer.invoke('Start-Sync',pathfile),
  StopSync:(pathfile)=>ipcRenderer.invoke('Stop-Sync',pathfile),
  StopWatcher:()=>ipcRenderer.invoke('Stop-Watcher'),
  CreateFile:(pathfile)=>ipcRenderer.invoke('Create-File',pathfile),
  OpenVSCode:(pathfile)=>ipcRenderer.invoke('Open-Vs-Code',pathfile),
  // we can also expose variables, not just functions
  onSyncStatus: (callback) =>
    ipcRenderer.on('Sync-Status', (event,message) => callback(message)),
});
