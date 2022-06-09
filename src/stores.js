import { writable } from 'svelte/store';

export const subMenuContent = writable({component: null, title: null});
export const dialog = writable({component: null, title: null});