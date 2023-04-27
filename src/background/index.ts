import { PluginMessage } from '../interfaces/plugin-messages.interface';
import { createAlarm, handleAlarm } from './alarms';
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
  }
};

chrome.runtime.onMessageExternal.addListener(externalMessageHandler);

// Create the alarm
createAlarm();

// Handle the alarm when it fires
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm triggered:', alarm);
  handleAlarm(alarm);
});
