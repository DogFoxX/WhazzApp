<script>
    // Import Menu component
    import TitleMenu from "$lib/components/title-menu.svelte";

    // Import menu open (boolean) store
    import { menu } from '$lib/stores';

    import { countries } from '$assets/country-codes';

    // Setup menus
    const menus = {
        0: [
            {
                title: "Accounts",
                submenu: true
            },
            {
                title: "Quick Replies",
                submenu: true
            },
            {
                title: "Refresh WhatsApp",
                submenu: false,
                hotkey: "F5"
            },
            {
                title: "Settings"
            },
            {
                title: "Exit",
                submenu: false
            }
        ],
        1: 
            countries
        
    }

    // Bind input value to variable
    let value;

    // Regex pattern for number format
    // Format options:  +27 xx xxx xxxx
    //                  0xx xxx xxxx
    //                  xx xxx xxxx
    let numFormat = /^(\+27[-\s\.])?[0]?[0-9]{2} [0-9]{3} [0-9]{4}$/;

    // Send number main process
    const send = () => {
        // Test value against Regex pattern before sending
        if (numFormat.test(value)) num.send(value);
    }

    // Input keyup handler
    const hanldeKeydown = (e) => {
        // Array of valid regex that match inputFormat at each stage
        const regex = [
            /^(\+[0-9]{2})$/,
            /^(\+[0-9]{2}) [0-9]{2}$/,
            /^(\+[0-9]{2}) [0-9]{2} [0-9]{3}$/,
            /^[1-9]{2}$/,
            /^[1-9]{2} [0-9]{3}$/,
            /^0[0-9]{2}$/,
            /^0[0-9]{2} [0-9]{3}$/
        ];

        // Do nothing when Enter is pressed
        // Form handels the submit
        if (e.key == 'Enter') return;

        // Prevent spacebar input
        if (e.keyCode == '32') e.preventDefault();

        // Prevent further code from running when backspace is pressed
        if (e.key == 'Backspace') return;

        // Allow only numbers as input
        if (/[^\+0-9\s]/g.test(e.key)) e.preventDefault();

        // Test value against Regex pattern and prevent input
        if (numFormat.test(value)) e.preventDefault();

        // Check and update the formatting using the same logic as keyup
        regex.forEach(rex => {
            if (rex.test(value)) value += ' ';
        });
    }

    // Get active user and account
    $: ({ account } = accounts.get.active())
</script>

<div id="title-bar" class="p-1">
    <div class="w-max no-drag">
        <div class="dropdown">
            <button on:click={() => menu.set({0: !$menu[0], 1: false})} id="menu-btn" class="fa-light fa-bars" />
            {#if $menu[0]}
                <TitleMenu items={menus[0]}>
                    <div id="menu-header" class="pb-4 pl-6 pr-4">
                        <span class="fa-solid fa-user" />
                        <div>
                            <span>{account.users.find(user => { return user.active }).name}</span>
                            <span>{account.name}</span>
                        </div>
                        <span class="text-right fa-solid fa-right-left" />
                    </div>
                </TitleMenu>
            {/if}
        </div>
    </div>
    <div class="text-xs w-full">
        <span>WhazzApp</span>
    </div>
    <div id="search" class="p-1 text-sm w-max no-drag">
        <span>
            <div class="dropdown">
                <button on:click={() => menu.set({0: false, 1: !$menu[1]})} class="flex items-center justify-start gap-1 px-2">
                    <span class="flag-icon flag-icon-za" />
                    <span>+27</span>
                </button>
                {#if $menu[1]}
                    <TitleMenu items={menus[1]}>
                    </TitleMenu>
                {/if}
            </div>
            <form on:submit|preventDefault={send}>
                <input
                    bind:value type="text"
                    on:keydown={hanldeKeydown}
                    maxlength="15" placeholder="Enter number"
                >
                <button class="px-2 fa-regular fa-arrow-right icon-btn secondary" disabled={!numFormat.test(value)}/>
            </form>
        </span>
    </div>
</div>

<style>
    #title-bar {
	    -webkit-app-region: drag;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        height: 36px;
        background-color: var(--title-bg);
        color: var(--title-font);
        user-select: none;
    }

    #title-bar > div {
        display: flex;
        align-items: center;
        height: 100%;
    }

    .dropdown {
        position: relative;
        height: 100%;
    }

    #menu-btn {
        border-radius: 6px;
        transition: 0.18s ease-in-out;
    }

    #menu-btn:hover {
        background-color: var(--title-button-hover-bg);
    }

    .no-drag {
        -webkit-app-region: no-drag;
    }

    #search {
        position: absolute;
        color: var(--title-input-font);
    }

    #search > span {
        display: flex;
        align-items:  center;
        height: 100%;
        width: 100%;
        border-radius: 6px;
        background-color: var(--title-input-bg);
    }

    #menu-header {
        position: relative;
        display: flex;
        align-items: center;
    }

    #menu-header::after {
        content: "";
        position: absolute;
        bottom: 0.5rem;
        height: 1px;
        width: 100%;
        background-color: #fff;
    }

    #menu-header > span {
        display: block;
        flex-grow: 1;
    }

    #menu-header > div {
        display: flex;
        flex-direction: column;
    }

    button {
        height: 100%;
        min-width: 46px;
    }

    input {
        flex-grow: 1;
        height: 100%;
    }
</style>