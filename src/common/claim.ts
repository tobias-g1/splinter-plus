import { getUserSettings } from "@background/plugin";
import { generateSafeRandomNumber, sendCustomJSONRequest } from "src/common/keychain";
import { KeychainKeyTypes } from "src/interfaces/keychain.interface";
import { lookupBalanceHistory } from './splinterlands';

// This function checks if autoClaimSetting is enabled for each user, if so stakes tokens for them
export const checkAutoClaimSetting = async () => {
  try {
    const data = await getUserSettings();
    for (const user in data) {
      const autoClaimSettingEnabled = data[user].autoClaimSetting;
      if (autoClaimSettingEnabled) {
        console.log(`Auto claim setting is enabled for ${user}`);
        try {
          // In order to claim tokens, you can submit a stake with 0
          const claim = await stakeTokens(user, 0, 'SPS');
          return claim;
        } catch (error) {
          console.error(`Error while staking tokens for ${user}: `, error);
        }
      }
    }
  } catch (error) {
    console.error('Error while retrieving plugin data from local storage: ', error);
  }
};

// This function stakes tokens by sending a custom JSON request
export const stakeTokens = async (username: string, quantity: number, symbol: string): Promise<any> => {
  try {
    const json: string = JSON.stringify({
      token: symbol,
      qty: quantity,
      app: process.env.APP,
      n: generateSafeRandomNumber()
    });
    const claim = await sendCustomJSONRequest('sm_stake_tokens', json, username, KeychainKeyTypes.posting);
    console.log('Claim Created');
    return claim;
  } catch (error) {
    console.error('Error while sending custom JSON request: ', error);
    throw error;
  }
};

// This function attempts to auto-stake for a user, by looking up balance history and staking tokens
export const attemptAutoStake = async (user: string, trxId: string): Promise<any> => {
  try {
    const userSettings = await getUserSettings();
    console.log(user);
    if (userSettings[user].autoStakeSetting) {
      let retryCount = 0;
      const checkBalanceHistory = async () => {
        const balanceHistory = await lookupBalanceHistory(user, 'claim_staking_rewards', 'SPS', 0, 100);
        const foundTransaction = balanceHistory.find((transaction) => transaction.trx_id === trxId);
        if (foundTransaction) {
          const quantity = parseFloat(foundTransaction.amount);
          const claim = await stakeTokens(user, quantity, 'SPS');
          return claim;
        } else if (retryCount < 5) {
          retryCount++;
          // Retry after 3 seconds if transaction not found
          setTimeout(checkBalanceHistory, 3000);
        } else {
          console.log('Transaction not found after 5 retries');
        }
      };
      checkBalanceHistory();
    } else {
      console.log('Auto Stake Disabled for User');
    }
  } catch (error) {
    console.error(`Error while attempting auto-stake for ${user}: `, error);
  }
};
