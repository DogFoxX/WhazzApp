const { ipcRenderer } = require('electron')
const observer = new MutationObserver(callback)

let theme
window.onload = () => {
    observer.observe(document.body, {attributes: true})
	
	if (window.localStorage.getItem('theme')) {
		theme = window.localStorage.getItem('theme').replaceAll('"', '')
	}
	else { theme = 'light' }
	ipcRenderer.send('theme', theme)
}
  
function callback(mutationList) {
	mutationList.forEach(function(mutation) {
		if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
			if (window.localStorage.getItem('theme')) {
				theme = window.localStorage.getItem('theme').replaceAll('"', '')
			}
			else { theme = 'light' }
			ipcRenderer.send('theme', theme)
		}
	})
}