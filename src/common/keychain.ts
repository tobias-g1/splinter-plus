import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestTypes
} from 'src/interfaces/keychain.interface';

// The extension ID of the Keychain extension
const KEYCHAIN_EXTENSION_ID: string = process.env.KEYCHAIN_EXTENSION_ID || '';

/**
 * Generates a safe random number.
 * @returns {number} The generated safe random number.
 */
export const generateSafeRandomNumber = (): number => {
  return Math.floor(Math.random() * 1000000);
};

/**
 * Sends a custom JSON request to the Keychain extension.
 * @param {string} id - The request ID.
 * @param {string} json - The JSON data to be sent.
 * @param {string} username - The username.
 * @param {KeychainKeyTypes} method - The Keychain key type.
 * @returns {Promise<any>} A promise that resolves with the response from the Keychain extension.
 */
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
          console.error('Error from sendMessage:', JSON.stringify(chrome.runtime.lastError));
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
