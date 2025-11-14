const { contextBridge,ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('versions', {
  loadData:(message)=> ipcRenderer.invoke('data-change',message),
  selectSource: () => ipcRenderer.invoke('select-source'),
  selectDestination: () => ipcRenderer.invoke('select-destination'),
  startSync: ()=>ipcRenderer.invoke('Start-Sync'),
  openInVSCode:(filepath)=>ipcRenderer.invoke('open-vscode',filepath),
  onSyncStatus: (callback) =>
    ipcRenderer.on('Sync-Status', (event,message) => callback(message)),
});
