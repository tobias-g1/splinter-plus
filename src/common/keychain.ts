import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestTypes
} from 'src/interfaces/keychain.interface';

const KEYCHAIN_EXTENSION_ID: string = 'cgbodljjckpjacbgjcfgljhacbeoojkb';

export const generateSafeRandomNumber = (): number => {
  return Math.floor(Math.random() * 1000000);
};

export const sendCustomJSONRequest = async (
  id: string, json: string, username: string, method: KeychainKeyTypes
): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const request = {
        type: KeychainRequestTypes.custom,
        id,
        method,
        json,
        username,
        request_id: generateSafeRandomNumber()
      } as KeychainRequest;

      console.log('Sending message:', request);
      chrome.runtime.sendMessage(KEYCHAIN_EXTENSION_ID, request, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error from sendMessage:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('Response received:', response);
          resolve(response);
        }
      });
    } catch (error) {
      console.error('Error when sending message:', error);
      reject(error);
    }
  });
};


