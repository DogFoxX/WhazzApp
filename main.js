const { app, BrowserWindow, ipcMain } = require('electron');
require("@electron/remote/main").initialize();
const windowStateKeeper = require('electron-window-state');
const serve = require('electron-serve');
const loadURL = serve({ directory: 'public' });
const gotTheLock = app.requestSingleInstanceLock();
const contextMenu = require('electron-context-menu');
const Store = require('electron-store');
const fs = require('fs');
const path = require('path');
const insertCSS = fs.readFileSync(path.join(__dirname, '/public/css/webview.css'), 'utf-8');

app.setAsDefaultProtocolClient('whatsapp');
app.setAppUserModelId(app.name);

let mainWindow;

new Store();

function isDev() {
	return !app.isPackaged;
};

// Main Window
function createWindow() {
	// Set default width and height values
	let mainWindowState = windowStateKeeper({
		defaultWidth: 800,
		defaultHeight: 600
	});
	
	// Create the browser window.
	mainWindow = new BrowserWindow({
		title: app.name,
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
		minWidth: 816,
		minHeight: 679,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
			webviewTag: true
		},
		frame: false,
		show: false
	});
	
	require("@electron/remote/main").enable(mainWindow.webContents);
	mainWindow.removeMenu();
	mainWindowState.manage(mainWindow);
	
	if (isDev()) {
		mainWindow.openDevTools();
		
		mainWindow.setIcon('./resources/icon.ico');
		
		mainWindow.loadURL('http://localhost:5000/');
	}
	else {
		loadURL(mainWindow)
	};

	process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
	
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
	
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});
};

if (!gotTheLock) {
	app.quit();
}
else {
	app.on('second-instance', () => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.focus();
			}
			else {
				mainWindow.show();
			}
		};
	});
	
	app.on('ready', () => {
		createWindow();
		// Include any other code here. Good place to check for updates when the app starts
		mainWindow.webContents.on('will-attach-webview', (e, webPreferences) => {
			webPreferences.preloadURL = path.join(__dirname, '/public/assets/webview-preload.js')
		})
	});
};

// Context menu
contextMenu({
	showLookUpSelection: false,
	showSearchWithGoogle: false,
});

// Webview
ipcMain.on('theme', (e, color) => {
	mainWindow.webContents.send('theme', color);
});

ipcMain.on('webview-keydown', (e, key) => {
	mainWindow.webContents.send('webview-keydown', key);
});

app.on('web-contents-created', (e, contents) => {
	if (contents.getType() == 'webview') {
		
		// Get WebView Title
		contents.on('page-title-updated', () => {
			let webviewTitle = contents.getTitle();
			let messageCount;
			let regex = /\d/g;
			if (regex.test(webviewTitle)) {
				messageCount = webviewTitle.replace(/\D/g, "");
				mainWindow.setTitle(`(${messageCount}) ${app.name}`);
			}
			else {
				mainWindow.setTitle(app.name);
			};
			mainWindow.webContents.send('title-updated');
		});
		
		// Set User Agent
		contents.session.webRequest.onBeforeSendHeaders((details, callback) => {
			details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.143 Safari/537.36';
			callback({ cancel: false, requestHeaders: details.requestHeaders });
		});
		
		// Insert Custom CSS
		contents.on('dom-ready', () => {
			contents.insertCSS(insertCSS);
		});

		// Open Links
		contents.setWindowOpenHandler(({ url }) => {
			shell.openExternal(url);
		});
		
		// set context menu in webview
		contextMenu({
			showLookUpSelection: false,
			showSearchWithGoogle: false,
			window: contents
		});
	};
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// Get App Details
ipcMain.handle('get-details', async () => {
	return {author: 'DogFoxX', appName: app.name, version: app.getVersion()};
});
