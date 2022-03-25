<script>
    // Imports
    import { getContext } from 'svelte'
    const { open } = getContext('modal')
    import QuickRepliesModal from './quick-replies-modal.svelte'

    export let quickReplies, listButtonClick

    const openDropDown = () => {
		open(QuickRepliesModal, {title: 'Quick Replies', quickReplies, listButtonClick})
	}
</script>

<div class="form" spellcheck="false">
    <button on:click={openDropDown} class="dropdown-btn quick-replies">Quick Replies [<strong>{quickReplies.length}</strong>]</button>
</div>

<style>

</style>