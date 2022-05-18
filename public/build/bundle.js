
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function expoIn(t) {
        return t === 0.0 ? t : Math.pow(2.0, 10.0 * (t - 1.0));
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const subMenuContent = writable({component: null, title: null});

    /* src\svelte\menus\sub-menus\accounts-users.svelte generated by Svelte v3.48.0 */
    const file$3 = "src\\svelte\\menus\\sub-menus\\accounts-users.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[2] = i;
    	return child_ctx;
    }

    // (50:4) {#each accounts as account, i}
    function create_each_block$3(ctx) {
    	let button;
    	let span1;
    	let span0;
    	let t0_value = /*i*/ ctx[2] + 1 + "";
    	let t0;
    	let t1;
    	let span3;
    	let span2;
    	let t2_value = /*account*/ ctx[8].name + "";
    	let t2;
    	let t3;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span1 = element("span");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span3 = element("span");
    			span2 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(span0, file$3, 52, 16, 1562);
    			attr_dev(span1, "class", "menu-list-item-icon");
    			add_location(span1, file$3, 51, 12, 1510);
    			add_location(span2, file$3, 55, 16, 1670);
    			attr_dev(span3, "class", "menu-list-item-label");
    			add_location(span3, file$3, 54, 12, 1617);
    			attr_dev(button, "class", "menu-list-item");
    			button.disabled = button_disabled_value = /*account*/ ctx[8].active;
    			add_location(button, file$3, 50, 8, 1414);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span1);
    			append_dev(span1, span0);
    			append_dev(span0, t0);
    			append_dev(button, t1);
    			append_dev(button, span3);
    			append_dev(span3, span2);
    			append_dev(span2, t2);
    			append_dev(button, t3);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*switchAccount*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*accounts*/ 1 && t2_value !== (t2_value = /*account*/ ctx[8].name + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*accounts*/ 1 && button_disabled_value !== (button_disabled_value = /*account*/ ctx[8].active)) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(50:4) {#each accounts as account, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let input;
    	let input_placeholder_value;
    	let t0;
    	let div2;
    	let t1;
    	let div4;
    	let div3;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*accounts*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div4 = element("div");
    			div3 = element("div");
    			button = element("button");
    			button.textContent = "Add Account";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "search-input");
    			attr_dev(input, "placeholder", input_placeholder_value = "Search " + /*accounts*/ ctx[0].length + " Accounts");
    			add_location(input, file$3, 45, 8, 1195);
    			attr_dev(div0, "class", "form-content");
    			attr_dev(div0, "spellcheck", "false");
    			add_location(div0, file$3, 44, 4, 1140);
    			attr_dev(div1, "class", "form");
    			add_location(div1, file$3, 43, 0, 1116);
    			attr_dev(div2, "class", "menu-list svelte-yr1knj");
    			add_location(div2, file$3, 48, 0, 1328);
    			attr_dev(button, "class", "form-button");
    			add_location(button, file$3, 62, 12, 1832);
    			attr_dev(div3, "class", "form-content");
    			add_location(div3, file$3, 61, 8, 1792);
    			attr_dev(div4, "class", "form");
    			add_location(div4, file$3, 60, 4, 1764);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			/*div2_binding*/ ctx[5](div2);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, button);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*searchInput*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*accounts*/ 1 && input_placeholder_value !== (input_placeholder_value = "Search " + /*accounts*/ ctx[0].length + " Accounts")) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*accounts, switchAccount*/ 17) {
    				each_value = /*accounts*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			/*div2_binding*/ ctx[5](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $subMenuContent;
    	validate_store(subMenuContent, 'subMenuContent');
    	component_subscribe($$self, subMenuContent, $$value => $$invalidate(6, $subMenuContent = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Accounts_users', slots, []);
    	let { accounts } = $$props;

    	// Variables
    	let i, list, accStore = $subMenuContent.accStore;

    	// Functions
    	const searchInput = e => {
    		let listBtns = list.querySelectorAll('button');
    		let value = e.target.value.toUpperCase();

    		for ($$invalidate(2, i = 0); i < listBtns.length; $$invalidate(2, i++, i)) {
    			let nameStr = listBtns[i].querySelectorAll('span')[2];

    			if (nameStr.textContent.toUpperCase().startsWith(value)) {
    				listBtns[i].style.display = '';
    			} else {
    				listBtns[i].style.display = 'none';
    			}
    		}
    	};

    	const switchAccount = e => {
    		$$invalidate(0, accounts = accounts.map(obj => ({
    			...obj,
    			active: obj.name == e.target.querySelector('.menu-list-item-label').textContent
    		})));

    		accStore.set('accounts', accounts);
    		subMenuContent.set({ component: null, title: null });
    	};

    	const writable_props = ['accounts'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Accounts_users> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			list = $$value;
    			$$invalidate(1, list);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('accounts' in $$props) $$invalidate(0, accounts = $$props.accounts);
    	};

    	$$self.$capture_state = () => ({
    		subMenuContent,
    		accounts,
    		i,
    		list,
    		accStore,
    		searchInput,
    		switchAccount,
    		$subMenuContent
    	});

    	$$self.$inject_state = $$props => {
    		if ('accounts' in $$props) $$invalidate(0, accounts = $$props.accounts);
    		if ('i' in $$props) $$invalidate(2, i = $$props.i);
    		if ('list' in $$props) $$invalidate(1, list = $$props.list);
    		if ('accStore' in $$props) accStore = $$props.accStore;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [accounts, list, i, searchInput, switchAccount, div2_binding];
    }

    class Accounts_users extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { accounts: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Accounts_users",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*accounts*/ ctx[0] === undefined && !('accounts' in props)) {
    			console.warn("<Accounts_users> was created without expected prop 'accounts'");
    		}
    	}

    	get accounts() {
    		throw new Error("<Accounts_users>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accounts(value) {
    		throw new Error("<Accounts_users>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\svelte\menus\sub-menus\country-codes.svelte generated by Svelte v3.48.0 */
    const file$2 = "src\\svelte\\menus\\sub-menus\\country-codes.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (52:4) {#each countryCodes as countryCode}
    function create_each_block$2(ctx) {
    	let button;
    	let span1;
    	let span0;
    	let t0;
    	let span4;
    	let span2;
    	let t1_value = /*countryCode*/ ctx[1].code + "";
    	let t1;
    	let t2;
    	let span3;
    	let t3_value = /*countryCode*/ ctx[1].name + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*countryCode*/ ctx[1]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			span1 = element("span");
    			span0 = element("span");
    			t0 = space();
    			span4 = element("span");
    			span2 = element("span");
    			t1 = text(t1_value);
    			t2 = text(" - ");
    			span3 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			attr_dev(span0, "class", "flag-icon " + /*countryCode*/ ctx[1].flag + " svelte-1fmd2tm");
    			add_location(span0, file$2, 54, 16, 1880);
    			attr_dev(span1, "class", "menu-list-item-icon");
    			add_location(span1, file$2, 53, 12, 1828);
    			add_location(span2, file$2, 57, 16, 2013);
    			add_location(span3, file$2, 57, 50, 2047);
    			attr_dev(span4, "class", "menu-list-item-label");
    			add_location(span4, file$2, 56, 12, 1960);
    			attr_dev(button, "class", "menu-list-item");
    			add_location(button, file$2, 52, 8, 1660);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span1);
    			append_dev(span1, span0);
    			append_dev(button, t0);
    			append_dev(button, span4);
    			append_dev(span4, span2);
    			append_dev(span2, t1);
    			append_dev(span4, t2);
    			append_dev(span4, span3);
    			append_dev(span3, t3);
    			append_dev(button, t4);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(52:4) {#each countryCodes as countryCode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let input;
    	let t;
    	let div2;
    	let mounted;
    	let dispose;
    	let each_value = /*countryCodes*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "search-input");
    			attr_dev(input, "placeholder", "Search " + /*countryCodes*/ ctx[2].length + " Country Names/Codes");
    			add_location(input, file$2, 47, 8, 1421);
    			attr_dev(div0, "class", "form-content");
    			attr_dev(div0, "spellcheck", "false");
    			add_location(div0, file$2, 46, 4, 1366);
    			attr_dev(div1, "class", "form");
    			add_location(div1, file$2, 45, 0, 1342);
    			attr_dev(div2, "class", "menu-list svelte-1fmd2tm");
    			add_location(div2, file$2, 50, 0, 1569);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			/*div2_binding*/ ctx[6](div2);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*searchInput*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*listBtnClick, countryCodes*/ 20) {
    				each_value = /*countryCodes*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			/*div2_binding*/ ctx[6](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $subMenuContent;
    	validate_store(subMenuContent, 'subMenuContent');
    	component_subscribe($$self, subMenuContent, $$value => $$invalidate(8, $subMenuContent = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Country_codes', slots, []);
    	const countryCodes = require('./resources/country-codes.json');

    	// Exports
    	// Variables
    	let i,
    		list,
    		settStore = $subMenuContent.settStore,
    		countryCode = settStore.get('country-code');

    	// Functions
    	const searchInput = e => {
    		let listBtns = list.querySelectorAll('button');
    		let value = e.target.value.toUpperCase();

    		for (i = 0; i < listBtns.length; i++) {
    			let wholeValue = listBtns[i].querySelectorAll('span')[2];
    			let nameStr = listBtns[i].querySelectorAll('span')[4];

    			if (wholeValue.textContent.toUpperCase().startsWith(value)
    			? wholeValue.textContent.toUpperCase().startsWith(value)
    			: nameStr.textContent.toUpperCase().startsWith(value)) {
    				listBtns[i].style.display = '';
    			} else {
    				listBtns[i].style.display = 'none';
    			}
    		}
    	};

    	const listBtnClick = args => {
    		$$invalidate(1, countryCode = {
    			name: args.name,
    			code: args.code,
    			flag: args.flag
    		});

    		settStore.set('country-code', countryCode);
    		subMenuContent.set({ component: null, title: null });
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Country_codes> was created with unknown prop '${key}'`);
    	});

    	const click_handler = countryCode => listBtnClick({
    		id: 'country-btn',
    		name: countryCode.name,
    		code: countryCode.code,
    		flag: countryCode.flag
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			list = $$value;
    			$$invalidate(0, list);
    		});
    	}

    	$$self.$capture_state = () => ({
    		subMenuContent,
    		countryCodes,
    		i,
    		list,
    		settStore,
    		countryCode,
    		searchInput,
    		listBtnClick,
    		$subMenuContent
    	});

    	$$self.$inject_state = $$props => {
    		if ('i' in $$props) i = $$props.i;
    		if ('list' in $$props) $$invalidate(0, list = $$props.list);
    		if ('settStore' in $$props) settStore = $$props.settStore;
    		if ('countryCode' in $$props) $$invalidate(1, countryCode = $$props.countryCode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		list,
    		countryCode,
    		countryCodes,
    		searchInput,
    		listBtnClick,
    		click_handler,
    		div2_binding
    	];
    }

    class Country_codes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Country_codes",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\svelte\menus\sub-menus\quick-replies.svelte generated by Svelte v3.48.0 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Quick_replies', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Quick_replies> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Quick_replies extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quick_replies",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\svelte\menus\sub-menus\settings.svelte generated by Svelte v3.48.0 */

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Settings', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\svelte\menus\main-menu.svelte generated by Svelte v3.48.0 */
    const file$1 = "src\\svelte\\menus\\main-menu.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	return child_ctx;
    }

    // (217:0) {:else}
    function create_else_block$1(ctx) {
    	let div3;
    	let header;
    	let div2;
    	let div0;
    	let button;
    	let span;
    	let svg;
    	let path;
    	let t0;
    	let div1;
    	let h1;
    	let t1_value = /*$subMenuContent*/ ctx[11].title + "";
    	let t1;
    	let t2;
    	let switch_instance;
    	let div3_intro;
    	let div3_outro;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*$subMenuContent*/ ctx[11].component;

    	function switch_props(ctx) {
    		return {
    			props: { accounts: /*accounts*/ ctx[1] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			header = element("header");
    			div2 = element("div");
    			div0 = element("div");
    			button = element("button");
    			span = element("span");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "m12 4 1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z");
    			add_location(path, file$1, 224, 28, 8721);
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "class", "");
    			add_location(svg, file$1, 223, 24, 8634);
    			attr_dev(span, "data-testid", "back");
    			attr_dev(span, "data-icon", "back");
    			attr_dev(span, "class", "");
    			add_location(span, file$1, 222, 20, 8557);
    			attr_dev(button, "class", "back-btn");
    			attr_dev(button, "aria-label", "Back");
    			add_location(button, file$1, 221, 16, 8424);
    			attr_dev(div0, "class", "menu-back");
    			add_location(div0, file$1, 220, 12, 8383);
    			add_location(h1, file$1, 230, 16, 8976);
    			attr_dev(div1, "class", "menu-title");
    			add_location(div1, file$1, 229, 12, 8934);
    			attr_dev(div2, "class", "header-content");
    			add_location(div2, file$1, 219, 8, 8341);
    			add_location(header, file$1, 218, 4, 8323);
    			attr_dev(div3, "class", "menu-content");
    			add_location(div3, file$1, 217, 0, 8104);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, header);
    			append_dev(header, div2);
    			append_dev(div2, div0);
    			append_dev(div0, button);
    			append_dev(button, span);
    			append_dev(span, svg);
    			append_dev(svg, path);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div3, t2);

    			if (switch_instance) {
    				mount_component(switch_instance, div3, null);
    			}

    			/*div3_binding*/ ctx[25](div3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_4*/ ctx[24], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*$subMenuContent*/ 2048) && t1_value !== (t1_value = /*$subMenuContent*/ ctx[11].title + "")) set_data_dev(t1, t1_value);
    			const switch_instance_changes = {};
    			if (dirty[0] & /*accounts*/ 2) switch_instance_changes.accounts = /*accounts*/ ctx[1];

    			if (switch_value !== (switch_value = /*$subMenuContent*/ ctx[11].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div3, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (div3_outro) div3_outro.end(1);

    				div3_intro = create_in_transition(div3, fly, {
    					x: /*subMenu*/ ctx[8].offsetWidth,
    					duration: 230,
    					opacity: 1
    				});

    				div3_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (div3_intro) div3_intro.invalidate();

    			div3_outro = create_out_transition(div3, fly, !/*$subMenuContent*/ ctx[11].component
    			? {
    					x: /*subMenu*/ ctx[8].offsetWidth,
    					duration: 230,
    					opacity: 1
    				}
    			: { opacity: 1 });

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (switch_instance) destroy_component(switch_instance);
    			/*div3_binding*/ ctx[25](null);
    			if (detaching && div3_outro) div3_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(217:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (102:0) {#if !$subMenuContent.component}
    function create_if_block$1(ctx) {
    	let div8;
    	let header;
    	let div2;
    	let div0;
    	let button0;
    	let span0;
    	let svg;
    	let path;
    	let t0;
    	let div1;
    	let h1;
    	let div2_intro;
    	let t2;
    	let t3;
    	let div4;
    	let button1;
    	let span2;
    	let span1;
    	let t4;
    	let div3;
    	let span3;
    	let t5;
    	let t6;
    	let span4;
    	let t7;
    	let t8;
    	let div6;
    	let div5;
    	let button2;
    	let span5;
    	let span5_class_value;
    	let t9;
    	let span6;
    	let t10_value = /*countryCode*/ ctx[10].code + "";
    	let t10;
    	let button2_title_value;
    	let t11;
    	let input;
    	let t12;
    	let div7;
    	let button3;
    	let span8;
    	let span7;
    	let t13;
    	let span10;
    	let span9;
    	let t15;
    	let button4;
    	let span12;
    	let span11;
    	let t16;
    	let span14;
    	let span13;
    	let t18;
    	let button5;
    	let span16;
    	let span15;
    	let t19;
    	let span18;
    	let span17;
    	let t21;
    	let button6;
    	let span20;
    	let span19;
    	let t22;
    	let span22;
    	let span21;
    	let t24;
    	let button7;
    	let span24;
    	let span23;
    	let t25;
    	let span26;
    	let span25;
    	let t27;
    	let button8;
    	let span28;
    	let span27;
    	let t28;
    	let span30;
    	let span29;
    	let t30;
    	let footer;
    	let span31;
    	let t31_value = /*AppDetails*/ ctx[2].author + "";
    	let t31;
    	let t32;
    	let t33_value = /*AppDetails*/ ctx[2].appName + "";
    	let t33;
    	let t34;
    	let t35_value = /*AppDetails*/ ctx[2].version + "";
    	let t35;
    	let div8_intro;
    	let div8_outro;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*accounts*/ ctx[1] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			header = element("header");
    			div2 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Main Menu";
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			div4 = element("div");
    			button1 = element("button");
    			span2 = element("span");
    			span1 = element("span");
    			t4 = space();
    			div3 = element("div");
    			span3 = element("span");
    			t5 = text(/*accountName*/ ctx[5]);
    			t6 = space();
    			span4 = element("span");
    			t7 = text(/*userName*/ ctx[6]);
    			t8 = space();
    			div6 = element("div");
    			div5 = element("div");
    			button2 = element("button");
    			span5 = element("span");
    			t9 = space();
    			span6 = element("span");
    			t10 = text(t10_value);
    			t11 = space();
    			input = element("input");
    			t12 = space();
    			div7 = element("div");
    			button3 = element("button");
    			span8 = element("span");
    			span7 = element("span");
    			t13 = space();
    			span10 = element("span");
    			span9 = element("span");
    			span9.textContent = "Quick replies";
    			t15 = space();
    			button4 = element("button");
    			span12 = element("span");
    			span11 = element("span");
    			t16 = space();
    			span14 = element("span");
    			span13 = element("span");
    			span13.textContent = "Settings";
    			t18 = space();
    			button5 = element("button");
    			span16 = element("span");
    			span15 = element("span");
    			t19 = space();
    			span18 = element("span");
    			span17 = element("span");
    			span17.textContent = "Check for updates";
    			t21 = space();
    			button6 = element("button");
    			span20 = element("span");
    			span19 = element("span");
    			t22 = space();
    			span22 = element("span");
    			span21 = element("span");
    			span21.textContent = "Refresh WhatsApp";
    			t24 = space();
    			button7 = element("button");
    			span24 = element("span");
    			span23 = element("span");
    			t25 = space();
    			span26 = element("span");
    			span25 = element("span");
    			span25.textContent = "Help";
    			t27 = space();
    			button8 = element("button");
    			span28 = element("span");
    			span27 = element("span");
    			t28 = space();
    			span30 = element("span");
    			span29 = element("span");
    			span29.textContent = "About";
    			t30 = space();
    			footer = element("footer");
    			span31 = element("span");
    			t31 = text(t31_value);
    			t32 = text(" | ");
    			t33 = text(t33_value);
    			t34 = text(" v");
    			t35 = text(t35_value);
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "m12 4 1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z");
    			add_location(path, file$1, 109, 28, 3302);
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "class", "");
    			add_location(svg, file$1, 108, 24, 3215);
    			attr_dev(span0, "data-testid", "back");
    			attr_dev(span0, "data-icon", "back");
    			attr_dev(span0, "class", "");
    			add_location(span0, file$1, 107, 20, 3138);
    			attr_dev(button0, "class", "back-btn");
    			attr_dev(button0, "aria-label", "Back");
    			add_location(button0, file$1, 106, 16, 3053);
    			attr_dev(div0, "class", "menu-back");
    			add_location(div0, file$1, 105, 12, 3012);
    			add_location(h1, file$1, 115, 16, 3557);
    			attr_dev(div1, "class", "menu-title");
    			add_location(div1, file$1, 114, 12, 3515);
    			attr_dev(div2, "class", "header-content");
    			add_location(div2, file$1, 104, 8, 2910);
    			add_location(header, file$1, 103, 4, 2892);
    			attr_dev(span1, "class", "fa-solid fa-user");
    			add_location(span1, file$1, 145, 12, 5160);
    			attr_dev(span2, "class", "account-icon");
    			add_location(span2, file$1, 144, 8, 5119);
    			attr_dev(span3, "class", "account-name");
    			add_location(span3, file$1, 148, 16, 5275);
    			attr_dev(span4, "class", "user-name");
    			add_location(span4, file$1, 149, 16, 5340);
    			attr_dev(div3, "class", "active-account-user");
    			add_location(div3, file$1, 147, 12, 5224);
    			attr_dev(button1, "class", "account-details");
    			add_location(button1, file$1, 143, 8, 4984);
    			attr_dev(div4, "class", "account");
    			add_location(div4, file$1, 142, 4, 4953);
    			attr_dev(span5, "class", span5_class_value = "flag-icon " + /*countryCode*/ ctx[10].flag + " svelte-158bds");
    			add_location(span5, file$1, 156, 16, 5696);
    			add_location(span6, file$1, 157, 16, 5759);
    			attr_dev(button2, "class", "country-codes");
    			attr_dev(button2, "title", button2_title_value = /*countryCode*/ ctx[10].name);
    			add_location(button2, file$1, 155, 12, 5525);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "search-input");
    			attr_dev(input, "placeholder", "Enter Number");
    			add_location(input, file$1, 159, 12, 5827);
    			attr_dev(div5, "class", "form-content");
    			attr_dev(div5, "spellcheck", "false");
    			add_location(div5, file$1, 154, 8, 5466);
    			attr_dev(div6, "class", "form");
    			add_location(div6, file$1, 153, 4, 5438);
    			attr_dev(span7, "class", "fa-solid fa-bolt");
    			add_location(span7, file$1, 165, 16, 6190);
    			attr_dev(span8, "class", "menu-list-item-icon");
    			add_location(span8, file$1, 164, 12, 6138);
    			add_location(span9, file$1, 168, 16, 6311);
    			attr_dev(span10, "class", "menu-list-item-label");
    			add_location(span10, file$1, 167, 12, 6258);
    			attr_dev(button3, "class", "menu-list-item");
    			add_location(button3, file$1, 163, 8, 6006);
    			attr_dev(span11, "class", "fa-solid fa-gear");
    			add_location(span11, file$1, 173, 16, 6573);
    			attr_dev(span12, "class", "menu-list-item-icon");
    			add_location(span12, file$1, 172, 12, 6521);
    			add_location(span13, file$1, 176, 16, 6694);
    			attr_dev(span14, "class", "menu-list-item-label");
    			add_location(span14, file$1, 175, 12, 6641);
    			attr_dev(button4, "class", "menu-list-item");
    			add_location(button4, file$1, 171, 8, 6387);
    			attr_dev(span15, "class", "fa-solid fa-down-from-line");
    			add_location(span15, file$1, 181, 16, 6862);
    			attr_dev(span16, "class", "menu-list-item-icon");
    			add_location(span16, file$1, 180, 12, 6810);
    			add_location(span17, file$1, 184, 16, 6993);
    			attr_dev(span18, "class", "menu-list-item-label");
    			add_location(span18, file$1, 183, 12, 6940);
    			attr_dev(button5, "class", "menu-list-item");
    			add_location(button5, file$1, 179, 8, 6765);
    			attr_dev(span19, "class", "fa-solid fa-rotate-right");
    			add_location(span19, file$1, 189, 16, 7170);
    			attr_dev(span20, "class", "menu-list-item-icon");
    			add_location(span20, file$1, 188, 12, 7118);
    			add_location(span21, file$1, 192, 16, 7299);
    			attr_dev(span22, "class", "menu-list-item-label");
    			add_location(span22, file$1, 191, 12, 7246);
    			attr_dev(button6, "class", "menu-list-item");
    			add_location(button6, file$1, 187, 8, 7073);
    			attr_dev(span23, "class", "fa-solid fa-circle-question");
    			add_location(span23, file$1, 197, 16, 7475);
    			attr_dev(span24, "class", "menu-list-item-icon");
    			add_location(span24, file$1, 196, 12, 7423);
    			add_location(span25, file$1, 200, 16, 7607);
    			attr_dev(span26, "class", "menu-list-item-label");
    			add_location(span26, file$1, 199, 12, 7554);
    			attr_dev(button7, "class", "menu-list-item");
    			add_location(button7, file$1, 195, 8, 7378);
    			attr_dev(span27, "class", "fa-solid fa-circle-info");
    			add_location(span27, file$1, 205, 16, 7771);
    			attr_dev(span28, "class", "menu-list-item-icon");
    			add_location(span28, file$1, 204, 12, 7719);
    			add_location(span29, file$1, 208, 16, 7899);
    			attr_dev(span30, "class", "menu-list-item-label");
    			add_location(span30, file$1, 207, 12, 7846);
    			attr_dev(button8, "class", "menu-list-item");
    			add_location(button8, file$1, 203, 8, 7674);
    			attr_dev(div7, "class", "menu-list svelte-158bds");
    			add_location(div7, file$1, 162, 4, 5973);
    			add_location(span31, file$1, 213, 8, 7993);
    			add_location(footer, file$1, 212, 4, 7975);
    			attr_dev(div8, "class", "menu-content");
    			add_location(div8, file$1, 102, 0, 2644);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, header);
    			append_dev(header, div2);
    			append_dev(div2, div0);
    			append_dev(div0, button0);
    			append_dev(button0, span0);
    			append_dev(span0, svg);
    			append_dev(svg, path);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(header, t2);
    			if (if_block) if_block.m(header, null);
    			append_dev(div8, t3);
    			append_dev(div8, div4);
    			append_dev(div4, button1);
    			append_dev(button1, span2);
    			append_dev(span2, span1);
    			append_dev(button1, t4);
    			append_dev(button1, div3);
    			append_dev(div3, span3);
    			append_dev(span3, t5);
    			append_dev(div3, t6);
    			append_dev(div3, span4);
    			append_dev(span4, t7);
    			append_dev(div8, t8);
    			append_dev(div8, div6);
    			append_dev(div6, div5);
    			append_dev(div5, button2);
    			append_dev(button2, span5);
    			append_dev(button2, t9);
    			append_dev(button2, span6);
    			append_dev(span6, t10);
    			append_dev(div5, t11);
    			append_dev(div5, input);
    			/*input_binding*/ ctx[20](input);
    			append_dev(div8, t12);
    			append_dev(div8, div7);
    			append_dev(div7, button3);
    			append_dev(button3, span8);
    			append_dev(span8, span7);
    			append_dev(button3, t13);
    			append_dev(button3, span10);
    			append_dev(span10, span9);
    			append_dev(div7, t15);
    			append_dev(div7, button4);
    			append_dev(button4, span12);
    			append_dev(span12, span11);
    			append_dev(button4, t16);
    			append_dev(button4, span14);
    			append_dev(span14, span13);
    			append_dev(div7, t18);
    			append_dev(div7, button5);
    			append_dev(button5, span16);
    			append_dev(span16, span15);
    			append_dev(button5, t19);
    			append_dev(button5, span18);
    			append_dev(span18, span17);
    			append_dev(div7, t21);
    			append_dev(div7, button6);
    			append_dev(button6, span20);
    			append_dev(span20, span19);
    			append_dev(button6, t22);
    			append_dev(button6, span22);
    			append_dev(span22, span21);
    			append_dev(div7, t24);
    			append_dev(div7, button7);
    			append_dev(button7, span24);
    			append_dev(span24, span23);
    			append_dev(button7, t25);
    			append_dev(button7, span26);
    			append_dev(span26, span25);
    			append_dev(div7, t27);
    			append_dev(div7, button8);
    			append_dev(button8, span28);
    			append_dev(span28, span27);
    			append_dev(button8, t28);
    			append_dev(button8, span30);
    			append_dev(span30, span29);
    			append_dev(div8, t30);
    			append_dev(div8, footer);
    			append_dev(footer, span31);
    			append_dev(span31, t31);
    			append_dev(span31, t32);
    			append_dev(span31, t33);
    			append_dev(span31, t34);
    			append_dev(span31, t35);
    			/*div8_binding*/ ctx[23](div8);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*openMenu*/ ctx[3])) /*openMenu*/ ctx[3].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button1, "click", /*click_handler*/ ctx[18], false, false, false),
    					listen_dev(button2, "click", /*click_handler_1*/ ctx[19], false, false, false),
    					listen_dev(input, "keydown", /*inputKeydown*/ ctx[13], false, false, false),
    					listen_dev(button3, "click", /*click_handler_2*/ ctx[21], false, false, false),
    					listen_dev(button4, "click", /*click_handler_3*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*accounts*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*accounts*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(header, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*accountName*/ 32) set_data_dev(t5, /*accountName*/ ctx[5]);
    			if (!current || dirty[0] & /*userName*/ 64) set_data_dev(t7, /*userName*/ ctx[6]);

    			if (!current || dirty[0] & /*countryCode*/ 1024 && span5_class_value !== (span5_class_value = "flag-icon " + /*countryCode*/ ctx[10].flag + " svelte-158bds")) {
    				attr_dev(span5, "class", span5_class_value);
    			}

    			if ((!current || dirty[0] & /*countryCode*/ 1024) && t10_value !== (t10_value = /*countryCode*/ ctx[10].code + "")) set_data_dev(t10, t10_value);

    			if (!current || dirty[0] & /*countryCode*/ 1024 && button2_title_value !== (button2_title_value = /*countryCode*/ ctx[10].name)) {
    				attr_dev(button2, "title", button2_title_value);
    			}

    			if ((!current || dirty[0] & /*AppDetails*/ 4) && t31_value !== (t31_value = /*AppDetails*/ ctx[2].author + "")) set_data_dev(t31, t31_value);
    			if ((!current || dirty[0] & /*AppDetails*/ 4) && t33_value !== (t33_value = /*AppDetails*/ ctx[2].appName + "")) set_data_dev(t33, t33_value);
    			if ((!current || dirty[0] & /*AppDetails*/ 4) && t35_value !== (t35_value = /*AppDetails*/ ctx[2].version + "")) set_data_dev(t35, t35_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (!div2_intro) {
    				add_render_callback(() => {
    					div2_intro = create_in_transition(div2, fly, !/*subMenu*/ ctx[8]
    					? { x: -100, duration: 700 }
    					: { opacity: 1 });

    					div2_intro.start();
    				});
    			}

    			transition_in(if_block);

    			add_render_callback(() => {
    				if (div8_outro) div8_outro.end(1);

    				div8_intro = create_in_transition(div8, fly, /*subMenu*/ ctx[8]
    				? {
    						x: -/*mainMenu*/ ctx[7].offsetWidth,
    						duration: 230,
    						opacity: 1
    					}
    				: { opacity: 1 });

    				div8_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (div8_intro) div8_intro.invalidate();

    			div8_outro = create_out_transition(div8, fly, /*$subMenuContent*/ ctx[11].component
    			? {
    					x: -/*mainMenu*/ ctx[7].offsetWidth,
    					duration: 230,
    					opacity: 1
    				}
    			: { opacity: 1 });

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if (if_block) if_block.d();
    			/*input_binding*/ ctx[20](null);
    			/*div8_binding*/ ctx[23](null);
    			if (detaching && div8_outro) div8_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(102:0) {#if !$subMenuContent.component}",
    		ctx
    	});

    	return block;
    }

    // (119:8) {#if accounts}
    function create_if_block_1$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*accounts*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*accounts, switchUser, dropdownOpen, logout, openDropdown*/ 114691) {
    				each_value = /*accounts*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(119:8) {#if accounts}",
    		ctx
    	});

    	return block;
    }

    // (121:16) {#if account.active}
    function create_if_block_2$1(ctx) {
    	let div;
    	let button0;
    	let span;
    	let button0_class_value;
    	let t0;
    	let button1;
    	let t1;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*dropdownOpen*/ ctx[0] && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			span = element("span");
    			t0 = space();
    			button1 = element("button");
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(span, "class", "fa-regular fa-arrow-up-arrow-down");
    			add_location(span, file$1, 123, 28, 3947);
    			attr_dev(button0, "id", "dropdown-btn");
    			attr_dev(button0, "class", button0_class_value = "account-action-btn " + (/*dropdownOpen*/ ctx[0] ? 'open' : ''));
    			attr_dev(button0, "title", "Switch User");
    			add_location(button0, file$1, 122, 24, 3791);
    			attr_dev(button1, "class", "account-action-btn fa-solid fa-arrow-right-from-bracket");
    			attr_dev(button1, "title", "Logout");
    			add_location(button1, file$1, 125, 24, 4063);
    			attr_dev(div, "class", "account-actions");
    			add_location(div, file$1, 121, 20, 3736);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, span);
    			append_dev(div, t0);
    			append_dev(div, button1);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*openDropdown*/ ctx[14], false, false, false),
    					listen_dev(button1, "click", /*logout*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*dropdownOpen*/ 1 && button0_class_value !== (button0_class_value = "account-action-btn " + (/*dropdownOpen*/ ctx[0] ? 'open' : ''))) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (/*dropdownOpen*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*dropdownOpen*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t2);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(121:16) {#if account.active}",
    		ctx
    	});

    	return block;
    }

    // (127:24) {#if dropdownOpen}
    function create_if_block_3(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let div1_transition;
    	let current;
    	let each_value_1 = /*account*/ ctx[30].users;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "user-dropdown-list");
    			add_location(div0, file$1, 129, 36, 4423);
    			attr_dev(div1, "class", "user-dropdown-content");
    			add_location(div1, file$1, 128, 32, 4315);
    			attr_dev(div2, "class", "user-dropdown-container");
    			add_location(div2, file$1, 127, 28, 4244);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*switchUser, accounts*/ 32770) {
    				each_value_1 = /*account*/ ctx[30].users;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, scale, { duration: 250 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, scale, { duration: 250 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(127:24) {#if dropdownOpen}",
    		ctx
    	});

    	return block;
    }

    // (131:40) {#each account.users as user}
    function create_each_block_1(ctx) {
    	let button;
    	let t_value = /*user*/ ctx[33].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "id", "dropdown-list-btn");
    			add_location(button, file$1, 131, 44, 4572);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*switchUser*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*accounts*/ 2 && t_value !== (t_value = /*user*/ ctx[33].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(131:40) {#each account.users as user}",
    		ctx
    	});

    	return block;
    }

    // (120:12) {#each accounts as account}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*account*/ ctx[30].active && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*account*/ ctx[30].active) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*accounts*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(120:12) {#each accounts as account}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*$subMenuContent*/ ctx[11].component) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $subMenuContent;
    	validate_store(subMenuContent, 'subMenuContent');
    	component_subscribe($$self, subMenuContent, $$value => $$invalidate(11, $subMenuContent = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main_menu', slots, []);
    	const { ipcRenderer } = require('electron');
    	const Store = require('electron-store');
    	let { openMenu, dropdownOpen, numberSearch, accStore, accounts, accountName, userName, AppDetails = [] } = $$props;

    	// Variables
    	let mainMenu, subMenu, number;

    	let settStore = new Store({
    			name: 'settings',
    			cwd: 'Partitions',
    			fileExtension: '',
    			watch: true,
    			defaults: {
    				settings: [],
    				'country-code': {
    					name: 'United States',
    					code: '+1',
    					flag: 'flag-icon-us'
    				}
    			}
    		});

    	let settings = settStore.get('settings');
    	let countryCode = settStore.get('country-code');

    	// Functions
    	onMount(async () => {
    		$$invalidate(2, AppDetails = await ipcRenderer.invoke('get-details'));
    		number.focus();
    	});

    	onDestroy(() => {
    		subMenuContent.set({ component: null, title: null });
    		unsubscribe();
    		$$invalidate(0, dropdownOpen = false);
    	});

    	const unsubscribe = settStore.onDidAnyChange(() => {
    		settings = settStore.get('settings');
    		$$invalidate(10, countryCode = settStore.get('country-code'));
    	});

    	const inputKeydown = e => {
    		numberSearch(e, number.value, countryCode.code, callback => {
    			if (callback) {
    				openMenu();
    			}
    		});
    	};

    	const openDropdown = e => {
    		if (dropdownOpen) {
    			$$invalidate(0, dropdownOpen = false);
    			e.target.focus();
    		} else {
    			$$invalidate(0, dropdownOpen = true);
    			e.target.blur();
    		}
    	};

    	const switchUser = e => {
    		$$invalidate(1, accounts = accounts.map(obj => obj.active
    		? {
    				...obj,
    				users: obj.users.map(user => ({
    					...user,
    					active: user.name == e.target.innerHTML
    				}))
    			}
    		: obj));

    		accStore.set('accounts', accounts);
    		$$invalidate(0, dropdownOpen = false);
    	};

    	const logout = () => {
    		$$invalidate(1, accounts = accounts.map(obj => ({ ...obj, active: false })));
    		accStore.set('accounts', accounts);
    	};

    	const writable_props = [
    		'openMenu',
    		'dropdownOpen',
    		'numberSearch',
    		'accStore',
    		'accounts',
    		'accountName',
    		'userName',
    		'AppDetails'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main_menu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => subMenuContent.set({
    		component: Accounts_users,
    		title: 'Accounts',
    		accStore
    	});

    	const click_handler_1 = () => subMenuContent.set({
    		component: Country_codes,
    		title: 'Country Codes',
    		settStore
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			number = $$value;
    			$$invalidate(9, number);
    		});
    	}

    	const click_handler_2 = () => subMenuContent.set({
    		component: Quick_replies,
    		title: 'Quick Replies'
    	});

    	const click_handler_3 = () => subMenuContent.set({
    		component: Settings,
    		title: 'Settings',
    		settStore
    	});

    	function div8_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			mainMenu = $$value;
    			$$invalidate(7, mainMenu);
    		});
    	}

    	const click_handler_4 = () => subMenuContent.set({ component: null, title: null });

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			subMenu = $$value;
    			$$invalidate(8, subMenu);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('openMenu' in $$props) $$invalidate(3, openMenu = $$props.openMenu);
    		if ('dropdownOpen' in $$props) $$invalidate(0, dropdownOpen = $$props.dropdownOpen);
    		if ('numberSearch' in $$props) $$invalidate(17, numberSearch = $$props.numberSearch);
    		if ('accStore' in $$props) $$invalidate(4, accStore = $$props.accStore);
    		if ('accounts' in $$props) $$invalidate(1, accounts = $$props.accounts);
    		if ('accountName' in $$props) $$invalidate(5, accountName = $$props.accountName);
    		if ('userName' in $$props) $$invalidate(6, userName = $$props.userName);
    		if ('AppDetails' in $$props) $$invalidate(2, AppDetails = $$props.AppDetails);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		fly,
    		scale,
    		subMenuContent,
    		AccountsUsers: Accounts_users,
    		CountryCodes: Country_codes,
    		QuickReplies: Quick_replies,
    		Settings,
    		ipcRenderer,
    		Store,
    		openMenu,
    		dropdownOpen,
    		numberSearch,
    		accStore,
    		accounts,
    		accountName,
    		userName,
    		AppDetails,
    		mainMenu,
    		subMenu,
    		number,
    		settStore,
    		settings,
    		countryCode,
    		unsubscribe,
    		inputKeydown,
    		openDropdown,
    		switchUser,
    		logout,
    		$subMenuContent
    	});

    	$$self.$inject_state = $$props => {
    		if ('openMenu' in $$props) $$invalidate(3, openMenu = $$props.openMenu);
    		if ('dropdownOpen' in $$props) $$invalidate(0, dropdownOpen = $$props.dropdownOpen);
    		if ('numberSearch' in $$props) $$invalidate(17, numberSearch = $$props.numberSearch);
    		if ('accStore' in $$props) $$invalidate(4, accStore = $$props.accStore);
    		if ('accounts' in $$props) $$invalidate(1, accounts = $$props.accounts);
    		if ('accountName' in $$props) $$invalidate(5, accountName = $$props.accountName);
    		if ('userName' in $$props) $$invalidate(6, userName = $$props.userName);
    		if ('AppDetails' in $$props) $$invalidate(2, AppDetails = $$props.AppDetails);
    		if ('mainMenu' in $$props) $$invalidate(7, mainMenu = $$props.mainMenu);
    		if ('subMenu' in $$props) $$invalidate(8, subMenu = $$props.subMenu);
    		if ('number' in $$props) $$invalidate(9, number = $$props.number);
    		if ('settStore' in $$props) $$invalidate(12, settStore = $$props.settStore);
    		if ('settings' in $$props) settings = $$props.settings;
    		if ('countryCode' in $$props) $$invalidate(10, countryCode = $$props.countryCode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dropdownOpen,
    		accounts,
    		AppDetails,
    		openMenu,
    		accStore,
    		accountName,
    		userName,
    		mainMenu,
    		subMenu,
    		number,
    		countryCode,
    		$subMenuContent,
    		settStore,
    		inputKeydown,
    		openDropdown,
    		switchUser,
    		logout,
    		numberSearch,
    		click_handler,
    		click_handler_1,
    		input_binding,
    		click_handler_2,
    		click_handler_3,
    		div8_binding,
    		click_handler_4,
    		div3_binding
    	];
    }

    class Main_menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				openMenu: 3,
    				dropdownOpen: 0,
    				numberSearch: 17,
    				accStore: 4,
    				accounts: 1,
    				accountName: 5,
    				userName: 6,
    				AppDetails: 2
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main_menu",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*openMenu*/ ctx[3] === undefined && !('openMenu' in props)) {
    			console.warn("<Main_menu> was created without expected prop 'openMenu'");
    		}

    		if (/*dropdownOpen*/ ctx[0] === undefined && !('dropdownOpen' in props)) {
    			console.warn("<Main_menu> was created without expected prop 'dropdownOpen'");
    		}

    		if (/*numberSearch*/ ctx[17] === undefined && !('numberSearch' in props)) {
    			console.warn("<Main_menu> was created without expected prop 'numberSearch'");
    		}

    		if (/*accStore*/ ctx[4] === undefined && !('accStore' in props)) {
    			console.warn("<Main_menu> was created without expected prop 'accStore'");
    		}

    		if (/*accounts*/ ctx[1] === undefined && !('accounts' in props)) {
    			console.warn("<Main_menu> was created without expected prop 'accounts'");
    		}

    		if (/*accountName*/ ctx[5] === undefined && !('accountName' in props)) {
    			console.warn("<Main_menu> was created without expected prop 'accountName'");
    		}

    		if (/*userName*/ ctx[6] === undefined && !('userName' in props)) {
    			console.warn("<Main_menu> was created without expected prop 'userName'");
    		}
    	}

    	get openMenu() {
    		throw new Error("<Main_menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openMenu(value) {
    		throw new Error("<Main_menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dropdownOpen() {
    		throw new Error("<Main_menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropdownOpen(value) {
    		throw new Error("<Main_menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numberSearch() {
    		throw new Error("<Main_menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numberSearch(value) {
    		throw new Error("<Main_menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get accStore() {
    		throw new Error("<Main_menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accStore(value) {
    		throw new Error("<Main_menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get accounts() {
    		throw new Error("<Main_menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accounts(value) {
    		throw new Error("<Main_menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get accountName() {
    		throw new Error("<Main_menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accountName(value) {
    		throw new Error("<Main_menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get userName() {
    		throw new Error("<Main_menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userName(value) {
    		throw new Error("<Main_menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get AppDetails() {
    		throw new Error("<Main_menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set AppDetails(value) {
    		throw new Error("<Main_menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\svelte\App.svelte generated by Svelte v3.48.0 */
    const file = "src\\svelte\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    // (204:3) {:else}
    function create_else_block_1(ctx) {
    	let svg;
    	let rect;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			rect = svg_element("rect");
    			attr_dev(rect, "width", "10");
    			attr_dev(rect, "height", "10");
    			attr_dev(rect, "fill", "none");
    			attr_dev(rect, "stroke", "currentColor");
    			attr_dev(rect, "stroke-width", "2");
    			add_location(rect, file, 205, 5, 5671);
    			attr_dev(svg, "width", "10px");
    			attr_dev(svg, "height", "10px");
    			add_location(svg, file, 204, 4, 5633);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, rect);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(204:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (200:3) {#if isMax}
    function create_if_block_2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M241 331l90 0 301 0 0 301 0 90 0 150 -542 0 0 -542 150 0zm90 -241l542 0 0 542 -150 0 0 -391 -391 0 0 -150zm391 632l241 0 0 -722 -722 0 0 241 -241 0 0 722 722 0 0 -241z");
    			add_location(path, file, 201, 5, 5407);
    			attr_dev(svg, "width", "12px");
    			attr_dev(svg, "height", "12px");
    			attr_dev(svg, "viewBox", "0 0 963 963");
    			add_location(svg, file, 200, 4, 5347);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(200:3) {#if isMax}",
    		ctx
    	});

    	return block;
    }

    // (219:0) {#if menuOpen}
    function create_if_block_1(ctx) {
    	let div;
    	let div_transition;
    	let t;
    	let section;
    	let mainmenu;
    	let updating_dropdownOpen;
    	let section_intro;
    	let section_outro;
    	let current;
    	let mounted;
    	let dispose;

    	function mainmenu_dropdownOpen_binding(value) {
    		/*mainmenu_dropdownOpen_binding*/ ctx[20](value);
    	}

    	let mainmenu_props = {
    		openMenu: /*openMenu*/ ctx[0],
    		numberSearch: /*numberSearch*/ ctx[1],
    		accStore: /*accStore*/ ctx[13],
    		accounts: /*accounts*/ ctx[5],
    		accountName: /*accountName*/ ctx[7],
    		userName: /*userName*/ ctx[8]
    	};

    	if (/*dropdownOpen*/ ctx[4] !== void 0) {
    		mainmenu_props.dropdownOpen = /*dropdownOpen*/ ctx[4];
    	}

    	mainmenu = new Main_menu({ props: mainmenu_props, $$inline: true });
    	binding_callbacks.push(() => bind(mainmenu, 'dropdownOpen', mainmenu_dropdownOpen_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			section = element("section");
    			create_component(mainmenu.$$.fragment);
    			attr_dev(div, "class", "menu-backdrop");
    			add_location(div, file, 219, 1, 6106);
    			attr_dev(section, "id", "menu");
    			add_location(section, file, 220, 1, 6199);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, section, anchor);
    			mount_component(mainmenu, section, null);
    			/*section_binding*/ ctx[21](section);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "mousedown", prevent_default(/*mousedown_handler*/ ctx[18]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const mainmenu_changes = {};
    			if (dirty & /*accounts*/ 32) mainmenu_changes.accounts = /*accounts*/ ctx[5];
    			if (dirty & /*accountName*/ 128) mainmenu_changes.accountName = /*accountName*/ ctx[7];
    			if (dirty & /*userName*/ 256) mainmenu_changes.userName = /*userName*/ ctx[8];

    			if (!updating_dropdownOpen && dirty & /*dropdownOpen*/ 16) {
    				updating_dropdownOpen = true;
    				mainmenu_changes.dropdownOpen = /*dropdownOpen*/ ctx[4];
    				add_flush_callback(() => updating_dropdownOpen = false);
    			}

    			mainmenu.$set(mainmenu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 180 }, true);
    				div_transition.run(1);
    			});

    			transition_in(mainmenu.$$.fragment, local);

    			add_render_callback(() => {
    				if (section_outro) section_outro.end(1);
    				section_intro = create_in_transition(section, fly, { x: -170, duration: 280, opacity: 1 });
    				section_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 180 }, false);
    			div_transition.run(0);
    			transition_out(mainmenu.$$.fragment, local);
    			if (section_intro) section_intro.invalidate();

    			section_outro = create_out_transition(section, fly, {
    				x: -/*menu*/ ctx[10].offsetWidth,
    				duration: 300,
    				opacity: 1,
    				easing: expoIn
    			});

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(section);
    			destroy_component(mainmenu);
    			/*section_binding*/ ctx[21](null);
    			if (detaching && section_outro) section_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(219:0) {#if menuOpen}",
    		ctx
    	});

    	return block;
    }

    // (230:0) {:else}
    function create_else_block(ctx) {
    	let section;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let t0;
    	let span0;
    	let t2;
    	let span3;
    	let t3;
    	let span1;
    	let t4;
    	let span2;
    	let t6;

    	const block = {
    		c: function create() {
    			section = element("section");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "Welcome to WhazzApp";
    			t2 = space();
    			span3 = element("span");
    			t3 = text("To get started click ");
    			span1 = element("span");
    			t4 = text(" or press ");
    			span2 = element("span");
    			span2.textContent = "F2";
    			t6 = text(" to open menu");
    			attr_dev(path0, "fill", "currentColor");
    			attr_dev(path0, "d", "M81.87 689.48c0,-301.05 244.06,-545.11 545.12,-545.11 301.06,0 545.11,244.06 545.11,545.11 0,301.06 -244.05,545.12 -545.11,545.12 -301.06,0 -545.12,-244.06 -545.12,-545.12zm1172 0c0,-346.21 -280.66,-626.88 -626.88,-626.88 -346.22,0 -626.89,280.67 -626.89,626.88 0,346.22 280.67,626.89 626.89,626.89 346.22,0 626.88,-280.67 626.88,-626.89z");
    			add_location(path0, file, 232, 3, 6770);
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "d", "M511.56 531.24c-3.72,-18.59 -48.34,-118.98 -59.49,-141.29 -33.42,-50.17 -104.89,-3.01 -133.89,26.04 -26.02,33.46 -40.89,74.37 -40.89,115.26 0,216.06 420.97,555.37 602.35,464.77 29.12,-19.4 141.14,-117.16 78.09,-148.75l-40.9 -18.59c-15.2,-6.65 -101.8,-48.34 -107.83,-48.34 -48.17,0 -72,81.8 -100.39,81.8 -77.53,0.29 -281.01,-206.03 -249.1,-237.94 17.67,-22.1 62.22,-62.5 52.05,-92.96z");
    			add_location(path1, file, 233, 3, 7144);
    			attr_dev(path2, "fill", "currentColor");
    			attr_dev(path2, "d", "M970.32 2.81l0 0c66.72,0 121.31,54.59 121.31,121.31l0 106.14 106.14 0c66.72,0 121.31,54.59 121.31,121.31l0 0c0,66.71 -54.59,121.3 -121.31,121.3l-106.14 0 0 106.14c0,66.72 -54.59,121.31 -121.31,121.31l0 0c-66.72,0 -121.3,-54.59 -121.3,-121.31l0 -106.14 -106.15 0c-66.71,0 -121.3,-54.59 -121.3,-121.3l0 0c0,-66.72 54.59,-121.31 121.3,-121.31l106.15 0 0 -106.14c0,-66.72 54.58,-121.31 121.3,-121.31z");
    			add_location(path2, file, 234, 3, 7563);
    			attr_dev(svg, "height", "80px");
    			attr_dev(svg, "viewBox", "0 0 1319.18 1319.18");
    			add_location(svg, file, 231, 2, 6717);
    			attr_dev(span0, "class", "splash-text");
    			add_location(span0, file, 236, 2, 8003);
    			attr_dev(span1, "class", "keyboard-key fa-solid fa-ellipsis");
    			add_location(span1, file, 237, 49, 8105);
    			attr_dev(span2, "class", "keyboard-key");
    			add_location(span2, file, 237, 109, 8165);
    			attr_dev(span3, "class", "splash-text");
    			add_location(span3, file, 237, 2, 8058);
    			attr_dev(section, "class", "splash");
    			add_location(section, file, 230, 1, 6690);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(section, t0);
    			append_dev(section, span0);
    			append_dev(section, t2);
    			append_dev(section, span3);
    			append_dev(span3, t3);
    			append_dev(span3, span1);
    			append_dev(span3, t4);
    			append_dev(span3, span2);
    			append_dev(span3, t6);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(230:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (226:0) {#if activeAccount.length > 0}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*activeAccount*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeAccount, webview*/ 4160) {
    				each_value = /*activeAccount*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(226:0) {#if activeAccount.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (227:1) {#each activeAccount as account}
    function create_each_block(ctx) {
    	let webview_1;
    	let webview_1_src_value;
    	let webview_1_partition_value;

    	const block = {
    		c: function create() {
    			webview_1 = element("webview");
    			if (!src_url_equal(webview_1.src, webview_1_src_value = "https://web.whatsapp.com")) attr_dev(webview_1, "src", webview_1_src_value);
    			attr_dev(webview_1, "partition", webview_1_partition_value = `persist:${/*account*/ ctx[28].id}`);
    			add_location(webview_1, file, 227, 2, 6565);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, webview_1, anchor);
    			/*webview_1_binding*/ ctx[22](webview_1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeAccount*/ 64 && webview_1_partition_value !== (webview_1_partition_value = `persist:${/*account*/ ctx[28].id}`)) {
    				attr_dev(webview_1, "partition", webview_1_partition_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(webview_1);
    			/*webview_1_binding*/ ctx[22](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(227:1) {#each activeAccount as account}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let section;
    	let div0;
    	let button0;
    	let span0;
    	let t0;
    	let span1;
    	let t1;
    	let span2;
    	let t2;
    	let p;
    	let t3;
    	let t4;
    	let div1;
    	let button1;
    	let svg0;
    	let line0;
    	let t5;
    	let button2;
    	let button2_title_value;
    	let t6;
    	let button3;
    	let svg1;
    	let line1;
    	let line2;
    	let t7;
    	let t8;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*isMax*/ ctx[2]) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*menuOpen*/ ctx[3] && create_if_block_1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*activeAccount*/ ctx[6].length > 0) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block2 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			t0 = space();
    			span1 = element("span");
    			t1 = space();
    			span2 = element("span");
    			t2 = space();
    			p = element("p");
    			t3 = text(/*title*/ ctx[9]);
    			t4 = space();
    			div1 = element("div");
    			button1 = element("button");
    			svg0 = svg_element("svg");
    			line0 = svg_element("line");
    			t5 = space();
    			button2 = element("button");
    			if_block0.c();
    			t6 = space();
    			button3 = element("button");
    			svg1 = svg_element("svg");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			t7 = space();
    			if (if_block1) if_block1.c();
    			t8 = space();
    			if_block2.c();
    			if_block2_anchor = empty();
    			add_location(span0, file, 186, 3, 4908);
    			add_location(span1, file, 187, 3, 4920);
    			add_location(span2, file, 188, 3, 4932);
    			attr_dev(button0, "class", "title-btn menu-btn");
    			attr_dev(button0, "title", "Menu (F2)");
    			add_location(button0, file, 185, 2, 4811);
    			attr_dev(div0, "class", "left-align");
    			add_location(div0, file, 184, 1, 4784);
    			attr_dev(p, "class", "title");
    			add_location(p, file, 191, 1, 4962);
    			attr_dev(line0, "x1", "10");
    			attr_dev(line0, "stroke", "currentColor");
    			attr_dev(line0, "stroke-width", "2");
    			add_location(line0, file, 195, 4, 5150);
    			attr_dev(svg0, "width", "10px");
    			attr_dev(svg0, "height", "1px");
    			add_location(svg0, file, 194, 3, 5114);
    			attr_dev(button1, "id", "min");
    			attr_dev(button1, "class", "title-btn");
    			attr_dev(button1, "tabindex", "-1");
    			attr_dev(button1, "title", "Minimize");
    			add_location(button1, file, 193, 2, 5020);
    			attr_dev(button2, "id", "max");
    			attr_dev(button2, "class", "title-btn");
    			attr_dev(button2, "title", button2_title_value = /*isMax*/ ctx[2] ? "Restore" : "Maximize");
    			add_location(button2, file, 198, 2, 5229);
    			attr_dev(line1, "y1", "10");
    			attr_dev(line1, "x2", "10");
    			attr_dev(line1, "y2", "0");
    			attr_dev(line1, "stroke", "currentColor");
    			attr_dev(line1, "stroke-width", "1");
    			add_location(line1, file, 211, 4, 5904);
    			attr_dev(line2, "y1", "0");
    			attr_dev(line2, "x2", "10");
    			attr_dev(line2, "y2", "10");
    			attr_dev(line2, "stroke", "currentColor");
    			attr_dev(line2, "stroke-width", "1");
    			add_location(line2, file, 212, 4, 5978);
    			attr_dev(svg1, "width", "10px");
    			attr_dev(svg1, "height", "10px");
    			add_location(svg1, file, 210, 3, 5867);
    			attr_dev(button3, "id", "close");
    			attr_dev(button3, "class", "title-btn");
    			attr_dev(button3, "title", "Close");
    			add_location(button3, file, 209, 2, 5788);
    			attr_dev(div1, "class", "right-align");
    			add_location(div1, file, 192, 1, 4992);
    			attr_dev(section, "id", "title-bar");
    			add_location(section, file, 183, 0, 4758);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, button0);
    			append_dev(button0, span0);
    			append_dev(button0, t0);
    			append_dev(button0, span1);
    			append_dev(button0, t1);
    			append_dev(button0, span2);
    			/*button0_binding*/ ctx[19](button0);
    			append_dev(section, t2);
    			append_dev(section, p);
    			append_dev(p, t3);
    			append_dev(section, t4);
    			append_dev(section, div1);
    			append_dev(div1, button1);
    			append_dev(button1, svg0);
    			append_dev(svg0, line0);
    			append_dev(div1, t5);
    			append_dev(div1, button2);
    			if_block0.m(button2, null);
    			append_dev(div1, t6);
    			append_dev(div1, button3);
    			append_dev(button3, svg1);
    			append_dev(svg1, line1);
    			append_dev(svg1, line2);
    			insert_dev(target, t7, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "resize", /*windowResize*/ ctx[14], false, false, false),
    					listen_dev(window, "keydown", /*windowKeydown*/ ctx[17], false, false, false),
    					listen_dev(window, "mousedown", /*windowMousedown*/ ctx[16], false, false, false),
    					listen_dev(button0, "click", /*openMenu*/ ctx[0], false, false, false),
    					listen_dev(button1, "click", /*windowAction*/ ctx[15], false, false, false),
    					listen_dev(button2, "click", /*windowAction*/ ctx[15], false, false, false),
    					listen_dev(button3, "click", /*windowAction*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 512) set_data_dev(t3, /*title*/ ctx[9]);

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(button2, null);
    				}
    			}

    			if (!current || dirty & /*isMax*/ 4 && button2_title_value !== (button2_title_value = /*isMax*/ ctx[2] ? "Restore" : "Maximize")) {
    				attr_dev(button2, "title", button2_title_value);
    			}

    			if (/*menuOpen*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*menuOpen*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t8.parentNode, t8);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			/*button0_binding*/ ctx[19](null);
    			if_block0.d();
    			if (detaching) detach_dev(t7);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t8);
    			if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $subMenuContent;
    	validate_store(subMenuContent, 'subMenuContent');
    	component_subscribe($$self, subMenuContent, $$value => $$invalidate(23, $subMenuContent = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const { ipcRenderer } = require('electron');
    	const mainWindow = require('@electron/remote').getCurrentWindow();
    	const Store = require('electron-store');

    	// Exports
    	// Variables
    	let accStore = new Store({
    			name: 'accounts',
    			cwd: 'Partitions',
    			fileExtension: '',
    			watch: true,
    			defaults: { 'accounts': [] }
    		});

    	let isMax = Boolean, menuOpen = Boolean(false), dropdownOpen = Boolean(false);
    	let accounts = accStore.get('accounts'), activeAccount = [], accountName, userName;
    	let title = mainWindow.getTitle(), menu, menuBtn, webview;

    	//#region Functions
    	onMount(() => {
    		mainWindow.isMaximized()
    		? $$invalidate(2, isMax = true)
    		: $$invalidate(2, isMax = false);

    		getActiveAccountUser(result => {
    			$$invalidate(7, accountName = result.account);
    			$$invalidate(8, userName = result.user);
    		});
    	});

    	// Get Webview Title and Theme
    	ipcRenderer.on('title-updated', () => {
    		$$invalidate(9, title = mainWindow.getTitle());
    	});

    	ipcRenderer.on('theme', (e, color) => {
    		document.body.setAttribute('theme', color);
    	});

    	// Window Functions
    	const windowResize = () => {
    		mainWindow.isMaximized()
    		? $$invalidate(2, isMax = true)
    		: $$invalidate(2, isMax = false);
    	};

    	const windowAction = e => {
    		if (e.target.id == 'close') {
    			mainWindow.close();
    		}

    		if (e.target.id == 'min') {
    			mainWindow.minimize();
    		}

    		if (e.target.id == 'max') {
    			mainWindow.isMaximized()
    			? mainWindow.restore()
    			: mainWindow.maximize();
    		}

    		webview.focus();
    	};

    	ipcRenderer.on('webview-keydown', (e, key) => {
    		windowKeydown(key);
    	});

    	const windowMousedown = e => {
    		if (e.target.matches('.user-dropdown-list') || e.target.matches('#dropdown-btn') || e.target.matches('#dropdown-list-btn')) return;

    		if (e.target.matches('*')) {
    			$$invalidate(4, dropdownOpen = false);
    		}
    	};

    	const windowKeydown = e => {
    		// Close, Minimize, Maximize
    		if (e.key === 'Escape') {
    			if (dropdownOpen) {
    				$$invalidate(4, dropdownOpen = false);
    			} else if ($subMenuContent.component) {
    				subMenuContent.set({ component: null, title: null });
    			} else if (menuOpen && !dropdownOpen && !$subMenuContent.component) {
    				$$invalidate(3, menuOpen = false);
    				menuBtn.classList.remove('active');
    				webview.focus();
    			}
    		} else if (e.key === 'F2') {
    			openMenu();
    		} else if (e.key === 'F5') {
    			webview.reload();
    		}

    		// Menu Focus Trap
    		if (menuOpen && e.key === 'Tab') {
    			const nodes = document.querySelector('.user-dropdown-content')
    			? document.querySelector('.user-dropdown-content').querySelectorAll('*')
    			: menu.querySelectorAll('*');

    			const tabbable = Array.from(nodes).filter(node => node.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && e.shiftKey) index = 0;
    			index += tabbable.length + (e.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			e.preventDefault();
    		}
    	};

    	const openMenu = () => {
    		$$invalidate(3, menuOpen = !menuOpen);

    		menuOpen
    		? menuBtn.classList.add('active')
    		: menuBtn.classList.remove('active');

    		menuOpen ? webview.blur() : webview.focus();
    	};

    	const numberSearch = (e, number, code, callback) => {
    		if (e.key === 'Enter') {
    			if (number) {
    				let url = 'https://web.whatsapp.com/send?phone=';

    				if (number.startsWith(code)) {
    					number = number.substring(code.length);
    				}

    				if ((/\s/).test(number)) {
    					number = number.replace(/\s/g, '');
    				}

    				if (number.startsWith('0')) {
    					number = number.substring(1);
    				}

    				url = `${url}${code}${number}`;
    				webview.loadURL(url);
    				return callback(true);
    			}
    		}
    	};

    	//#endregion
    	accStore.onDidAnyChange(() => {
    		$$invalidate(5, accounts = accStore.get('accounts'));

    		getActiveAccountUser(result => {
    			$$invalidate(7, accountName = result.account);
    			$$invalidate(8, userName = result.user);
    		});
    	});

    	const getActiveAccountUser = callback => {
    		let account;
    		let user = '';

    		if (accounts) {
    			$$invalidate(6, activeAccount = accounts.filter(({ active }) => active == true));

    			account = activeAccount.length > 0
    			? activeAccount.map(({ name }) => name)
    			: 'Login or create an account';

    			user = activeAccount.map(({ users }) => users).flat().filter(({ active }) => active == true).map(({ name }) => name);
    		}
    		return callback({ account, user });
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function mousedown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function button0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			menuBtn = $$value;
    			$$invalidate(11, menuBtn);
    		});
    	}

    	function mainmenu_dropdownOpen_binding(value) {
    		dropdownOpen = value;
    		$$invalidate(4, dropdownOpen);
    	}

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			menu = $$value;
    			$$invalidate(10, menu);
    		});
    	}

    	function webview_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			webview = $$value;
    			$$invalidate(12, webview);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		fly,
    		fade,
    		expoIn,
    		subMenuContent,
    		MainMenu: Main_menu,
    		ipcRenderer,
    		mainWindow,
    		Store,
    		accStore,
    		isMax,
    		menuOpen,
    		dropdownOpen,
    		accounts,
    		activeAccount,
    		accountName,
    		userName,
    		title,
    		menu,
    		menuBtn,
    		webview,
    		windowResize,
    		windowAction,
    		windowMousedown,
    		windowKeydown,
    		openMenu,
    		numberSearch,
    		getActiveAccountUser,
    		$subMenuContent
    	});

    	$$self.$inject_state = $$props => {
    		if ('accStore' in $$props) $$invalidate(13, accStore = $$props.accStore);
    		if ('isMax' in $$props) $$invalidate(2, isMax = $$props.isMax);
    		if ('menuOpen' in $$props) $$invalidate(3, menuOpen = $$props.menuOpen);
    		if ('dropdownOpen' in $$props) $$invalidate(4, dropdownOpen = $$props.dropdownOpen);
    		if ('accounts' in $$props) $$invalidate(5, accounts = $$props.accounts);
    		if ('activeAccount' in $$props) $$invalidate(6, activeAccount = $$props.activeAccount);
    		if ('accountName' in $$props) $$invalidate(7, accountName = $$props.accountName);
    		if ('userName' in $$props) $$invalidate(8, userName = $$props.userName);
    		if ('title' in $$props) $$invalidate(9, title = $$props.title);
    		if ('menu' in $$props) $$invalidate(10, menu = $$props.menu);
    		if ('menuBtn' in $$props) $$invalidate(11, menuBtn = $$props.menuBtn);
    		if ('webview' in $$props) $$invalidate(12, webview = $$props.webview);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		openMenu,
    		numberSearch,
    		isMax,
    		menuOpen,
    		dropdownOpen,
    		accounts,
    		activeAccount,
    		accountName,
    		userName,
    		title,
    		menu,
    		menuBtn,
    		webview,
    		accStore,
    		windowResize,
    		windowAction,
    		windowMousedown,
    		windowKeydown,
    		mousedown_handler,
    		button0_binding,
    		mainmenu_dropdownOpen_binding,
    		section_binding,
    		webview_1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { openMenu: 0, numberSearch: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get openMenu() {
    		return this.$$.ctx[0];
    	}

    	set openMenu(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numberSearch() {
    		return this.$$.ctx[1];
    	}

    	set numberSearch(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
