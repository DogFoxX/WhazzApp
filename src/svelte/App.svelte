<script>
	// Imports
	import { onMount } from "svelte"
	import Modal from '../modal'
	import NumberSearchForm from './number-search/number-search-form.svelte'
	import QuickRepliesForm from "./quick-replies/quick-replies-form.svelte"

	// Misc
	const { ipcRenderer } = require('electron')
	const currentWindow = require('@electron/remote').getCurrentWindow()
	const randomstring = require("randomstring")

	// Electron Store
	const Store = require('electron-store')

	let accStore = new Store({
		name: 'accounts',
		cwd: 'Partitions',
		// encryptionKey: randomstring.generate({charset: 'hex', capitalization: 'uppercase'}),
		fileExtension: '',
		defaults: {
			'accounts': []
		}
	})

	let settStore = new Store({
		name: 'settings',
		cwd: 'Partitions',
		fileExtension: '',
		defaults: {
			settings: 
				{
					countryCode: {
						name: 'United States',
						code: '+1',
						flag: 'flag-icon-us'
					}
					
				}
			
		}
	})

	// accStore.set('accounts', [{
	// 	id: randomstring.generate({charset: 'hex', capitalization: 'uppercase'}),
	// 	name: 'Christiaan Claassen',
	// 	active: true,
	// 	users: [
	// 		{
	// 			name: 'Christiaan Claassen',
	// 			active: true
	// 		}
	// 	]
	// }])

	// Exports
	export let accounts = accStore.get('accounts'),
		settings = settStore.get('settings'),
		replyStore,
		quickReplies = [],
		countryCodes = require('./resources/country-codes.json')


	let i,
		title,
		isMax = Boolean,
		webview,
		messageCount = 0

	onMount(() => {
		currentWindow.isMaximized() ? isMax = true : isMax = false

		if (accounts != '') {
			for (i in accounts) {
				if (accounts[i].active) {
					replyStore = new Store({
						name: 'quick-replies',
						cwd: `Partitions/${accounts[i].id}`,
						// encryptionKey: randomstring.generate({charset: 'hex', capitalization: 'uppercase'}),
						fileExtension: '',
						defaults: {
							'quick-replies': []
						}
					})
				}
			}
			quickReplies = replyStore.get('quick-replies')
		}
	})

	ipcRenderer.on('title-updated', (e, messages) => {
		title = currentWindow.getTitle()
		messageCount = messages
	})

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

	const refreshWebview = () => {
		webview.reload()
	}
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
			<NumberSearchForm {settings} {accounts} {countryCodes} />
			<QuickRepliesForm {quickReplies} />			
		</div>
        <div class="right-align">
			{#if accounts != ''}
				{#each accounts as account}
					{#if account.active}
						{#if account.users != ''}
							{#each account.users as user}
								{#if user.active}
									<p class="user-name">{user.name}</p>
								{/if}
							{/each}
						{:else}
							<p class="user-name">{account.name}</p>
						{/if}
					{/if}
				{/each}
			{/if}
			<button class="fa-btn fa-solid fa-user"></button>
			<button class="fa-btn fa-solid fa-gear"></button>
		</div>
    </div>
	<div class="whatsapp-window">
		{#if accounts}
			{#each accounts as account}
				{#if account.active}
					<webview bind:this={webview} src="https://web.whatsapp.com"  partition={`persist:${account.id}`}></webview>
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
			<button on:click={refreshWebview} class="fa-regular fa-arrows-rotate"></button>
		</div>
	</div>
	<div class="right-align">
		<div class="status-bar-item">
			<p>Up To Date</p><i style="margin:0; margin-left:10px" class="sync-success fa-regular fa-check"></i>
		</div>
		<div class="status-bar-item">
			<p class="author">DogFoxX | WhazzApp v0.9.0</p>
		</div>
	</div>
</div>

<style>
	
</style>