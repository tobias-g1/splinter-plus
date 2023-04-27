import { addConversionButton } from "src/content-scripts/combine/add-button";
import './combine.scss';


/**
 * Checks for the existence of the conversion button and adds it if it doesn't already exist.
 */
const checkButtonsExist = () => {
  const buttonsDivs = document.querySelectorAll('.buttons');
  if (buttonsDivs && buttonsDivs.length) {
    addConversionButton();
  } else {
    return;
  }
};

// Call the checkButtonsExist function on initial load
checkButtonsExist();

// Watch for changes to the DOM and check for the existence of the conversion button on each change
const observer = new MutationObserver(() => {
  checkButtonsExist();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
