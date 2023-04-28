import { CheckboxSetting, PluginSettingType } from '../interfaces/plugins.interface';
import { getMessage } from './i18n.utils';

export const getPlugin = async () => {
  return {
    definition: {
      title: await getMessage('plugin_name'),
      description: await getMessage('description'),
      generalSettings: [
        {
          label: await getMessage('enable_plugin_label'),
          key: 'enablePluginSetting',
          type: PluginSettingType.CHECKBOX,
          hint: await getMessage('enable_plugin_hint'),
        } as CheckboxSetting,
      ],
      userSettings: [
        {
          label: await getMessage('claim_reward_label'),
          key: 'autoClaimSetting',
          type: PluginSettingType.CHECKBOX,
          hint: await getMessage('claim_reward_hint'),
        } as CheckboxSetting,
      ],
    },

  };
};

export const sendPluginData = async (sendResp: (response?: any) => void) => {
  const data = await chrome.storage.local.get('plugindata');
  sendResp({ ...(await getPlugin()), data: data.plugindata });
};