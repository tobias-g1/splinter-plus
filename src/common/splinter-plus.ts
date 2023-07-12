import { getAccessToken } from "src/common/auth";
import { CardResponse, DeckResponse } from "src/interfaces/spinter-plus.interface";

const BASE_URL: string = "https://deckwhisperer.autoimp.me";

type Params = { [key: string]: any };

export const sendRequest = async (
    endpoint: string,
    method: string,
    token?: string,
    params?: Params,
    data?: any
): Promise<any> => {
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

    const modifiedMethod = method === "GET" ? "GET" : method; // Use original method for non-GET requests

    const response = await fetch(`${BASE_URL}/${endpoint}`, { ...config, method: modifiedMethod });
    const responseData = await response.json();

    if (response.status !== 200) {
        throw new Error(`Request to ${endpoint} failed: ${responseData.error || responseData.message}`);
    }

    return responseData;
};



export const login = async (message: string, signature: string, pubkey: string): Promise<{ access_token: string, refresh_token: string }> => {
    const data = await sendRequest("login", "POST", undefined, undefined, { message, signature, pubkey });
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

export const getDecks = async (
    mana: number,
    ruleset: string[],
    elements: string[],
    league: string,
    format: string,
    count: number,
    offset: number
): Promise<DeckResponse> => {
    const params: Params = {
        mana,
        rulesets: JSON.stringify(ruleset),
        elements: JSON.stringify(elements),
        league,
        format,
        count,
        offset,
    };
    const data = await sendRequest("decks", "GET", await getAccessToken(), params);
    return data as DeckResponse;
};

export const getCards = async (
    mana: number[],
    ruleset: string[],
    elements: string[],
    league: string,
    format: string,
    top_cnt: number
): Promise<CardResponse> => {
    const data = await sendRequest("cards", "GET", await getAccessToken(), undefined, {
        mana,
        rulesets: ruleset,
        elements,
        league,
        format,
        top_cnt,
    });
    return data as CardResponse;
};


