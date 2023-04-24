import { checkAutoClaimSetting } from './claim';

const CHECK_AUTO_CLAIM_SETTING_ALARM = 'checkAutoClaimSetting';

export const createAlarm = () => {
  chrome.alarms.create(CHECK_AUTO_CLAIM_SETTING_ALARM, {
    periodInMinutes: 0.3
  });
};

export const handleAlarm = async (alarm: chrome.alarms.Alarm) => {
  if (alarm.name === CHECK_AUTO_CLAIM_SETTING_ALARM) {
    await checkAutoClaimSetting();
  }
};
