import { PluginMessage } from 'hive-keychain-commons/lib/plugins';
import { handleKeyChainResponse } from 'src/common/keychain-response';
import { createAlarms, handleAlarm } from './alarms';
import { sendPluginData } from './plugin';

const externalMessageHandler = async (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResp: (response?: any) => void,
) => {
  if (message.command === PluginMessage.IS_INSTALLED) {
    sendResp(PluginMessage.ACK_PLUGIN_INSTALL);
  } else if (message.command === PluginMessage.GET_PLUGIN_INFO) {
    sendPluginData(sendResp);
  } else if (message.command === PluginMessage.HIVE_KEYCHAIN_RESPONSE) {
    console.log(message)
    handleKeyChainResponse(message);
  } else if (message.command === PluginMessage.SAVE_PLUGIN_DATA) {
    console.log('Saving data:', message.value);
    chrome.storage.local.set({ plugindata: message.value }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving data:', chrome.runtime.lastError);
        sendResp(PluginMessage.ACK_PLUGIN_DATA_SAVED);
      } else {
        sendResp(PluginMessage.ACK_PLUGIN_DATA_SAVED);
      }
    });
  } else {
    console.log(message)
  }
};

chrome.runtime.onMessageExternal.addListener(externalMessageHandler);

createAlarms();

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm triggered:', alarm);
  handleAlarm(alarm);
});