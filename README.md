
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
