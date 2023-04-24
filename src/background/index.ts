import { KeychainKeyTypes, KeychainRequestTypes, RequestCustomJSON } from 'src/interfaces/keychain.interface';
import { PluginMessage } from '../interfaces/plugin-messages.interface';
import {
  CheckboxSetting,
  PluginDefinition,
  PluginSettingType,
} from '../interfaces/plugins.interface';
import { I18nUtils } from './i18n.utils';

//@ts-ignore
chrome.i18n.getMessage = I18nUtils.getMessage;

const CHECK_AUTO_CLAIM_SETTING_ALARM = 'checkAutoClaimSetting';
const KEYCHAIN_EXTENSION_ID = 'fbjjilfdeadgdphnoikkhjhpnndlkgfn';

const getPlugin = async (): Promise<PluginDefinition> => {
  const plugin: PluginDefinition = {
    title: await chrome.i18n.getMessage('plugin_name'),
    description: await chrome.i18n.getMessage('plugin_description'),
    generalSettings: [
      {
        label: await chrome.i18n.getMessage('enable_plugin_label'),
        key: 'enablePluginSetting',
        type: PluginSettingType.CHECKBOX,
        hint: await chrome.i18n.getMessage('enable_plugin_hint'),
      } as CheckboxSetting,
    ],
    userSettings: [
      {
        label: await chrome.i18n.getMessage('claim_reward_label'),
        key: 'autoClaimSetting',
        type: PluginSettingType.CHECKBOX,
        hint: await chrome.i18n.getMessage('claim_reward_hint'),
      } as CheckboxSetting
    ],
  };
  return plugin;
};

const sendPluginData = async (sendResp: (response?: any) => void) => {
  const data = await chrome.storage.local.get('plugindata');
  const pluginData = {
    ...(await getPlugin()),
    data: data.plugindata,
  };
  sendResp(pluginData);
};

const externalMessageHandler = async (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResp: (response?: any) => void,
) => {
  switch (message.command) {
    case PluginMessage.IS_INSTALLED:
      sendResp(PluginMessage.ACK_PLUGIN_INSTALL);
      break;
    case PluginMessage.GET_PLUGIN_INFO:
      sendPluginData(sendResp);
      break;
    case PluginMessage.SAVE_PLUGIN_DATA:
      console.log('Saving data:', message.value);
      chrome.storage.local.set({ plugindata: message.value }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving data:', chrome.runtime.lastError);
        }
        sendResp(PluginMessage.ACK_PLUGIN_DATA_SAVED);
      });
      break;
    default:
      break;
  }
};

chrome.runtime.onMessageExternal.addListener(externalMessageHandler);

const createClaim = async (username: string) => {
  const json: string = JSON.stringify({
    token: 'SPS',
    qty: 0,
    app: 'splinter-plus',
    n: '19nqfUoKHV',
  });

  const displayMsg: string = await getMessage('sps_claim_display_message');
  const domain: string = await getMessage('plugin_name');
  const request: RequestCustomJSON = createCustomJSONRequest(
    'sm_stake_tokens',
    json,
    displayMsg,
    username,
    domain,
  );
  
  const claim = await sendCustomJSONRequest(request);
  console.log('Claim Response ' + claim)
  
};

const createCustomJSONRequest = (id: string, json: string, displayMsg: string, username: string, domain: string) => {
  return {
    type: KeychainRequestTypes.custom,
    id,
    method: KeychainKeyTypes.posting,
    json,
    display_msg: displayMsg,
    username,
    domain,
  } as RequestCustomJSON;
};

const getMessage = async (key: string) => {
  return await chrome.i18n.getMessage(key);
};

const sendCustomJSONRequest = (request: RequestCustomJSON) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(KEYCHAIN_EXTENSION_ID, request, (response) => {
      if (!response) {
        reject(new Error('No response from keychain extension'));
      } else if (!response.success) {
        const errorMessage = response?.error?.message || 'Unknown error';
        console.error(`Failed to create custom JSON for ${request.username}: ${errorMessage}`);
        reject(new Error(`Failed to create custom JSON for ${request.username}`));
      } else {
        console.log(`Successfully created custom JSON for ${request.username}`);
        resolve(response.result);
      }
    });
  });
};

const checkUserSetting = async (settingKey: string, username: string) => {
  const data = await chrome.storage.local.get('plugindata');
  const userSettings = data?.plugindata?.userSettings;
  const settingEnabled = userSettings?.[username]?.[settingKey];
  return settingEnabled;
};

const checkAutoClaimSetting = async () => {
  const data = await chrome.storage.local.get('plugindata');
  const users = data?.plugindata?.userSettings;
  for (const user in users) {
    const autoClaimSettingEnabled = await checkUserSetting('autoClaimSetting', user);
    if (autoClaimSettingEnabled) {
      console.log(`Auto claim setting is enabled for ${user}`);
      try {
        await createClaim(user);
        console.log(`SPS Claimed for ${user}`);
      } catch (error) {
        console.log(`Unable to claim SPS for ${user}`);
        console.error(error);
      }
    }
  }
};


// Create the alarm
chrome.alarms.create(CHECK_AUTO_CLAIM_SETTING_ALARM, {
  periodInMinutes: 0.3,
});

// Handle the alarm when it fires
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === CHECK_AUTO_CLAIM_SETTING_ALARM) {
    await checkAutoClaimSetting();
  }
});
