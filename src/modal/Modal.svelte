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
    import { fly, fade } from 'svelte/transition';
    import { expoIn } from 'svelte/easing';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();

    const baseSetContext = svelte.setContext;

    // Global Variables & Exports
    let props

    export let closeButton = true,
        contextMenuOpen

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
    
    const handleKeydown = (event) => {
        if (!contextMenuOpen && state.closeOnEsc && Component && event.key === 'Escape') {
            event.preventDefault();
            close();
        }
        else if (contextMenuOpen && event.key === 'Escape') {
            contextMenuOpen = false
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

    const hanldeClick = (e) => {
        if (
            e.target.matches('.search-num') ||
            e.target.matches('.search-num-btn') ||
            e.target.matches('.webview-reload')
            ) {
            close()
        }
    }
    
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

<svelte:window on:keydown={handleKeydown} on:click={hanldeClick} />

{#if Component}
    <div class="window-bg"></div>
    <div bind:this={modalWindow} in:fly={{x: -modalWindow.clientWidth, duration: 250, opacity: 1}} out:fly={{x: -modalWindow.clientWidth, duration: 320, opacity: 1, easing: expoIn}} class="window">
        <div class="window-header">
            <div class="window-button-container">
                <button on:click={close} class="window-close fa-regular fa-arrow-left"></button>
            </div>
            <div class="window-title-container">
                <p class="window-title">{props.title}</p>
            </div>
        </div>
        <div class="window-content">
            <svelte:component this={Component} bind:contextMenuOpen={contextMenuOpen} {close}/>
        </div>
    </div>
{/if}
<slot />

<style>
    * {
        box-sizing: border-box;
    }
</style>
