<script>
    // Imports
    import { onMount } from 'svelte';
	import { dialog } from '../../stores.js';

    // Constants


    // Exports


    // Variables
    let content,
        replyName,
        replyText,
		hotkey,
		placeholder = true,
        error,
		replyStore = $dialog.replyStore,
		quickReplies = replyStore.get('quick-replies');;

    // Functions
    onMount(() => {
        replyName.focus();
    });

    const save = () => {
		for (let quickReply of quickReplies) {
			if (replyName.value.toUpperCase() == quickReply.name.toUpperCase()) {
				displayError('That account name already exists');
				replyName.parentNode.style.outline = '1px solid #F54949';
				return;
			};
		};

		if (!replyName.value && !replyText.innerHTML) {
			displayError('Required fields cannot be empty');
			replyName.parentNode.style.outline = '1px solid #F54949';
			replyText.parentNode.style.outline = '1px solid #F54949';
			return;
		}
		else if (!replyName.value) {
			displayError('Required fields cannot be empty');
			replyName.parentNode.style.outline = '1px solid #F54949';
			return;
		}
		else if (!replyText.innerHTML) {
			displayError('Required fields cannot be empty');
			replyText.parentNode.style.outline = '1px solid #F54949';
			return;
		};

		quickReplies = [...quickReplies, {
			name: replyName.value,
			value: replyText.textContent,
			hotkey: hotkey.value.replace(/\s/g, '')
		}];

		replyStore.set('quick-replies', quickReplies);
		close();
	};

	const displayError = (errorText) => {
		error.textContent = errorText;
		error.style.animation = 'attention 2s ease 0ms 1 normal forwards';
		setTimeout(() => {
			error.style.animation = '';
		}, 2000);
	}

	const close = () => {
		dialog.set({component: null, title: null});
	};

    const replyNameInput = () => {
		replyName.parentNode.style.outline = '';
		error.textContent = '';

		for (let quickReply of quickReplies) {
			if (replyName.value.toUpperCase() == quickReply.name.toUpperCase()) {
				displayError('That account name already exists');
				replyName.parentNode.style.outline = '1px solid #F54949';
			};
		};
    };

    const replyTextInput = (e) => {
		replyText.parentNode.style.outline = '';
		if (replyText.innerHTML) { placeholder = false }
		else { placeholder = true};
    };

	const replyTextKeydown = (e) => {
		if (e.key === 'Enter') {
        	e.preventDefault()
        	document.execCommand("insertLineBreak")
  		}
	}

	const hotkeyKeydown = (e) => {
		e.preventDefault();

		let keycodes = {
			48: '0',
			49: '1',
			50: '2',
			51: '3',
			52: '4',
			53: '5',
			54: '6',
			55: '7',
			56: '8',
			57: '9',
			96: '0',
			97: '1',
			98: '2',
			99: '3',
			100: '4',
			101: '5',
			102: '6',
			103: '7',
			104: '8',
			105: '9'
		};

		if (e.key == "Backspace" || e.key == "Delete") {
			if (hotkey.value == '') { return }
			else {
				hotkey.value = '';
				return;
			};
		};
		
		e.ctrlKey ? hotkey.value = `CTRL + ${keycodes[e.keyCode] ? keycodes[e.keyCode] : ''}` : '';

		e.shiftKey && e.ctrlKey ? hotkey.value = `CTRL + SHIFT + ${keycodes[e.keyCode] ? keycodes[e.keyCode] : ''}` : '';
		e.altKey && e.ctrlKey ? hotkey.value = `CTRL + ALT + ${keycodes[e.keyCode] ? keycodes[e.keyCode] : ''}` : '';
		e.altKey && e.shiftKey ? hotkey.value = `SHIFT + ALT + ${keycodes[e.keyCode] ? keycodes[e.keyCode] : ''}` : '';

		e.shiftKey && e.ctrlKey && e.altKey ? hotkey.value = `CTRL + SHIFT + ALT + ${keycodes[e.keyCode] ? keycodes[e.keyCode] : ''}` : '';
	}

	const hotkeyKeyUp = (e) => {
		let keycodes = [
			16,
			17,
			18
		];

		if (keycodes.indexOf(e.keyCode) > -1) {
			if (hotkey.value.endsWith(' ')) hotkey.value = '';
		};
		
	};

</script>

<section bind:this={content} class="dialog-content">
	<div class="dialog-content-form">
		<p class="form-title">Quick reply name</p>
		<div class="form">
			<div class="form-content dialog" spellcheck="false">
				<input bind:this={replyName} on:input={replyNameInput} type="text" class="form-input" placeholder="ex. Standard greeting">
			</div>
		</div>
	</div>
	<div class="dialog-content-form">
		<p class="form-title">Hotkey</p>
		<div class="form">
			<div class="form-content dialog" spellcheck="false">
				<input bind:this={hotkey} on:keydown={hotkeyKeydown} on:keyup={hotkeyKeyUp} type="text" class="form-input" placeholder="None">
			</div>
		</div>
	</div>
	<div class="dialog-content-form">
		<p class="form-title">Quick reply text</p>
		<div class="form reply-text">
			<div class="form-content dialog textarea" spellcheck="false">
				<!-- svelte-ignore a11y-positive-tabindex -->
				<div bind:this={replyText} on:input={replyTextInput} on:keydown={replyTextKeydown} contenteditable spellcheck="true" class="form-textarea" tabindex="1" />
				{#if placeholder}
					<p class="placeholder">Quick reply text</p>
				{/if}
			</div>
		</div>
		<div class="reply-text-formatting">
			<button class="fa-regular fa-arrow-rotate-left" title="Undo" />
			<button class="fa-regular fa-rotate-right" title="Redo" />
			<button class="fa-regular fa-font-case" title="Font Case" />
			<button class="fa-regular fa-list-ul" title="Dotted List" />
			<button class="fa-regular fa-list-ol" title="Numbered List" />
			<button class="fa-regular fa-list-check" title="Checklist" />
			<button class="fa-regular fa-bold" title="Bold" />
			<button class="fa-regular fa-italic" title="Italic" />
			<button class="fa-regular fa-strikethrough" title="Strikethrough" />
			<button class="fa-regular fa-brackets-curly" title="Dynamic Variables" />
			<button class="emoji-btn" title="Emojis">
				<svg viewBox="0 0 24 24" width="24" height="24" class="ekdr8vow dhq51u3o">
					<path fill="currentColor" d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.505 0-5.388-1.164-5.607-1.959 0 0 5.912 1.055 10.658 0zM11.804 1.011C5.609 1.011.978 6.033.978 12.228s4.826 10.761 11.021 10.761S23.02 18.423 23.02 12.228c.001-6.195-5.021-11.217-11.216-11.217zM12 21.354c-5.273 0-9.381-3.886-9.381-9.159s3.942-9.548 9.215-9.548 9.548 4.275 9.548 9.548c-.001 5.272-4.109 9.159-9.382 9.159zm3.108-9.751c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z"></path>
				</svg>
			</button>
		</div>
	</div>
	<div class="dialog-actions">
		<p bind:this={error} class="dialog-error"></p>
		<button on:click={() => close(false)} class="dialog-btn cancel">CANCEL</button>
		<button on:click={save} class="dialog-btn save">SAVE</button>
	</div>
</section>

<style>

</style>