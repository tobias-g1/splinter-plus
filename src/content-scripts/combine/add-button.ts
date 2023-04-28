import { getUrlParams } from "src/common/url-search-params";
import { launchModal } from "src/content-scripts/combine/combine-modal";

/**
 * Adds a conversion button to the DOM if the current URL contains card details and the correct tab is selected.
 */
export const addConversionButton = (): void => {
    const buttonsDivs = document.querySelectorAll('.buttons');
    const urlParams = getUrlParams();

    if (urlParams.get('p') === 'card_details' && buttonsDivs && buttonsDivs.length !== 0) {
        const selectedTab = urlParams.get('tab');
        if (selectedTab === '' || selectedTab === 'cards') { // Add the button only for these tabs
            addButtonToDOM(buttonsDivs, urlParams);
        }
    } else {
        console.log("[Content Script] .buttons element not found in the DOM yet");
    }
};

/**
 * Adds a conversion button to the DOM if it doesn't already exist.
 * @param buttonsDivs - The buttons container divs on the page.
 * @param urlParams - The URL search params.
 */
const addButtonToDOM = (buttonsDivs: NodeListOf<Element>, urlParams: URLSearchParams): void => {

    if (document.querySelector('#btn_combine_sp')) {
        return;
    }

    if (typeof urlParams.get('id') !== 'undefined' && urlParams.get('id') !== null) {
        const button = createConversionButton();
        buttonsDivs[0].appendChild(button);
        button.addEventListener('click', launchModal);
    } else {
        console.error('[Content Script] Card details not found in the URL');
    }
};

/**
 * Creates a conversion button with necessary attributes.
 * @returns The created conversion button.
 */
const createConversionButton = (): HTMLDivElement => {
    const button = document.createElement('div');
    button.id = 'btn_combine_sp';
    button.className = 'btn_combine sp_combine';
    button.setAttribute('data-toggle', 'tooltip');
    button.setAttribute('data-placement', 'top');
    button.setAttribute('role', 'button');
    button.setAttribute('data-template', '<div class="tooltip" role="tooltip"><div class="tooltip-inner modern" style="min-width: 175px; max-width: 175px;"></div></div>');
    button.setAttribute('data-original-title', 'Combine to Next Level');
    return button;
};
