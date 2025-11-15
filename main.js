const { app, BrowserWindow ,ipcMain,dialog,webContents} = require('electron')
const chokidar=require('chokidar');
const {exec}=require('child_process');
const fs=require('fs');
const path = require('path');
const { setInterval } = require('timers/promises');
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
// Checks read/write permissions for a given file path
function checkPermissions(filePath) {
  if (!filePath) return false;
  try {
    fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}
ipcMain.handle('Open-Vs-Code',async(event,pathfile)=>{
  if (!pathfile) return 'Select the Source file';
  // return a promise so the renderer receives the result when exec completes
  return new Promise((resolve) => {
    exec(`code "${pathfile}"`, (error) => {
      if (error) {
        resolve(error.message || 'Failed to open VS Code');
        return;
      }
      resolve('VS Code opened successfully');
    });
  });
});
// Simple date formatter to avoid relying on Intl options that may not be
// consistent across Electron builds. Produces DD-MM-YYYY HH:MM:SS
function formatDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

ipcMain.handle('Start-Sync', async (event) => {
  if (!checkPermissions(sourcefile)) {
    return 'permission denied';
  }

  const watcher = chokidar.watch(sourcefile, {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('change', (changedPath) => {
    console.log(`File ${changedPath} has been changed`);

    // Send initial detection messages
    const ts = formatDate(new Date());
    mainWindow.webContents.send('Sync-Status', `Changes detected in source file at ${ts}`)
    try {
      const stream = fs.createReadStream(sourcefile, 'utf-8');
      const writable = fs.createWriteStream(destinationfile, 'utf-8');
      
      stream.on('data', (chunk) => {
        console.log('Writing changes to destination file...');
        writable.write(chunk);
      });

      stream.on('end', () => {
        console.log('File Sync Completed');
        mainWindow.webContents.send('Sync-Status', 'File synchronization completed successfully');
      });

      stream.on('error', (error) => {
        console.error('Error during sync:', error);
        mainWindow.webContents.send('Sync-Status', `Error during sync: ${error.message}`);
      });
    } catch (error) {
      console.error('Error setting up file sync:', error);
      mainWindow.webContents.send('Sync-Status', `Failed to start sync: ${error.message}`);
    }
  });

  return 'watcher started';
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})