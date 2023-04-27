
import { fetchPricesAndUpdateStorage } from 'src/common/prices';
import { fetchSettingsAndUpdateStorage } from 'src/common/settings';
import { checkAutoClaimSetting } from './claim';

const PRICES_REFRESH_INTERVAL_MINUTES = Number(process.env.PRICES_REFRESH_INTERVAL_MINUTES) || 1;
const SETTINGS_REFRESH_INTERVAL_MINUTES = Number(process.env.SETTINGS_REFRESH_INTERVAL_MINUTES) || 240;
const CHECK_AUTO_CLAIM_SETTING_INTERVAL_MINUTES = Number(process.env.CHECK_AUTO_CLAIM_SETTING_INTERVAL_MINUTES) || 60;

const CHECK_PRICES_ALARM = 'checkPrices';
const CHECK_SETTINGS_ALARM = 'checkSettings';
const CHECK_AUTO_CLAIM_SETTING_ALARM = 'checkAutoClaimSetting';

export const createAlarms = () => {
  chrome.alarms.create(CHECK_PRICES_ALARM, {
    periodInMinutes: PRICES_REFRESH_INTERVAL_MINUTES,
  });
  chrome.alarms.create(CHECK_SETTINGS_ALARM, {
    periodInMinutes: SETTINGS_REFRESH_INTERVAL_MINUTES,
  });
  chrome.alarms.create(CHECK_AUTO_CLAIM_SETTING_ALARM, {
    periodInMinutes: CHECK_AUTO_CLAIM_SETTING_INTERVAL_MINUTES,
  });
};

export const handleAlarm = async (alarm: chrome.alarms.Alarm) => {
  if (alarm.name === CHECK_PRICES_ALARM) {
    await fetchPricesAndUpdateStorage();
  } else if (alarm.name === CHECK_SETTINGS_ALARM) {
    await fetchSettingsAndUpdateStorage();
  } else if (alarm.name === CHECK_AUTO_CLAIM_SETTING_ALARM) {
    await checkAutoClaimSetting();
  }
};


