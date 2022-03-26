<script>
    // Imports
    import { onMount } from 'svelte'
    import { getContext } from 'svelte'
    const { open } = getContext('modal')
    import AccountsUsersModal from './accounts-users-modal.svelte'
	import AddAccountUser from './add-account-user.svelte'

    // Exports
    export let accStore, accounts

    // Global Variables


    onMount(() => {
        
    })

    const openAccountsUsers = () => {
        open(AccountsUsersModal, {title: 'Accounts & Users', store: accStore, accounts: accounts, addAccountUser})
    }

	const addAccountUser = () => {
		open(AddAccountUser, {title: 'Add Account & Users', store: accStore, accounts: accounts})
	}
</script>

<svelte:window on:load={accounts != '' ? null : addAccountUser} />

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
<button on:click={openAccountsUsers} class="fa-btn fa-solid fa-user"></button>

<style>

</style>