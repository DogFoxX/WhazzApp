<script>
    // Imports
    import { subMenuContent, dialog } from '../../../stores.js';
    import AddQuickReply from '../../dialogs/add-quick-reply.svelte';

    // Constants


    // Exports
    export let quickReplies


    // Variables
    let i,
		list,
        replyStore = $subMenuContent.replyStore

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

</script>

<div class="form">
	<div class="form-content menu" spellcheck="false">
		<input on:input={searchInput} type="text" class="form-input" placeholder="Search {quickReplies.length} Quick Replies">
	</div>
</div>
<div bind:this={list} class="menu-list">
	{#each quickReplies as quickReply, i}
		<button on:click={() => navigator.clipboard.writeText(quickReply.value)} class="menu-list-item" title="Click to copy{quickReply.hotkey ? ` (${quickReply.hotkey})` : ''}: &#013;{quickReply.value}">
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