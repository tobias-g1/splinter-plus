const BASE_URL: string = "https://deckwhisperer.autoimp.me";

type Params = { [key: string]: any };

export const sendRequest = async (endpoint: string, method: string, token?: string, params?: Params, data?: any): Promise<any> => {
    const config: RequestInit = { method };
    if (token) {
        config.headers = { "Authorization": `Bearer ${token}` };
    }
    if (data) {
        config.headers = { "Content-Type": "application/json" };
        config.body = JSON.stringify(data);
    }
    if (params) {
        const urlParams = new URLSearchParams(params);
        endpoint += `?${urlParams.toString()}`;
    }
    const response = await fetch(`${BASE_URL}/${endpoint}`, config);
    const responseData = await response.json();
    if (response.status !== 200) {
        throw new Error(`Request to ${endpoint} failed: ${responseData.error || responseData.message}`);
    }
    return responseData;
};

export const login = async (account: string, timestamp: number, signature: string, pubkey: string): Promise<{ access_token: string, refresh_token: string }> => {
    const data = await sendRequest("login", "POST", undefined, undefined, { message: `${account} ${timestamp}`, signature, pubkey });
    return data;
};

export const logout = async (tokens?: string[]): Promise<{ message: string }> => {
    const data = await sendRequest("logout", "POST", "refresh", undefined, tokens ? { tokens } : undefined);
    return data;
};

export const refreshToken = async (): Promise<{ access_token: string }> => {
    const data = await sendRequest("refresh", "GET", "refresh");
    return data;
};

export const bestDeckForRuleset = async (mana: number, ruleset: string[], elements: string[], league: string, use_collection: boolean, username?: string): Promise<{ summoner_id: number | null, summoner_lvl: number | null, monster0_id: number | null, monster0_lvl: number | null, monster1_id: number | null, monster1_lvl: number | null, monster2_id: number | null, monster2_lvl: number | null, monster3_id: number | null, monster3_lvl: number | null, monster4_id: number | null, monster4_lvl: number | null, monster5_id: number | null, monster5_lvl: number | null }> => {
    const params: Params = { mana, ruleset: JSON.stringify(ruleset), elements: JSON.stringify(elements), league, use_collection, username };
    const data = await sendRequest("best_deck_for_ruleset", "GET", "access", params);
    return data;
};

export const collectionForLeague = async (mana_min?: number, mana_max?: number, rulesets?: string[][], elements?: string[], league?: string): Promise<{ cards: { id: number, lvl: number }[] }> => {
    const params: Params = { mana_min, mana_max, rulesets: JSON.stringify(rulesets), elements: JSON.stringify(elements), league };
    const data = await sendRequest("collection_for_league", "GET", "access", params);
    return data;
};


