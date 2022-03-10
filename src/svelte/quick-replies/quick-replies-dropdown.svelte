<script>
    export let props

    let i,
        list

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

</script>

<div class="dropdown-header">
    <div class="dropdown-form">
        <input on:input={searchInput} class="dropdown-search" type="text" placeholder="Search Quick Replies">
    </div>
</div>
<div class="list-container">
    <div bind:this={list} class="list">
        {#each props as quickReply}
            <button class="list-btn">{quickReply.name}</button>
        {/each}
    </div>
</div>
<div class="dropdown-footer">
    <div class="dropdown-form">
        <button class="dropdown-add-btn">Add Quick Reply</button>
    </div>
</div>

<style>
    .list-container {
        max-height: 200px;
    }
</style>