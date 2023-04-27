import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestTypes
} from 'src/interfaces/keychain.interface';

const KEYCHAIN_EXTENSION_ID = 'fbjjilfdeadgdphnoikkhjhpnndlkgfn';

const generateSafeRandomNumber = (): number => {
  return Math.floor(Math.random() * 1000000);
};

export const sendCustomJSONRequest = async (
  id: string, json: string, username: string, method: KeychainKeyTypes
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const request = {
      type: KeychainRequestTypes.custom,
      id,
      method,
      json,
      username,
      request_id: generateSafeRandomNumber()
    } as KeychainRequest;
    chrome.runtime.sendMessage(KEYCHAIN_EXTENSION_ID, request, (response) => {
      resolve(response);
    });
  });
};
