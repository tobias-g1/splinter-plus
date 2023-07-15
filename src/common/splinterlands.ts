import { sendCustomJSONRequest } from "src/common/keychain";
import { getPricesFromLocalStorage } from "src/common/prices";
import { getSettingsFromLocalStorage } from "src/common/settings";
import { KeychainKeyTypes } from "src/interfaces/keychain.interface";
import { Prices } from "src/interfaces/prices.interface";
import {
    Balance,
    BalanceHistory,
    CardLevelInfo,
    Collection,
    ForSaleListing,
    MarketListing,
    SettingsWithIndexSignature,
    Transaction,
} from "src/interfaces/splinterlands.interface";

const BASE_URL = process.env.SPLINTERLANDS_BASE || 'https://api2.splinterlands.com';

export const fetchSettings = async (): Promise<SettingsWithIndexSignature> => {
    try {
        const settingsUrl = `${BASE_URL}/settings`;
        const settingsResponse = await fetch(settingsUrl);
        if (!settingsResponse.ok) {
            throw new Error(`Error: ${settingsResponse.status} ${settingsResponse.statusText}`);
        }
        return await settingsResponse.json();
    } catch (error) {
        console.error('An error occurred during the settings fetch:', error);
        throw error;
    }
};

export const getCardDetails = async (card_detail_id: number | number[]) => {
    try {
        const response = await fetch(`${BASE_URL}/cards/get_details`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(card_detail_id)) {
            const cards = data.filter((card: any) => card_detail_id.includes(card.id));
            if (cards.length === 0) {
                throw new Error(`No cards found with IDs ${card_detail_id.join(", ")}.`);
            }
            return cards;
        } else {
            const card = data.find((card: any) => card.id === card_detail_id);
            if (!card) {
                throw new Error(`Card with ID ${card_detail_id} not found.`);
            }
            return card;
        }
    } catch (error) {
        console.error('An error occurred while fetching card details:', error);
        throw error;
    }
};

export const getCardLevelInfo = async (card: any): Promise<CardLevelInfo> => {
    const details = await getCardDetails(card.card_detail_id);
    const edition = card.edition;
    const rarity = details.rarity;
    const gold = card.gold;
    const settings: SettingsWithIndexSignature = await getSettingsFromLocalStorage() as SettingsWithIndexSignature;

    // Calculate the base XP for the card
    let xp_property;

    if (edition === 0 || (edition === 2 && card.card_detail_id < 100)) {
        xp_property = gold ? "gold_xp" : "alpha_xp";
    } else {
        xp_property = gold ? "beta_gold_xp" : "beta_xp";
    }

    const base_xp = settings[xp_property][rarity - 1];

    if (card.edition == 4 || details.tier >= 4) {
        const rates = card.gold ? settings.combine_rates_gold[details.rarity - 1] : settings.combine_rates[details.rarity - 1];
        let level = 0;

        if (!rates) {
            throw new Error('Rates are undefined')
        }

        for (let i = 0; i < rates.length; i++) {
            if (rates[i] > card.xp) break;
            level++;
        }
        if (card.xp === 0) level = 1;
        const levelInfo: CardLevelInfo = {
            level: level,
            next_level: level + 1,
            cards_required: level >= rates.length ? 0 : rates[level] - card.xp,
            xp_required: (level >= rates.length ? 0 : rates[level] - card.xp) * base_xp,
            base_xp: base_xp
        };

        return levelInfo;
    }

    const levels = settings.xp_levels[details.rarity - 1];
    let level = 0;
    for (let i = 0; i < levels.length; i++) {
        if (card.xp < levels[i]) {
            level = i + 1;
            break;
        }
    }

    if (level === 0) level = levels.length + 1;

    const xp_to_next_level = level > levels.length ? card.xp - levels[levels.length - 1] : card.xp - (level === 1 ? 0 : levels[level - 2]);
    const xp_needed = level > levels.length ? -1 : level === 1 ? levels[level - 1] : levels[level - 1] - levels[level - 2];
    const xp_array = card.edition == 1 || card.edition == 3 || (card.edition == 2 && details.id > 100) ? (card.gold ? "beta_gold_xp" : "beta_xp") : card.gold ? "gold_xp" : "alpha_xp";
    const xp_per_card = settings[xp_array][details.rarity - 1];
    const cards_needed = Math.ceil(xp_needed / xp_per_card);
    const cards_to_next_level = cards_needed - Math.ceil((xp_needed - xp_to_next_level) / xp_per_card);

    const res: CardLevelInfo = {
        level: level,
        next_level: level + 1,
        cards_required: cards_needed - cards_to_next_level,
        xp_required: (cards_needed - cards_to_next_level) * base_xp,
        base_xp: base_xp
    };

    return res;
};

