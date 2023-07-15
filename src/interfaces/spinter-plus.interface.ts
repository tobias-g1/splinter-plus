export interface DeckResponse {
    count: number;
    decks: {
        idx: number;
        monster0_id: number;
        monster1_id: number;
        monster2_id: number;
        monster3_id: number;
        monster4_id: number;
        monster5_id: number;
        rating: number;
        summoner_id: number;
    }[];
    elements: string[];
    format: string;
    league: string;
    mana: number;
    offset: number;
    rulesets: string[];
}


export interface CardResponse {
    cards: Card[]
    elements: any[]
    format: string
    league: string
    mana: number[]
    rulesets: any[]
    top_cnt: number
    total_deck_cnt: number
}

export interface Card {
    avg_rating: number
    card_id: number
    deck_cnt: number
}


