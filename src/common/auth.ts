import { sendRequestSignBuffer } from "src/common/keychain";
import { sendRequest } from "src/common/splinter-plus";
import { getUsernameFromLocalStorage } from "src/common/user";

const LOGIN_STORAGE_KEY = 'sp_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'sp_refresh_token';

export const getAccessToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(LOGIN_STORAGE_KEY, (data) => {
            const token = data[LOGIN_STORAGE_KEY];
            resolve(token)
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

export const getRefreshToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(REFRESH_TOKEN_STORAGE_KEY, (data) => {
            const token = data[REFRESH_TOKEN_STORAGE_KEY];
            if (!token) {
                reject(new Error('Refresh token not found'));
            } else {
                resolve(token);
            }
        });
    });
};

export const clearAccessToken = async (): Promise<void> => {
    return new Promise((resolve) => {
        chrome.storage.local.remove(LOGIN_STORAGE_KEY, () => {
            resolve();
        });
    });
};

export const clearRefreshToken = async (): Promise<void> => {
    return new Promise((resolve) => {
        chrome.storage.local.remove(REFRESH_TOKEN_STORAGE_KEY, () => {
            resolve();
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
    try {
        const username = await getUsernameFromLocalStorage();
        if (!username) {
            throw new Error('Failed to retrieve username from local storage');
        }
        const message = username + ' ' + Math.floor(Date.now() / 1000);
        sendRequestSignBuffer(username as string, message);

    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const refreshToken = async (): Promise<void> => {
    try {
        const access_token = await getAccessToken();
        const refresh_token = await getRefreshToken();
        if (access_token && refresh_token) {
            const { access_token: new_access_token, refresh_token: new_refresh_token } = await sendRequest('refresh', 'GET', refresh_token);
            await setAccessToken(new_access_token);
            await setRefreshToken(new_refresh_token);
            console.log('Refreshed access token:', new_access_token);
            console.log('Refreshed refresh token:', new_refresh_token);
        } else {
            await login();
        }
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        await login();
    }
};
