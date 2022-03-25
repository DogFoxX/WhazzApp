<script>
    // Imports
    import { getContext } from 'svelte'
    const { open } = getContext('modal')
    import CountryCodesModal from './country-codes-modal.svelte'

    // Exports
    export let settings, countryCodes, numberSearch, listButtonClick

    // Global Variables
    let i, numberValue = ''

    //Functions
    const openDropDown = () => {
		open(CountryCodesModal, {title: 'Country Codes', countryCodes, listButtonClick})
	}

    const inputKeydown = (e) => {
        if (e.key === 'Enter') {
            numberSearch(numberValue)
        }
    }
</script>

<div class="form" spellcheck="false">
    <button on:click={openDropDown} class="dropdown-btn country-code" title={settings.countryCode.name}><i class="flag-icon {settings.countryCode.flag}"></i>{settings.countryCode.code}</button>
    <input bind:value={numberValue} on:keydown={inputKeydown} class="form-input" type="text" placeholder="Enter Number">
    <button on:click={numberSearch(numberValue)} class="search-num-btn fa-solid fa-caret-right" disabled={numberValue == ''}></button>
</div>

<style>

</style>