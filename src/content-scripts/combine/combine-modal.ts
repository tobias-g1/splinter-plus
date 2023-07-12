import { getPricesFromLocalStorage } from "src/common/prices";
import { buyCardsFromMarket, calculateCheapestCards, combineCards, fetchCardData, fetchCardSaleData, getCardLevelInfo, sumCards, verifySuccessfulPurchases, waitForTransactionSuccess } from "src/common/splinterlands";
import { getUsernameFromLocalStorage } from "src/common/user";
import { CardLevelInfo, ForSaleListing } from "src/interfaces/splinterlands.interface";

let launched: boolean = false;
let globalModal: any = null;
let cardsToCombine: string[] = [];
export let combineInProgress: boolean = false;
export let inProgressPurchase: ForSaleListing[] = [];

const modalToAdd: string = `
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
                <button id="btn_cancel" class="gradient-button red" data-dismiss="modal">Cancel</button>
                <button id="btn_sell" class="gradient-button green">BUY & COMBINE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

function setPrice(modal: HTMLElement, price: string): void {
  const priceElement: HTMLElement = modal.querySelector('#price') as HTMLElement;
  priceElement.innerHTML = `${price} `;
}

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
  combineInfo.innerHTML = `You can combine your selected card(s) to <b>level ${level}</b>, by purchasing the equivalent of <b>${cardsToCombine} card(s) </b> from the market. We've found the cheapest card combination available and you can find a quote below.`;
}

function addModalEventListeners(modal: HTMLElement, buyAndCombineHandler: () => void): void {
  const closeButton: HTMLElement | null = modal.querySelector('.modal-close-new');
  closeButton?.addEventListener('click', () => {
    launched = false;
    modal.remove();
  });

  const buyAndCombineButton: HTMLElement = modal.querySelector('#btn_sell') as HTMLElement;
  buyAndCombineButton.addEventListener('click', buyAndCombineHandler);

  const cancelButton: HTMLElement = modal.querySelector('#btn_cancel') as HTMLElement;
  cancelButton.addEventListener('click', () => {
    launched = false;
    modal.remove();
  });
}

export const launchModal = async (cardIds: string): Promise<void> => {

  if (launched) return;

  launched = true;
  cardsToCombine = [];

  const data = await fetchCardData(cardIds);

  if (!validate(data)) {
    launched = false;
    return;
  }

  cardsToCombine = cardIds.split(',');

  const combinedCards = await sumCards(data);
  const levelInfo: CardLevelInfo = await getCardLevelInfo(combinedCards);

  const { card_detail_id, gold, edition } = data[0];

  const marketData: ForSaleListing[] = await fetchCardSaleData(card_detail_id, gold, edition, 300);
  const cheapestCards: ForSaleListing[] | null = await calculateCheapestCards(marketData, levelInfo.xp_required, levelInfo.base_xp);
  const modal: HTMLElement = createModal();

  globalModal = modal;

  setCombineInfo(modal, levelInfo.level + 1, levelInfo.cards_required);

  document.body.appendChild(modal);

  const prices = await getPricesFromLocalStorage();

  if (cheapestCards && prices) {

    const totalPriceUSD = cheapestCards.reduce((sum, card) => sum + parseFloat(card.buy_price), 0).toFixed(2)
    const totalPriceDEC = (parseFloat(totalPriceUSD) / prices.dec).toFixed(3);

    setPrice(modal, `~${totalPriceDEC} DEC ($${totalPriceUSD})`);


  } else {
    setPrice(modal, '0');
  }


  const buyAndCombineHandler = async () => {
    const username = await getUsernameFromLocalStorage();

    submitBuyRequest(username, cheapestCards);
  };

  addModalEventListeners(modal, buyAndCombineHandler);
};

