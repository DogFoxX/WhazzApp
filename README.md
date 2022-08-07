# This project is not being maintained anymore. Feel free to download the latest release and try it out.
# The status of this repo will be updated if I get the chance to work on the project again.

<div align="center">
    <h1>Introducing WhazzApp</h1>
    <br>
    <div>
        <a href="https://github.com/DogFoxX/WhazzApp/releases/latest/download/whazzapp_setup.exe" title="Download Latest Release">
            <img src="https://img.shields.io/github/v/release/DogFoxX/WhazzApp?color=008266&label=Latest%20Build&style=for-the-badge&labelColor=00A884">
        </a>
        <img src="https://img.shields.io/github/downloads/DogFoxX/WhazzApp/total?color=008266&label=Total%20Downloads&style=for-the-badge&labelColor=00A884">
        <img src="https://img.shields.io/github/license/DogFoxX/WhazzApp?color=FF3F01&style=for-the-badge&labelColor=FF6836">
    </div>
    <div>
        <img src="https://img.shields.io/badge/Status-Development-0074A6?style=for-the-badge&labelColor=0492CF">
        <img src="https://img.shields.io/badge/Supported%20OS-Windows-0074A6?style=for-the-badge&labelColor=0492CF">
        <img src="https://img.shields.io/badge/Linux Support-Developing-FF3F01?style=for-the-badge&labelColor=FF6836">
    </div>
    <br>
    <img src="https://github.com/DogFoxX/assets/blob/master/whazzapp/whazzapp.png?raw=true" alt="WhazzApp Banner" width="100%" />
</div>

### An ElectronJS/Svelte based WhatsApp Desktop alternative, with extra functionality

-  ***Multiple Instances of WhatsApp Web***
    - Add Multiple Accounts and Users :family:
-  ***Start a chat with any number registered to WhatsApp***
    - Select Country Code > Type in a registered number > Start chatting :rocket:
    - Easy :+1:
