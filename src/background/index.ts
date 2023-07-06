import { PluginMessage } from 'hive-keychain-commons/lib/plugins';
import { handleKeyChainResponse } from 'src/common/keychain-response';
import { verifySuccessfulPurchases } from 'src/common/splinterlands';
import { createAlarms, handleAlarm } from './alarms';
import { sendPluginData } from './plugin';

let contentScriptPort: chrome.runtime.Port | null = null;
let contentScriptReady = false;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "content-script") {
    contentScriptPort = port;

    port.onMessage.addListener((message) => {
      console.log("Message from content script:", message);
      if (message.command === 'activeTab') {
        const activeTabId = message.tabId;
        console.log(`Tab ID received and stored: ${activeTabId}`);
        port.postMessage({ status: 'Tab ID received' });
      } else if (message.command === 'contentReady') {
        contentScriptReady = true;
        console.log('Content script is ready.');
      }
      // Handle other messages...
    });

    // Notify the content script that the background script is ready
    port.postMessage({ command: 'backgroundReady' });
    console.log('Sent backgroundReady message to content script');
  }
});

// Function to send messages to the content script
export const sendMessageToContentScript = (command: any) => {
  if (contentScriptPort && contentScriptReady) {
    contentScriptPort.postMessage(command);
    console.log('Message sent to content script:', command);
  } else {
    console.error("No connection to content script or content script is not ready.");
  }
};

const externalMessageHandler = async (message: any, sender: any, sendResp: any) => {
  if (message.command === PluginMessage.IS_INSTALLED) {
    sendResp(PluginMessage.ACK_PLUGIN_INSTALL);
  } else if (message.command === PluginMessage.GET_PLUGIN_INFO) {
    sendPluginData(sendResp);
  } else if (message.command === PluginMessage.HIVE_KEYCHAIN_RESPONSE) {
    handleKeyChainResponse(message);
  } else if (message.command === PluginMessage.SAVE_PLUGIN_DATA) {
    chrome.storage.local.set({ plugindata: message.value }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving data:', chrome.runtime.lastError);
      }
      sendResp(PluginMessage.ACK_PLUGIN_DATA_SAVED);
    });
  } else {
    console.log(message);
  }
};

chrome.runtime.onMessageExternal.addListener(externalMessageHandler);

createAlarms();

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm triggered:', alarm);
  handleAlarm(alarm);
});


verifySuccessfulPurchases('cdba4d044be139bfb6a67658bd6c287d6ab4c20c')

console.log('Background Script Loaded');
