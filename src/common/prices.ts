import { Prices } from "src/interfaces/prices.interface";

export const fetchPrices = async (): Promise<Prices> => {
    const response = await fetch('https://prices.splinterlands.com/prices');
    const prices: Prices = await response.json();
    return prices;
};
