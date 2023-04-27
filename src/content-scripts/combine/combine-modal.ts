import { getPricesFromLocalStorage } from "src/common/prices";
import { buyCardsFromMarket, calculateCheapestCards, fetchCardData, fetchCardSaleData, getCardLevelInfo, sumCards, waitForTransactionSuccess } from "src/common/splinterlands";
import { getUsernameFromLocalStorage } from "src/common/user";
import { CardLevelInfo, ForSaleListing, Result, Seller, TransactionUpdate } from "src/interfaces/splinterlands.interface";

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
            <div id="price" class="sm-well"></div>
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

function setPrice(modal: HTMLElement, price: string): void {
  const priceElement: HTMLElement = modal.querySelector('#price') as HTMLElement;
  priceElement.innerHTML = `${price} DEC`;
}

const getCardIds = (selectedCards: NodeListOf<HTMLElement>): string => {
  return Array.from(selectedCards).map(card => card.getAttribute('card_id')).join(',');
};

const validate = (data: any[]): boolean => {

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


function createModal(): HTMLElement {
  const modalWrapper: HTMLDivElement = document.createElement('div');
  modalWrapper.innerHTML = modalToAdd;
  return modalWrapper.querySelector('#combine_dialog') as HTMLElement;
}

function setCombineInfo(modal: HTMLElement, level: number, cardsToCombine: number): void {
  const combineInfo: HTMLElement = modal.querySelector('#combine-info') as HTMLElement;
  combineInfo.innerHTML = `You can combine your selected cards to level ${level}, by purchasing the equivalent of ${cardsToCombine} cards from the market. We've found the cheapest cards available and you can find a quote below.`;
}

function addModalEventListeners(modal: HTMLElement, buyAndCombineHandler: () => void): void {
  const closeButton: HTMLElement | null = modal.querySelector('.modal-close-new');
  closeButton?.addEventListener('click', () => {
    modal.remove();
  });

  const buyAndCombineButton: HTMLElement = modal.querySelector('#btn_sell') as HTMLElement;
  buyAndCombineButton.addEventListener('click', buyAndCombineHandler);

  const cancelButton: HTMLElement = modal.querySelector('[data-dismiss="modal"]') as HTMLElement;
  cancelButton.addEventListener('click', () => {
    modal.remove();
  });
}

export const launchModal = async (): Promise<void> => {
  const selectedCards = getSelectedCards();
  if (selectedCards.length === 0) {
    return;
  }

  const cardIds = getCardIds(selectedCards);
  const data = await fetchCardData(cardIds);
  if (!validate(data)) {
    return;
  }

  const combinedCards = await sumCards(data);
  const levelInfo: CardLevelInfo = await getCardLevelInfo(combinedCards);
  const { card_detail_id, gold, edition } = data[0];

  const marketData: ForSaleListing[] = await fetchCardSaleData(card_detail_id, gold, edition, 300);
  const cheapestCards: ForSaleListing[] | null = await calculateCheapestCards(marketData, levelInfo.xp_required, levelInfo.base_xp);

  const modal: HTMLElement = createModal();
  setCombineInfo(modal, levelInfo.level + 1, levelInfo.cards_required);
  document.body.appendChild(modal);

  // Calculate the price in DEC and update the modal
  const prices = await getPricesFromLocalStorage();
  if (cheapestCards && prices) {
    const totalPriceUSD = cheapestCards.reduce((sum, card) => sum + parseFloat(card.buy_price), 0);
    const totalPriceDEC = (totalPriceUSD / prices.dec).toFixed(3);
    setPrice(modal, totalPriceDEC);
  } else {
    setPrice(modal, '0');
  }


  const buyAndCombineHandler = async () => {
    const username = await getUsernameFromLocalStorage();
    handleBuyAndCombine(username, cheapestCards);
  };

  addModalEventListeners(modal, buyAndCombineHandler);
};

async function handleBuyAndCombine(username: string | null, cheapestCards: ForSaleListing[] | null): Promise<void> {
  if (!cheapestCards) {
    console.log("No cheapest cards found.");
    return;
  }

  const total_price = cheapestCards.reduce((sum, card) => sum + parseFloat(card.buy_price), 0).toFixed(3);

  if (!username) {
    console.log("Username not found in local storage.");
    return;
  }

  const response = await buyCardsFromMarket(username, total_price, cheapestCards);
  const transactionId = response.trx_id;
  const transactionData: TransactionUpdate = await waitForTransactionSuccess(transactionId, 3, 3);

  if (!transactionData.success) {
    console.log("Transaction failed after 3 retries");
    return;
  }

  const result: Result = JSON.parse(transactionData.trx_info.result);
  const purchasedCards = result.by_seller.reduce((sum: string[], seller: Seller) => {
    return sum.concat(seller.items);
  }, []);

  if (purchasedCards.length === cheapestCards.length) {
    console.log("All cards purchased successfully");
  } else {
    const unpurchasedCards = cheapestCards.filter((card) => {
      return !purchasedCards.includes(card.card_detail_id + "-" + card.edition);
    });
    console.log("Some cards could not be purchased:", unpurchasedCards);
  }
}
