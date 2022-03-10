<script>
    // Imports
    import { onMount } from 'svelte'
    import { fade, fly } from 'svelte/transition'
    import { countryDropdown, repliesDropdown, dropdownContent } from '../stores'
    
    const windowKeydown = (e) => {
        if (e.key === 'Escape') {
            close()
        }
    }

    const windowClick = (e) => {
        if (e.target.matches('.dropdown-content')) { return }
        if (e.target.matches('.dropdown-btn')) { return }
        if (e.target.matches('.list')) { return }
        if (e.target.matches('.list-btn')) { return }
        if (e.target.matches('.dropdown-header')) { return }
        if (e.target.matches('.dropdown-from')) { return }
        if (e.target.matches('.dropdown-search')) { return }
        
        close()
    }

    const close = () => {
        if ($countryDropdown || $repliesDropdown) {
            countryDropdown.set(null)
            repliesDropdown.set(null)
        }
    }
</script>

<svelte:window on:keydown={windowKeydown} on:click={windowClick} />

<div transition:fade={{duration: 180}} on:click={close} class="dropdown-bg"></div>
<div transition:fly={{y: -10, duration: 300}} class="dropdown-content">
    <svelte:component this={$dropdownContent.component} props={$dropdownContent.props} />
</div>

<style>

</style>