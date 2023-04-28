import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestTypes
} from 'src/interfaces/keychain.interface';

const KEYCHAIN_EXTENSION_ID: string = process.env.KEYCHAIN_EXTENSION_ID || 'fbjjilfdeadgdphnoikkhjhpnndlkgfn';

export const generateSafeRandomNumber = (): number => {
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

export const sendRequestSignBuffer = async (username: string, message: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const request = {
      type: KeychainRequestTypes.signBuffer,
      request_id: generateSafeRandomNumber(),
      username,
      message
    } as KeychainRequest;
    chrome.runtime.sendMessage(KEYCHAIN_EXTENSION_ID, request, (response) => {
      resolve(response);
    });
  });
};