const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#1e1e1e',
    show: false
  });

  // Remove application menu
  Menu.setApplicationMenu(null);

  // Load the React app
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from app.asar (client folder was copied from client/dist)
    const distPath = path.join(__dirname, 'client', 'index.html');
    console.log('Loading from:', distPath);
    mainWindow.loadFile(distPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Terminus App started successfully');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  // In production, backend is in extraResources (resources/backend)
  const isDev = !app.isPackaged;
  let backendPath;

  if (isDev) {
    // In development, backend is next to main.js
    backendPath = path.join(__dirname, 'backend');
  } else {
    // In production, backend is in resources folder (extraResources)
    backendPath = path.join(process.resourcesPath, 'backend');
  }

  console.log('[Main] Backend path:', backendPath);
  console.log('[Main] Is development:', isDev);

  // Use cmd.exe explicitly on Windows to avoid spawn ENOENT error
  const shellCmd = process.platform === 'win32' ? process.env.COMSPEC || 'cmd.exe' : '/bin/sh';
  backendProcess = spawn(shellCmd, ['/c', 'node', 'src/index.js'], {
    cwd: backendPath,
    shell: false,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: isDev ? 'development' : 'production' }
  });

  backendProcess.on('error', (err) => {
    console.error('[Main] Backend process error:', err);
  });

  backendProcess.on('close', (code) => {
    console.log(`[Main] Backend process exited with code ${code}`);
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('get-backend-url', () => {
  return 'http://localhost:3001';
});

// Window controls
ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});
