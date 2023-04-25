import { addConversionButton } from "src/content-scripts/combine/add-button";

console.log("[Content Script] Running content script...");

const checkButtonsExist = setInterval(() => {
  const buttonsDivs = document.querySelectorAll('.buttons');
  if (buttonsDivs && buttonsDivs.length) {
    clearInterval(checkButtonsExist);
    addConversionButton();
  }
}, 500);

window.addEventListener('popstate', () => {
  clearInterval(checkButtonsExist);
});
