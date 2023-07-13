import { buildAndInsertPanel } from 'src/content-scripts/recommend-cards/panel';
import '../common/modal.scss';
import './panel.scss';

const battleHistoryUrl = 'https://splinterlands.com/?p=battle_history';
let inProgress = false;

// Check if the current page is the battle history page
if (window.location.href === battleHistoryUrl) {

    const formatElement: HTMLElement | null = document.querySelector('.bh-selectable-obj a.selected');
    console.log(formatElement)
    let format = '';

    if (formatElement) {
        format = formatElement.innerText.toLowerCase();
    }

    // Function to check for the existence of the history-header div and add the panel if it doesn't already exist
    const checkPanelExists = async () => { // Change function to async
        if (inProgress) return;
        inProgress = true;

        const historyHeaderDiv = document.querySelector('.history-header');
        const customPanelDiv = document.querySelector('.custom-panel');
        if (historyHeaderDiv && !customPanelDiv) {
            // Disconnect the observer
            observer.disconnect();

            await buildAndInsertPanel(format);
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        inProgress = false;
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