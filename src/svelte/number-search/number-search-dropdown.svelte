<script>
    export let props

    let i,
        list

    const searchInput = (e) => {
        let listBtns = list.querySelectorAll('button')
        let value = e.target.value.toUpperCase()
        
        for (i = 0; i < listBtns.length; i++) {
            let nameStr = listBtns[i].querySelectorAll('span')[1]
            if (
                listBtns[i].innerText.startsWith(value) ? listBtns[i].innerText.startsWith(value) : nameStr.innerText.toUpperCase().startsWith(value)
            ) {
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
        <input on:input={searchInput} class="dropdown-search" type="text" placeholder="Search {props.length} Country Names/Codes">
    </div>
</div>
<div class="list-container">
    <div bind:this={list} class="list">
        {#each props as countryCode}
            <button class="list-btn"><i class="flag-icon {countryCode.flag}"></i><span>{countryCode.code}</span> - <span>{countryCode.name}</span></button>
        {/each}
    </div>
</div>

<style>

</style>