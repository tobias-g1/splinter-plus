import { refreshCardsPanel } from 'src/content-scripts/recommend-cards';
// backgroundScriptConnector.ts

let backgroundScriptPort: chrome.runtime.Port;
let modalInstance: any;

export const initializeBackgroundScriptConnection = (modal: any): void => {
    modalInstance = modal;
    backgroundScriptPort = chrome.runtime.connect({ name: 'content-script' });

    backgroundScriptPort.onMessage.addListener((message: any) => {
        console.log("Message from background script:", message);

        switch (message.command) {
            case 'backgroundReady':
                console.log('Background script is ready.');
                sendToBackgroundScript('contentReady');
                break;
            case 'rent':
                modalInstance.handlePurchase(message.data);
                break;
            case 'purchase':
                modalInstance.handlePurchase(message.data);
                break;
            case 'combine':
                modalInstance.handleCombine(message.data);
                break;
            case 'refresh-cards':
                refreshCardsPanel()
                break;
        }
    });

    sendToBackgroundScript('backgroundReady');
};

export const sendToBackgroundScript = (command: string): void => {
    backgroundScriptPort.postMessage({ command });
    console.log(`Sent ${command} message to background script`);
};
