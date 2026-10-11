// Windows desktop shell: loads the offline web build from disk.
const { app, BrowserWindow, Menu, nativeTheme, session, shell } = require('electron');
const path = require('path');

app.setAppUserModelId('krd.health.cancerscreening');
// Always light, even when Windows is set to dark mode.
nativeTheme.themeSource = 'light';

// One running copy only: a second launch focuses the existing window.
if (!app.requestSingleInstanceLock()) app.quit();

let win = null;

// Only the app's own files and secure (https) connections are allowed; everything else is blocked.
function lockDownNetwork() {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const u = details.url;
    const ok =
      u.startsWith('file://') || u.startsWith('data:') || u.startsWith('blob:') || u.startsWith('devtools://') ||
      u.startsWith('https://') || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(u);
    callback({ cancel: !ok });
  });
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
}

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
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: !app.isPackaged,
      spellcheck: false,
    },
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
app.whenReady().then(() => {
  if (app.isPackaged) Menu.setApplicationMenu(null);
  lockDownNetwork();
  createWindow();
});
// No other windows or webviews may be created.
app.on('web-contents-created', (_e, contents) => {
  contents.on('will-attach-webview', (e) => e.preventDefault());
});
app.on('window-all-closed', () => app.quit());
