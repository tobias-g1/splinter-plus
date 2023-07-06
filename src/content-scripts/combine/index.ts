import { addCombineButton } from "src/content-scripts/combine/add-button";
import { combineInProgress, handleCombine, handlePurchase, inProgressPurchase } from "src/content-scripts/combine/combine-modal";
import './combine.scss';

let backgroundScriptPort: chrome.runtime.Port;

const connectToBackgroundScript = () => {
  backgroundScriptPort = chrome.runtime.connect({ name: 'content-script' });

  backgroundScriptPort.onMessage.addListener((message) => {
    console.log("Message from background script:", message);
    if (message.command === 'backgroundReady') {
      console.log('Background script is ready.');
      // Notify the background script that the content script is ready
      backgroundScriptPort.postMessage({ command: 'contentReady' });
      console.log('Sent contentReady message to background script');
    } else if (message.command === 'combine-purchase') {
      if (inProgressPurchase && inProgressPurchase.length !== 0) {
        handlePurchase(message.data);
      }
    } else if (message.command === 'combine-combining') {
      if (combineInProgress) {
        handleCombine(message.data)
      }
    }


    // Handle other messages...
  });

  // Notify the background script that the content script is ready
  backgroundScriptPort.postMessage({ command: 'backgroundReady' });
  console.log('Sent backgroundReady message to background script');
};

/**
 * Checks for the existence of the conversion button in the specified classes and adds it if it doesn't already exist.
 */
const checkButtonsExist = () => {
  const buttonsDivs = document.querySelectorAll('.buttons, .c-PJLV-ifKYhuQ-css > .c-PJLV-ihmcGFm-css');
  if (buttonsDivs && buttonsDivs.length) {
    if (!document.getElementById('btn_combine_sp')) {
      addCombineButton();
      console.log('Conversion button added.');
    }
  } else {
    return;
  }
};


// Connect to the background script
connectToBackgroundScript();

// Call the checkButtonsExist function on initial load
checkButtonsExist();
console.log('Content script loaded successfully.');

// Watch for changes to the DOM and check for the existence of the conversion button on each change
const observer = new MutationObserver(() => {
  checkButtonsExist();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
