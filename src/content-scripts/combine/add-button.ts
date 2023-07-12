import { getUrlParams } from "src/common/url-search-params";
import { launchModal } from "src/content-scripts/combine/combine-modal";

/**
 * Adds a combine button to the DOM if the current URL contains card details and the correct tab is selected.
 */
export const addCombineButton = (): void => {
    const buttonsDivs = document.querySelectorAll('.header > .buttons, .c-PJLV-ifKYhuQ-css > .c-PJLV-ihmcGFm-css');
    const urlParams = getUrlParams();

    // Check if pathname starts with /card-detail or if p URL parameter is 'card_details'
    if ((window.location.pathname.startsWith('/card-detail') || urlParams.get('p') === 'card_details') && buttonsDivs && buttonsDivs.length !== 0) {
        const selectedTab = urlParams.get('tab');
        if (selectedTab === '' || selectedTab === 'cards') {
            addButtonToDOM(buttonsDivs, 'old');
        } else if (window.location.pathname.startsWith('/card-detail')) {
            addButtonToDOM(buttonsDivs, 'new');
        }
    } else {
        console.log("[Content Script] .buttons or .c-PJLV-ihmcGFm-css elements not found in the DOM yet");
    }
};


/**
 * Adds a combine button to the DOM if it doesn't already exist.
 * @param buttonsDivs - The buttons container divs on the page.
 * @param urlParams - The URL search params.
 */
const addButtonToDOM = (buttonsDivs: NodeListOf<Element>, type: string): void => {

    buttonsDivs.forEach(buttonsDiv => {
        if (!buttonsDiv.querySelector('#btn_combine_sp')) {
            const button = createCombineButton(type);
            const buttonContainer = document.createElement('div');
            if (type === 'new') {
                buttonContainer.className = 'sp_button_container_new';
            } else {
                buttonContainer.className = 'sp_button_container';
            }
            buttonContainer.appendChild(button);
            buttonsDiv.appendChild(buttonContainer);
            button.addEventListener('click', launchCollectionModal);
        }
    });
};

/**
 * Creates a combine button with necessary attributes.
 * @returns The created combine button.
 */
const createCombineButton = (type: string): HTMLDivElement => {
    const button = document.createElement('div');

    let imageUrl = chrome.runtime.getURL('assets/images/combine-new.svg');

    if (type === 'old') {
        imageUrl = chrome.runtime.getURL('assets/images/combine-old.svg');
    }

    button.style.backgroundImage = `url(${imageUrl})`;

    button.id = 'btn_combine_sp';
    button.className = 'btn_combine sp_combine';
    button.setAttribute('data-toggle', 'tooltip');
    button.setAttribute('data-placement', 'top');
    button.setAttribute('role', 'button');
    button.setAttribute('data-template', '<div class="tooltip" role="tooltip"><div class="tooltip-inner modern" style="min-width: 175px; max-width: 175px;"></div></div>');
    button.setAttribute('data-original-title', 'Combine to Next Level');
    return button;
};


const launchCollectionModal = () => {
    const selectedCards = getSelectedCards();


    if (!selectedCards || selectedCards.length === 0) {
        alert('Oops! No cards have been selected for combining. Please choose at least one card to proceed.');
        return;
    }

    const cardIds = getCardIds(selectedCards);

    launchModal(cardIds);
}


const getSelectedCards = (): NodeListOf<Element> | Element[] | null => {

    // New method
    const checkedBoxesNew = document.querySelectorAll('.c-gyOReJ.c-dcDALJ.c-gyOReJ-crmSPl-adjusted-true:checked:not(#check_all)');
    if (checkedBoxesNew.length) {
        const selectedCardRowsNew = Array.from(checkedBoxesNew)
            .map(checkbox => checkbox.closest('tr'))
            .filter(el => el !== null) as Element[];
        return selectedCardRowsNew;
    }

    // Legacy method
    const checkedBoxesLegacy = document.querySelectorAll('.card-checkbox.checked:not(#check_all)');
    if (checkedBoxesLegacy.length) {
        return checkedBoxesLegacy;
    }

    return null;
};



const getCardIds = (selectedCards: NodeListOf<Element> | Element[]): string => {

    return Array.from(selectedCards).map(card => {
        // New method
        if (card instanceof HTMLTableRowElement) {
            const tds = card.querySelectorAll('td');
            if (tds.length > 1) {
                return tds[tds.length - 3].textContent;
            }
        }
        // Legacy method
        else if (card instanceof HTMLElement) {
            return card.getAttribute('card_id');
        }
    }).filter(id => id !== undefined && id !== null).join(',');
};
