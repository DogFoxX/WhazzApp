<script>
	// Imports
	import { onMount } from 'svelte'
	import Modal from '../modal'
	import NumberSearchForm from './number-search/number-search-form.svelte'
	import QuickRepliesForm from "./quick-replies/quick-replies-form.svelte"
	import AccountsUsers from './accounts-users/accounts-users.svelte'


	// Misc
	const { ipcRenderer } = require('electron')
	const currentWindow = require('@electron/remote').getCurrentWindow()
	const remote = require('@electron/remote')
	const path = require('path')
	const fs = require('fs')

	// Electron Store
	const Store = require('electron-store')

	export let accStore = new Store({
		name: 'accounts',
		cwd: 'Partitions',
		// encryptionKey: randomstring.generate({charset: 'hex', capitalization: 'uppercase'}),
		fileExtension: '',
		watch: true,
		defaults: {
			'accounts': []
		}
	})

	accStore.onDidAnyChange(() => {
		accounts = accStore.get('accounts')
	})

	export let settStore = new Store({
		name: 'settings',
		cwd: 'Partitions',
		fileExtension: '',
		defaults: {
			settings: {
				countryCode: {
					name: 'Mongolia',
					code: '+976',
					flag: 'flag-icon-mn'
				}
			}
			
		}
	})

	// Exports
	//let contents = fs.readFileSync(`${path.dirname(remote.app.getAppPath())}\\country-codes.json`)
	//countryCodes = JSON.parse(contents)
	export let accounts = accStore.get('accounts'),
		settings = settStore.get('settings'),
		replyStore,
		quickReplies = [],
		countryCodes = require('./resources/country-codes.json')

	// Global Variables
	let i,
		title = 'WhazzApp',
		isMax = Boolean,
		webview,
		messageCount = 0,
		AppDetails = [],
		updateDone = false,
		updateDownloaded = false,
		updateMsg = 'Checking for update...'

	// Functions on Mount
	onMount(() => {
		currentWindow.isMaximized() ? isMax = true : isMax = false
		getDetails()

		if (accounts != '') {
			document.body.style.backgroundImage = 'none'
			for (i in accounts) {
				if (accounts[i].active) {
					replyStore = new Store({
						name: 'quick-replies',
						cwd: `Partitions/${accounts[i].id}`,
						// encryptionKey: randomstring.generate({charset: 'hex', capitalization: 'uppercase'}),
						fileExtension: '',
						watch: true,
						defaults: {
							'quick-replies': []
						}
					})
				}
			}
			quickReplies = replyStore.get('quick-replies')
		}
	})

	// Get Webview Title and Theme
	ipcRenderer.on('title-updated', (e, messages) => {
		title = currentWindow.getTitle()
		messageCount = messages
	})

	ipcRenderer.on('theme', (e, color) => {	
		document.body.setAttribute('data-theme', color)
	})

	// Window Functions
	const windowResize = () => {
		currentWindow.isMaximized() ? isMax = true : isMax = false
	}

	const windowAction = (e) => {
		if (e.target.id == 'close') {
			currentWindow.close()
		}
		if (e.target.id == 'min') {
			currentWindow.minimize()
		}
		if (e.target.id == 'max') {
			currentWindow.isMaximized() ? currentWindow.restore() : currentWindow.maximize()
		}
	}

	// Functions
	const numberSearch = (result) => {
		if (result) {
			let number = result
			let code = settings.countryCode.code
			let url = 'https://web.whatsapp.com/send?phone='

			if (number.startsWith(code)) { number = number.substring(code.length) }
			if (/\s/.test(number)) { number = number.replace(/\s/g, '') }
			if (number.startsWith('0')) { number = number.substring(1) }

			url = `${url}${code}${number}`
			webview.loadURL(url)
		}
	}

	// Country Codes & Quick Replies functions
	const listButtonClick = (args) => {
        if (args.id == 'country-btn') {
			settings.countryCode =  {
				name: args.name,
				code: args.code,
				flag: args.flag
			}
			settStore.set('settings', settings)
			settings = settStore.get('settings')
		}
		else if (args.id == 'quickReply-btn') {
			navigator.clipboard.writeText(args.value)
		}
    }

	const refreshWebview = () => {
		webview.reload()
	}

	// Updates
	const getDetails = async () => {
    	const result = await ipcRenderer.invoke('get-details')
    	AppDetails = result
	}
	
	ipcRenderer.on('checking-for-update', (e) => {
		updateDone = false
		updateDownloaded = false
		updateMsg = 'Checking for update...'
	})

	ipcRenderer.on('update-available', (e, releaseVersion) => {
		updateDone = false
		updateDownloaded = false
		updateMsg = `Downloading update ${releaseVersion}...`
	})
	
	ipcRenderer.on('no-update', (e) => {
		updateDone = true
		updateDownloaded = false
		updateMsg = 'Up To Date'
	})
	
	ipcRenderer.on('update-downloaded', (e, releaseVersion) => {
		updateDone = true
		updateDownloaded = true
		updateMsg = `Update ${releaseVersion} downloaded. `
	})
	
	const restart = () => {
		ipcRenderer.send('restart')
	}

	// URL Protocol
	ipcRenderer.on('url-protocol', (e, url) => {
		webview.loadURL(url)
	})
