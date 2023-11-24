<script>
    // Get current active user id
    // Points webview partition with id as folder name
    $: ({ account } = accounts.get.active());
</script>

<webview src="https://web.whatsapp.com" partition={`persist:${account.id}`} />

<style>
    webview {
        position: fixed;
        top: 36px;
        left: 0;
        height: calc(100% - 36px);
        width: 100%;
    }
</style>