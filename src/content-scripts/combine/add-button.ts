import { getUrlParams } from "src/common/url-search-params";
import { launchModal } from "src/content-scripts/combine/combine-modal";

/**
 * Adds a combine button to the DOM if the current URL contains card details and the correct tab is selected.
 */
export const addCombineButton = (): void => {
    const buttonsDivs = document.querySelectorAll('.buttons, .c-PJLV-ifKYhuQ-css > .c-PJLV-ihmcGFm-css');
    const urlParams = getUrlParams();

    // Check if pathname starts with /card-detail or if p URL parameter is 'card_details'
    if ((window.location.pathname.startsWith('/card-detail') || urlParams.get('p') === 'card_details') && buttonsDivs && buttonsDivs.length !== 0) {
        const selectedTab = urlParams.get('tab');
        console.log(selectedTab)
        if (selectedTab === '' || selectedTab === 'cards') {
            addButtonToDOM(buttonsDivs);
        } else if (window.location.pathname.startsWith('/card-detail')) {
            addButtonToDOM(buttonsDivs);
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
const addButtonToDOM = (buttonsDivs: NodeListOf<Element>): void => {

    buttonsDivs.forEach(buttonsDiv => {
        if (!buttonsDiv.querySelector('#btn_combine_sp')) {
            const button = createCombineButton();
            buttonsDiv.appendChild(button);
            button.addEventListener('click', launchModal);
        }
    });
};

/**
 * Creates a combine button with necessary attributes.
 * @returns The created combine button.
 */
const createCombineButton = (): HTMLDivElement => {
    const button = document.createElement('div');

    let imageUrl = chrome.runtime.getURL('images/combine.svg');
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

