const { contextBridge,ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('versions', {
  
  loadData:(message)=> ipcRenderer.invoke('data-change',message),
  selectSource: () => ipcRenderer.invoke('select-source'),
  selectDestination: () => ipcRenderer.invoke('select-destination'),
  // we can also expose variables, not just functions
})