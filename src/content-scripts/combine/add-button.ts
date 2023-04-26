import { showConversionModal } from "src/content-scripts/combine/combine-modal";
import { getUrlParams } from "src/content-scripts/combine/url-search-params";

/**
 * Adds a conversion button to the DOM if the current URL contains card details.
 */
export const addConversionButton = (): void => {
    const buttonsDivs = document.querySelectorAll('.buttons');
    const urlParams = getUrlParams();

    if (urlParams.get('p') === 'card_details' && buttonsDivs && buttonsDivs.length !== 0) {
        addButtonToDOM(buttonsDivs, urlParams);
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
    console.log("[Content Script] Card details page detected");
    console.log("[Content Script] .buttons element found in the DOM");

    if (document.querySelector('#btn_combine_sp')) {
        console.log("[Content Script] Conversion button has already been added");
        return;
    }

    if (typeof urlParams.get('id') !== 'undefined' && urlParams.get('id') !== null) {
        console.log("[Content Script] Card details found in the URL");
        const button = createConversionButton();
        buttonsDivs[0].appendChild(button);
        console.log("[Content Script] Conversion button added to the DOM");
        button.addEventListener('click', showConversionModal);
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
