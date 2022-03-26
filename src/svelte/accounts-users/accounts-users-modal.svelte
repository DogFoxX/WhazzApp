<script>
    // Imports
    import AddAccountUser from './add-account-user.svelte'

    // Exports
    export let store, accounts, addAccountUser

    let i

    const switchUser = (e) => {
        for (i in accounts) {
            accounts[i].active = false

            if (e.target.id == accounts[i].id) {
                accounts[i].active = true
            }
        }
        store.set('accounts', accounts)
    }
</script>

<div class="modal-header-footer">
    <div class="modal-form">
        <input class="modal-form-input" type="text" placeholder="Search Accounts/Users">
    </div>
</div>
<div class="modal-container">
    <div class="list">
        {#each accounts as account}
            <button id={account.id} on:click={switchUser} class="list-btn" disabled={account.active ? true : false}>
                <span class="details">{account.name}</span>
            </button>
        {/each}
    </div>
</div>
<div class="modal-header-footer">
    <div class="modal-form">
        <button on:click={addAccountUser} class="modal-btn">Add Account & Users</button>
    </div>
</div>

<style>
    .modal-container {
        height: calc(100% - 102px);
        border-bottom: 1px solid var(--modal-lines-color);
    }
</style>