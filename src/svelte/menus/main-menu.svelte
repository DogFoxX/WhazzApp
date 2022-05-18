<script>
    // Imports
    import { onMount, onDestroy } from 'svelte'
	import { fly, scale } from 'svelte/transition';
	import { subMenuContent } from '../../stores';
    import AccountsUsers from './sub-menus/accounts-users.svelte';
    import CountryCodes from './sub-menus/country-codes.svelte';
    import QuickReplies from './sub-menus/quick-replies.svelte';
    import Settings from './sub-menus/settings.svelte';

    // Constants
    const { ipcRenderer } = require('electron')
	const Store = require('electron-store');

    //Exports
    export let openMenu,
            dropdownOpen,
            numberSearch,
            accStore,
            accounts,
            accountName,
            userName,
            AppDetails = [];

    // Variables
    let mainMenu, subMenu, number;

    let settStore = new Store({
		name: 'settings',
		cwd: 'Partitions',
		fileExtension: '',
        watch: true,
		defaults: {
			settings: [],
			'country-code': {
				name: 'United States',
				code: '+1',
				flag: 'flag-icon-us'
			}
		}
	});

    let settings = settStore.get('settings');
    let countryCode = settStore.get('country-code');

    // Functions
    onMount( async () => {
        AppDetails = await ipcRenderer.invoke('get-details');
        number.focus();
    });

    onDestroy(() => {
        subMenuContent.set({component: null, title: null});
        unsubscribe();
        dropdownOpen = false;
    });

    const unsubscribe = settStore.onDidAnyChange(() => {
        settings = settStore.get('settings');
        countryCode = settStore.get('country-code');
    });

    const inputKeydown = (e) => {
        numberSearch(e, number.value, countryCode.code, (callback) => {
            if (callback) { openMenu() };
        });
    };

    const openDropdown = (e) => {
        if (dropdownOpen) {
            dropdownOpen = false;
            e.target.focus();
        }
        else {
            dropdownOpen = true;
            e.target.blur();
        }
    }

    const switchUser = (e) => {
        accounts = accounts
        .map(obj => obj.active ? ({ ...obj,
            users: obj.users.map(user => ({ ...user,
                active: user.name == e.target.innerHTML
            }))
        }) : obj);

        accStore.set('accounts', accounts);
        dropdownOpen = false;
    }

    const logout = () => {
        accounts = accounts
        .map(obj => ({ ...obj,
            active: false
        }));

        accStore.set('accounts', accounts);
    }
</script>

