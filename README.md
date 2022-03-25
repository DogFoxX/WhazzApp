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
    <h1>VERSION <ins><a href="https://github.com/DogFoxX/WhazzApp/releases/tag/v0.9.0">0.9.0 PRE-RELEASE IS HERE</a></ins>!!!</h1>
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
