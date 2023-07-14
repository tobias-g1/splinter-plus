
import { convertToTitleCase, setValueInLocalStorage } from 'src/content-scripts/common/common';
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

    function extractFormat(): string {
        const formatElement = document.querySelector('.bh-selectable-obj a.selected') as HTMLElement | null;

        if (formatElement) {
            format = formatElement.innerText.trim().toLowerCase();
            setValueInLocalStorage('format', format);
        }

        return format;
    }

    function extractLeague(): string {
        const leagueElement = document.querySelector('#current_league_text') as HTMLElement | null;

        if (leagueElement) {
            let league = leagueElement.innerText.trim().toLowerCase();
            league = convertToTitleCase(league);
            setValueInLocalStorage('league', league);
            return league;
        }

        return '';
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

            format = extractFormat();
            league = extractLeague();

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