{#if !$subMenuContent.component}
<div bind:this={mainMenu} in:fly={subMenu ? {x: -mainMenu.offsetWidth, duration: 230, opacity: 1} : {opacity: 1}} out:fly={$subMenuContent.component ? {x: -mainMenu.offsetWidth, duration: 230, opacity: 1} : {opacity: 1}} class="menu-content">
    <header>
        <div in:fly={!subMenu ? {x: -100, duration: 700} : {opacity: 1}} class="header-content">
            <div class="menu-back">
                <button on:click={openMenu} class="back-btn" aria-label="Back">
                    <span data-testid="back" data-icon="back" class="">
                        <svg viewBox="0 0 24 24" width="24" height="24" class="">
                            <path fill="currentColor" d="m12 4 1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"></path>
                        </svg>
                    </span>
                </button>
            </div>
            <div class="menu-title">
                <h1>Main Menu</h1>
            </div>
        </div>
        {#if accounts}
            {#each accounts as account}
                {#if account.active}
                    <div class="account-actions">
                        <button on:click={openDropdown} id="dropdown-btn" class="account-action-btn {dropdownOpen ? 'open' : ''}" title="Switch User">
                            <span class="fa-regular fa-arrow-up-arrow-down"></span>
                        </button>
                        <button on:click={logout} class="account-action-btn fa-solid fa-arrow-right-from-bracket" title="Logout" />
                        {#if dropdownOpen}
                            <div class="user-dropdown-container">
                                <div transition:scale={{duration: 250}} class="user-dropdown-content">
                                    <div class="user-dropdown-list">
                                        {#each account.users as user}
                                            <button id="dropdown-list-btn" on:click={switchUser}>{user.name}</button>
                                        {/each}
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}
        {/if}
    </header>
    <div class="account">
        <button on:click={() => subMenuContent.set({component: AccountsUsers, title: 'Accounts', accStore})} class="account-details">
        <span class="account-icon">
            <span class="fa-solid fa-user" />
        </span>
            <div class="active-account-user">
                <span class="account-name">{accountName}</span>
                <span class="user-name">{userName}</span>
            </div>
        </button>
    </div>
    <div class="form">
        <div class="form-content" spellcheck="false">
            <button on:click={() => subMenuContent.set({component: CountryCodes, title: 'Country Codes', settStore})} class="country-codes" title={countryCode.name}>
                <span class="flag-icon {countryCode.flag}" />
                <span>{countryCode.code}</span>
            </button>
            <input bind:this={number} on:keydown={inputKeydown} type="text" class="search-input" placeholder="Enter Number">
        </div>
    </div>
    <div class="menu-list">
        <button on:click={() => subMenuContent.set({component: QuickReplies, title: 'Quick Replies'})} class="menu-list-item">
            <span class="menu-list-item-icon">
                <span class="fa-solid fa-bolt" />
            </span>
            <span class="menu-list-item-label">
                <span>Quick replies</span>
            </span>
        </button>
        <button on:click={() => subMenuContent.set({component: Settings, title: 'Settings', settStore})} class="menu-list-item">
            <span class="menu-list-item-icon">
                <span class="fa-solid fa-gear" />
            </span>
            <span class="menu-list-item-label">
                <span>Settings</span>
            </span>
        </button>
        <button class="menu-list-item">
            <span class="menu-list-item-icon">
                <span class="fa-solid fa-down-from-line" />
            </span>
            <span class="menu-list-item-label">
                <span>Check for updates</span>
            </span>
        </button>
        <button class="menu-list-item">
            <span class="menu-list-item-icon">
                <span class="fa-solid fa-rotate-right" />
            </span>
            <span class="menu-list-item-label">
                <span>Refresh WhatsApp</span>
            </span>
        </button>
        <button class="menu-list-item">
            <span class="menu-list-item-icon">
                <span class="fa-solid fa-circle-question" />
            </span>
            <span class="menu-list-item-label">
                <span>Help</span>
            </span>
        </button>
        <button class="menu-list-item">
            <span class="menu-list-item-icon">
                <span class="fa-solid fa-circle-info" />
            </span>
            <span class="menu-list-item-label">
                <span>About</span>
            </span>
        </button>
    </div>
    <footer>
        <span>{AppDetails.author} | {AppDetails.appName} v{AppDetails.version}</span>
    </footer>
</div>
{:else}
<div bind:this={subMenu} in:fly={{x: subMenu.offsetWidth, duration: 230, opacity: 1}} out:fly={!$subMenuContent.component ? {x: subMenu.offsetWidth, duration: 230, opacity: 1} : {opacity: 1}} class="menu-content">
    <header>
        <div class="header-content">
            <div class="menu-back">
                <button on:click={() => subMenuContent.set({component: null, title: null})} class="back-btn" aria-label="Back">
                    <span data-testid="back" data-icon="back" class="">
                        <svg viewBox="0 0 24 24" width="24" height="24" class="">
                            <path fill="currentColor" d="m12 4 1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"></path>
                        </svg>
                    </span>
                </button>
            </div>
            <div class="menu-title">
                <h1>{$subMenuContent.title}</h1>
            </div>
        </div>
    </header>
    <svelte:component this={$subMenuContent.component} {accounts}></svelte:component>
</div>
{/if}

<style>
    .menu-list {
        max-height: calc(100% - 302px);
    }
</style>