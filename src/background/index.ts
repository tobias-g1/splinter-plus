import { PluginMessage } from '../interfaces/plugin-messages.interface';
import {
  CheckboxSetting,
  DropdownSetting,
  InputSetting,
  PluginSettingType,
} from '../interfaces/plugins.interface';
import { I18nUtils } from './i18n.utils';

const KEYCHAIN_PLUGIN_DATA_KEY = 'KEYCHAIN_PLUGIN_DATA';

//@ts-ignore
chrome.i18n.getMessage = I18nUtils.getMessage;

const getPlugin = async () => {
  return {
    definition: {
      title: await chrome.i18n.getMessage('plugin_example'),
      description: await chrome.i18n.getMessage('my_plugin_description'),
      generalSettings: [
        {
          label: await chrome.i18n.getMessage('text_input_example_label'),
          key: 'inputSettingKey',
          type: PluginSettingType.INPUT,
          hint: await chrome.i18n.getMessage('text_input_example_hint'),
          inputType: 'text',
          placeholder: await chrome.i18n.getMessage('placeholder'),
        } as InputSetting,
        {
          label: await chrome.i18n.getMessage('dropdown_example_label'),
          key: 'dropdownSettingKey',
          type: PluginSettingType.DROPDOWN,
          data: [
            {
              label: await chrome.i18n.getMessage('dropdown_value1_example'),
              value: 'value1',
            },
            {
              label: await chrome.i18n.getMessage('dropdown_value2_example'),
              value: 'value2',
            },
            {
              label: await chrome.i18n.getMessage('dropdown_value3_example'),
              value: 'value3',
            },
            { label: 'Not translated value', value: 'value4' },
          ],
        } as DropdownSetting,
      ],
      userSettings: [
        {
          label: await chrome.i18n.getMessage('checkbox_example_label'),
          key: 'checkboxSettingKey',
          type: PluginSettingType.CHECKBOX,
          hint: await chrome.i18n.getMessage('checkbox_example_hint'),
        } as CheckboxSetting,
        {
          label: await chrome.i18n.getMessage(
            'required_text_input_example_label',
          ),
          placeholder: await chrome.i18n.getMessage(
            'required_text_input_example_label',
          ),
          key: 'requiredInputSettingKey',
          type: PluginSettingType.INPUT,
          inputType: 'text',
          required: true,
        } as InputSetting,
      ],
    },
  };
};

const sendPluginData = async (sendResp: (response?: any) => void) => {
  const data = await chrome.storage.local.get(KEYCHAIN_PLUGIN_DATA_KEY);
  sendResp({ ...(await getPlugin()), data: data.plugindata });
};

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
    chrome.storage.local.set({ plugindata: message.value });
    sendResp(PluginMessage.ACK_PLUGIN_DATA_SAVED);
  }
};
chrome.runtime.onMessageExternal.addListener(externalMessageHandler);
