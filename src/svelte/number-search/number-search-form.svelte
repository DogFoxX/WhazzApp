<script>
    // Imports
	import { countryDropdown, repliesDropdown, dropdownContent } from '../../stores'
	import Dropdown from '../dropdown.svelte'
    import NumberSearchDropdown from './number-search-dropdown.svelte'

    export let settings, countryCodes

    const openDropDown = () => {
		if ($countryDropdown) { return countryDropdown.set(null) }
        if ($repliesDropdown) {
            repliesDropdown.set(null)
            setTimeout(() => {
                countryDropdown.set(Dropdown)
                dropdownContent.set({component: NumberSearchDropdown, props: countryCodes})
            }, 100)
        }
        else {
            countryDropdown.set(Dropdown)
            dropdownContent.set({component: NumberSearchDropdown, props: countryCodes})
        }
	}
</script>

<div class="form" spellcheck="false">
    <svelte:component this={$countryDropdown} />
    <button on:click={openDropDown} class="dropdown-btn country-code"><i class="flag-icon {settings.countryCode.flag}"></i>{settings.countryCode.code}</button>
    <input class="search-num" type="text" placeholder="Enter Number">
    <button class="search-num-btn fa-solid fa-caret-right"></button>
</div>

<style>

</style>