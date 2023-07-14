
import { convertToTitleCase, extractElementText, setValueInLocalStorage } from 'src/content-scripts/common/common';
import { buildAndInsertPanel } from 'src/content-scripts/recommend-cards/panel';
import '../../styles/common.scss';
import '../../styles/modal.scss';
import '../../styles/panel.scss';

const battleHistoryUrl = 'https://splinterlands.com/?p=battle_history';
let inProgress = false;
let format: string = '';
let league: string = '';

// Check if the current page is the battle history page
if (window.location.href === battleHistoryUrl) {


    // Function to check for the existence of the history-header div and add the panel if it doesn't already exist
    const checkPanelExists = async () => { // Change function to async
        if (inProgress) return;
        inProgress = true;

        const historyHeaderDiv = document.querySelector('.history-header');
        const customPanelDiv = document.querySelector('.custom-panel');
        if (historyHeaderDiv && !customPanelDiv) {
            // Disconnect the observer
            observer.disconnect();

            format = extractElementText('.bh-selectable-obj a.selected')
            setValueInLocalStorage('format', format);

            league = extractElementText('#current_league_text')
            league = convertToTitleCase(league);
            setValueInLocalStorage('league', league);

            await buildAndInsertPanel(format, league);
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
