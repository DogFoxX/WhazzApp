const { app, BrowserWindow, ipcMain, shell } = require('electron')
require("@electron/remote/main").initialize()
const { autoUpdater } = require("electron-updater")
const windowStateKeeper = require('electron-window-state')
const serve = require('electron-serve')
const loadURL = serve({ directory: 'public' })
const gotTheLock = app.requestSingleInstanceLock()
const contextMenu = require('electron-context-menu')
const Store = require('electron-store')
const fs = require('fs')
const path = require('path')
const insertCSS = fs.readFileSync(path.join(__dirname, '/public/css/webview.css'), 'utf-8')

app.setAsDefaultProtocolClient('whatsapp')

new Store()

let mainWindow, interval

function isDev() {
	return !app.isPackaged
}

// Main Window
function createWindow() {
	let mainWindowState = windowStateKeeper({
		defaultWidth: 1450,
		defaultHeight: 900
	})

	mainWindow = new BrowserWindow({
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
		minWidth: 900,
		minHeight: 800,
		webPreferences: {
			webviewTag: true,
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false
		},
		frame: false,
		show: false
	})
	
	require("@electron/remote/main").enable(mainWindow.webContents)
	mainWindow.removeMenu()
	mainWindowState.manage(mainWindow)
	
	if (isDev()) {
		mainWindow.openDevTools()
		mainWindow.setIcon('./resources/icon.ico')
		mainWindow.loadURL('http://localhost:5000/')
	}
	else {
		loadURL(mainWindow)
	}
	
	// Uncomment the following line of code when app is ready to be packaged
	// loadURL(mainWindow)
	
	process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true
	
	mainWindow.on('closed', function () {
		mainWindow = null
	})
	
	mainWindow.once('ready-to-show', () => {
			let arg = process.argv[1]
			if (arg == '-min') {
		  		mainWindow.hide()
			}
  
			// Open with Url Protocol
			else if (String(arg).startsWith('whatsapp://')) {
		  		mainWindow.show()
		  		let urlProtocol = String(arg).replace('whatsapp:/', 'https://web.whatsapp.com');
		  		mainWindow.webContents.send('url-protocol', urlProtocol);
			}
		
		else {
		  mainWindow.show()
		}
	})
}

// Single Instance 
if (!gotTheLock) {
	app.quit()
}
else {
	app.on('second-instance', (e, argv) => {
		if (mainWindow) {
			if (argv.find((arg) => arg.startsWith('whatsapp://'))) {
        		let urlProtocol = String(argv.find((arg) => arg.startsWith('whatsapp://')).replace('whatsapp:/', 'https://web.whatsapp.com'));
        		mainWindow.webContents.send('url-protocol', urlProtocol)
      		}
			if (mainWindow.isMinimized()) {
				mainWindow.focus()
			}
			else {
				mainWindow.show()
			}
		}
	})
	
	app.on('ready', () => {
		createWindow()

		mainWindow.webContents.on('will-attach-webview', (e, webPreferences) => {
			webPreferences.preloadURL = path.join(__dirname, '/public/assets/webview-preload.js')
		})
			
		autoUpdater.checkForUpdates()
		interval = setInterval(() => {
			autoUpdater.checkForUpdates()
		}, 300000)
	})
}

// Updates
ipcMain.handle('get-details', async () => {
	return {author: 'DogFoxX', appName: app.name, version: app.getVersion()}
})

autoUpdater.on('checking-for-update', () => {
	mainWindow.webContents.send('checking-for-update')
})

autoUpdater.on('update-available', (updateInfo) => {
	let releaseVersion = updateInfo.version
	mainWindow.webContents.send('update-available', releaseVersion)
	clearInterval(interval)
})

autoUpdater.on('update-not-available', () => {
	mainWindow.webContents.send('no-update')
})

autoUpdater.on('update-downloaded', (updateInfo) => {
	let releaseVersion = updateInfo.version
	mainWindow.webContents.send('update-downloaded', releaseVersion);
})

ipcMain.on('restart', (e) => {
	autoUpdater.quitAndInstall()
})

// Context menu
contextMenu({
	showLookUpSelection: false,
	showSearchWithGoogle: false,
})

// Webview
ipcMain.on('theme', (e, color) => {
	mainWindow.webContents.send('theme', color)
})
app.on('web-contents-created', (e, contents) => {
	if (contents.getType() == 'webview') {
		
		// Get WebView Title
		contents.on('page-title-updated', () => {
			let webviewTitle = contents.getTitle()
			let messageCount
			let regex = /\d/g
			if (regex.test(webviewTitle)) {
				messageCount = webviewTitle.replace(/\D/g, "")
				mainWindow.webContents.send('title-updated', (messageCount))
				mainWindow.setTitle(`(${messageCount}) ${app.name}`)
			}
			else {
				mainWindow.webContents.send('title-updated', (0))
				mainWindow.setTitle(app.name)
			}
		})
		
		// Set User Agent
		contents.session.webRequest.onBeforeSendHeaders((details, callback) => {
			details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
			callback({ cancel: false, requestHeaders: details.requestHeaders })
		})
		
		// Insert Custom CSS
		contents.on('dom-ready', () => {
			contents.insertCSS(insertCSS)
		})

		// Open Links
		contents.setWindowOpenHandler(({ url }) => {
			shell.openExternal(url);
		})
		
		// set context menu in webview
		contextMenu({
			showLookUpSelection: false,
			showSearchWithGoogle: false,
			window: contents
		})
	}
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
