import { sendRequestSignBuffer } from "src/common/keychain";
import { sendRequest } from "src/common/splinter-plus";
import { getUsernameFromLocalStorage } from "src/common/user";

const LOGIN_STORAGE_KEY = 'sp_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'sp_refresh_token';

export const getAccessToken = async (): Promise<string | undefined> => {
    return new Promise((resolve) => {
        chrome.storage.local.get(LOGIN_STORAGE_KEY, (data) => {
            resolve(data[LOGIN_STORAGE_KEY]);
        });
    });
};

export const setAccessToken = async (token: string): Promise<void> => {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [LOGIN_STORAGE_KEY]: token }, () => {
            resolve();
        });
    });
};

export const getRefreshToken = async (): Promise<string | undefined> => {
    return new Promise((resolve) => {
        chrome.storage.local.get(REFRESH_TOKEN_STORAGE_KEY, (data) => {
            resolve(data[REFRESH_TOKEN_STORAGE_KEY]);
        });
    });
};

export const setRefreshToken = async (token: string): Promise<void> => {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [REFRESH_TOKEN_STORAGE_KEY]: token }, () => {
            resolve();
        });
    });
};

export const login = async () => {
    const username = await getUsernameFromLocalStorage();
    const message = username + ' ' + Math.floor(Date.now() / 1000);
    await sendRequestSignBuffer(username as string, message);
};

export const refreshToken = async (): Promise<void> => {
    const access_token = await getAccessToken();
    const refresh_token = await getRefreshToken();
    if (access_token && refresh_token) {
        const { access_token: new_access_token, refresh_token: new_refresh_token } = await sendRequest('refresh', 'GET', refresh_token);
        await setAccessToken(new_access_token);
        await setRefreshToken(new_refresh_token);
        console.log('Refreshed access token:', new_access_token);
        console.log('Refreshed refresh token:', new_refresh_token);
    } else {
        console.warn('Cannot refresh access token: no token found');
    }
};
