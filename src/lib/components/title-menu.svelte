<script>
    // Import menu & submenu open (boolean) store
    export let items;
</script>

<div id="menu" class="py-2 text-sm">
    <!-- Menu Header -->
    <slot />
    <!-- Items (array) -->
    <ul>
        {#each items as { title, submenu, hotkey }}
        <li class="pl-6 pr-4">
            <button>
                <span>{title}</span>
                {#if hotkey}
                    <span>({hotkey})</span>
                {/if}
                {#if submenu}
                    <span class="text-right fa-light fa-chevron-right" />
                {/if}
            </button>
        </li>
        {/each}
    </ul>
</div>

<style>
    #menu {
        position: absolute;
        display: flex;
        flex-direction: column;
        top: 38px;
        left: 0;
        background-color: var(--menu-bg);
        color: var(--menu-font);
        border-radius: 3px;
        box-shadow: 0 2px 5px 0 #0B141A42, 0 2px 10px 0 #0B141A42;
        z-index: 1;
    }

    ul li {
        display: flex;
        align-items: center;
        gap: 1rem;
        height: 36px;
    }

    ul li:hover {
        background-color: var(--menu-button-hover);
    }

    ul li button {
        display: flex;
        align-items: center;
        gap: 2rem;
        flex-grow: 1;
        height: 100%;
        width: max-content;
        text-align: left;
    }

    ul li span {
        display: block;
        flex-grow: 1;
    }
</style>