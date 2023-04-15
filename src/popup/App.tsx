import React from 'react';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '../interfaces/keychain.interface';
import './App.scss';
import ButtonComponent from './button/button.component';

const KEYCHAIN_EXTENSION_ID =
  process.env.KEYCHAIN_EXTENSION_ID || 'jcacnejopjdphbnjgfaaobbfafkihpep';

const App = ({}) => {
  const sendRequestToKeychain = async () => {
    const request: KeychainRequest = {
      request_id: 1,
      type: KeychainRequestTypes.transfer,
      username: 'sender',
      to: 'receiver',
      amount: '0.001',
      memo: '',
      enforce: false,
      currency: 'HIVE',
    } as KeychainRequest;
    chrome.runtime.sendMessage(KEYCHAIN_EXTENSION_ID, request, (response) => {
      console.log('response', response);
    });
  };

  return (
    <div className={`App homepage`}>
      Go check service worker logs for more information
      <ButtonComponent
        label="Send request to Keychain"
        skipLabelTranslation={true}
        onClick={sendRequestToKeychain}
      />
    </div>
  );
};

export default App;
