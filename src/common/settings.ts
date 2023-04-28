import { Settings } from "http2";
import { fetchSettings } from "src/common/splinterlands";

export const fetchSettingsAndUpdateStorage = async (): Promise<Settings> => {
    const settings: Settings = await fetchSettings();
    chrome.storage.local.set({ settings }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings data:', chrome.runtime.lastError);
        }
    });
    return settings;
};

export const getSettingsFromLocalStorage = async (): Promise<Settings> => {
    const data: any = chrome.storage.local.get('settings');
    let settings: Settings = data.settings;
    if (!settings) {
        settings = await fetchSettingsAndUpdateStorage();
    }
    return settings;
};
