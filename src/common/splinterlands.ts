import { generateSafeRandomNumber, sendCustomJSONRequest } from "src/common/keychain";
import { getSettingsFromLocalStorage } from "src/common/settings";
import { KeychainKeyTypes } from "src/interfaces/keychain.interface";
import { BalanceHistory, CardLevelInfo, ForSaleListing, SettingsWithIndexSignature, Transaction, TransactionUpdate } from "src/interfaces/splinterlands.interface";

const BASE_URL = process.env.SPLINTERLANDS_BASE || 'https://api2.splinterlands.com';

// Fetches settings data from Splinterlands API
export const fetchSettings = async () => {
    const settingsUrl = `${BASE_URL}/settings`;
    const settingsResponse = await fetch(settingsUrl);
    return await settingsResponse.json();
};

// Fetches card details from Splinterlands API
export const getCardDetails = async (card_detail_id: number) => {
    const response = await fetch(`${BASE_URL}/cards/get_details`);
    const data = await response.json();
    return data.find((card: any) => card.id === card_detail_id);
};

// Returns the card image URL based on edition, card name, level, and gold status
export function getCardImage(edition: string, cardName: string, level: number, isGold = false): string {
    return '';
}

// Retrieves level information for a given card
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
    let level = 0
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

// Fetches card data for a list of card IDs from Splinterlands API
export const fetchCardData = async (cardIds: string) => {
    const apiUrl = `${BASE_URL}/cards/find?ids=${cardIds}`;
    const response = await fetch(apiUrl);
    return await response.json();
};

// Fetches card sale data for a specific card detail ID from Splinterlands API
export const fetchCardSaleData = async (cardDetailId: number, gold: boolean, edition: number, fee: number): Promise<ForSaleListing[]> => {
    const apiUrl = `${BASE_URL}/market/for_sale_by_card?card_detail_id=${cardDetailId}&gold=${gold}&edition=${edition}&fee=${fee}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.flat();
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
}

export const calculateCheapestCards = async (marketData: ForSaleListing[], requiredXP: number, baseXP: number) => {
    const requiredBcx = requiredXP / baseXP;

    // Create an array of indices and sort it by price per BCX in ascending order.
    const sortedIndices = [...Array(marketData.length).keys()].sort((i, j) => {
        const a = marketData[i];
        const b = marketData[j];
        const aPrice = parseFloat(a.buy_price);
        const bPrice = parseFloat(b.buy_price);
        const aBcx = a.bcx;
        const bBcx = b.bcx;

        return (aPrice / aBcx) - (bPrice / bBcx);
    });

    const findCombination = (currentIndex: number, remainingBcx: number, selectedCardIndices: number[]): number[] | null => {

        if (remainingBcx === 0) {
            return selectedCardIndices;
        }

        if (currentIndex >= sortedIndices.length || remainingBcx < 0) {
            return null;
        }

        const currentCardIndex = sortedIndices[currentIndex];
        const currentCard = marketData[currentCardIndex];
        const currentCardBcx = currentCard.bcx;

        // Only consider adding the current card if it would not make the total BCX exceed requiredBcx
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
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

export async function waitForTransactionSuccess(trxId: string, retryIntervalSeconds: number, maxRetries: number): Promise<TransactionUpdate> {
    let retries = 0;
    while (true) {
        const transactionData: Transaction = await lookupTransaction(trxId);
        if (transactionData.trx_info.success === true) {
            return {
                trx_info: transactionData.trx_info,
                success: true
            };
        } else {
            retries++;
            if (retries > maxRetries) {
                return {
                    trx_info: transactionData.trx_info,
                    success: false
                };
            }
            await new Promise((resolve) => setTimeout(resolve, retryIntervalSeconds * 1000));
        }
    }
}

export const buyCardsFromMarket = async (username: string, cards: ForSaleListing[], currency: string): Promise<any> => {
    const items = cards.map(card => card.market_id);
    const total_price = cards.reduce((sum, card) => sum + parseFloat(card.buy_price), 0).toFixed(3)
    const json: string = JSON.stringify({
        items,
        price: total_price,
        currency,
        market: process.env.MARKET,
        app: process.env.APP
    })
    sendCustomJSONRequest('sm_market_purchase', json, username, KeychainKeyTypes.active);
};

export const fetchBalances = async (username: string) => {
    const apiUrl = `${BASE_URL}/players/balances?username=${username}`;
    const response = await fetch(apiUrl);
    return await response.json();
};

export const combineCards = async (username: string, cards: string[], appVersion: string): Promise<any> => {
    const json: string = JSON.stringify({
        cards,
        app: appVersion,
        n: generateSafeRandomNumber()
    });
    const combineRequest = {
        required_auths: [],
        required_posting_auths: [username],
        id: "sm_combine_cards",
        json
    };
    const combineResponse = await sendCustomJSONRequest(combineRequest.id, JSON.stringify(combineRequest.json), username, KeychainKeyTypes.posting);
    return combineResponse;
};


export const lookupBalanceHistory = async (username: string, types: string, tokenType: string, offset: number, limit: number): Promise<BalanceHistory[]> => {
    const url = `https://api2.splinterlands.com/players/balance_history?username=${username}&token_type=${tokenType}&types=${types}&offset=${offset}&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};
