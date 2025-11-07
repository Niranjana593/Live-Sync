const { app, BrowserWindow ,ipcMain,dialog,webContents} = require('electron')
const chokidar=require('chokidar');
const fs=require('fs');
const path = require('path')
let mainWindow;
let sourcefile="";
let destinationfile="";
const createWindow = () => {
   mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:false
    }
  })

  mainWindow.loadURL('http://localhost:5173/')
}

app.whenReady().then(() => {
  createWindow()// this for the window/linux os. 
  app.on('activate', () => {// This is for mac os.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
//Source file selector
ipcMain.handle('select-source', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  
  if (canceled) {
    return null;  // user canceled, return null
  }
  console.log(filePaths);
  console.log(filePaths[0]);
  sourcefile=filePaths[0];
  return filePaths[0];  // return first selected path
});
//Destination file selector
ipcMain.handle('select-destination', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  
  if (canceled) {
    return null;  // user canceled, return null
  }
  console.log(filePaths);
  console.log(filePaths[0]);
  destinationfile=filePaths[0];
  return filePaths[0];  // return first selected path
});
function Checkpermissions(){
  //Checks for the permission of the file
   try{
    fs.access('sourcefile',fs.constants.R_OK || fs.constants.W_OK)
    return true;
   }
   catch{
    return false;
   }
}
ipcMain.handle('Start-Sync',async (event)=>{
  let watcher=chokidar.watch(sourcefile,{
    persistent:true,
    ignoreInitial:true
  })
  if(!Checkpermissions){
    return 'Permission denied';
  }
  watcher.on('change',path=>{
    console.log(`File ${path} has been changed`);
    
    mainWindow.webContents.send('Sync-Status', 'Source file changes are detected,Syncing of file in progress....');
    
    const stream=fs.createReadStream(sourcefile,'utf-8');
    const writable=fs.createWriteStream(destinationfile,'utf-8');
    stream.on('data',chunk=>{
      console.log('Detecting the Change....');
      writable.write(chunk);
      console.log('File Synced Successfully');
      mainWindow.webContents.send('Sync-Status', 'Changes are successfully updated in the destination file');
    });
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})