import { fetchCardData, fetchSettings, getCardBCX, getCardLevelInfo } from "src/content-scripts/combine/splinterlands";

const modalToAdd = `
<div id="combine_dialog" class="modal fade show neon in" tabindex="-1" role="dialog" style="display: block; padding-right: 10px;">
  <div class="modal-dialog battle-dialog" style="width: 800px;">
    <div class="modal-content">
      <div class="modal-header">
        <div class="banner">
          <div class="relative-position">
            <div class="title-text">COMBINE TO NEXT</div>
          </div>
        </div>
        <div class="modal-close-new" data-dismiss="modal">
            <img src="https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/popups/icon_close_onhover.svg">
        </div>
      </div>
      <div class="modal-body">
        <div style="display: flex" class="combine-content">
          <img id='card-image' src='' class='level-image'>
          <div>
            <p id="combine-info"></p>
            <div class="sm-well">100 DEC</div>
            <p class="buy-info"> In the event any cards are purchased prior to your transaction being submitted, other cards may be bought and you'll be provided an update quote on the price to combine to next.</p>
            <div class="buttons" style="margin-top: 15px;">
                <button class="gradient-button red" data-dismiss="modal">Cancel</button>
                <button id="btn_sell" class="gradient-button green">BUY & COMBINE</button>
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
    const modalWrapper = document.createElement('div');
    modalWrapper.innerHTML = modalToAdd;

    const modal: any = modalWrapper.querySelector('#combine_dialog');
    const cardImage: any = modal.querySelector('#card-image');

    const cardImageUrl = `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/beta/Spineback%20Turtle_lv4_gold.png`;
    cardImage.src = cardImageUrl;

    const combineInfo: any = modal.querySelector('#combine-info');
    const cardsToCombine = levelInfo.cards_needed;
    const estimatedCost = 0;

    combineInfo.innerHTML = `You can combine your selected cards to level ${levelInfo.level + 1}, by purchasing ${cardsToCombine} from the market. We've found the cheapest cards available and you can find a quote below.`;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.modal-close-new');
    closeButton?.addEventListener('click', () => {
        modal.remove();
    });

    const buyAndCombineButton: any = modal.querySelector('#btn_sell');
    buyAndCombineButton.addEventListener('click', async () => {
        // Add your buy and combine logic here
        console.log('Buy & Combine button clicked');
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


