<script>
    // Imports
	import { countryDropdown, repliesDropdown, dropdownContent } from '../../stores'
	import Dropdown from '../dropdown.svelte'
    import QuickRepliesDropdown from './quick-replies-dropdown.svelte'

    export let quickReplies

    const openDropDown = () => {
		if ($repliesDropdown) { return repliesDropdown.set(null) }
        if ($countryDropdown) {
            countryDropdown.set(null)

            setTimeout(() => {
                repliesDropdown.set(Dropdown)
                dropdownContent.set({component: QuickRepliesDropdown, props: quickReplies})
            }, 100);
        }
        else {
            repliesDropdown.set(Dropdown)
            dropdownContent.set({component: QuickRepliesDropdown, props: quickReplies})
        }
	}
</script>

<div class="form" spellcheck="false">
    <svelte:component this={$repliesDropdown} />
    <button on:click={openDropDown} class="dropdown-btn quick-replies">Quick Replies [<strong>{quickReplies.length}</strong>]</button>
</div>

<style>

</style>