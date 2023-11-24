const { BrowserWindow, app, ipcMain, nativeTheme, Notification } = require('electron');
const { initRenderer } = require('electron-store');
const serve = require('electron-serve');
const loadURL = serve({ directory: "." });
const windowState = require('electron-window-state');
const contextMenu = require("electron-context-menu");
const { readFileSync } = require('fs');
const insertCSS = readFileSync(`${__dirname}/webview.css`, 'utf-8');
const { autoUpdater } = require('electron-updater');
const { setInterval } = require('timers');

// Set Modal ID
app.setAppUserModelId(app.name);

// Initialize Store
initRenderer();

// Keep global reference to main window
let mainWindow

const isDev = () => {
	return !app.isPackaged;
};

// Create Main Window
const createWindow = () => {
    // Set default width and height values
    let mainWindowState = new windowState({
        defaultHeight: 600,
        defaultHeight: 800
    })

    // Create the browser window
    mainWindow = new BrowserWindow({
        x:mainWindowState.x,
        y: mainWindowState.y,
        height: mainWindowState.height,
        width: mainWindowState.width,
		backgroundColor: nativeTheme.shouldUseDarkColors ? '#111B22' : '#F0F2F5',
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			color: '#FFFFFF00',
			symbolColor: '#F0F2F5',
			height: 36
		},
		minHeight: 235,
		minWidth: 550,
        webPreferences: {
            webviewTag: true,
            contextIsolation: false,
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: `${__dirname}/api.cjs`
        },
        show: false
    })

    // Save the last window state (width, height, x posistion, y position)
	mainWindowState.manage(mainWindow);

	// This block of code is intended for development purpose only.
	// Delete this entire block of code when you are ready to package the application.
	if (isDev()) {
		// Open the DevTools
		mainWindow.webContents.openDevTools({ mode: 'detach' })

		// Configure AutoUpdater for Development testing
		autoUpdater.autoDownload = false
		autoUpdater.forceDevUpdateConfig = `${__dirname}\\dev-app-update.yml`
		
		// Set the window icon while in development.
		// Not needed when packaged. Replace icon.ico in ./resources with your own.
		// Icon is set in electron-builder.yml
		mainWindow.setIcon('./resources/icon.ico');
		
		mainWindow.loadURL('http://localhost:5000/');
	} else {
		loadURL(mainWindow);
	};

	// Uncomment the following line of code when app is ready to be packaged
	// loadURL(mainWindow);
	
	//Prevent context menu
	// mainWindow.on("system-context-menu", (e) => {
	// 	e.preventDefault();
	// })

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
	
	// Emitted when the window is ready to be shown
	// This helps in showing the window gracefully.
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});
}

// Set the Context Menu
contextMenu({
	showLookUpSelection: false,
	showSearchWithGoogle: true,
	showCopyImage: true,
});

app.on('ready', () => {
    createWindow();
	mainWindow.webContents.openDevTools({ mode: 'detach' })

	// Insert Webview Preload
	mainWindow.webContents.on('will-attach-webview', (e, webPreferences) => {
		webPreferences.preload = `${__dirname}/webview-preload.js`;
	});

	// Handle AutoUpdates
	autoUpdater.checkForUpdates()

	// Create interval
	let updateInterval = setInterval(() => { autoUpdater.checkForUpdates() }, 900000);

	// Clear interval when update available
	autoUpdater.on("update-available", (updateInfo) => {
		clearInterval(updateInterval);
	})

	// Notify user when update is ready to install
	autoUpdater.on("update-downloaded", () => {
		const notification = new Notification({
			title: "New version of WhazzApp Available",
			body: "Click to install the latest version of WhazzApp"
		})

		notification.show();

		// Install on notification click
		notification.on('click', () => {
			autoUpdater.quitAndInstall()
		})
	})

	// 
})

app.on('web-contents-created', (e, contents) => {
	if (contents.getType() == 'webview') {
		
		// Get WebView Title
		
		// Set User Agent
		contents.session.webRequest.onBeforeSendHeaders((details, callback) => {
			details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.5845.82 Safari/537.36';
			callback({ cancel: false, requestHeaders: details.requestHeaders });
		});

		// Insert Custom CSS
		contents.on('dom-ready', () => {
			contents.insertCSS(insertCSS);
		});

		// Load number
		ipcMain.handle('load-number', (e, data) => {
			contents.loadURL(`https://web.whatsapp.com/send?phone=${data}`)
		})
		
		// set context menu in webview
		contextMenu({
			showLookUpSelection: false,
			showSearchWithGoogle: false,
			window: contents
		});
	};
});

// IPC handles
ipcMain.on('theme/set', (e, mode) => {
	mainWindow.webContents.send('theme/set', mode);
});