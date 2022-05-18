<<<<<<< HEAD
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
    <br>
    <h1>VERSION <ins><a href="https://github.com/DogFoxX/WhazzApp/releases/tag/v0.9.1">0.9.1 PRE-RELEASE IS HERE</a></ins>!!!</h1>
</div>

### An ElectronJS/Svelte based WhatsApp Desktop alternative, with extra functionality

-  ***Multiple Instances of WhatsApp Web***
    - Add Multiple Accounts and Users :family:
-  ***Start a chat with any number registered to WhatsApp***
    - Select Country Code > Type in a registered number > Start chatting :rocket:
    - Easy :+1:
-  ***Quick Replies; so you don't have to type everything***
    - Create your own Quick Replies with our intuitive editor :pencil2:
    - When typing long messages over and over again is time consuming :clock3:
    - See more at the [Quick Replies](#quick-replies) Section

### Screenshots :camera:
<div align="center">
    <img src="https://github.com/DogFoxX/assets/blob/master/whazzapp/screenshot_1.png?raw=true" width="45%">
    <img src="https://github.com/DogFoxX/assets/blob/master/whazzapp/screenshot_2.png?raw=true" width="45%">
    <img src="https://github.com/DogFoxX/assets/blob/master/whazzapp/screenshot_5.png?raw=true" width="45%">
</div>

# Features
### ***Search any number:***
- With WhazzApp, you can start a chat with any number registered on WhatsApp by using the ***Enter Number*** input field

- First, select a country code related to the number you want to search

- You may enter the number with or without the country code

### ***Command-line args:***
#### WhazzApp adds a URL Protocol much like the official WhatsApp Web Desktop App
- Opening links like `wa.me/send?phone=xxx`, or `https://api.whatsapp.com/send/?phone=xxx` will open the link in WhazzApp and start a chat with the number used
- Using `whazzapp.exe whatsapp://send?phone=xxx` from a terminal will open WhazzApp and start a chat with the number used
- Using Windows Run command, or `Win+R`, and running `whatsapp://send?phone=xxx` will open WhazzApp and start a chat with the number used

### ***Quick Replies:***
- Click on ***Quick Replies*** to display a dropdown list of saved Quick Replies

- Quick replies can be created using the ***Add Quick Reply*** button

- An editor will be opened where the name and text for a quick reply can be created

- Emojis are supported using the emoji picker within the editor

- After saving the quick reply, it will be displayed in the Quick Replies dropdown list

- Clicking the quick reply will copy it's text to the clipboard and can be pasted in the chat text field

- Variables are supported; See ***[Quick Reply Text Variables](#quick-reply-text-variables)***

### ***Accounts and Users:***
- WhazzApp supports multiple instances, here reffered to as ***Accounts***

- Click on the ***User Icon*** to display a dropdown list of saved Accounts and Users

- Accounts can be added using the ***Add Account*** button

- Users can be added using the ***Add User*** button

- Users are usefull when more than one person will use the same Account

## Settings:
### ***General Settings:***
#### ***Behavior:***
- Start with Windows

- Start Minimized:
  - WhazzApp will start minimized and can be opened from the System Tray

- When closing WhazzApp:
  - ***Exit:*** WhazzApp is closed completely without prompt
  - ***Minimize to system tray:*** WhazzApp is minimized to system tray without prompt
  - ***Always ask:*** WhazzApp will show a prompt before closing

#### ***Updates:***
- ***Enable Auto Updates:***
  - WhazzApp will check for any updates every 15 minutes

- ***Check for updates on app startup:***
  - WhazzApp will check for updates everytime the app is started

- ***Update behavior:***
  - ***Notify me first:*** Notification will be displayed before downloading any updates
  - ***Download & Install:*** Updates will be automatically downloaded and installed

- ***Check Now*** button:
  - Manually check for updates
  - This will work even if Auto Updates are disabled
  - ***Update behavior*** action is also taken

### :exclamation: After updates are installed, you will be notified to restart WhazzApp to apply the update. If no action is taken, the update will be applied after WhazzApp is closed

### ***Manage Accounts:***
- From here you can add, edit or delete saved Accounts

### ***Manage Users:***
- Displays Users accociated with each Account

- From here you can add, edit or delete saved Users

### ***Manage Quick Replies:***
- Displays Quick Replies associated with each Account

- From here you can add, edit or delete Quick Replies

- Editing Quick Replies will open the default editor but the name field is disabled

### ***Advanced***
#### ***Dev Tools:***
- ***Open Dev Tools:***
    - Opens Chrome Dev Tools

- ***Open Webview Dev Tools:***
    - Opens Chrome Dev Tools for the Webview hosting WhatsApp Web

- ***Custom CSS:***
    - ***WhazzApp CSS:***
        - Here you can apply custom CSS to WhazzApp
    - ***WhatsApp CSS:***
        - Here you can apply custom CSS to the Webview

### :exclamation: Use the following only when experiencing issues with WhazzApp

- ***Clear App Cache:***
  - This will clear the app's cache

- ***Clear WhatsApp Cache:***
    - This will clear the cache from the Webview hosting WhatsApp Web

- ***Reset App:***
  - This will reset WhazzApp as if it were freshly installed
  - You will be signed out of WhatsApp Web

# Quick Reply text variables
#### Note: This list will expand as development continues

### ***Text variables to use in Quick Replies***

#

```
{user-name}
```
Inserts the active user's name

ex.

```
# Hello, my name is {user-name}
> Hello, my name is John
```

#

```
{[datetime][type][time format]}
```
Inserts today's date and current time
- [type]:
    - ***[long]*** - Date will be displayed as long date, ex. `Monday, January 01, 2022`
    - ***[short]*** - Date will be displayed as short date, ex. `Mon, Jan 01, 2022`
    - ***[digit]*** - Date will be displayed with numbers only (mm/dd/yyyy), ex. `01/01/2022` 
- [time format]:
    - ***[24h]*** - Time will be displayed in 24 Hour
    - ***[12h]*** - Time will be displayed in 12 Hour, with AM/PM indication

ex.

```
# Today is {[datetime][digit][12h]}
> Today is 01/01/2022, 10:30am
```

#

```
{[date][type]}
```
Inserts today's date only
- [type]:
    - ***[long]*** - Date will be displayed as long date, ex. `Monday, January 01, 2022`
    - ***[short]*** - Date will be displayed as short date, ex. `Mon, Jan 01, 2022`
    - ***[digit]*** - Date will be displayed with numbers only (mm/dd/yyyy), ex. `01/01/2022` 

ex.

```
# Today is {[date][digit]}
> Today is 01/01/2022
```

#

```
{[time][time format]}
```
Inserts current time only
- [time format]:
    - ***[24h]*** - Time will be displayed in 24 Hour
    - ***[12h]*** - Time will be displayed in 12 Hour, with AM/PM indication

ex.

```
# The current time is {[time][12h]}
> The current time is 10:30am
```

### :exclamation: The variable will replaced with it's actual value only when clicking on the Quick Reply

#

# Acknowledgements
### WhazzApp does not alter the function of WhatsApp, nor the services provided.

### WhazzApp uses the following npm packages and thanks each developer for their work:
- electron-context-menu | repo: <a href="https://github.com/sindresorhus/electron-context-menu">sindresorhus/electron-context-menu</a> 
- electron-store | repo: <a href="https://github.com/sindresorhus/electron-store">sindresorhus/electron-store</a>
- electron-first-run | repo: <a href="https://github.com/joecohens/electron-first-run">joecohens/electron-first-run</a>
- electron-window-state | repo: <a href="https://github.com/mawie81/electron-window-state">mawie81/electron-window-state</a>
- emoji-picker-element | repo: <a href="https://github.com/nolanlawson/emoji-picker-element">nolanlawson/emoji-picker-element</a>
- windows-shortcuts | repo: <a href="https://github.com/j201/windows-shortcuts">j201/windows-shortcuts</a>

### Created with [electron-svelte-template](https://github.com/DogFoxX/electron-svelte-template) by [DogFoxX](https://github.com/DogFoxX)

# Issues/Bugs
### Please feel free to report issues/bugs regarding WhazzApp by clicking <a href="https://github.com/DogFoxX/WhazzApp/issues">here</a> and creating a new issue.
=======

<div align="center">
<h1><strong>Desktop Apps with Electron + Svelte</strong></h1>
<br>
<br>
<img src="https://github.com/DogFoxX/assets/blob/master/electron-svelte-template/electron_svelte.png?raw=true" alt="Electron + Svelte Banner" />
<br>
<br>
	<h3>Boilerplate to get started with Electron using the Svelte Framework</h3>
</div>
<br>

# Get Started :checkered_flag:
### 1) Clone this boilerplate

**Run the following command to clone**<br>
Replace electron-svelte-app to folder of your choice and with your project name<br>
eg. Cloning the project into Documents folder **C:\Users\UserName\Documents\My App**

    npx degit DogFoxX/electron-svelte-template electron-svelte-app
	
**Switch to cloned directory**<br>
Again, replace electron-svelte-app with your project directory from the first step

    cd electron-svelte-app
	
**Install all Dependencies**

    npm install
    
**Initialize Project**<br>
Will ask for package name, description, author, github repo, etc

    npm init
    
**Update all Dependencies (Optional)**

    npm install --save electron-serve@latest electron-window-state@latest

**Update all Dev Dependencies (Optional)**

    npm install --save-dev @rollup/plugin-commonjs@latest @rollup/plugin-node-resolve@latest concurrently@latest electron@latest electron-builder@latest rollup@latest rollup-plugin-css-only@latest rollup-plugin-livereload@latest rollup-plugin-svelte@latest rollup-plugin-terser@latest sirv-cli@latest svelte@latest wait-on@latest

### :exclamation: Pro tip: If using VS Code, install the <a href="https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode">Svelte for VS Code</a> extension

### 2) Changing some values :pencil2:
After you've cloned the project you're ***almost*** ready to get started on your app<br>
We need to change some things first

#### package.json:
Open **package.json** with your preferred IDE, and look for **productName**<br>
It's value will be the title of your app

It may contain upper and lowercase letters, spaces and other special characters not allowed in the **name** property<br>
eg. If the **name** property is **"myapp"**, the **productName** property can be **"MyApp"**

#### Electron-Builder:
Open **electron-builder.yml** with your preferred IDE<br>
You may change any values here, but we will only cover the ones that are needed for now<br>
See <a href="https://www.electron.build/configuration/configuration">Electron Builder Configuration</a> for more details on each property

- Set the **appID**
- Set the **uninstallDisplayName** (May contain upper and lowercase letters, spaces and other special characters)
- Set **token** (Your GitHub Personal Access Token. This is needed if you wish to publish your app to your repo and use **electron-updater**

### 3) Running & Building your app :hammer:
You should now be good to go to run your app

**Test your app** :rocket:

    npm run dev
    
**Build your app** :hammer:

This will create a new folder in your project folder, named **dist**<br>
Inside the **dist** folder will be your setup file, and the fully unpacked app inside **win-unpacked** folder

    npm run build
    
**Publish your app** :trophy:

This will build your app the same as `npm run build`, but it will also publish your app as a release in your GitHub Repo<br>
Version number inside **package.json** is also taken into account

    npm run deploy
    
### 3) Yes! :clap: Result :computer:
<div align="center" back>
	<img src="https://github.com/DogFoxX/assets/blob/master/electron-svelte-template/screenshot.png?raw=true">
</div>

## Wait, I don't know what to do next! :fearful:
If you haven't used Svelte before, it may be a bit confusing at first where to start<br>
We'll get you started with the basics

### 1) CSS and HTML
Svelte makes use of the **public** and **src** folders found in the root of your project

#### Public Folder
Here you'll find two files; **global.css** and **index.html**

- **global.css**<br>
This is where you'll add any css code to be applied to your whole app<br>
We recommend not to use this file to set all your css code, as it can get cluttered

- **index.html**<br>
This is the main html file where all your **.svelte** files will be loaded<br>
We do not recommend to change anything in the ```<body>``` tag<br>
Inside the ```<head>``` tag you can include more css stylesheets

#### Src Folder
Here you'll find two files; **App.svelte** and **main.js**

- **App.svelte**<br>
This file serves as the main html and scripts for your project<br>
**.svelte** files typically have a ```<script>``` tag where all your javascript code will be, and a ```<style>``` tag to add css code that only affect the html inside the current .svelte file<br>
You do not need to create a ```<body>``` tag again. Just write your html as normal.

**eg.**

```
<script>
any javascript code here
</script>

html code here
eg.
<h1>Hello World</h1>

<style>
any css code here
eg.
h1 { color: red;}
</style>
```
<br>

- **main.js**<br>
Not to be confused with the **main.js** file in the root of your project<br>
This file tells electron to add **App.svelte** inside the ```<body>``` of **index.html**<br>
We do not recommend to change anything here, except for any **props** you wish to send to **App.svelte**<br>
If you do not want to send any props to **App.svelte**, you may go ahead and remove the property<br>

#### That's it for now<br>
#### Visit the <a  href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn more about Svelte

# :star: Contributions :star:
### **electron-svelte-template** is based on <a href="https://github.com/soulehshaikh99/create-svelte-electron-app">create-svelte-electron-app</a> by <a href="https://github.com/soulehshaikh99">soulehshaikh99</a>
>>>>>>> e3b2d7e (Update 0.9.2)
