import { getPricesFromLocalStorage } from "src/common/prices";
import { buyCardsFromMarket, calculateCheapestCards, fetchCardData, fetchCardSaleData, getCardLevelInfo, sumCards } from "src/common/splinterlands";
import { getUsernameFromLocalStorage } from "src/common/user";
import { CardLevelInfo, ForSaleListing } from "src/interfaces/splinterlands.interface";

let launched: boolean = false;
let globalModal: any = null;
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

const getSelectedCards = (): NodeListOf<Element> | Element[] | null => {

  // New method
  const checkedBoxesNew = document.querySelectorAll('.c-gyOReJ.c-dcDALJ.c-gyOReJ-crmSPl-adjusted-true:checked:not(#check_all)');
  if (checkedBoxesNew.length) {
    const selectedCardRowsNew = Array.from(checkedBoxesNew)
      .map(checkbox => checkbox.closest('tr'))
      .filter(el => el !== null) as Element[];
    return selectedCardRowsNew;
  }

  // Legacy method
  const checkedBoxesLegacy = document.querySelectorAll('.card-checkbox.checked:not(#check_all)');
  if (checkedBoxesLegacy.length) {
    return checkedBoxesLegacy;
  }

  return null;
};

function setPrice(modal: HTMLElement, price: string): void {
  const priceElement: HTMLElement = modal.querySelector('#price') as HTMLElement;
  priceElement.innerHTML = `${price} `;
}

const getCardIds = (selectedCards: NodeListOf<Element> | Element[]): string => {

  return Array.from(selectedCards).map(card => {
    // New method
    if (card instanceof HTMLTableRowElement) {
      const tds = card.querySelectorAll('td');
      if (tds.length > 1) {
        return tds[tds.length - 3].textContent;
      }
    }
    // Legacy method
    else if (card instanceof HTMLElement) {
      return card.getAttribute('card_id');
    }
  }).filter(id => id !== undefined && id !== null).join(',');
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

export const launchModal = async (): Promise<void> => {

  if (launched) return;

  launched = true;

  const selectedCards = getSelectedCards();

  if (!selectedCards || selectedCards.length === 0) {
    alert('Oops! No cards have been selected for combining. Please choose at least one card to proceed.');
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
    console.log("No cheapest cards found.");
    return null;
  }

  if (!username) {
    console.log("Username not found in local storage.");
    return null;
  }

  buyCardsFromMarket(username, cheapestCards, 'DEC');

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



function createResultContent(header: string, text: string): HTMLElement {
  const resultContent: HTMLDivElement = document.createElement('div');
  resultContent.innerHTML = `<h2>${header}</h2><p>${text}</p>`;
  return resultContent;
}
