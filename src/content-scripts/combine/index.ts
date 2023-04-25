import { addConversionButton } from "src/content-scripts/combine/add-button";
import './scss/combine.scss';

/**
 * Logs a message indicating that the content script is running.
 */
console.log("[Content Script] Running content script...");

/**
 * Periodically checks if the buttons exist on the page and adds the conversion button if they do.
 */
const checkButtonsExist = setInterval(() => {
  const buttonsDivs = document.querySelectorAll('.buttons');
  if (buttonsDivs && buttonsDivs.length) {
    clearInterval(checkButtonsExist);
    addConversionButton();
  }
}, 500);

/**
 * Stops the interval checking for buttons when the user navigates to a new page.
 */
window.addEventListener('popstate', () => {
  clearInterval(checkButtonsExist);
});
