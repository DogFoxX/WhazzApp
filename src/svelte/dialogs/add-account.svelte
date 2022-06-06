<script>
	// Imports
	import { onMount } from 'svelte';
	import { subMenuContent, dialog } from '../../stores.js';

	// Constants
	const randomstring = require('randomstring')

	// Exports


	// Variables
	let i,
		content,
		accountName,
		userNames,
		addUserCheck = true,
		userCount = 1,
		error,
		accStore = $dialog.accStore,
		accounts = accStore.get('accounts');

	// Functions
	onMount(() => {
		accountName.focus();
	});

	const save = () => {
		let inputs = content.querySelectorAll('.required');
		let userInputs = userNames ? userNames.querySelectorAll('.required') : [];
		let users = [];
		let flag = Boolean;

		for (i in accounts) {
			if (accountName.value.toUpperCase() == accounts[i].name.toUpperCase()) {
				displayError('That account name already exists');
				accountName.parentNode.style.outline = '1px solid #F54949';
				return;
			}
		};

		for (i = 0; i < inputs.length; i++) {
			if (!inputs[i].value) {
				displayError('Required fields cannot be empty');
				inputs[i].parentNode.style.outline = '1px solid #F54949';
				flag = true;
			}
			else {flag = false};
		};

		if (!flag) { return };

		if (userNames) {
			for (i = 0; i < userInputs.length; i++) {
				if (userInputs[i].value) {
					users = [...users, {
					name: userInputs[i].value,
					active: false
					}];
				};
			};
			users[0].active = true;
		}

		accounts = accounts
		.map(obj =>({ ...obj,
			active: false
		}));

		accounts = [...accounts, {
			id: randomstring.generate({charset: 'hex', capitalization: 'uppercase'}),
			name: accountName.value,
			active: true,
			users: users
		}];
		
		accStore.set('accounts', accounts)
		close(true);
	};

	const displayError = (errorText) => {
		error.textContent = errorText;
		error.style.animation = 'attention 2s ease 0ms 1 normal forwards';
		setTimeout(() => {
			error.style.animation = '';
		}, 2000);
	}

	const close = (isDone) => {
		dialog.set({component: null, title: null});
		if (isDone) {
			setTimeout(() => {
				subMenuContent.set({component: null, title: null});
			}, 400);
		};
	};

	const accountNameInput = () => {
		accountName.parentNode.style.outline = '';
		error.textContent = '';

		for (i in accounts) {
			if (accountName.value.toUpperCase() == accounts[i].name.toUpperCase()) {
				displayError('That account name already exists');
				accountName.parentNode.style.outline = '1px solid #F54949';
			};
		};
	};

	const userNameInput = (e) => {
		e.target.parentNode.style.outline = '';
		error.textContent = '';
	};

	const addRemoveUser = (add) => {
		let inputs = userNames.querySelectorAll('input');

		if (add) {
			userCount = userCount + 1;
		}
		else {
			userCount = userCount - 1;
			inputs[inputs.length - 2].focus();
		}
	} 

</script>

<section bind:this={content} class="dialog-content">
	<div class="dialog-content-form">
		<p class="form-title">Account name</p>
		<div class="form">
			<div class="form-content dialog" spellcheck="false">
				<input bind:this={accountName} on:input={accountNameInput} type="text" class="form-input required" placeholder="ex. Main Account">
			</div>
		</div>
		<div class="checkbox">
			<input bind:checked={addUserCheck} id="add-users" class="dialog-checkbox" type="checkbox">
			<label for="add-users" class="dialog-checkbox-label">Add users to this account</label>
		</div>
	</div>
	{#if addUserCheck}
		<div class="dialog-content-form">
			<p class="form-title">Users</p>
			<div bind:this={userNames} class="users">
				{#each Array(userCount) as _, i}
					<div class="form">
						<div class="form-content dialog" spellcheck="false">
							<!-- svelte-ignore a11y-autofocus -->
							<input on:input={userNameInput} type="text" id="userName" class="form-input required" placeholder="User #{i + 1}" autofocus>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="add-remove-btn">
			<button on:click={() => addRemoveUser(false)} aria-disabled={userCount < 2} tabindex={userCount < 2 ? "-1" : ""}>
				<svg width="10px" height="1px">
					<line x1="10" stroke="currentColor" stroke-width="2"/>
				</svg>
			</button>
			<button on:click={() => addRemoveUser(true)}>
				<svg width="12px" height="12px">
					<line y1="6" x2="12" y2="6" stroke="currentColor" stroke-width="2" />
					<line x1="6" x2="6" y2="12" stroke="currentColor" stroke-width="2" />
				</svg>
			</button>
		</div>
	{/if}
	<div class="dialog-actions">
		<p bind:this={error} class="dialog-error"></p>
		<button on:click={() => close(false)} class="dialog-btn cancel">CANCEL</button>
		<button on:click={save} class="dialog-btn save">SAVE</button>
	</div>
</section>

<style>

</style>