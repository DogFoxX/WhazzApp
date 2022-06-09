<script>
	// Imports
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
    import { expoIn } from 'svelte/easing';
	import { subMenuContent, dialog } from '../stores.js';
	import MainMenu from '../svelte/menus/main-menu.svelte';

	// Constants
	const { ipcRenderer, clipboard } = require('electron');
	const remote = require('@electron/remote');
	const mainWindow = require('@electron/remote').getCurrentWindow();
	const autoUpdater = remote.require('electron-updater').autoUpdater;
	const log = require('electron-log');
	const path = require('path');
	const Store = require('electron-store');
	const dateTimeVariables = {
			dateTime12h: new Date().toLocaleDateString(navigator.language, {
				weekday: 'short',
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: true
			}),
			dateTime24h: new Date().toLocaleDateString(navigator.language, {
				weekday: 'short',
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			}),
			dateLong: new Date().toLocaleDateString(navigator.language, {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			}),
			dateMed: new Date().toLocaleDateString(navigator.language, {
				weekday: 'short',
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			}),
			dateShort: new Date().toLocaleDateString(),
			time12h: new Date().toLocaleTimeString(navigator.language, {
				hour: '2-digit',
				minute: '2-digit',
				hour12: true
			}),
			time24h: new Date().toLocaleTimeString(navigator.language, {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			})
		};

	//#region Logger Settings
	log.transports.console.level = false;
	log.transports.file.format = '{m}/{d}/{y}, {h}:{i}:{s} [{level}]>> {text}';
	log.transports.file.resolvePath = () => path.join(remote.app.getPath('userData'), 'logs/update_log.log');
	//#endregion

	// Variables

	//#region Stores
	let settStore = new Store(
			{
				name: 'settings',
				cwd: 'Partitions',
				fileExtension: '',
				watch: true,
				defaults: {
					'windows-settings': {
						autoLaunch: true,
						startMin: false,
						minToTray: true
					},
					'updates': {
						allowPrerelease: false,
						autoDownload: true,
						checkUpdates: true,
						updateFreq: 900000
					},
					'country-code': {
						name: 'United States',
						code: '+1',
						flag: 'flag-icon-us'
					}
				}
			}
		),
		windowsSettings = settStore.get('windows-settings'),
		updates = settStore.get('updates'),
		countryCode = settStore.get('country-code');

	let accStore = new Store(
			{
				name: 'accounts',
				cwd: 'Partitions',
				fileExtension: '',
				watch: true,
				defaults: {
					'accounts': []
				}
			}
		),
		accounts = accStore.get('accounts'),
		accountName,
		userName;

	let hotkeyStore = new Store(
			{
				name: 'hotkeys',
				fileExtension: ''
			}
		);

	let replyStore,
		quickReplies = [];
	//#endregion

	let isMax = Boolean,
		menuOpen = Boolean(false),
		dropdownOpen = Boolean(false);

	let title = mainWindow.getTitle(),
		updateInterval,
		menu,
		menuBtn,
		webview,
		notification,
		notifyBtnAction;

	//#region Functions

	onMount(() => {
		mainWindow.isMaximized() ? isMax = true : isMax = false;
		
		getActiveAccountUser((result) => {
            accountName = result.account;
            userName = result.user;
        });
		
		createReplyStore();

		// Updater Settings
		autoUpdater.autoDownload = updates.autoDownload;
		autoUpdater.allowPrerelease = updates.allowPrerelease;
		autoUpdater.logger = log;
		autoUpdater.logger.transports.file.level = "info";
		autoUpdater.logger.transports.file.level = "debug";
		autoUpdater.logger.transports.file.level = "error";
		autoUpdater.logger.transports.file.level = "warn";

		windowsSett();
		updaterSett();
	});

	// Get Webview Title and Theme
	ipcRenderer.on('title-updated', () => {
		title = mainWindow.getTitle();
	});

	ipcRenderer.on('theme', (e, color) => {	
		document.body.setAttribute('theme', color);
	});

	//#region Window Functions
	const windowResize = () => {
		mainWindow.isMaximized() ? isMax = true : isMax = false;
	};

	const windowAction = (e) => {
		switch (e.target.id) {
			case 'close':
				windowsSettings.minToTray ? mainWindow.hide() : mainWindow.close();
				break;
			case 'min':
				mainWindow.minimize();
				break;
			case 'max':
				mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
				break;
			default:
				break;
		}
		webview ? webview.focus() : '';
	};

	const windowMousedown = (e) => {
		if (e.target.matches('.user-dropdown-list') || e.target.matches('#dropdown-btn') || e.target.matches('#dropdown-list-btn')) return;

		if (e.target.matches('*')) {
			dropdownOpen = false;
		};
	};

	const windowKeydown = (e) => {
		if (e.key === 'Escape') {
			if (dropdownOpen) {
				dropdownOpen = false;
			}
			else if ($subMenuContent.component && !$dialog.component) {
				subMenuContent.set({component: null, title: null})
			}
			else if ($dialog.component) {
				dialog.set({component: null, title: null})
			}
			else if (menuOpen && !dropdownOpen && !$subMenuContent.component && !$dialog.component) {
				menuOpen = false;
				menuBtn.classList.remove('active');
				webview ? webview.focus() : '';
			}
		};
	};

	ipcRenderer.on('hotkey', (e, key) => {
		switch (key) {
			case 'F2':
				openMenu();
				break;
			case 'F5':
				webview.reload();
				break;
			default:
				if (quickReplies != [] && accountName) {
					let name = quickReplies.filter(({hotkey}) => hotkey == key)[0].name;
					let value = quickReplies.filter(({hotkey}) => hotkey == key)[0].value;

					if (value.includes('{userName}')) {
						value = value.replaceAll('{userName}', userName);
					};
					if (value.includes('{dateTime12h}')) {
						value = value.replaceAll('{dateTime12h}', dateTimeVariables.dateTime12h);
					};
					if (value.includes('{dateTime24h}')) {
						value = value.replaceAll('{dateTime24h}', dateTimeVariables.dateTime24h);
					};
					if (value.includes('{dateLong}')) {
						value = value.replaceAll('{dateLong}', dateTimeVariables.dateLong);
					};
					if (value.includes('{dateMed}')) {
						value = value.replaceAll('{dateMed}', dateTimeVariables.dateMed);
					};
					if (value.includes('{dateShort}')) {
						value = value.replaceAll('{dateShort}', dateTimeVariables.dateShort);
					};
					if (value.includes('{time12h}')) {
						value = value.replaceAll('{time12h}', dateTimeVariables.time12h);
					};
					if (value.includes('{time24h}')) {
						value = value.replaceAll('{time24h}', dateTimeVariables.time24h);
					};
					
					clipboard.writeText(value);
					showNotify({text: `Copied: ${name}`, button: null}, true);
				};
				break;
		};
	});
	//#endregion

	//#region Menu Functions
	const openMenu = () => {
		menuOpen = !menuOpen;
		menuOpen ? menuBtn.classList.add('active') : menuBtn.classList.remove('active');
		webview ? menuOpen ? webview.blur() : webview.focus() : '';
	};

	const numberSearch = (e, number, code, callback) => {
		if (e.key === 'Enter') {
			if (number) {
				let url = 'https://web.whatsapp.com/send?phone='

				if (number.startsWith(code)) { number = number.substring(code.length) }
				if (/\s/.test(number)) { number = number.replace(/\s/g, '') }
				if (number.startsWith('0')) { number = number.substring(1) }

				url = `${url}${code}${number}`
				webview.loadURL(url)
				return callback(true)
			}
		}
	}
	//#endregion

	//#region Stores Functions
	const windowsSett = () => {
		remote.app.setLoginItemSettings({
			openAtLogin: windowsSettings.autoLaunch,
			name: 'WhazzApp',
			path: `"${remote.process.execPath}"`,
			args: windowsSettings.startMin ? ["-min"] : ''
		});
	};

	const updaterSett = () => {
		autoUpdater.autoDownload = updates.autoDownload;
		autoUpdater.allowPrerelease = updates.allowPrerelease;

		if (updates.checkUpdates) {
			autoUpdater.checkForUpdates();
			updateInterval = setInterval(() => {
				autoUpdater.checkForUpdates();
			}, updates.updateFreq);
		};
	};

	settStore.onDidChange('windows-settings', () => {
		windowsSettings = settStore.get('windows-settings');
		windowsSett();
	});

	settStore.onDidChange('updates', () => {
		updates = settStore.get('updates');
		updaterSett();
	});

	settStore.onDidChange('country-code', () => {
		countryCode = settStore.get('country-code');
	});

	const getActiveAccountDir = () => {
		if (accounts) {
			return accounts.filter(({active}) => active == true).map(({id}) => id);
		};
	};

	const createReplyStore = () => {
		if (getActiveAccountDir() != '') {
			replyStore = new Store(
				{
					name: 'quick-replies',
					cwd: `Partitions/${getActiveAccountDir()}`,
					fileExtension: '',
					watch: true,
					defaults: {
						'quick-replies': []
					}
				}
			);
			quickReplies = replyStore.get('quick-replies');

			replyStore.onDidAnyChange(() => {
				quickReplies = replyStore.get('quick-replies');
				hotkeyStore.set('hotkeys', quickReplies.filter(({hotkey}) => hotkey != '').map(({hotkey}) => hotkey));
    		});

			hotkeyStore.set('hotkeys', quickReplies.filter(({hotkey}) => hotkey != '').map(({hotkey}) => hotkey));
		};
	};

	accStore.onDidAnyChange(() => {
        accounts = accStore.get('accounts');
		
		getActiveAccountUser((result) => {
            accountName = result.account;
            userName = result.user;
        });

		createReplyStore();
    });

	const getActiveAccountUser = (callback) => {
        let account = '';
        let user = '';

        if (accounts) {
            let activeAccount = accounts
        	.filter(({active}) => active == true);
			
            account = activeAccount.length > 0 ? activeAccount.map(({name}) => name) : '';

            user = activeAccount
            .map(({users}) => users)
            .flat()
            .filter(({active}) => active == true)
            .map(({name}) => name);
            
        };
        return callback({account, user});
    };

	//#region Notifications and Updates Handles
	const showNotify = (args, fade) => {
		notification = args;

		if (fade) {
			setTimeout(() => {
				notification = null;
			}, 5000);
		};
	};

	autoUpdater.on('update-available', (info) => {
		if (autoUpdater.autoDownload) { return };

		showNotify({text: `Update ${info.version} available`, button: 'Download Now'}, false);
		notifyBtnAction = () => {
			autoUpdater.downloadUpdate();
			notification = null;
		}
	});

	autoUpdater.on('update-downloaded', (info) => {
		showNotify({text: `Update ${info.version} downloaded`, button: 'Restart Now'}, false);
		notifyBtnAction = () => autoUpdater.quitAndInstall();
	});

	const checkForUpdate = () => {
		autoUpdater.checkForUpdates();
	};
	//#endregion