async function submitBuyRequest(username: string | null, cheapestCards: ForSaleListing[] | null): Promise<any | null> {

  if (!cheapestCards) {
    addResultContainer("We weren't able to find any cards on the market.", "Unfortunately, we couldn't find any available cards in the market at this time. Please check back later for updates. We apologize for any inconvenience caused.")
    return null;
  }

  if (!username) {
    addResultContainer("An unexpected error occurred", "We're very sorry, but an unexpected error occurred while processing your request. Please try again later.")
    return null;
  }

  inProgressPurchase = cheapestCards;

  buyCardsFromMarket(username, cheapestCards, 'DEC');

}

export async function handlePurchase(data: any) {

  addLoadingIndicator("Hang tight! We're processing your card purchase.");

  const { tx_id } = data;
  const cardsBought = await verifySuccessfulPurchases(tx_id);

  const { allSuccessful, successful, unsuccessful } = cardsBought;

  let cardCombine: string[] = cardsToCombine;
  let successfulCards: any[] = [];
  let unsuccessfulCards: any[] = [];

  if (successful && successful.length > 0) {
    successful.forEach((purchase: any) => {
      if (purchase.cards && purchase.cards.length > 0) {
        purchase.cards.forEach((card: any) => {
          cardsToCombine.push(card.uid);
          successfulCards.push(card);
        });
      }
    });
  }

  if (unsuccessful && unsuccessful.length > 0) {
    unsuccessful.forEach((purchase: any) => {
      if (purchase.cards && purchase.cards.length > 0) {
        purchase.cards.forEach((card: any) => {
          unsuccessfulCards.push(card);
        });
      }
    });
  }

  if (allSuccessful) {
    const username = await getUsernameFromLocalStorage();
    if (username) {
      combineInProgress = true;
      await combineCards(username, cardCombine);
    }
  } else {
    addResultContainer('There has been an error purchasing your cards', "We're sorry, but an error occurred while trying to process your card purchase. Please ensure you have the correct amount to complete the purchase and try again.")
  }
}

export async function handleCombine(data: any) {

  addLoadingIndicator("Your cards we're purchased successfully. We're processing your card combine.");

  const { tx_id } = data;
  const success = await waitForTransactionSuccess(tx_id, 4, 5);

  if (success) {
    addResultContainer('Your cards have been combined successfully!', 'Congratulations! Your cards were successfully combined. You can now view the combined card in your inventory.')
  } else {
    addResultContainer('There has been an error combining your cards', "We're sorry, but an error occurred while trying to process your card combine.")
  }

  combineInProgress = false;

}

function setModalBodyContent(modal: HTMLElement, content: HTMLElement | string): void {
  const modalBody: HTMLElement = modal.querySelector('.modal-body') as HTMLElement;
  modalBody.innerHTML = ''; // Clear the existing content
  if (typeof content === 'string') {
    modalBody.innerHTML = content;
  } else {
    modalBody.appendChild(content);
  }
}

function createLoadingIndicator(loadingText: string): HTMLDivElement {
  const loadingIndicator: HTMLDivElement = document.createElement('div');
  loadingIndicator.classList.add('sp-loading');

  const img: HTMLImageElement = document.createElement('img');
  img.src = 'https://d36mxiodymuqjm.cloudfront.net/website/loading-spinner_500.gif';
  img.alt = 'Loading Indicator';

  loadingIndicator.appendChild(img);

  const text: HTMLDivElement = document.createElement('div');
  text.innerText = loadingText;
  text.style.fontSize = '20px';
  text.style.color = '#fff';
  text.style.textAlign = 'center';

  loadingIndicator.appendChild(text);

  return loadingIndicator;
}

export function addLoadingIndicator(text: string) {
  const loadingIndicator = createLoadingIndicator(text);
  setModalBodyContent(globalModal, loadingIndicator);
}

export function addResultContainer(header: string, description: string) {
  const resultContainer = createResultContent(header, description);
  setModalBodyContent(globalModal, resultContainer);
}

function createResultContent(header: string, text: string): HTMLElement {
  const resultContent: HTMLDivElement = document.createElement('div');
  resultContent.innerHTML = `<h2>${header}</h2><p>${text}</p>`;
  return resultContent;
}
