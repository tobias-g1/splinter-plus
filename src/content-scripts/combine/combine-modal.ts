import { fetchCardData, fetchSettings, getCardBCX, getCardLevelInfo } from "src/content-scripts/combine/splinterlands";

const modalToAdd = `
<div id="combine_dialog" class="modal fade neon in" tabindex="-1" role="dialog" style="display: block; padding-right: 10px;">
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
        <div style="display: flex" class="modal-content>
          <div id="card-image"></div>
          <div>
            <p id="combine-info"></p>
            <div class="sm-well">100 DEC</div>
            <p class="buy-info"> In the event any cards are purchause prior to your transaction being submitted, other cards may be bought and you'll be provided an update quote on the price to combine to next.</p>
            <div class="buttons" style="margin-top: 30px;">
								<button class="gradient-button red" data-dismiss="modal">Cancel</button>
								<button id="btn_sell" class="gradient-button green">COMBINE TO NEXT</button>
							</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

const getSelectedCards = (): NodeListOf<HTMLElement> => {
    return document.querySelectorAll('.card-checkbox.checked');
};

const checkIfNoCardsSelected = (selectedCards: NodeListOf<HTMLElement>): boolean => {
    if (selectedCards.length === 0) {
        alert('No cards selected.');
        return true;
    }
    return false;
};

const getCardIds = (selectedCards: NodeListOf<HTMLElement>): string => {
    return Array.from(selectedCards).map(card => card.getAttribute('card_id')).join(',');
};

const validateCards = (data: any[]): boolean => {
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
        return false;
    }

    return true;
};

const createAndShowModal = async (bcx: number, levelInfo: any) => {

    const modal = document.createElement('div');
    modal.className = 'modal-dialog battle-dialog';
    modal.style.width = '800px';
    modal.innerHTML = modalToAdd;

    const cardImage: any = modal.querySelector('#card-image');
    const cardName = levelInfo.name;
    const level = levelInfo.level + 1;
    const isGold = levelInfo.gold;

    const combineInfo: any = modal.querySelector('#combine-info');
    const cardsToCombine = levelInfo.cards_needed;
    const estimatedCost = 0;

    combineInfo.innerHTML = `The cards you've added will allow you to combine one card to level ${levelInfo.level}. In order to combine these cards to level ${levelInfo.level + 1}, you require ${cardsToCombine} cards. Before that, find the estimated cost to level to the next level: ${estimatedCost}`;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.modal-close-new');

    closeButton?.addEventListener('click', () => {
        modal.remove();
    });

};

export const showConversionModal = async (): Promise<void> => {
    const selectedCards = getSelectedCards();

    if (checkIfNoCardsSelected(selectedCards)) {
        return;
    }

    const cardIds = getCardIds(selectedCards);

    try {

        const data = await fetchCardData(cardIds);

        if (!validateCards(data)) {
            return;
        }

        const settings = await fetchSettings();

        const combinedObj: any = {};

        for (let card of data) {
            for (let key in card) {
                if (key === 'xp' && typeof card[key] === 'number') {
                    if (!combinedObj[key]) {
                        combinedObj[key] = 0;
                    }
                    combinedObj[key] += card[key];
                } else {
                    combinedObj[key] = card[key];
                }
            }
        }

        const bcx = await getCardBCX(combinedObj, settings);
        const levelInfo: any = await getCardLevelInfo(combinedObj, settings);

        createAndShowModal(bcx, levelInfo);

    } catch (error) {
        console.error(error);
        return;
    }

};


