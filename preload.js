const { contextBridge,ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  loadData:(message)=> ipcRenderer.invoke('data-change',message)
  // we can also expose variables, not just functions
})