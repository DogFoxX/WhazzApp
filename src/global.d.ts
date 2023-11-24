declare const num: {
    /**Sends the number to main renderer to load in Webview */
    send(value: String): void;
}

declare const accounts: {
    /**Get account info from Store */
    get: {
        /**Get all accounts info from Store */
        all(): async;

        /**Get active account and user info from Store */
        active(): async;
    }

    /**Create a new account */
    create(options: {name: string, users: [options: {name: string}]}): void
}

declare const theme: {
    //**Sets the desired theme mode */
    set(mode: 'dark' | 'light' | 'system'): void
}

declare const updates: {
    /**Checks for updates and notifies user */
    check(): void
}