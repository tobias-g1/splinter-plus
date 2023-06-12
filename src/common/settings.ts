import { Settings } from "http2";
import { fetchSettings } from "src/common/splinterlands";

/**
 * Fetches the settings and updates the storage with the fetched settings.
 * @returns {Promise<Settings>} The fetched settings.
 */
export const fetchSettingsAndUpdateStorage = async (): Promise<Settings> => {
    try {
        const settings: Settings = await fetchSettings();
        chrome.storage.local.set({ settings }, () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
        });
        return settings;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Retrieves the settings from the local storage.
 * If the settings are not found in the local storage, fetches the settings
 * and updates the storage.
 * @returns {Promise<Settings>} The retrieved or fetched settings.
 */
export const getSettingsFromLocalStorage = async (): Promise<Settings> => {
    try {
        const data = localStorage.getItem('settings');
        let settings: Settings = data ? JSON.parse(data) : null;
        if (!settings) {
            settings = await fetchSettingsAndUpdateStorage();
        }
        return settings;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