</script>

<svelte:window on:resize={windowResize} />

<div class="title-bar">
	<p class="title">{title}</p>
	<div class="title-bar-btns">
		<button on:click={windowAction} class="btn" id="min">
			<svg width="10px" height="2px">
				<line x1="10" stroke="white" stroke-width="2"/>
			</svg>
		</button>
		<button on:click={windowAction} class="btn" id="max">
			{#if isMax}
				<svg width="12px" height="12px" viewBox="0 0 963 963">
					<path fill="white" d="M241 331l90 0 301 0 0 301 0 90 0 150 -542 0 0 -542 150 0zm90 -241l542 0 0 542 -150 0 0 -391 -391 0 0 -150zm391 632l241 0 0 -722 -722 0 0 241 -241 0 0 722 722 0 0 -241z"/>
				</svg>
			{:else}
				<svg width="10px" height="10px">
					<rect width="10" height="10" fill="none" stroke="white" stroke-width="2" />
				</svg>
			{/if}
		</button>
		<button on:click={windowAction} class="btn" id="close">
			<svg width="10px" height="10px">
				<line x1="0" y1="10" x2="10" y2="0" stroke="white" stroke-width="1"/>
				<line x1="0" y1="0" x2="10" y2="10" stroke="white" stroke-width="1"/>
			</svg>
		</button>
	</div>
</div>

<Modal>
<main>
    <div class="header">
		<div class="left-align">
			<NumberSearchForm {settings} {countryCodes} {numberSearch} {listButtonClick} />
			<QuickRepliesForm {quickReplies} {listButtonClick} />			
		</div>
        <div class="right-align">
			<AccountsUsers {accStore} {accounts} />
			<button class="fa-btn fa-solid fa-gear"></button>
		</div>
    </div>
	<div class="whatsapp-window">
		{#if accounts}
			{#each accounts as account}
				{#if account.active}
					<webview bind:this={webview} src="https://web.whatsapp.com" partition={`persist:${account.id}`}></webview>
				{/if}
			{/each}
        {/if}
    </div>
</main>
</Modal>

<div class="status-bar">
	<div class="left-align">
		<div class="status-bar-item" title="Messages">
			<i class="fa-solid fa-envelope" id="message-count"></i>
			<label for="message-count">{messageCount}</label>
		</div>
		<div class="status-bar-item" title="WhatsApp Account">
			<i class="fa-brands fa-whatsapp" id="whatsapp-account"></i>
			<label for="whatsapp-account">
				{#each accounts as account}
					{#if account.active}
						{account.name}
					{/if}
				{/each}
			</label>
		</div>
		<div class="status-bar-item" title="Refresh WhatsApp">
			<button on:click={refreshWebview} class="webview-reload fa-regular fa-arrows-rotate"></button>
		</div>
	</div>
	<div class="right-align">
		<div class="status-bar-item">
				<p>{updateMsg}</p>
				{#if !updateDone}
					<svg class="spinner" width="14px" height="14px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
						<circle class="path" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
					</svg>
				{:else}
					{#if updateDone && updateDownloaded}
						<p on:click={restart} class="restart-btn">Restart and Install</p>
					{/if}
					<i class="sync-success fa-regular fa-check"></i>
				{/if}
		</div>
		<div class="status-bar-item">
			<p class="author">{AppDetails.author} | {AppDetails.appName} v{AppDetails.version}</p>
		</div>
	</div>
</div>

<style>
	
</style>