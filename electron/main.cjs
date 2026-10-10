// Windows desktop shell: loads the offline web build from disk.
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

app.setAppUserModelId('krd.health.cancerscreening');

// One running copy only: a second launch focuses the existing window.
if (!app.requestSingleInstanceLock()) app.quit();

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 820,
    minWidth: 360,
    minHeight: 480,
    show: false,
    backgroundColor: '#f6f7f9',
    title: 'Cancer Screening Guide',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, '..', 'dist-electron', 'index.html'));
  // Open external links (guideline sources) in the default browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) {
      e.preventDefault();
      if (/^https:\/\//.test(url)) shell.openExternal(url);
    }
  });
}

app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
