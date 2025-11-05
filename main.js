const { app, BrowserWindow ,ipcMain,dialog} = require('electron')
const chokidar=require('chokidar');
const fs=require('fs');
const path = require('path')
ipcMain.handle('data-change',async(event,message)=>{
  console.log(message);
  return 'Recieve your message'
})
let sourcefile="";
let destinationfile="";
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:false
    }
  })

  win.loadURL('http://localhost:5173/')
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
     const stream=fs.createReadStream(sourcefile,'utf-8');
     const writable=fs.createWriteStream(destinationfile,'utf-8');
     stream.on('data',chunk=>{
        console.log('Detecting the Change....');
        // console.log(chunk);
        writable.write(chunk);
        console.log('File Synced Successfully');
     })
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})