const { ipcRenderer } = require('electron');
const observer = new MutationObserver(callback);

let mode;

window.onload = async () => {
	// Begin document body observing
    observer.observe(document.body, { attributes: true });

    mode = document.body.classList[1] || 'light';
	ipcRenderer.send('theme/set', mode);
};

// Function to run when document body mutation is fired
function callback(mutationList) {
    mutationList.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            // Retrieve theme from document body classlist (dark) or use 'light' if not present
            mode = mutation.target.classList[1] || 'light';
            ipcRenderer.send('theme/set', mode);
        }
    });
}