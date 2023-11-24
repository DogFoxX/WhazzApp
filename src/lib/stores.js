import { writable } from 'svelte/store';

export const menu = writable({0: false, 1: false});
export const submenu = writable({});