</script>

<svelte:window on:resize={windowResize} on:keydown={windowKeydown} on:mousedown={windowMousedown} />

<section id="title-bar">
	<div class="left-align">
		<button bind:this={menuBtn} on:click={openMenu} class="title-btn menu-btn" title="Menu (F2)" aria-disabled={$dialog.component ? true : false}>
			<span />
			<span />
			<span />
		</button>
	</div>
	<p class="title">{title}</p>
	<div class="right-align">
		<button on:click={windowAction} id="min" class="title-btn" tabindex="-1" title="Minimize">
			<svg width="10px" height="1px">
				<line x1="10" stroke="currentColor" stroke-width="2"/>
			</svg>
		</button>
		<button on:click={windowAction} id="max" class="title-btn" title={isMax ? "Restore" : "Maximize"}>
			{#if isMax}
				<svg width="12px" height="12px" viewBox="0 0 963 963">
					<path fill="currentColor" d="M241 331l90 0 301 0 0 301 0 90 0 150 -542 0 0 -542 150 0zm90 -241l542 0 0 542 -150 0 0 -391 -391 0 0 -150zm391 632l241 0 0 -722 -722 0 0 241 -241 0 0 722 722 0 0 -241z"/>
				</svg>
			{:else}
				<svg width="10px" height="10px">
					<rect width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" />
				</svg>
			{/if}
		</button>
		<button on:click={windowAction} id="close" class="title-btn" title="Close">
			<svg width="10px" height="10px">
				<line y1="10" x2="10" y2="0" stroke="currentColor" stroke-width="1"/>
				<line y1="0" x2="10" y2="10" stroke="currentColor" stroke-width="1"/>
			</svg>
		</button>
	</div>
</section>

{#if menuOpen}
	<div transition:fade={{duration: 180}} on:mousedown|preventDefault class="menu-backdrop" />
	<section bind:this={menu} in:fly={{x: -170, duration: 280, opacity: 1}} out:fly={{x: -menu.offsetWidth, duration: 300, opacity: 1, easing: expoIn}} id="menu">
		<MainMenu {openMenu} bind:dropdownOpen={dropdownOpen} {numberSearch} {showNotify} {checkForUpdate} {settStore} {countryCode} {accStore} {accounts} {accountName} {userName} {replyStore} {dateTimeVariables} />
	</section>
{/if}

{#each accounts as account}
{#if account.active}
	<webview bind:this={webview} src="https://web.whatsapp.com" partition={`persist:${account.id}`}></webview>
{/if}
{/each}
{#if !webview}
	<section class="splash">
		<svg height="80px" viewBox="0 0 1319.18 1319.18">
			<path fill="currentColor" d="M81.87 689.48c0,-301.05 244.06,-545.11 545.12,-545.11 301.06,0 545.11,244.06 545.11,545.11 0,301.06 -244.05,545.12 -545.11,545.12 -301.06,0 -545.12,-244.06 -545.12,-545.12zm1172 0c0,-346.21 -280.66,-626.88 -626.88,-626.88 -346.22,0 -626.89,280.67 -626.89,626.88 0,346.22 280.67,626.89 626.89,626.89 346.22,0 626.88,-280.67 626.88,-626.89z"/>
			<path fill="currentColor" d="M511.56 531.24c-3.72,-18.59 -48.34,-118.98 -59.49,-141.29 -33.42,-50.17 -104.89,-3.01 -133.89,26.04 -26.02,33.46 -40.89,74.37 -40.89,115.26 0,216.06 420.97,555.37 602.35,464.77 29.12,-19.4 141.14,-117.16 78.09,-148.75l-40.9 -18.59c-15.2,-6.65 -101.8,-48.34 -107.83,-48.34 -48.17,0 -72,81.8 -100.39,81.8 -77.53,0.29 -281.01,-206.03 -249.1,-237.94 17.67,-22.1 62.22,-62.5 52.05,-92.96z"/>
			<path fill="currentColor" d="M970.32 2.81l0 0c66.72,0 121.31,54.59 121.31,121.31l0 106.14 106.14 0c66.72,0 121.31,54.59 121.31,121.31l0 0c0,66.71 -54.59,121.3 -121.31,121.3l-106.14 0 0 106.14c0,66.72 -54.59,121.31 -121.31,121.31l0 0c-66.72,0 -121.3,-54.59 -121.3,-121.31l0 -106.14 -106.15 0c-66.71,0 -121.3,-54.59 -121.3,-121.3l0 0c0,-66.72 54.59,-121.31 121.3,-121.31l106.15 0 0 -106.14c0,-66.72 54.58,-121.31 121.3,-121.31z"/>
		</svg>
		<span class="splash-text">Welcome to WhazzApp</span>
		<span class="splash-text">To get started click <span class="keyboard-key fa-solid fa-ellipsis" /> or press <span class="keyboard-key">F2</span> to open menu</span>
	</section>
{/if}

{#if notification}
	<div in:fly={{y: 50, duration: 200, opacity: 1}} out:fade={{duration: 100}} class="notification">
		<span>{notification.text}</span>
		{#if notification.button}
			<button on:click={notifyBtnAction} class="notification-action">{notification.button}</button>
		{/if}
		<button on:click={() => notification = null} class="notification-close">
			<svg viewBox="0 0 24 24" width="24" height="24" class="">
				<path fill="currentColor" d="M17.25 7.8 16.2 6.75l-4.2 4.2-4.2-4.2L6.75 7.8l4.2 4.2-4.2 4.2 1.05 1.05 4.2-4.2 4.2 4.2 1.05-1.05-4.2-4.2 4.2-4.2z"></path>
			</svg>
		</button>
	</div>
{/if}

<style>
	
</style>