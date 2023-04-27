import { sendCustomJSONRequest } from "src/common/keychain";
import { calculateCheapestCards, fetchCardData, fetchCardSaleData, fetchSettings, getCardLevelInfo, sumCards } from "src/common/splinterlands";
import { getUsernameFromLocalStorage } from "src/common/user";
import { KeychainKeyTypes } from "src/interfaces/keychain.interface";
import { CardLevelInfo, ForSaleListing, Settings } from "src/interfaces/splinterlands.interface";

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

const createAndShowModal = async (cardData: any): Promise<void> => {

  const settings: Settings = await fetchSettings();
  const combinedCards = await sumCards(cardData);
  const levelInfo: CardLevelInfo = await getCardLevelInfo(combinedCards, settings);

  const { card_detail_id, gold, edition } = cardData[0];

  const marketData: ForSaleListing[] = await fetchCardSaleData(card_detail_id, gold, edition, 300);
  const cheapestCards: ForSaleListing[] | null = await calculateCheapestCards(marketData, levelInfo.xp_required, levelInfo.base_xp);
  const modalWrapper: HTMLDivElement = document.createElement('div');

  modalWrapper.innerHTML = modalToAdd;

  const modal: HTMLElement = modalWrapper.querySelector('#combine_dialog') as HTMLElement;
  const cardImage: HTMLImageElement = modal.querySelector('#card-image') as HTMLImageElement;

  // const cardImageUrl: string = `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/beta/Spineback%20Turtle_lv4_gold.png`;
  //cardImage.src = cardImageUrl;

  const combineInfo: HTMLElement = modal.querySelector('#combine-info') as HTMLElement;
  const cardsToCombine: number = levelInfo.cards_required;

  combineInfo.innerHTML = `You can combine your selected cards to level ${levelInfo.level + 1}, by purchasing the equivilant of ${cardsToCombine} cards from the market. We've found the cheapest cards available and you can find a quote below.`;

  console.log(levelInfo)

  document.body.appendChild(modal);

  const closeButton: HTMLElement | null = modal.querySelector('.modal-close-new');
  closeButton?.addEventListener('click', () => {
    modal.remove();
  });

  const buyAndCombineButton: HTMLElement = modal.querySelector('#btn_sell') as HTMLElement;

  buyAndCombineButton.addEventListener('click', async () => {

    const username = await getUsernameFromLocalStorage();
    console.log(username);

    if (cheapestCards) {

      const total_price = cheapestCards.reduce((sum, card) => sum + parseFloat(card.buy_price), 0).toFixed(3);

      if (username) {
        await buyCardsFromMarket(username, total_price, cheapestCards);
      } else {
        console.log("Username not found in local storage.");
      }
    } else {
      console.log("No cheapest cards found.");
    }
  });


  const cancelButton: HTMLElement = modal.querySelector('[data-dismiss="modal"]') as HTMLElement;
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

export const buyCardsFromMarket = async (username: string, price: string, cards: ForSaleListing[]): Promise<any> => {

  console.log(`Buying cards from the market for user ${username}`);

  const items = cards.map(card => card.market_id);
  const total_price = cards.reduce((sum, card) => sum + parseFloat(card.buy_price), 0).toFixed(3);

  const json: string = JSON.stringify({
    items,
    price: total_price,
    currency: 'DEC',
    market: process.env.MARKET,
    app: process.env.APP_VERSION
  })

  const purchase = await sendCustomJSONRequest('sm_market_purchase', json, username, KeychainKeyTypes.active);
  console.log(`Cards purchased for user ${username}:`, purchase);
  return purchase;
};
