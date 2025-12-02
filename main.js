const { app, BrowserWindow ,ipcMain,dialog,webContents, autoUpdater} = require('electron')
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
    width:800 ,
    height: 800,
    icon:path.join(__dirname,'Live-Sync/public/logo3.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:false
    }
  })
  // window.menubar=false;
  mainWindow.menuBarVisible=false;
  // Load the built dist folder using file:// protocol with proper path
  const distPath = path.join(__dirname, 'Live-Sync/dist/index.html');
  mainWindow.loadFile(distPath);
  // For development, use: mainWindow.loadURL('http://localhost:5173/')
  
  // Open DevTools for debugging (comment out for production)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow()// this for the window/linux os. 
  app.on('activate', () => {// This is for mac os.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  // autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.on('update-available',()=>{
      console.log("Update available...")
  })
  autoUpdater.on('update-downloaded',()=>{
      console.log("Update downloaded. It will be installed on restart");
      autoUpdater.quitAndInstall();
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
  sourcefile=filePaths[0];
  return filePaths[0];  // return first selected path
});
//Createing the temporary file
ipcMain.handle('Create-File', async (event, pathfile) => {
  if (!pathfile) {
    return { ok: false, error: 'No file path provided' };
  }

  try {
    // Check if file exists and has write permissions
    if (fs.existsSync(pathfile)) {
      if (!checkPermissions(pathfile)) {
        return { ok: false, error: 'File exists but does not have write permissions' };
      }
    } else {
      // Check if parent directory has write permissions for creating new file
      const dir = path.dirname(pathfile);
      if (!checkPermissions(dir)) {
        return { ok: false, error: 'Directory does not have write permissions' };
      }
    }

    fs.writeFileSync(pathfile, '', { mode: 0o666 });
    return { ok: true, message: 'File created successfully' };
  } catch (err) {
    console.error('Error creating file:', err);
    return { ok: false, error: err.message };
  }
});
//Destination file selector
ipcMain.handle('select-destination', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  
  if (canceled) {
    return null;  // user canceled, return null
  }
  destinationfile=filePaths[0];
  return filePaths[0];  // return first selected path
});
// Checks read/write permissions for a given file path
function checkPermissions(filePath) {
  if (!filePath) return false;
  try {
    // Check for read AND write permissions using bitwise OR (correct for fs.constants)
    fs.accessSync(filePath, fs.constants.R_OK & fs.constants.W_OK);
    return true;
  } catch (err) {
    console.error(`Permission check failed for ${filePath}:`, err.message);
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

ipcMain.handle('Start-Sync', async (event, pathfile) => {
  if (!checkPermissions(pathfile)) {
    return 'permission denied';
  }

  // Close any existing watcher before starting a new one
  if (fileWatcher) {
    try {
      await fileWatcher.close();
    } catch (e) {
      console.warn('Error closing previous watcher:', e);
    }
  }

  fileWatcher = chokidar.watch(pathfile, {
    persistent: true,
    ignoreInitial: true,
  });

  fileWatcher.on('change', (changedPath) => {
    // Send initial detection messages
    const ts = formatDate(new Date());
    mainWindow.webContents.send('Sync-Status', `Changes detected in the source file at ${ts}`);
    try {
      const stream = fs.createReadStream(pathfile, 'utf-8');
      const writable = fs.createWriteStream(destinationfile, 'utf-8');
      
      stream.on('data', (chunk) => {
        writable.write(chunk);
      });

      stream.on('end', () => {
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
});;

// Store watcher reference so we can close it
let fileWatcher = null;

ipcMain.handle('Stop-Watcher', async (event) => {
  if (fileWatcher) {
    try {
      await fileWatcher.close();
      fileWatcher = null;
      console.log('File watcher stopped');
      return { ok: true, message: 'Watcher stopped' };
    } catch (err) {
      console.error('Error closing watcher:', err);
      return { ok: false, error: err.message };
    }
  }
  return { ok: true, message: 'No active watcher' };
});

ipcMain.handle('Stop-Sync', async (event, pathfile) => {
  try {
    // Stop the watcher first
    if (fileWatcher) {
      await fileWatcher.close();
      fileWatcher = null;
      console.log('Watcher closed');
    }

    // Delete the file
    if (pathfile && fs.existsSync(pathfile)) {
      fs.unlinkSync(pathfile);
      console.log(`File deleted: ${pathfile}`);
    }

    return { ok: true, message: 'Successfully stopped sync and deleted the temporary file' };
  } catch (err) {
    console.error('Error stopping sync:', err);
    return { ok: false, error: err.message };
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})