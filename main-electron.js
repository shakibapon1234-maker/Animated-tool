const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn, spawnSync } = require('child_process');
const net = require('net');

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 4600;

function getNodeExecutable() {
  const result = spawnSync('where.exe', ['node.exe'], { encoding: 'utf8', windowsHide: true });
  const nodePath = (result.stdout || '').split(/\r?\n/).find(Boolean);
  return nodePath || 'node.exe';
}

function isServerAvailable(callback) {
  const probe = net.connect({ host: '127.0.0.1', port: SERVER_PORT });
  probe.once('connect', () => { probe.destroy(); callback(true); });
  probe.once('error', () => callback(false));
}

function waitForServer(callback, attempts = 20) {
  isServerAvailable((ready) => {
    if (ready || attempts <= 0) return callback();
    setTimeout(() => waitForServer(callback, attempts - 1), 200);
  });
}

function startServer(callback) {
  isServerAvailable((alreadyRunning) => {
    if (alreadyRunning) return callback();
    try {
      serverProcess = spawn(getNodeExecutable(), [path.join(__dirname, 'server.js')], {
        cwd: __dirname,
        stdio: 'ignore',
        windowsHide: true
      });
      serverProcess.on('error', () => {});
    } catch (_) {}
    waitForServer(callback);
  });
}

try {
  app.setAppUserModelId('com.shakib.animationlibrary');
} catch (_) {}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 960,
    minHeight: 620,
    title: "অ্যানিমেশন লাইব্রেরি — Shakib's Animation Studio",
    backgroundColor: '#05050c',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  // Handle external urls (e.g. video editor / google fonts)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(`http://127.0.0.1:${SERVER_PORT}/index.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer(() => {
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    try { serverProcess.kill(); } catch (_) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
