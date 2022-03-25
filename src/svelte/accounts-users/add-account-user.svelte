<script>
	// Imports
	import { onMount } from 'svelte'
	// Exports
	export let store, accounts, close

	// Global Variables
	const randomstring = require('randomstring')

	let i,
		accountName,
		saveBtn,
		modalMessage,
		accStore = store

	onMount(() => {
		accountName.focus()
	})

	const accountNameInput = (e) => {
		let value = e.target.value.toUpperCase()

		if (accounts != '') {
			for (i in accounts) {
				if (value == accounts[i].name.toUpperCase()) {
					e.target.parentNode.style.outline = '1px solid #eb4c4c'
					saveBtn.disabled = true
					showMessage('Account name already exists')
					return
				}
				else {
					e.target.parentNode.style.outline = 'none'
					value == '' ? saveBtn.disabled = true : saveBtn.disabled = false
					showMessage()
				}           
			}
		}
		else {
			value == '' ? saveBtn.disabled = true : saveBtn.disabled = false
		}
	}

	const save = () => {
		let name = accountName.value.split(' ')
		
   		for (i = 0; i < name.length; i++) {
			name[i] = name[i].charAt(0).toUpperCase() + name[i].substring(1);     
   		}
   		name = name.join(' ');
		
		for (let account of accounts) {
			if (account.active) {
				account.active = false
			}
		}

		accounts = [...accounts, {
			id: randomstring.generate({charset: 'hex', capitalization: 'uppercase'}),
			name: name,
			active: true,
			users: []
		}]
		accStore.set('accounts', accounts)

		close()
	}

	const showMessage = (text) => {
		if (!text) {
			modalMessage.textContent = ''
			modalMessage.style.animation = 'none'
		}
		else {
			modalMessage.textContent = text
			modalMessage.style.animation = 'myAnim 1500ms ease-in-out 0s 1 normal forwards'
		}
	}
</script>

<div class="modal-header-footer">
	<div class="modal-form" spellcheck="false">
		<input bind:this={accountName} on:input={accountNameInput} class="modal-form-input" type="text" placeholder="Account Name">
	</div>
</div>
<div class="modal-container">
	<div class="modal-message">
		<p bind:this={modalMessage}></p>
	</div>
</div>
<div class="modal-header-footer">
	<div class="modal-form">
		<button bind:this={saveBtn} on:click={save} class="modal-btn" disabled>Save</button>
	</div>
</div>

<style>
	.modal-container {
		position: relative;
		padding: 7.5px 12px;
		height: calc(100% - 117px);
		border-bottom: 1px solid var(--modal-lines-color);
	}
</style>