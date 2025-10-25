const { contextBridge,ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('versions', {
  
  loadData:(message)=> ipcRenderer.invoke('data-change',message),
  selectSource: () => ipcRenderer.invoke('select-source'),
  selectDestination: () => ipcRenderer.invoke('select-destination'),
  startSync: ()=>ipcRenderer.invoke('Start-Sync'),
  // we can also expose variables, not just functions
})