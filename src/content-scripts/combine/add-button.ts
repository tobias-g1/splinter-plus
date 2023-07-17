import { getUrlParams } from "src/common/url-search-params";
import { launchCollectionModal } from "src/content-scripts/combine";

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
    button.setAttribute('data-original-title', 'Combine to Next Level');

    // Create the div for the tooltip
    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'tooltip';
    tooltipDiv.innerText = 'Combine to Next Level';

    // Append the tooltip div to the button
    button.appendChild(tooltipDiv);

    return button;
};