-  ***Quick Replies***
    - When typing long messages over and over again is time consuming :clock3:
    - Create your own Quick Replies with our intuitive Quick Reply Creator :pencil2:
    - Set Hotkeys for each Quick Reply for easy access :keyboard:
    - See more at the [Quick Replies](#quick-replies) Section

# Screenshots :camera:
<div align="center">
    <img src="https://github.com/DogFoxX/assets/blob/master/whazzapp/screenshot_1.png?raw=true" width="45%">
    <img src="https://github.com/DogFoxX/assets/blob/master/whazzapp/screenshot_2.png?raw=true" width="45%">
    <img src="https://github.com/DogFoxX/assets/blob/master/whazzapp/screenshot_3.png?raw=true" width="45%">
    <img src="https://github.com/DogFoxX/assets/blob/master/whazzapp/screenshot_4.png?raw=true" width="45%">
</div>

# About :information_source:
### WhazzApp is an Electron based dektop app, using Svelte as it's framework.
### TL;DR WhatsApp Web is loaded using Electron's Webview Tag, and the rest of the functions are built around that. Great for businesses that use WhatsApp as a way to communicate with customers.

# Features :star:
## Design & UI
- Simplistic and easy to navigate Menu System
- Carefully designed to fit naturally with WhatsApp Web
- Fully supports WhatsApp Web's Dark/Light theme

## Keyboard Shortcuts (More will be added as needed)
- Press ```F2``` to open the Main Menu
- Press ```F5``` to refresh WhatsApp Web

## Accounts and Users
- Open the Main Menu and click on the green User Icon to switch to another account or create a new one
- To create an Account, click on ```Add Account```
- Duplicate Account Names aren't allowed, for obvious reasons
- An UNLIMTED amount of Users can be added to an account
- If you don't need any users added to an Account, uncheck ```Add users to this account```
- To switch to a different User, open the Main Menu, and click on ```⇅``` found at the very top to open a dropdown list of available users
- To log out of an Account, open the Main Menu, and click on ```[→``` found at the very top

## Number Search & Country Codes
#### One of the best features of WhazzApp is the ability to open a chat with any number registered to WhatsApp. WhazzApp uses the WhatsApp API ```https://web.whatsapp.com/send?phone=``` for this.

- After opening the Main Menu, users will find an input block to enter a number
- Clicking on the Country Code will open a submenu containing a list of 242 Country Codes to choose from
- Choose the Country Code associated with the number
- Numbers can be entered with or without the leading Country Code. Numbers starting with ```0``` will automatically be corrected with a leading Country Code

## Quick Replies
- Open the Main Menu and click on Quick Replies to see a list of created Quick Replies
- Clicking on a Quick Reply will copy it's text to the clipboard
- To create a Quick Reply, click on ```Add Quick Reply```
- Duplicate Quick Reply Names aren't allowed, for obvious reasons
- Setting a Hotkey:
    - Users can set a Hotkey when creating a Quick Reply using any of the following combinations for a total of 40 different Hotkeys
    - Use ```CTRL+#```, ```CTRL+SHIFT+#```, ```CTRL+ALT+#``` or ```CTRL+SHIFT+ALT+#```
    - *#* = any number from ```0-9```

### Quick Reply Dynamic Variables
Quick Replies supports the use of variables which will be replaced with a value when clicking on a Quick Reply or using it's Hotkey
- **{userName}**
    - Replaced with the active User Name
- **{dateTime12h}**
    - Medium lenght date with 12-hour time
    - Outputs ```Mon, 1 Jan 2022, 10:08 pm```
- **{dateTime24h}**
    - Medium lenght date with 24-hour time
    - Outputs ```Mon, 1 Jan 2022, 22:08```
- **{dateLong}**
    - Long date only
    - Outputs ```Monday, 1 January 2022```
- **{dateMed}**
    - Medium lenght date only
    - Outputs ```Mon, 1 Jan 2022```
- **{dateShort}**
    - Short date only
    - Outputs ```01/01/22```
- **{time12h}**
    - 12-hour time only
- **{time24h}**
    - 24-hour time only

## Settings
### Windows Settings
- Start with Windows (toggle)
    - WhazzApp will launch upon Windows start-up
- Start minimized (toggle)
    - WhazzApp will launch minimized to the System Tray
- Minimize to System Tray (toggle)
    - Clicking ```✖``` will minimize WhazzApp to the System Tray

### Auto Update Settings
- Enable Auto Updates (toggle)
    - Enabled: WhazzApp will check for updates automatically
    - Disabled: Users will have to check for updates manually
- Update frequency (dropdown)
    - WhazzApp will regularly check for updates based on the frequency chosen
    - Choose from 10, 15, 30 or 60 minutes
    - This setting will be disabled when <ins>Enable Auto Updates</ins> is disabled
- Auto download updates (toggle)
    - Enabled: Updates will be downloaded automatically
    - Disabled: Users will be promted to download updates manually

When <ins>Auto download updates</ins> is disabled, users can manually check for updates using ```Check for updates``` in the Main Menu.

Auto Update notifications will prompt users to download updates (only when <ins>Auto download updates</ins> is disabled), and restart WhazzApp when an update is ready to be installed.

- Allow pre-releases (toggle)
    - WhazzApp will check for pre-release updates
    - Not recommended

# Acknowledgements
### WhazzApp will always remain free to download and use.
### WhazzApp does not alter the function of WhatsApp, nor the services provided.

### WhazzApp uses the following npm packages and thanks each developer for their work:
- electron | repo: <a href="https://github.com/electron/electron">electron/electron</a>
- electron-builer & electron-updater | repo: <a href="https://github.com/electron-userland/electron-builder">electron-userland/electron-builder</a>
- @electron/remote | repo: <a href="https://github.com/electron/remote">electron/remote</a>
- electron-serve | repo: <a href="https://github.com/sindresorhus/electron-serve">sindresorhus/electron-serve</a>
- electron-context-menu | repo: <a href="https://github.com/sindresorhus/electron-context-menu">sindresorhus/electron-context-menu</a> 
- electron-store | repo: <a href="https://github.com/sindresorhus/electron-store">sindresorhus/electron-store</a>
- electron-shortcuts | repo: <a href="https://github.com/mlrv/electron-shortcuts">mlrv/electron-shortcuts</a>
- electron-window-state | repo: <a href="https://github.com/mawie81/electron-window-state">mawie81/electron-window-state</a>
- electron-log | repo: <a href="https://github.com/megahertz/electron-log">megahertz/electron-log</a>
- randomstring | repo: <a href="https://github.com/klughammer/node-randomstring">klughammer/node-randomstring</a>
- rollup | repo: <a href="https://github.com/rollup/rollup">rollup/rollup</a>
- rollup-plugins | repo: <a href="https://github.com/rollup/plugins">rollup/plugins</a>
- rollup-plugin-css-only | repo: <a href="https://github.com/thgh/rollup-plugin-css-only">thgh/rollup-plugin-css-only</a>
- rollup-plugin-livereload | repo: <a href="https://github.com/thgh/rollup-plugin-livereload">thgh/rollup-plugin-livereload</a>
- rollup-plugin-svelte | repo: <a href="https://github.com/sveltejs/rollup-plugin-svelte">sveltejs/rollup-plugin-svelte</a>
- rollup-plugin-terser | repo: <a href="https://github.com/TrySound/rollup-plugin-terser">TrySound/rollup-plugin-terser</a>
- concurrently | repo: <a href="https://github.com/open-cli-tools/concurrently">open-cli-tools/concurrently</a>
- sirv-cli | repo: <a href="https://github.com/rpoole/sirv-cli">rpoole/sirv-cli</a>
- svelte | repo: <a href="https://github.com/sveltejs/svelte">sveltejs/svelte</a>
- wait-on | repo: <a href="https://github.com/jeffbski/wait-on">jeffbski/wait-on</a>

### Created with [electron-svelte-template](https://github.com/DogFoxX/electron-svelte-template) by [DogFoxX](https://github.com/DogFoxX)

# Issues/Bugs
### Please feel free to report issues/bugs regarding WhazzApp by clicking <a href="https://github.com/DogFoxX/WhazzApp/issues">here</a> and creating a new issue.
