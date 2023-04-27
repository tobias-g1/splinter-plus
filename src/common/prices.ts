import { Prices } from "src/interfaces/prices.interface";

export const fetchPrices = async (): Promise<Prices> => {
    const response = await fetch('https://prices.splinterlands.com/prices');
    const prices: Prices = await response.json();
    return prices;
};

export const fetchPricesAndUpdateStorage = async () => {
    const prices: Prices = await fetchPrices();
    chrome.storage.local.set({ prices }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving prices data:', chrome.runtime.lastError);
        }
    });
};

export const getPricesFromLocalStorage = async (): Promise<Prices | undefined> => {
    return new Promise<Prices | undefined>((resolve) => {
        chrome.storage.local.get('prices', async (data) => {
            let prices: Prices | undefined = data.prices;
            if (!prices) {
                prices = await fetchPrices();
                fetchPricesAndUpdateStorage();
            }
            resolve(prices);
        });
    });
};