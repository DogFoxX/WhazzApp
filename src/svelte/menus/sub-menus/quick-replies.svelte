<script>
    // Imports
    import { subMenuContent, dialog } from '../../../stores.js';
    import AddQuickReply from '../../dialogs/add-quick-reply.svelte';

    // Constants
	const { clipboard } = require('electron');

    // Variables
    let i,
		list,
        replyStore = $subMenuContent.replyStore,
		quickReplies = replyStore.get('quick-replies'),
		userName = $subMenuContent.userName,
		showNotify = $subMenuContent.showNotify,
		dateTimeVariables = $subMenuContent.dateTimeVariables;

    // Functions
	replyStore.onDidAnyChange(() => {
		quickReplies = replyStore.get('quick-replies');
	});

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

	const quickReplyClick = (value, name) => {		
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
		showNotify({text: `Copied: ${name}`, button: ''}, true);
	}

</script>

<div class="form">
	<div class="form-content menu" spellcheck="false">
		<input on:input={searchInput} type="text" class="form-input" placeholder="Search {quickReplies.length} Quick Replies">
	</div>
</div>
<div bind:this={list} class="menu-list">
	{#each quickReplies as quickReply, i}
		<button on:click={() => quickReplyClick(quickReply.value, quickReply.name)} class="menu-list-item" title="Click to copy{quickReply.hotkey ? ` (${quickReply.hotkey})` : ''}: &#013;&#013;{quickReply.value}">
			<span class="menu-list-item-icon">
				<span>{i + 1}</span>
			</span>
			<span class="menu-list-item-label">
				<span>{quickReply.name}</span>
			</span>
		</button>
	{/each}
</div>
	<div class="form">
		<div class="form-content menu">
			<button on:click={() => dialog.set({component: AddQuickReply, title: 'Add a quick reply', replyStore})} class="form-button">Add Quick Reply</button>
		</div>
	</div>

<style>
    .menu-list {
        min-height: calc(100% - 208px);
		max-height: calc(100% - 208px);
	}
</style>