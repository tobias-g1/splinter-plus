import { sendCustomJSONRequest } from "@background/keychain";
import { calculateCheapestCards, fetchCardData, fetchCardSaleData, fetchSettings, getCardLevelInfo, sumCards } from "src/content-scripts/combine/splinterlands";
import { KeychainKeyTypes } from "src/interfaces/keychain.interface";
import { CardLevelInfo, Settings } from "src/interfaces/splinterlands.interface";

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

const createAndShowModal = async (cardData: any) => {

    const settings: Settings = await fetchSettings();
    const combinedCards = await sumCards(cardData);
    const levelInfo: CardLevelInfo = await getCardLevelInfo(combinedCards, settings);

    const { card_detail_id, gold, edition } = cardData[0];

    const marketData = await fetchCardSaleData(card_detail_id, gold, edition, 300);
    const cheapestCards = await calculateCheapestCards(marketData, levelInfo.xp_required, levelInfo.base_xp);
    const modalWrapper = document.createElement('div');

    modalWrapper.innerHTML = modalToAdd;

    const modal: any = modalWrapper.querySelector('#combine_dialog');
    const cardImage: any = modal.querySelector('#card-image');

    const cardImageUrl = `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/beta/Spineback%20Turtle_lv4_gold.png`;
    cardImage.src = cardImageUrl;

    const combineInfo: any = modal.querySelector('#combine-info');
    const cardsToCombine = levelInfo.cards_required;

    combineInfo.innerHTML = `You can combine your selected cards to level ${levelInfo.level + 1}, by purchasing the equivilant of ${cardsToCombine} cards from the market. We've found the cheapest cards available and you can find a quote below.`;

    console.log(levelInfo)

    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.modal-close-new');
    closeButton?.addEventListener('click', () => {
        modal.remove();
    });

    const buyAndCombineButton: any = modal.querySelector('#btn_sell');

    buyAndCombineButton.addEventListener('click', async () => {
        console.log(cheapestCards)
    });

    const cancelButton: any = modal.querySelector('[data-dismiss="modal"]');
    cancelButton.addEventListener('click', () => {
        modal.remove();
    });
};

export const showConversionModal = async (): Promise<void> => {

    const selectedCards = getSelectedCards();

    if (checkIfNoCardsSelected(selectedCards)) {
        return;
    }

    const cardIds = getCardIds(selectedCards);
    const data = await fetchCardData(cardIds);

    if (!validateCards(data)) {
        return;
    }

    createAndShowModal(data);

};

export const buyCards = async (username: string): Promise<any> => {

    console.log(`Creating claim for user ${username}`);
    const json: string = JSON.stringify({
        token: 'SPS',
        qty: 0,
        app: 'splinter-plus',
        n: '19nqfUoKHV'
    })

    const claim = await sendCustomJSONRequest('sm_stake_tokens', json, username, KeychainKeyTypes.posting);
    console.log(`Claim created for user ${username}:`, claim);
    return claim;
};

