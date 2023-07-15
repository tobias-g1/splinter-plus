
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
