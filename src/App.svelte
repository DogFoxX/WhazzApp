<script>
	const { ipcRenderer } = require('electron');
	import { onMount } from 'svelte';

	// Import app.css
	import './app.css';

	// Import components
	import TitleBar from '$lib/components/title-bar.svelte';
	import Webview from '$lib/components/webview/webview.svelte';

	// Change theme mode
	// Set a new attribute (data-theme) in document body
	ipcRenderer.on('theme/set', (e, color) => {	
		document.body.setAttribute('data-theme', color);
	});
</script>

<TitleBar />
<Webview />