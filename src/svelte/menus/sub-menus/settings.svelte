<script>
    // Imports
    import { subMenuContent } from '../../../stores.js';

    // Constants
    const frequencies = [
        {
            name: "10 Minuntes",
            value: 600000
        },
        {
            name: "15 Minutes (Default)",
            value: 900000
        },
        {
            name: "30 Minutes",
            value: 1800000
        },
        {
            name: "60 Minutes",
            value: 3600000
        }
    ];

    // Variables
    let settStore = $subMenuContent.settStore,
        windowsSettings = settStore.get('windows-settings'),
        updates = settStore.get('updates');

    let selectValue = updates.updateFreq;

    // Functions
    const settingChanged = (e) => {
        switch (e.target.id) {
            case 'autoLaunch':
                windowsSettings.autoLaunch = e.target.checked;
                settStore.set('windows-settings', windowsSettings);
                break;
            case 'startMin':
                windowsSettings.startMin = e.target.checked;
                settStore.set('windows-settings', windowsSettings);
                break;
            case 'minToTray':
                windowsSettings.minToTray = e.target.checked;
                settStore.set('windows-settings', windowsSettings);
                break;
            case 'checkUpdates':
                updates.checkUpdates = e.target.checked;
                settStore.set('updates', updates);
                break;
            case 'autoDownload':
                updates.autoDownload = e.target.checked;
                settStore.set('updates', updates);
                break;
            case 'allowPrerelease':
                updates.allowPrerelease = e.target.checked;
                settStore.set('updates', updates);
                break;
            default:
                break;
        }
    }

    const frequencyChanged = () => {
        updates.updateFreq = selectValue
        settStore.set('updates', updates);
    }
</script>

<div class="menu-list">
    <div class="menu-section">
        <p class="section-header">Windows Settings</p>
        <div class="section-items">
            <div class="checkbox-container">
			    <input on:change={settingChanged} id="autoLaunch" class="checkbox" type="checkbox" checked={windowsSettings.autoLaunch}>
			    <label for="autoLaunch" class="checkbox-label">Start with Windows</label>
		    </div>
            <p class="check-description">WhazzApp will launch upon Windows start-up.</p>
            <div class="checkbox-container">
			    <input on:change={settingChanged} id="startMin" class="checkbox" type="checkbox" checked={windowsSettings.startMin}>
			    <label for="startMin" class="checkbox-label">Start minimzed</label>
		    </div>
            <p class="check-description">WhazzApp will launch minimzed to the System Tray.</p>
            <div class="checkbox-container">
			    <input on:change={settingChanged} id="minToTray" class="checkbox" type="checkbox" checked={windowsSettings.minToTray}>
			    <label for="minToTray" class="checkbox-label">Minimze to System Tray</label>
		    </div>
            <p class="check-description">Clicking &#10006; will minimize WhazzApp to the System Tray.</p>
        </div>
    </div>
    <div class="menu-section">
        <p class="section-header">Updates</p>
        <div class="section-items">
            <div class="checkbox-container">
                <input on:change={settingChanged} id="checkUpdates" class="checkbox" type="checkbox" checked={updates.checkUpdates}>
                <label for="checkUpdates" class="checkbox-label">Enable Auto Updates</label>
            </div>
            <p class="check-description">Enabled: WhazzApp will check for updates automatically.</p>
            <p class="check-description">Disabled: You'll have to check for updates manually.</p>
            <div class="select-container">
                <label for="frequency">Update frequency:</label>
                <select bind:value={selectValue} on:change={frequencyChanged} name="frequency" disabled={!updates.checkUpdates}>
                    {#each frequencies as frequency}
                    <option value={frequency.value}>{frequency.name}</option>
                    {/each}
                </select>
            </div>
            <div class="checkbox-container">
			    <input on:change={settingChanged} id="autoDownload" class="checkbox" type="checkbox" checked={updates.autoDownload}>
			    <label for="autoDownload" class="checkbox-label">Auto download updates</label>
		    </div>
            <p class="check-description">Enabled: Updates will be downloaded automatically.</p>
            <p class="check-description">Disabled: You'll be promted to download updates manually.</p>
            <div class="checkbox-container">
			    <input on:change={settingChanged} id="allowPrerelease" class="checkbox" type="checkbox" checked={updates.allowPrerelease}>
			    <label for="allowPrerelease" class="checkbox-label">Allow pre-releases</label>
		    </div>
            <p class="check-description">Updates will include pre-releases. Not recommended.</p>
        </div>
    </div>
</div>

<style>
    .menu-list {
        min-height: calc(100% - 108px);
		max-height: calc(100% - 108px);
	}
</style>