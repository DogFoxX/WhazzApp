<script>
	// Imports
	import { subMenuContent } from '../../../stores.js';

	// Constants
	const countryCodes = require('./resources/country-codes.json');

	// Variables
	let i,
		list,
		settStore = $subMenuContent.settStore,
		countryCode = settStore.get('country-code');

	// Functions
	const searchInput = (e) => {
		let listBtns = list.querySelectorAll('button');
		let value = e.target.value.toUpperCase();
		
		for (i = 0; i < listBtns.length; i++) {
			let wholeValue = listBtns[i].querySelectorAll('span')[2];
			let nameStr = listBtns[i].querySelectorAll('span')[4];
			if (
				wholeValue.textContent.toUpperCase().startsWith(value) ? wholeValue.textContent.toUpperCase().startsWith(value) : nameStr.textContent.toUpperCase().startsWith(value)
			) {
				listBtns[i].style.display = '';
			}
			else {
				listBtns[i].style.display = 'none';
			};
		};
	};

	const listBtnClick = (args) => {        
		countryCode =  {
			name: args.name,
			code: args.code,
			flag: args.flag
		};
		
		settStore.set('country-code', countryCode);

		subMenuContent.set({component: null, title: null});
	};
</script>

<div class="form">
	<div class="form-content menu" spellcheck="false">
		<input on:input={searchInput} type="text" class="form-input" placeholder="Search {countryCodes.length} Country Names/Codes">
	</div>
</div>
<div bind:this={list} class="menu-list">
	{#each countryCodes as countryCode}
		<button on:click={() => listBtnClick({id: 'country-btn', name: countryCode.name, code: countryCode.code, flag: countryCode.flag})} class="menu-list-item">
			<span class="menu-list-item-icon">
				<span class="flag-icon {countryCode.flag}" />
			</span>
			<span class="menu-list-item-label">
				<span>{countryCode.code}</span> - <span>{countryCode.name}</span>
			</span>
		</button>
	{/each}
</div>

<style>
	.menu-list {
		max-height: calc(100% - 160px);
	}
</style>