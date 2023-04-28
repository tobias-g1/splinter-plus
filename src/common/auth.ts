import { sendRequestSignBuffer } from "src/common/keychain";
import { sendRequest } from "src/common/splinter-plus";
import { getUsernameFromLocalStorage } from "src/content-scripts/username/username";

const LOGIN_STORAGE_KEY = 'dw_access_token';

const KEYCHAIN_EXTENSION_ID = 'your-keychain-extension-id'; // Replace with your keychain extension ID
const USERNAME = 'your-username'; // Replace with your username
const MESSAGE = 'your-message'; // Replace with your message

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


export const login = async (): Promise<string> => {
    const username = await getUsernameFromLocalStorage()
    const message = 'login'
    const { signature, pubkey } = await sendRequestSignBuffer(username as string, message);
    const { access_token } = await sendRequest('login', 'POST', undefined, undefined, { message: MESSAGE, signature, pubkey });
    await setAccessToken(access_token);
    return access_token;
};

export const refreshToken = async (): Promise<void> => {
    const access_token = await getAccessToken();
    if (access_token) {
        const { access_token: new_access_token } = await sendRequest('refresh', 'GET', 'refresh');
        await setAccessToken(new_access_token);
        console.log('Refreshed access token:', new_access_token);
    } else {
        console.warn('Cannot refresh access token: no token found');
    }
};
