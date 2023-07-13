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
            case 'combine-purchase':
                if (modalInstance.inProgressPurchase && modalInstance.inProgressPurchase.length !== 0) {
                    modalInstance.handlePurchase(message.data);
                }
                break;
            case 'combine-combining':
                if (modalInstance.combineInProgress) {
                    modalInstance.handleCombine(message.data);
                }
                break;
        }
    });

    sendToBackgroundScript('backgroundReady');
};

export const sendToBackgroundScript = (command: string): void => {
    backgroundScriptPort.postMessage({ command });
    console.log(`Sent ${command} message to background script`);
};
