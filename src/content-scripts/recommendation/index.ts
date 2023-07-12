import { buildAndInsertPanel } from 'src/content-scripts/recommendation/panel';
import './panel.scss';

const battleHistoryUrl = 'https://splinterlands.com/?p=battle_history';

// Check if the current page is the battle history page
if (window.location.href === battleHistoryUrl) {
    // Extract the selected format
    const formatElement: any = document.querySelector('.bh-selectable-obj a.selected');
    const format = formatElement?.innerText.toLowerCase() ?? 'unknown';
    console.log(`Format: ${format}`); // "modern" or "wild"

    // Function to check for the existence of the history-header div and add the panel if it doesn't already exist
    const checkPanelExists = () => {
        const historyHeaderDiv = document.querySelector('.history-header');
        const customPanelDiv = document.querySelector('.custom-panel');
        if (historyHeaderDiv && !customPanelDiv) {
            buildAndInsertPanel(format);
        }
    };

    // Call the checkPanelExists function on initial load
    checkPanelExists();

    // Watch for changes to the DOM and check for the existence of the panel on each change
    const observer = new MutationObserver(() => {
        checkPanelExists();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
