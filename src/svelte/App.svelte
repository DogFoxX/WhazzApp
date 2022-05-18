<script>
	// Imports
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
    import { expoIn } from 'svelte/easing';
	import { subMenuContent } from '../stores.js'
	import MainMenu from '../svelte/menus/main-menu.svelte';

	// Constants
	const { ipcRenderer } = require('electron')
	const mainWindow = require('@electron/remote').getCurrentWindow();
	const Store = require('electron-store');

	// Exports
	

	// Variables
	let accStore = new Store({
		name: 'accounts',
		cwd: 'Partitions',
		fileExtension: '',
		watch: true,
		defaults: {
			'accounts': []
		}
	});

	let isMax = Boolean,
		menuOpen = Boolean(false),
		dropdownOpen = Boolean(false);

	let accounts = accStore.get('accounts'),
		activeAccount = [],
		accountName,
		userName;

	let title = mainWindow.getTitle(),
		menu,
		menuBtn,
		webview;

	//#region Functions

	onMount(() => {
		mainWindow.isMaximized() ? isMax = true : isMax = false;
		getActiveAccountUser((result) => {
            accountName = result.account;
            userName = result.user;
        });
	});

	// Get Webview Title and Theme
	ipcRenderer.on('title-updated', () => {
		title = mainWindow.getTitle();
	});

	ipcRenderer.on('theme', (e, color) => {	
		document.body.setAttribute('theme', color);
	});

	// Window Functions
	const windowResize = () => {
		mainWindow.isMaximized() ? isMax = true : isMax = false;
	};

	const windowAction = (e) => {
		if (e.target.id == 'close') {
			mainWindow.close();
		}
		if (e.target.id == 'min') {
			mainWindow.minimize();
		}
		if (e.target.id == 'max') {
			mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
		}
		webview.focus();
	};

	ipcRenderer.on('webview-keydown', (e, key) => {
		windowKeydown(key);
	});

	const windowMousedown = (e) => {
		if (e.target.matches('.user-dropdown-list') || e.target.matches('#dropdown-btn') || e.target.matches('#dropdown-list-btn')) return
		if (e.target.matches('*')
		) {
			dropdownOpen = false
		}
	}

	const windowKeydown = (e) => {
		// Close, Minimize, Maximize
		if (e.key === 'Escape') {
			if (dropdownOpen) {
				dropdownOpen = false;
			}
			else if ($subMenuContent.component) {
				subMenuContent.set({component: null, title: null})
			}
			else if (menuOpen && !dropdownOpen && !$subMenuContent.component) {
				menuOpen = false;
				menuBtn.classList.remove('active');
				webview.focus();
			}
		}
		else if (e.key === 'F2') {
			openMenu();
		}
		else if (e.key === 'F5') {
			webview.reload();
		};

		// Menu Focus Trap
		if (menuOpen && e.key === 'Tab') {
            const nodes = document.querySelector('.user-dropdown-content') ? document.querySelector('.user-dropdown-content').querySelectorAll('*') : menu.querySelectorAll('*');
            const tabbable = Array.from(nodes).filter((node) => node.tabIndex >= 0);
            
            let index = tabbable.indexOf(document.activeElement);
            if (index === -1 && e.shiftKey) index = 0;
            
            index += tabbable.length + (e.shiftKey ? -1 : 1);
            index %= tabbable.length;
            
            tabbable[index].focus();
            e.preventDefault();
        }
	};

	// Menu Functions
	export const openMenu = () => {
		menuOpen = !menuOpen;
		menuOpen ? menuBtn.classList.add('active') : menuBtn.classList.remove('active');
		menuOpen ? webview.blur() : webview.focus();
	};

	export const numberSearch = (e, number, code, callback) => {
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

	accStore.onDidAnyChange(() => {
        accounts = accStore.get('accounts');
		getActiveAccountUser((result) => {
            accountName = result.account;
            userName = result.user;
        });
    });

	const getActiveAccountUser = (callback) => {
        let account;
        let user = '';

        if (accounts) {
            activeAccount = accounts
        	.filter(({active}) => active == true);
			
            account = activeAccount.length > 0 ? activeAccount.map(({name}) => name) : 'Login or create an account';

            user = activeAccount
            .map(({users}) => users)
            .flat()
            .filter(({active}) => active == true)
            .map(({name}) => name);
            
        };
        return callback({account, user});
    };
</script>

<svelte:window on:resize={windowResize} on:keydown={windowKeydown} on:mousedown={windowMousedown} />

<section id="title-bar">
	<div class="left-align">
		<button bind:this={menuBtn} on:click={openMenu} class="title-btn menu-btn" title="Menu (F2)">
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
		<MainMenu {openMenu} bind:dropdownOpen={dropdownOpen} {numberSearch} {accStore} {accounts} {accountName} {userName} />
	</section>
{/if}

{#if activeAccount.length > 0}
	{#each activeAccount as account}
		<webview bind:this={webview} src="https://web.whatsapp.com" partition={`persist:${account.id}`}></webview>
	{/each}
{:else}
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

<style>
	
</style>