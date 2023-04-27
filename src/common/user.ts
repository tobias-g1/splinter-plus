export const getUsernameFromLocalStorage = (): Promise<string | null> => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('usernameBundle.js');
        script.onload = () => {
            script.remove();
            window.postMessage({ type: 'GET_USERNAME' }, '*');
        };
        document.body.appendChild(script);

        window.addEventListener('message', (event) => {
            if (event.source !== window) return;
            if (event.data.type && event.data.type === 'USERNAME_RESPONSE') {
                resolve(event.data.username || null);
            }
        }, false);
    });
};
