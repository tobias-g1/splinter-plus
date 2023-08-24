import { fetchSettingsAndUpdateStorage } from 'src/common/settings';
import { checkAutoClaimAllSetting, checkAutoClaimSetting } from '../common/claim';

// The interval (in minutes) for refreshing settings
const SETTINGS_REFRESH_INTERVAL_MINUTES = Number(process.env.SETTINGS_REFRESH_INTERVAL_MINUTES) || 240;

// The interval (in minutes) for checking the auto claim setting
const CHECK_AUTO_CLAIM_SETTING_INTERVAL_MINUTES = Number(process.env.CHECK_AUTO_CLAIM_SETTING_INTERVAL_MINUTES) || 60;

// The interval (in minutes) for checking the auto claim all setting
const CHECK_AUTO_CLAIM_ALL_SETTING_INTERVAL_MINUTES = Number(process.env.CHECK_AUTO_CLAIM_ALL_SETTING_INTERVAL_MINUTES) || 1440;

const CHECK_SETTINGS_ALARM = 'checkSettings';
const CHECK_AUTO_CLAIM_SETTING_ALARM = 'checkAutoClaimSetting';
const CHECK_AUTO_CLAIM_ALL_SETTING_ALARM = 'checkAutoClaimAllSetting';

/**
 * Creates alarms for checking settings and auto claim setting at specified intervals.
 */
export const createAlarms = () => {
  chrome.alarms.create(CHECK_SETTINGS_ALARM, {
    periodInMinutes: SETTINGS_REFRESH_INTERVAL_MINUTES,
  });
  chrome.alarms.create(CHECK_AUTO_CLAIM_SETTING_ALARM, {
    periodInMinutes: CHECK_AUTO_CLAIM_SETTING_INTERVAL_MINUTES,
  });
  chrome.alarms.create(CHECK_AUTO_CLAIM_ALL_SETTING_ALARM, {
    periodInMinutes: CHECK_AUTO_CLAIM_ALL_SETTING_INTERVAL_MINUTES,
  });
};

/**
 * Handles the alarm event triggered by the alarm system.
 * @param {chrome.alarms.Alarm} alarm - The alarm object representing the triggered alarm.
 */
export const handleAlarm = async (alarm: chrome.alarms.Alarm) => {
  if (alarm.name === CHECK_SETTINGS_ALARM) {
    await fetchSettingsAndUpdateStorage();
  } else if (alarm.name === CHECK_AUTO_CLAIM_SETTING_ALARM) {
    await checkAutoClaimSetting();
  } else if (alarm.name === CHECK_AUTO_CLAIM_ALL_SETTING_ALARM) {
    await checkAutoClaimAllSetting();
  }
};
