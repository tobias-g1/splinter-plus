import { CardLevelInfo, ForSaleListing } from "src/interfaces/splinterlands.interface";

const BASE_URL = 'https://api2.splinterlands.com';

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
export const getCardLevelInfo = async (card: any, settings: any): Promise<CardLevelInfo> => {

    const details = await getCardDetails(card.card_detail_id);
    const edition = card.edition;
    const rarity = details.rarity;
    const gold = card.gold;

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

// Calculates the cheapest way to achieve the required XP and returns a list of listings
export const calculateCheapestCards = async (marketData: ForSaleListing[], requiredXP: number, baseXP: number) => {

    // First, sort the cards by price per XP in ascending order.
    const sortedMarketData = marketData.sort((a, b) => {

        const aPrice = parseFloat(a.buy_price);
        const bPrice = parseFloat(b.buy_price);
        const aXP = a.xp > 0 ? a.xp : baseXP;
        const bXP = b.xp > 0 ? b.xp : baseXP;

        return (aPrice / aXP) - (bPrice / bXP);
    });

    const findCombination = (currentIndex: number, remainingXP: number, selectedCards: ForSaleListing[]): ForSaleListing[] | null => {
        if (remainingXP <= 0) {
            return selectedCards;
        }

        if (currentIndex >= sortedMarketData.length) {
            return null;
        }

        const currentCard = sortedMarketData[currentIndex];
        const currentCardXP = currentCard.xp > 0 ? currentCard.xp : baseXP;

        if (currentCardXP <= remainingXP) {
            const withCard = findCombination(currentIndex + 1, remainingXP - currentCardXP, [...selectedCards, currentCard]);
            if (withCard !== null) {
                return withCard;
            }
        }

        return findCombination(currentIndex + 1, remainingXP, selectedCards);
    };

    return findCombination(0, requiredXP, []);
};



