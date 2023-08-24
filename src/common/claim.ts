import { getUserSettings } from "@background/plugin";
import { generateSafeRandomNumber, sendCustomJSONRequest } from "src/common/keychain";
import { KeychainKeyTypes } from "src/interfaces/keychain.interface";
import { lookupBalanceHistory } from './splinterlands';
const autoClaimLocks: Record<string, boolean> = {};
const autoClaimAllLocks: Record<string, boolean> = {};

export const checkAutoClaimSetting = async () => {
  try {
    const data = await getUserSettings();

    // Filter out only the users which have the autoClaimSetting enabled and no existing lock
    const eligibleUsers = Object.keys(data).filter(user =>
      data.hasOwnProperty(user) && data[user].autoClaimSetting && !autoClaimLocks[user]
    );

    // Create a promise for each eligible user and execute them concurrently
    await Promise.all(
      eligibleUsers.map(user => {
        autoClaimLocks[user] = true;

        try {
          console.log(`Auto claim setting is enabled for ${user}`);
          stakeTokens(user, 0, 'SPS');
        } catch (error) {
          console.error(`Error while staking tokens for ${user}: `, error);
        } finally {
          autoClaimLocks[user] = false;
        }
      })
    );

    return;
  } catch (error) {
    console.error('Error while retrieving user settings: ', error);
    return [];
  }
};

export const checkAutoClaimAllSetting = async () => {
  try {
    const data = await getUserSettings();

    for (const user in data) {

      if (autoClaimAllLocks[user]) {
        console.log(`Skipping ${user} because they are currently being processed.`);
        continue;
      }
      const autoClaimAllSettingEnabled = data[user].autoClaimAllSetting;

      if (autoClaimAllSettingEnabled) {
        console.log(`Auto claim all setting is enabled for ${user}`);
        autoClaimAllLocks[user] = true;  // Set lock before the asynchronous call
        try {
          claimAll(user);
        } catch (error) {
          console.error(`Error while staking tokens for ${user}: `, error);
        } finally {
          autoClaimAllLocks[user] = false;  // Release lock after the asynchronous call completes
        }
      }
    }
    return;
  } catch (error) {
    console.error('Error while retrieving plugin data from local storage: ', error);
  }
};

export const attemptAutoStake = async (user: string, trxId: string, data: any): Promise<void> => {
  try {
    const userSettings = await getUserSettings();
    if (userSettings[user]?.autoStakeSetting) {
      const maxRetries = 5;
      const maxBackoffTime = 5000; // Maximum backoff time in milliseconds
      let retryCount = 0;

      const checkBalanceHistory = async () => {
        try {
          const balanceHistory = await lookupBalanceHistory(user, 'claim_staking_rewards', 'SPS', 0, 100);
          const foundTransaction = balanceHistory.find((transaction) => transaction.trx_id === trxId);

          if (foundTransaction) {

            const quantity = parseFloat(foundTransaction.amount);

            if (quantity > 0) {
              await stakeTokens(user, quantity, 'SPS');
            }
          } else if (retryCount < maxRetries) {

            retryCount++;
            const backoffTime = Math.min(Math.pow(2, retryCount) * 1000, maxBackoffTime);
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
            await checkBalanceHistory();
          } else {
            console.log('transaction not found')
          }
        } catch (error) {
          throw new Error(`Error during balance history check: ${error}`);
        }
      };

      await checkBalanceHistory();
    } else {
      console.log('Auto Stake Disabled for User');
    }
  } catch (error) {
    console.error(`Error while attempting auto-stake for ${user}: `, error);
  }
};



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

// This function claims all rewards
export const claimAll = async (username: string): Promise<any> => {
  try {
    const json: string = JSON.stringify({
      app: process.env.APP,
      n: generateSafeRandomNumber()
    });
    const claim = await sendCustomJSONRequest('sm_claim_rewards', json, username, KeychainKeyTypes.posting);
    console.log('Claim All Created');
    return claim;
  } catch (error) {
    console.error('Error while sending custom JSON request: ', error);
    throw error;
  }
};


