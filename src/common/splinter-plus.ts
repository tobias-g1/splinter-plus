import { getAccessToken } from "src/common/auth";
import { CardResponse, DeckResponse } from "src/interfaces/spinter-plus.interface";

const BASE_URL: string = "https://deckwhisperer.autoimp.me";

type Params = { [key: string]: any };

export const sendRequest = async (
    endpoint: string,
    method: string,
    token?: string,
    params?: Params,
    body?: any
): Promise<any> => {
    const config: RequestInit = { method };

    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        };
    }

    if (body) {
        config.headers = {
            ...config.headers,
            "Content-Type": "application/json",
        };
        config.body = JSON.stringify(body);
    }

    if (params) {
        const urlParams = new URLSearchParams(params);
        endpoint += `?${urlParams.toString()}`;
    }

    const response = await fetch(`${BASE_URL}/${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.error || responseData.message);
    }

    return { data: responseData, status: response.status };
};

export const login = async (
    message: string,
    signature: string,
    pubkey: string
): Promise<{ access_token: string; refresh_token: string }> => {
    const { data } = await sendRequest("login", "POST", undefined, undefined, {
        message,
        signature,
        pubkey,
    });
    return data;
};

export const logout = async (
    tokens?: string[]
): Promise<{ message: string }> => {
    const { data } = await sendRequest(
        "logout",
        "POST",
        "refresh",
        undefined,
        tokens ? { tokens } : undefined
    );
    return data;
};

export const refreshToken = async (): Promise<{ access_token: string }> => {

    const { data } = await sendRequest("refresh", "GET", "refresh");
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
    const { data } = await sendRequest(
        "decks",
        "POST",
        await getAccessToken(),
        undefined,
        {
            mana,
            rulesets: ruleset,
            elements,
            league,
            format,
            count,
            offset,
        }
    );
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
    const accessToken = await getAccessToken();
    const { data } = await sendRequest(
        "cards",
        "POST",
        accessToken,
        undefined,
        {
            mana,
            rulesets: ruleset,
            elements,
            league,
            format,
            top_cnt,
        }
    );
    return data as CardResponse;
};
