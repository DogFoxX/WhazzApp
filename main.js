const { app, BrowserWindow } = require('electron')
require("@electron/remote/main").initialize()
const windowStateKeeper = require('electron-window-state')
const serve = require('electron-serve')
const loadURL = serve({ directory: 'public' })
const gotTheLock = app.requestSingleInstanceLock()
const contextMenu = require('electron-context-menu')
const Store = require('electron-store')
const fs = require('fs')
const path = require('path')
const insertCSS = fs.readFileSync(path.join(__dirname, '/public/webview.css'), 'utf-8')

new Store()

let mainWindow

function isDev() {
	return !app.isPackaged
}

// Main Window
function createWindow() {
	let mainWindowState = windowStateKeeper({
		defaultWidth: 1200,
		defaultHeight: 800
	})

	mainWindow = new BrowserWindow({
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
		minWidth: 1200,
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
		mainWindow.show()
	})
}

// Single Instance 
if (!gotTheLock) {
	app.quit()
}
else {
	app.on('second-instance', () => {
		if (mainWindow) {
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
		// Include any other code here. Good place to check for updates when the app starts
	})
}

// Context menu
contextMenu({
	showLookUpSelection: false,
	showSearchWithGoogle: false,
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
