import { CheckboxSetting, PluginSettingType } from '../interfaces/plugins.interface';
import { getMessage } from './i18n.utils';

export const getPlugin = async () => {
  return {
    definition: {
      title: await getMessage('plugin_name'),
      description: await getMessage('description'),
      generalSettings: [],
      userSettings: [
        {
          label: await getMessage('auto_claim_label'),
          key: 'autoClaimAllSetting',
          type: PluginSettingType.CHECKBOX,
          hint: await getMessage('auto_claim_hint'),
        } as CheckboxSetting,
        {
          label: await getMessage('claim_reward_label'),
          key: 'autoClaimSetting',
          type: PluginSettingType.CHECKBOX,
          hint: await getMessage('claim_reward_hint'),
        } as CheckboxSetting,
        {
          label: await getMessage('stake_reward_label'),
          key: 'autoStakeSetting',
          type: PluginSettingType.CHECKBOX,
          hint: await getMessage('stake_reward_hint'),
        } as CheckboxSetting,
      ],
    },

  };
};

export const sendPluginData = async (sendResp: (response?: any) => void) => {
  const data = await chrome.storage.local.get('plugindata');
  sendResp({ ...(await getPlugin()), data: data.plugindata });
};

export const getUserSettings = async (): Promise<any> => {
  try {
    return new Promise<any>((resolve, reject) => {
      chrome.storage.local.get('plugindata', (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result?.plugindata?.userSettings || {});
        }
      });
    });
  } catch (error) {
    console.error('Error while retrieving user settings from local storage: ', error);
    throw error;
  }
};
