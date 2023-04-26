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

// Calculates the card's BCX value
export const getCardBCX = async (card: any, settings: any) => {
    const details = await getCardDetails(card.card_detail_id);
    if (card.edition == 4 || details.tier >= 4) return card.xp;
    const xp_property = card.edition == 0 || (card.edition == 2 && card.card_detail_id < 100) ? (card.gold ? "gold_xp" : "alpha_xp") : card.gold ? "beta_gold_xp" : "beta_xp";
    const bcx_xp = settings[xp_property][details.rarity - 1];
    const result = Math.max(card.gold ? card.xp / bcx_xp : (card.xp + bcx_xp) / bcx_xp, 1);
    return result;
};

// Returns the card image URL based on edition, card name, level, and gold status
export function getCardImage(edition: string, cardName: string, level: number, isGold = false): string {
    return '';
}

// Retrieves level information for a given card
export const getCardLevelInfo = async (card: any, settings: any) => {
    const details = await getCardDetails(card.card_detail_id);

    if (isNaN(card.xp)) {
        card.xp = (card.edition == 4 || details.tier) == 4 ? 1 : 0;
    }

    if (card.edition == 4 || details.tier >= 4) {
        const rates = card.gold ? settings.combine_rates_gold[details.rarity - 1] : settings.combine_rates[details.rarity - 1];
        let level = 0;

        if (!rates) {
            console.error("Error: Rates are undefined");
            return;
        }

        for (let i = 0; i < rates.length; i++) {
            if (rates[i] > card.xp) break;
            level++;
        }
        if (card.xp === 0) level = 1;
        return {
            level: level,
            xp_to_next_level: card.xp - rates[level - 1],
            cards_to_next_level: card.xp - rates[level - 1],
            xp_needed: level >= rates.length ? -1 : rates[level] - rates[level - 1],
            cards_needed: level >= rates.length ? -1 : rates[level] - rates[level - 1],
        };
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

    const res = {
        level: level,
        xp_to_next_level: xp_to_next_level,
        cards_to_next_level: cards_to_next_level,
        xp_needed: xp_needed,
        cards_needed: cards_needed,
    };

    return res;
};

// Fetches card data for a list of card IDs from Splinterlands API
export const fetchCardData = async (cardIds: string) => {
    const apiUrl = `${BASE_URL}/cards/find?ids=${cardIds}`;
    const response = await fetch(apiUrl);
    return await response.json();
};

