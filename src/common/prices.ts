import { Prices } from "src/interfaces/prices.interface";

// The time interval (in minutes) after which prices should be forcefully refreshed
const TIME_INTERVAL_IN_MINUTES: number = Number(process.env.PRICE_FORCE_REFRESH_IN_MINUTES) || 1;

// The base URL for fetching prices
const BASE_URL: string = process.env.BASE_URL || "https://prices.splinterlands.com";

/**
 * Fetches the prices.
 * If the prices haven't been fetched or the last fetch is older than the specified time interval,
 * performs a fresh fetch and updates the prices in storage.
 * Otherwise, retrieves the prices from storage.
 * @returns {Promise<Prices>} The fetched or retrieved prices.
 */
export const fetchPrices = async (): Promise<Prices> => {
    const lastRefresh: number | undefined = await getLastPriceRefresh();
    const currentTime: number = new Date().getTime();

    if (!lastRefresh || currentTime - lastRefresh > TIME_INTERVAL_IN_MINUTES * 60 * 1000) {
        const response = await fetch(`${BASE_URL}/prices`);
        const prices: Prices = await response.json();
        await updatePrices(prices);
        return prices;
    } else {
        const cachedPrices: Prices | undefined = await getCachedPrices();
        return cachedPrices || fetchPrices();
    }
};

/**
 * Retrieves the last price refresh timestamp from storage.
 * @returns {Promise<number | undefined>} The last price refresh timestamp.
 */
const getLastPriceRefresh = (): Promise<number | undefined> => {
    return new Promise<number | undefined>((resolve) => {
        chrome.storage.local.get('lastPriceRefresh', (data) => {
            const lastRefresh: number | undefined = data.lastPriceRefresh;
            resolve(lastRefresh);
        });
    });
};

/**
 * Updates the prices in storage along with the last price refresh timestamp.
 * @param {Prices} prices - The prices to be updated in storage.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
const updatePrices = async (prices: Prices): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ prices, lastPriceRefresh: new Date().getTime() }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(`Error saving prices data: ${chrome.runtime.lastError.message}`));
            } else {
                resolve();
            }
        });
    });
};

/**
 * Retrieves the cached prices from storage.
 * @returns {Promise<Prices | undefined>} The cached prices.
 */
const getCachedPrices = (): Promise<Prices | undefined> => {
    return new Promise<Prices | undefined>((resolve) => {
        chrome.storage.local.get('prices', (data) => {
            const prices: Prices | undefined = data.prices;
            resolve(prices);
        });
    });
};

/**
 * Retrieves the prices from storage.
 * If the prices haven't been fetched or the last fetch is older than the specified time interval,
 * performs a fresh fetch and returns the fetched prices.
 * Otherwise, retrieves the prices from storage.
 * If the prices are not found in storage, performs a fresh fetch and returns the fetched prices.
 * @returns {Promise<Prices | undefined>} The retrieved or fetched prices.
 */
export const getPricesFromLocalStorage = async (): Promise<Prices | undefined> => {
    const lastRefresh: number | undefined = await getLastPriceRefresh();
    const currentTime: number = new Date().getTime();

    if (!lastRefresh || currentTime - lastRefresh > TIME_INTERVAL_IN_MINUTES * 60 * 1000) {
        const prices: Prices = await fetchPrices();
        return prices;
    } else {
        const cachedPrices: Prices | undefined = await getCachedPrices();
        if (!cachedPrices) {
            const prices: Prices = await fetchPrices();
            return prices;
        } else {
            return cachedPrices;
        }
    }
};