export const fetchCardData = async (cardIds: string) => {
    try {
        const apiUrl = `${BASE_URL}/cards/find?ids=${cardIds}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('An error occurred during the card data fetch:', error);
        throw error;
    }
};

export const fetchCardSaleData = async (
    cardDetailId: number,
    gold: boolean,
    edition: number,
    fee: number
): Promise<ForSaleListing[]> => {
    try {
        const apiUrl = `${BASE_URL}/market/for_sale_by_card?card_detail_id=${cardDetailId}&gold=${gold}&edition=${edition}&fee=${fee}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Invalid response format: expected an array.');
        }

        return data.flat();
    } catch (error) {
        console.error('An error occurred during the card sale data fetch:', error);
        throw error;
    }
};

export const fetchMarketData = async (
    cardDetailId: number,
    gold: boolean,
    edition: number,
    fee: number,
    type: string,
    rentalType: string | null | undefined,
    limit: number,
    sort: string
): Promise<MarketListing[]> => {
    try {
        const apiUrl = `${BASE_URL}/market/market_query_by_card?card_detail_id=${cardDetailId}&gold=${gold}&edition=${edition}&fee=${fee}&type=${type}&rental_type=${rentalType}&limit=${limit}&sort=${sort}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Invalid response format: expected an array.');
        }

        return data.flat();
    } catch (error) {
        console.error('An error occurred during the card sale data fetch:', error);
        throw error;
    }
};

export const sumCards = async (cardData: any) => {
    const combinedObj: any = {};

    for (let card of cardData) {
        for (let key in card) {
            if (key === 'xp' && typeof card[key] === 'number') {
                if (!combinedObj[key]) {
                    combinedObj[key] = 0;
                }
                combinedObj[key] += card[key];
            } else {
                combinedObj[key] = card[key];
            }
        }
    }
    return combinedObj;
};

export const calculateCheapestCards = async (
    marketData: ForSaleListing[],
    requiredXP: number,
    baseXP: number
): Promise<ForSaleListing[] | null> => {
    const requiredBcx = requiredXP / baseXP;

    const sortedIndices = [...Array(marketData.length).keys()].sort((i, j) => {
        const a = marketData[i];
        const b = marketData[j];
        const aPrice = parseFloat(a.buy_price);
        const bPrice = parseFloat(b.buy_price);
        const aBcx = a.bcx;
        const bBcx = b.bcx;

        return (aPrice / aBcx) - (bPrice / bBcx);
    });

    const findCombination = (
        currentIndex: number,
        remainingBcx: number,
        selectedCardIndices: number[]
    ): number[] | null => {
        if (remainingBcx === 0) {
            return selectedCardIndices;
        }

        if (currentIndex >= sortedIndices.length || remainingBcx < 0) {
            return null;
        }

        const currentCardIndex = sortedIndices[currentIndex];
        const currentCard = marketData[currentCardIndex];
        const currentCardBcx = currentCard.bcx;

        if (currentCardBcx <= remainingBcx) {
            selectedCardIndices.push(currentCardIndex);
            const withCard = findCombination(currentIndex + 1, remainingBcx - currentCardBcx, selectedCardIndices);
            if (withCard !== null) {
                return withCard;
            }
            selectedCardIndices.pop();
        }
        return findCombination(currentIndex + 1, remainingBcx, selectedCardIndices);
    };

    const selectedCardIndices = findCombination(0, requiredBcx, []);
    if (selectedCardIndices === null) {
        return null;
    }
    return selectedCardIndices.map(index => marketData[index]);
};

export const lookupTransaction = async (trxId: string): Promise<Transaction> => {
    const url = `${BASE_URL}/transactions/lookup?trx_id=${trxId}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('An error occurred during the transaction lookup:', error);
        throw error;
    }
};

export async function waitForTransactionSuccess(
    trxId: string,
    retryIntervalSeconds: number,
    maxRetries: number
): Promise<any> {
    let retries = 0;
    while (true) {
        try {
            const transactionData: any = await lookupTransaction(trxId);
            if (transactionData.error && transactionData.error_code === 1) {
                retries++;
                if (retries > maxRetries) {
                    return {
                        trx_info: null,
                        success: false,
                    };
                }
                await new Promise((resolve) => setTimeout(resolve, retryIntervalSeconds * 1000));
            } else if (transactionData.trx_info.success === true) {
                return {
                    trx_info: transactionData.trx_info,
                    success: true,
                };
            } else {
                retries++;
                if (retries > maxRetries) {
                    return {
                        trx_info: transactionData.trx_info,
                        success: false,
                    };
                }
                await new Promise((resolve) => setTimeout(resolve, retryIntervalSeconds * 1000));
            }
        } catch (error) {
            console.error('An error occurred while waiting for transaction success:', error);
            throw error;
        }
    }
}
type Listing = ForSaleListing | MarketListing;

