const { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage  } = require('electron');
const { autoUpdater } = require('electron-updater');
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
const { registerGlobal, unregisterGlobal } = require("electron-shortcuts");

app.setAsDefaultProtocolClient('whatsapp');
app.setAppUserModelId(app.name);

let mainWindow, tray, icon;

let hotkeyStore = new Store({
	name: 'hotkeys',
	fileExtension: '',
	watch: true,
	defaults: {
		shortcuts: [
			'F2',
			'F5'
		],
		hotkeys: []
	}
});

let shortcuts = hotkeyStore.get('shortcuts');
let hotkeys = hotkeyStore.get('hotkeys');

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
		loadURL(mainWindow);
	};

	process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
	
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
	
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});
};

// Create Single Instance App
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

		// Start with args
		let arg = process.argv[1];

		switch (arg) {
			case '-min':
				mainWindow.hide();
				break;
			default: 
				break;
		}

		// Insert Webview Preload
		mainWindow.webContents.on('will-attach-webview', (e, webPreferences) => {
			webPreferences.preload = path.join(__dirname, '/public/assets/webview-preload.js');
		});

		// Register Shortcuts & Hotkeys
		for (let shortcut of shortcuts) {
			registerGlobal(shortcut, () => {
				if (mainWindow.isFocused()) {
					mainWindow.webContents.send('hotkey', shortcut);
				};
			});
		};
		if (hotkeys) {
			for (let hotkey of hotkeys) {
				registerGlobal(hotkey, () => {
					if (mainWindow.isFocused()) {
						mainWindow.webContents.send('hotkey', hotkey);
					};
				});
			};
		};

		// Tray Icon
		icon = isDev() ? './resources/icon.ico': `${path.dirname(process.execPath)}/resources/icon.ico`;
		tray = new Tray(icon);

		const trayMenu = Menu.buildFromTemplate([
			{label: 'WhazzApp', enabled: false},
			{ type: 'separator' },
			{ label: 'Hide', click: () => {mainWindow.hide()} },
			{ label: 'Exit', click: () => {app.quit()} }
		]);
  
		tray.setContextMenu(trayMenu);
		tray.setToolTip(app.name);

		tray.on('click', () => {
			!mainWindow.isFocused() || !mainWindow.isFocused() ? mainWindow.show() : '';
		});
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
	return { appName: app.name, version: app.getVersion() };
});

hotkeyStore.onDidChange('hotkeys', (newValue, oldValue) => {
	hotkeys = newValue;
	let difference = oldValue.filter(x => !newValue.includes(x))[0];

	if (difference) {
		unregisterGlobal(difference);
	}

	if (hotkeys != []) {
		for (let hotkey of hotkeys) {
			registerGlobal(hotkey, () =>  {
				if (mainWindow.isFocused()) {
					mainWindow.webContents.send('hotkey', hotkey);
				};
			});
		};
	};
});