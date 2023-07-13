import { Settings } from "http2";
import { fetchSettings } from "src/common/splinterlands";
import { SettingsWithIndexSignature } from "src/interfaces/splinterlands.interface";

/**
 * Fetches the settings and updates the localStorage with the fetched settings.
 * @returns {Promise<Settings>} The fetched settings.
 */
export const fetchSettingsAndUpdateStorage = async (): Promise<SettingsWithIndexSignature> => {
    try {
        const settings: SettingsWithIndexSignature = await fetchSettings();
        localStorage.setItem('settings', JSON.stringify(settings));
        return settings;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Retrieves the settings from the localStorage.
 * If the settings are not found in the localStorage, fetches the settings
 * and updates the storage.
 * @returns {Promise<Settings>} The retrieved or fetched settings.
 */
export const getSettingsFromLocalStorage = async (): Promise<SettingsWithIndexSignature> => {
    try {
        const data = localStorage.getItem('settings');
        let settings: SettingsWithIndexSignature = data ? JSON.parse(data) : null;
        if (!settings) {
            settings = await fetchSettingsAndUpdateStorage();
        }
        return settings;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
