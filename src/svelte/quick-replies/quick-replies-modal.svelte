<script>
    // Imports
    import { getContext } from 'svelte'
    export let quickReplies, listButtonClick

    // Exports
    import AddQuickReply from './add-quick-reply.svelte'

    const { open } = getContext('modal')

    // Global Variables
    let i,
        list,
        openAddQuickReply = false

    const searchInput = (e) => {
        let listBtns = list.querySelectorAll('button')
        let value = e.target.value.toUpperCase()
        
        for (i = 0; i < listBtns.length; i++) {
            if (listBtns[i].innerText.toUpperCase().indexOf(value) > -1) {
                listBtns[i].style.display = ''
            }
            else {
                listBtns[i].style.display = 'none'
            }
        }
    }

    const addQuickReply = () => {
        open(AddQuickReply, {title: 'Add Quick Reply', contextMenuOpen: true})
    }
</script>

<div class="modal-header-footer">
    <div class="modal-form" spellcheck="false">
        <input on:input={searchInput} class="modal-form-input" type="text" placeholder="Search Quick Replies">
    </div>
</div>
<div class="modal-container">
    <div bind:this={list} class="list">
        {#each quickReplies as quickReply}
            <button on:click={listButtonClick({id: 'quickReply-btn', value: quickReply.value})} class="list-btn" title={quickReply.value}>
                <span class="details">
                    <span>{quickReply.name}</span>
                </span>
            </button>
        {/each}
    </div>
</div>
<div class="modal-header-footer">
    <div class="modal-form">
        <button on:click={addQuickReply} class="modal-btn">Add Quick Reply</button>
    </div>
</div>

<style>
    .modal-container {
        height: calc(100% - 102px);
        border-bottom: 1px solid var(--modal-lines-color);
    }
</style>