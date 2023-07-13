import { createHeader } from '../common/common';
import '../common/modal.scss';
import './deck.scss';

const battleHistoryUrl = 'https://splinterlands.com/?p=create_team2';
let inProgress = false;
let format: string = 'wild';
let panelAdded = false; // Flag to track if the panel has been added

// Check if the current page is the battle history page
if (window.location.href === battleHistoryUrl) {

  // Function to check for the existence of the panel and add it if it doesn't already exist
  const checkPanelExists = async () => {
    const panel = document.createElement('div');
    panel.classList.add('deck-panel');
    const headerDiv = createHeader(format, 'Recommended Deck');
    panel.appendChild(headerDiv);
    const battleContainer: any = document.querySelector('.deck-builder-page2__filters');

    if (!panelAdded) {
      const panelWrapper = document.createElement('div');
      panelWrapper.classList.add('deck-panel-wrapper');
      panelWrapper.appendChild(panel);
      battleContainer.insertAdjacentElement('afterend', panelWrapper);
      panelAdded = true;
    }

  };

  // Call the checkPanelExists function on initial load
  checkPanelExists();

  // Watch for changes to the DOM and check for the existence of the panel on each change
  const observer = new MutationObserver(() => {
    checkPanelExists();
  });

  // Start observing changes in the document body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
