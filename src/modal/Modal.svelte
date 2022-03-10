<script context="module">
    /**
        * Svelte component to be shown as the modal
        * @type {(component: Component, props: Record<string, any>) => Component}
    */

    export function bind(Component, props = {}) {
        return function ModalComponent(options) {
            return new Component({
                ...options,
                props: {
                    ...props,
                    ...options.props,
                },
            });
        };
    }
</script>

<script>
    import * as svelte from 'svelte';
    import { fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();

    const baseSetContext = svelte.setContext;

    /**
        * Svelte component to be shown as the modal
        * @type {Component | null}
    */
    export let show = null;

    /**
        * Svelte context key to reference the simple modal context
        * @type {string}
    */
    export let key = 'modal';

    /**
        * Whether to show a close button or not
        * @type {boolean}
    */
    let props, windowSave, windowMessage, timeout
    export let closeButton = true

    /**
        * Whether to close the modal on hitting the escape key or not
        * @type {boolean}
    */
    export let closeOnEsc = true;

    /**
        * Whether to close the modal upon an outside mouse click or not
        * @type {boolean}
    */
    export let closeOnOuterClick = true;

    /**
        * CSS for styling the background element
        * @type {Record<string, string>}
    */
    export let styleBg = {};

    /**
        * CSS for styling the window wrapper element
        * @type {Record<string, string>}
    */
    export let styleWindowWrap = {};

    /**
        * CSS for styling the window element
        * @type {Record<string, string>}
    */
    export let styleWindow = {};

    /**
        * CSS for styling the content element
        * @type {Record<string, string>}
    */
    export let styleContent = {};

    /**
        * CSS for styling the close element
        * @type {Record<string, string>}
    */
    export let styleCloseButton = {};

    /**
        * @type {string | boolean}
    */
    export let setContext = baseSetContext;

    /**
        * Transition function for the background element
        * @see https://svelte.dev/docs#transition_fn
        * @type {(node: Element, parameters: BlurParams) => TransitionConfig}
    */
    export let transitionBg = fade;

    /**
        * Parameters for the background element transition
        * @type {BlurParams}
    */
    export let transitionBgProps = { duration: 150 };

    /**
        * Transition function for the window element
        * @see https://svelte.dev/docs#transition_fn
        * @type {(node: Element, parameters: BlurParams) => TransitionConfig}
    */
    export let transitionWindow = transitionBg;

    /**
        * Parameters for the window element transition
        * @type {BlurParams}
    */
    export let transitionWindowProps = transitionBgProps;

    /**
        * If `true` elements outside the modal can be focused
        * @type {boolean}
    */
    export let disableFocusTrap = false;

    const defaultState = {
        closeButton,
        closeOnEsc,
        closeOnOuterClick,
        styleBg,
        styleWindowWrap,
        styleWindow,
        styleContent,
        styleCloseButton,
        transitionBg,
        transitionBgProps,
        transitionWindow,
        transitionWindowProps,
        disableFocusTrap,
    };
    let state = { ...defaultState };
    
    let Component = null;


    let background;
    let modalWindow;
    let scrollY;
    let cssBg;
    let cssWindowWrap;
    let cssWindow;
    let cssContent;
    let cssCloseButton;
    let currentTransitionBg;
    let currentTransitionWindow;
    let prevBodyPosition;
    let prevBodyOverflow;
    let prevBodyWidth;
    let outerClickTarget;
    
    const camelCaseToDash = (str) => {
        str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
    }
    
    const toCssString = (props) => {
        props
        ? Object.keys(props).reduce(
            (str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`,
            ''
            )
        : '';
    }
    
    const isFunction = (f) => !!(f && f.constructor && f.call && f.apply);
    
    const updateStyleTransition = () => {
        cssBg = toCssString(
            Object.assign(
                {},
                {
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
                state.styleBg
            )
        );
        
        cssWindowWrap = toCssString(state.styleWindowWrap);
        cssWindow = toCssString(state.styleWindow);
        cssContent = toCssString(state.styleContent);
        cssCloseButton = toCssString(state.styleCloseButton);
        currentTransitionBg = state.transitionBg;
        currentTransitionWindow = state.transitionWindow;
    };
    
    const toVoid = () => {};
    let onOpen = toVoid;
    let onClose = toVoid;
    let onOpened = toVoid;
    let onClosed = toVoid;
    
    const open = (NewComponent, newProps = {}, options = {}, callback = {}) => {
        props = newProps
        Component = bind(NewComponent, newProps);
        state = { ...defaultState, ...options };
        updateStyleTransition();
        onOpen = (event) => {
            if (callback.onOpen) callback.onOpen(event);
            /**
                * The open event is fired right before the modal opens
                * @event {void} open
            */
           dispatch('open');
            /**
                * The opening event is fired right before the modal opens
                * @event {void} opening
                * @deprecated Listen to the `open` event instead
            */
           dispatch('opening'); // Deprecated. Do not use!
        };
        
        onClose = (event) => {
            if (callback.onClose) callback.onClose(event);
            /**
                * The close event is fired right before the modal closes
                * @event {void} close
            */
           dispatch('close');
            /**
                * The closing event is fired right before the modal closes
                * @event {void} closing
                * @deprecated Listen to the `close` event instead
            */
           dispatch('closing'); // Deprecated. Do not use!
        };
        
        onOpened = (event) => {
            if (callback.onOpened) callback.onOpened(event);
            /**
                * The opened event is fired after the modal's opening transition
                * @event {void} opened
            */
           dispatch('opened');
        };
        
        onClosed = (event) => {
            if (callback.onClosed) callback.onClosed(event);
            /**
                * The closed event is fired after the modal's closing transition
                * @event {void} closed
            */
           dispatch('closed');
        };
    };
    
    const close = (callback = {}) => {
        if (!Component) return;
        onClose = callback.onClose || onClose;
        onClosed = callback.onClosed || onClosed;
        Component = null;
    };
    
    // Window Message
    const showMessage = () => {
        clearTimeout(timeout)
        windowMessage.style.opacity = '1'
        timeout = setTimeout(() => {
            windowMessage.style.opacity = '0'
        }, 2000);
    }
    
    const handleKeydown = (event) => {
        if (state.closeOnEsc && Component && event.key === 'Escape') {
            event.preventDefault();
            close();
        }
        
        if (Component && event.key === 'Tab' && !state.disableFocusTrap) {
            // trap focus
            const nodes = modalWindow.querySelectorAll('*');
            const tabbable = Array.from(nodes).filter((node) => node.tabIndex >= 0);
            
            let index = tabbable.indexOf(document.activeElement);
            if (index === -1 && event.shiftKey) index = 0;
            
            index += tabbable.length + (event.shiftKey ? -1 : 1);
            index %= tabbable.length;
            
            tabbable[index].focus();
            event.preventDefault();
        }
    };
    
    setContext(key, { open, close });
    
    let isMounted = false;
    
    $: {
        if (isMounted) {
            if (isFunction(show)) {
                open(show);
            }
            else {
                close();
            }
        }
    }
    
    svelte.onDestroy(() => {
        if (isMounted) close();
    });
    
    svelte.onMount(() => {
        isMounted = true;
    });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if Component}
    <div class="window-container" bind:this={background} transition:currentTransitionBg={state.transitionBgProps} style={cssBg}>
        <div
            class="window"
            role="dialog"
            aria-modal="true"
            bind:this={modalWindow}
            transition:currentTransitionWindow={state.transitionWindowProps}
            on:introstart={onOpen}
            on:outrostart={onClose}
            on:introend={onOpened}
            on:outroend={onClosed}
            style={cssWindow}
        >
            <div class="window-header">
                <p class="window-title">{props.title}</p>
                {#if state.closeButton}
                    {#if isFunction(state.closeButton)}
                        <svelte:component this={state.closeButton} onClose={close} />
                    {:else}
                        <button on:click={close} class="close fa-regular fa-xmark" style={cssCloseButton} />
                    {/if}
                {/if}
            </div>
            <div class="content" style={cssContent}>
                <svelte:component this={Component} bind:windowSave={windowSave} showMessage={showMessage} bind:message={props.message} onClose={close} />
            </div>
            <div class="window-footer">
                <p class="window-message" bind:this={windowMessage}>{props.message}</p>
                <button on:click={windowSave} class="save-btn">Save</button>
            </div>
        </div>
    </div>
{/if}
<slot />

<style>
    * {
        box-sizing: border-box;
    }
    
    .window-container {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        z-index: 3;
        height: 100%;
        width: 100%;
    }
    
    .window {
        position: absolute;
        background: #f0f2f5;
        border-radius: 8px;
        box-shadow: 0px 3px 20px 0 #00000066;
        transition: 0.25s ease-out;
    }
    
    .window-header {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        height: 40px;
        width: 100%;
    }
    
    .window-title {
        font-size: 20px;
    }
    
    .content {
        display: flex;
        text-align: center;
        padding: 0 30px;
    }
    
    .window-footer {
        display: flex;
        position: relative;
        align-items: center;
        height: 50px;
        width: 100%;
    }
    
    .window-message {
        opacity: 0;
        position: absolute;
        left: 15px;
        color: #e83a3a;
        transition: 0.5s ease-in-out;
    }
    
    .close {
        position: absolute;
        right: 0;
        background-color: transparent;
        height: 40px;
        width: 40px;
        font-size: 18px;
        color: #333;
        opacity: 0.6;
    }
    
    .close:hover {
        opacity: 1;
    }
    
    .close:focus {
        opacity: 1;;
    }
    
    .save-btn {
        position: absolute;
        right: 15px;
        height: 30px;
        padding: 0 10px;
        width: 100px;
        background-color: white;
        border-radius: 15px;
        color: #333;
        font-size: 16px;
    }
    
    .save-btn:hover {
        background-color: #ccc;
    }
    
    .save-btn:active {
        background-color: white;
    }
</style>
