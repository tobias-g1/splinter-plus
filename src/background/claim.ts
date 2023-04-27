import { sendCustomJSONRequest } from "src/common/keychain";
import { KeychainKeyTypes } from "src/interfaces/keychain.interface";

export const checkAutoClaimSetting = async () => {
  const data = await chrome.storage.local.get('plugindata');
  const users = data?.plugindata?.userSettings || {};
  for (const user in users) {
    const autoClaimSettingEnabled = users[user].autoClaimSetting;
    if (autoClaimSettingEnabled) {
      console.log(`Auto claim setting is enabled for ${user}`);
      try {
        await createClaim(user);
      } catch (error) {
        console.error(error);
      }
    }
  }
};

export const createClaim = async (username: string): Promise<any> => {

  console.log(`Creating claim for user ${username}`);

  const json: string = JSON.stringify({
    token: 'SPS',
    qty: 0,
    app: 'splinter-plus',
    n: '19nqfUoKHV'
  })

  const claim = await sendCustomJSONRequest('sm_stake_tokens', json, username, KeychainKeyTypes.posting);
  console.log(`Claim created for user ${username}:`, claim);
  return claim;

};
