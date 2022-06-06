<script>
	// Imports
	import { scale } from 'svelte/transition';
	import { dialog } from '../../stores.js';

	// Constants


	// Exports


	// Variables
	

	// Functions

</script>

{#if $dialog.component}
	<div class="dialog-bg">
		<div transition:scale={{duration: 200, opacity: 1}} class="dialog-window">
			<p class="dialog-title">{$dialog.title}</p>
			<svelte:component this={$dialog.component} />
		</div>
	</div>
{/if}

<style>

</style>