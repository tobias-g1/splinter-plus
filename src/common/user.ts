import { getAccessToken, login, refreshToken } from "src/common/auth";

export const getUsernameFromLocalStorage = (): Promise<string | null> => {
    const script: HTMLScriptElement = document.createElement('script');
    script.src = chrome.runtime.getURL('usernameBundle.js');
    script.onload = () => {
        script.remove();
        window.postMessage({ type: 'GET_USERNAME' }, '*');
    };
    document.body.appendChild(script);

    return new Promise<string | null>((resolve) => {
        window.addEventListener('message', (event: MessageEvent) => {
            if (event.source !== window) return;
            if (event.data.type && event.data.type === 'USERNAME_RESPONSE') {
                resolve(event.data.username || null);
            }
        }, false);
    });
};

const init = async () => {
    const username = await getUsernameFromLocalStorage();
    if (username) {
        console.log(`Username from local storage: ${username}`);
        const accessToken = await getAccessToken();
        if (accessToken) {
            try {
                await refreshToken();
                console.log('Token successfully refreshed');
            } catch (error) {
                console.error('Failed to refresh token, requesting login', error);
                try {
                    const newAccessToken = await login();
                    console.log('Login successful, new access token:', newAccessToken);
                } catch (loginError) {
                    console.error('Login failed', loginError);
                }
            }
        } else {
            console.log('No access token found, requesting login');
            try {
                const newAccessToken = await login();
                console.log('Login successful, new access token:', newAccessToken);
            } catch (error) {
                console.error('Login failed', error);
            }
        }
    } else {
        console.log('No username found in local storage');
    }
};

init();