export const buyCardsFromMarket = async (
    username: string,
    cards: Listing[],
    currency: string
): Promise<any> => {

    const balances = await fetchBalances(username);
    const tokenBalance: number | undefined = getTokenBalance(balances, currency);

    console.log(balances)
    console.log(tokenBalance)

    const items = cards.map(card => card.market_id);
    const total_price = cards.reduce((sum, card) => {
        const buy_price = typeof card.buy_price === 'string' ? parseFloat(card.buy_price) : card.buy_price;
        return sum + (buy_price || 0);
    }, 0).toFixed(3);

    const prices: Prices | undefined = await getPricesFromLocalStorage();

    if (prices) {
        const totalPriceDEC = (parseFloat(total_price) / prices.dec).toFixed(3);

        console.log(totalPriceDEC)

        if (!tokenBalance || (tokenBalance < parseFloat(totalPriceDEC))) {

            alert(`You don't have enough ${currency} to complete this purchase.`);
            return;
        }

        const json: string = JSON.stringify({
            items,
            price: total_price,
            currency,
            market: process.env.MARKET,
            app: process.env.APP
        });
        sendCustomJSONRequest('sm_market_purchase', json, username, KeychainKeyTypes.active);
    } else {
        alert('Unable to complete purchases unable to calculate prices in DEC');
    }

};

export const rentCardsFromMarket = async (
    username: string,
    cards: Listing[],
    currency: string,
    days: string,
): Promise<any> => {

    const balances = await fetchBalances(username);
    const tokenBalance: number | undefined = getTokenBalance(balances, currency);
    const prices: Prices | undefined = await getPricesFromLocalStorage();

    const items = cards.map(card => card.market_id);
    const total_price = cards.reduce((sum, card) => {
        const buy_price = typeof card.buy_price === 'string' ? parseFloat(card.buy_price) : card.buy_price;
        return sum + (buy_price || 0);
    }, 0).toFixed(3);

    if (prices) {
        const totalPriceDEC = (parseFloat(total_price) / prices.dec).toFixed(3);

        if (!tokenBalance || tokenBalance < parseFloat(total_price)) {
            alert(`You don't have enough ${currency} to complete this rental.`);
            return;
        }

        const json: string = JSON.stringify({
            items,
            currency,
            days,
            market: process.env.MARKET,
            app: process.env.APP
        });
        sendCustomJSONRequest('sm_market_rent', json, username, KeychainKeyTypes.active);
    } else {
        alert('Unable to complete rental unable to calculate prices in DEC');
    }
};

export const fetchBalances = async (username: string): Promise<Balance[]> => {
    const apiUrl = `${BASE_URL}/players/balances?username=${username}`;
    const response = await fetch(apiUrl);
    return await response.json();
};

export const getTokenBalance = (balances: Balance[], token: string): number | undefined => {
    const balance = balances.find((item) => item.token === token)?.balance;
    return balance !== undefined ? balance : 0;
};

function generateRandomString(): string {
    let result = 'N';
    for (let i = 0; i < 8; i++) {
        result += Math.random().toString(36).charAt(2);
    }
    return result;
}

export const getCollection = async (username: string): Promise<Collection> => {
    const apiUrl = `${BASE_URL}/cards/collection/${username}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
};

export const combineCards = async (username: string, cards: string[]): Promise<any> => {
    const json: string = JSON.stringify({
        cards,
        app: "splinterlands/0.7.230630",
        n: generateRandomString()
    });
    const combineRequest = {
        required_auths: [],
        required_posting_auths: [username],
        id: "sm_combine_cards",
        json
    };
    const combineResponse = await sendCustomJSONRequest(combineRequest.id, combineRequest.json, username, KeychainKeyTypes.posting);
    return combineResponse;
};

export const lookupBalanceHistory = async (
    username: string,
    types: string,
    tokenType: string,
    offset: number,
    limit: number
): Promise<BalanceHistory[]> => {
    const url = `${BASE_URL}/players/balance_history?username=${username}&token_type=${tokenType}&types=${types}&offset=${offset}&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

export function getItemStatus(ids: string[]): Promise<any> {
    const apiUrl: string = `${BASE_URL}/market/status?ids=${ids.join(',')}`;

    return fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Request failed with status code: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error('An error occurred during the API request:', error);
            throw new Error('Failed to fetch item status. Please try again later.');
        });
}

export async function verifySuccessfulPurchases(trxId: string) {
    try {
        const res = await waitForTransactionSuccess(trxId, 4, 5);
        const trxInfo = res.trx_info;
        const json = JSON.parse(trxInfo.data);
        const { items } = json;
        const status = await getItemStatus(items);

        const allSuccessful = status.every((item: any) => item.status === 1);
        const successful = status.filter((item: any) => item.status === 1);
        const unsuccessful = status.filter((item: any) => item.status !== 1);

        return {
            allSuccessful,
            successful,
            unsuccessful
        };

    } catch (error) {
        console.error('An error occurred during purchase verification:', error);
        throw new Error('Failed to verify purchase. Please try again later.');
    }
}
