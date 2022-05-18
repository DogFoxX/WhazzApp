<script>
    // Imports
    import { subMenuContent } from '../../../stores.js';

    // Constants


    // Exports
    export let accounts


    // Variables
    let i, list, accStore = $subMenuContent.accStore;

    // Functions
    const searchInput = (e) => {
        let listBtns = list.querySelectorAll('button')
        let value = e.target.value.toUpperCase()
        
        for (i = 0; i < listBtns.length; i++) {
            let nameStr = listBtns[i].querySelectorAll('span')[2]
            if (
                nameStr.textContent.toUpperCase().startsWith(value)
            ) {
                listBtns[i].style.display = ''
            }
            else {
                listBtns[i].style.display = 'none'
            }
        }
    }

    const switchAccount = (e) => {
        accounts = accounts
        .map(obj =>({ ...obj,
            active: obj.name == e.target.querySelector('.menu-list-item-label').textContent
        }));

        accStore.set('accounts', accounts);
        subMenuContent.set({component: null, title: null})
    }
</script>

<div class="form">
    <div class="form-content" spellcheck="false">
        <input on:input={searchInput} type="text" class="search-input" placeholder="Search {accounts.length} Accounts">
    </div>
</div>
<div bind:this={list} class="menu-list">
    {#each accounts as account, i}
        <button on:click={switchAccount} class="menu-list-item" disabled={account.active}>
            <span class="menu-list-item-icon">
                <span>{i + 1}</span>
            </span>
            <span class="menu-list-item-label">
                <span>{account.name}</span>
            </span>
        </button>
    {/each}
</div>
    <div class="form">
        <div class="form-content">
            <button class="form-button">Add Account</button>
        </div>
    </div>

<style>
    .menu-list {
        max-height: calc(100% - 208px);
    }
</style>