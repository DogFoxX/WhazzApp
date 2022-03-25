<script>
    // Exports
    export let countryCodes, listButtonClick

    // Global Variables
    let i,
        list

    const searchInput = (e) => {
        let listBtns = list.querySelectorAll('button')
        let value = e.target.value.toUpperCase()
        
        for (i = 0; i < listBtns.length; i++) {
            let wholeValue = listBtns[i].querySelectorAll('span')[0]
            let nameStr = listBtns[i].querySelectorAll('span')[2]
            if (
                wholeValue.textContent.toUpperCase().startsWith(value) ? wholeValue.textContent.toUpperCase().startsWith(value) : nameStr.textContent.toUpperCase().startsWith(value)
            ) {
                listBtns[i].style.display = ''
            }
            else {
                listBtns[i].style.display = 'none'
            }
        }
    }
</script>

<div class="modal-header-footer">
    <div class="modal-form" spellcheck="false">
        <input on:input={searchInput} class="modal-form-input" type="text" placeholder="Search {countryCodes.length} Country Names/Codes">
    </div>
</div>
<div class="modal-container">
    <div bind:this={list} class="list">
        {#each countryCodes as countryCode}
            <button on:click={listButtonClick({id: 'country-btn', name: countryCode.name, code: countryCode.code, flag: countryCode.flag})} class="list-btn">
                <div class="flag">
                    <i class="flag-icon {countryCode.flag}"></i>
                </div>
                <span class="details">
                    <span>{countryCode.code}</span> - <span>{countryCode.name}</span>
                </span>
            </button>
        {/each}
    </div>
</div>

<style>
    .modal-container {
        height: calc(100% - 51px);
    }
</style>