import { getUrlParams } from "src/content-scripts/combine/url-search-params";

const modalToAdd = `
<div id="market_list_dialog" class="modal fade neon in" tabindex="-1" role="dialog" style="display: block; padding-right: 10px;">
  <div class="modal-dialog battle-dialog" role="document" style="width: 800px;">
    <div class="modal-content" style="background: transparent linear-gradient(236deg, #3A0045 0%, #005960 100%) 0% 0% no-repeat padding-box;">
      <div class="modal-header">
        <div class="banner">
          <div class="relative-position">
            <div class="title-text">COMBINE TO NEXT</div>
          </div>
        </div>
        <div class="modal-close-new" data-dismiss="modal"><img src="https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/popups/icon_close_onhover.svg"></div>
      </div>
      <div class="modal-body">
        <div style="display: flex" class="modal-content></div>
      </div>
    </div>
  </div>
</div>`;

export const addConversionButton = (): void => {
    const buttonsDivs = document.querySelectorAll('.buttons');
    const urlParams = getUrlParams();

    if (urlParams.get('p') === 'card_details' && buttonsDivs && buttonsDivs.length !== 0) {
        addButtonToDOM(buttonsDivs, urlParams);
    } else {
        console.log("[Content Script] .buttons element not found in the DOM yet");
    }
};

const addButtonToDOM = (buttonsDivs: NodeListOf<Element>, urlParams: URLSearchParams) => {
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

const createConversionButton = (): HTMLDivElement => {
    const button = document.createElement('div');
    button.id = 'btn_combine_sp';
    button.className = 'combine_sp';
    button.setAttribute('data-toggle', 'tooltip');
    button.setAttribute('data-placement', 'top');
    button.setAttribute('role', 'button');
    button.setAttribute('data-template', '<div class="tooltip" role="tooltip"><div class="tooltip-inner modern" style="min-width: 175px; max-width: 175px;"></div></div>');
    button.setAttribute('data-original-title', 'Combine to next Level');
    return button;
};

const showConversionModal = async (): Promise<void> => {
    const selectedCards = document.querySelectorAll('.card-checkbox.checked');

    if (selectedCards.length === 0) {
        alert('No cards selected.');
        return;
    }

    const cardIds = Array.from(selectedCards).map(card => card.getAttribute('card_id')).join(',');
    const apiUrl = `https://api2.splinterlands.com/cards/find?ids=${cardIds}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const hasSameProperties = data.every((card: any) => {
            return card.gold === data[0].gold
                && card.rental_type === null
                && card.delegated_to === null
                && card.buy_price === null
                && card.edition === data[0].edition
                && card.card_detail_id === data[0].card_detail_id;
        });

        if (!hasSameProperties) {
            alert('Selected cards do not meet the requirements for combining.');
            return;
        }

        const cardsToCombine = data;

        const settingsUrl = 'https://api2.splinterlands.com/settings';
        const settingsResponse = await fetch(settingsUrl);
        const settings = await settingsResponse.json();

        const calculateCardBCX = (card: any) => {
            const details = cardsToCombine.find((c: any) => c.card_detail_id === card.card_detail_id);
            if (card.edition == 4 || details.tier >= 4) {
                return card.xp;
            }
            const xpProperty =
                card.edition === 0 || (card.edition === 2 && card.card_detail_id < 100)
                    ? card.gold
                        ? 'gold_xp'
                        : 'alpha_xp'
                    : card.gold
                        ? 'beta_gold_xp'
                        : 'beta_xp';
            const bcxXp = settings[xpProperty][details.rarity - 1];
            return Math.max(card.gold ? card.xp / bcxXp : (card.xp + bcxXp) / bcxXp, 1);
        };

        const cardBcxArray = cardsToCombine.map((card: any) => calculateCardBCX(card));

        console.log(cardBcxArray)

    } catch (error) {
        console.error(error);
        return;
    }

    const modal = createModal();
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.modal-close-new');
    closeButton?.addEventListener('click', () => {
        modal.remove();
    });
};


const createModal = (): HTMLDivElement => {
    const modal = document.createElement('div');
    modal.className = 'modal-dialog battle-dialog';
    modal.style.width = '800px';
    modal.innerHTML = modalToAdd;
    return modal;
};

function getCardImage(edition: string, cardName: string, level: number, isGold: boolean = false): string {
    // Make sure edition is lowercase
    edition = edition.toLowerCase();

    // Replace spaces with URL encoding
    cardName = cardName.replace(/ /g, '%20');

    // Construct URL based on input parameters
    if (isGold) {
        return `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/${edition}/${cardName}_lv${level}_gold.png`;
    } else {
        return `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/${edition}/${cardName}_lv${level}.png`;
    }
}



