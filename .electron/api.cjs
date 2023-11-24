const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const { generate } = require('randomstring');

const settStore = new Store({
    name: 'settings',
    fileExtension: '',
    cwd: 'Partitions',
    defaults: {
        'windows-settings': {
            autoLaunch: true,
            startMin: false,
            minToTray: true
        },
        'updates': {
            allowPrerelease: false,
            autoDownload: true,
            checkUpdates: true,
            updateFreq: 900000
        },
        'country-code': {
            name: 'South Africa',
            code: '+27',
            flag: 'flag-icon-za'
        }
    }
});

const { code } = settStore.get('country-code');

const accStore = new Store({
    name: 'accounts',
    fileExtension: '',
    cwd: 'Partitions',
    defaults: {
        accounts: []
    }
});

let accounts = accStore.get('accounts');

window.num = {
    send: (data) => {
        let number = data;
        
        if (number.startsWith(code)) { number = number.substring(code.length) }
        if (/\s/.test(number)) { number = number.replace(/\s/g, '') }
        if (number.startsWith('0')) { number = number.substring(1) }

        ipcRenderer.invoke('load-number', (number))
    }
}

window.accounts = {
    get: {
        all: () => { return accounts },
        active: () => {
            const user = accounts.filter(({active}) => active == true)
            .map(({users}) => users)
            .flat()
            .find(({active}) => active == true)
            
            const account = accounts.find(({ active }) => active == true)
            
            return {
                user: user,
                account: account
            }
        }
    },
    create: ({name, users}) => {
        accounts = accounts.filter(({ active }) => active ).map(obj => ({ ...obj, active: false }));
        accStore.set('accounts', [
            ...accounts, {
                id: generate({charset: 'hex', capitalization: 'uppercase'}),
                name,
                active: true,
                users
            }
        ]);
    }
}