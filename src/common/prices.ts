import { Prices } from "src/interfaces/prices.interface";

const TIME_INTERVAL_IN_MINUTES = Number(process.env.TIME_INTERVAL_IN_MINUTES) || 1;
const BASE_URL = process.env.BASE_URL || "https://prices.splinterlands.com";

export const fetchPrices = async (): Promise<Prices> => {
    const lastRefresh = await getLastPriceRefresh();
    const currentTime = new Date().getTime();
    if (!lastRefresh || currentTime - lastRefresh > TIME_INTERVAL_IN_MINUTES * 60 * 1000) {
        const response = await fetch(`${BASE_URL}/prices`);
        const prices: Prices = await response.json();
        await updatePrices(prices);
        return prices;
    } else {
        const cachedPrices = await getCachedPrices();
        return cachedPrices || fetchPrices();
    }
};

const getLastPriceRefresh = (): Promise<number | undefined> => {
    return new Promise<number | undefined>((resolve) => {
        chrome.storage.local.get('lastPriceRefresh', (data) => {
            const lastRefresh: number | undefined = data.lastPriceRefresh;
            resolve(lastRefresh);
        });
    });
};

const updatePrices = async (prices: Prices) => {
    chrome.storage.local.set({ prices, lastPriceRefresh: new Date().getTime() }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving prices data:', chrome.runtime.lastError);
        }
    });
};

const getCachedPrices = (): Promise<Prices | undefined> => {
    return new Promise<Prices | undefined>((resolve) => {
        chrome.storage.local.get('prices', (data) => {
            const prices: Prices | undefined = data.prices;
            resolve(prices);
        });
    });
};

export const getPricesFromLocalStorage = async (): Promise<Prices | undefined> => {
    const lastRefresh = await getLastPriceRefresh();
    const currentTime = new Date().getTime();
    if (!lastRefresh || currentTime - lastRefresh > TIME_INTERVAL_IN_MINUTES * 60 * 1000) {
        const prices = await fetchPrices();
        return prices;
    } else {
        const cachedPrices = await getCachedPrices();
        if (!cachedPrices) {
            const prices = await fetchPrices();
            return prices;
        } else {
            return cachedPrices;
        }
    }
};
