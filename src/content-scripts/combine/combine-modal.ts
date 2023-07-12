import { getPricesFromLocalStorage } from "src/common/prices";
import { buyCardsFromMarket, calculateCheapestCards, combineCards, fetchCardData, fetchCardSaleData, getCardLevelInfo, sumCards, verifySuccessfulPurchases, waitForTransactionSuccess } from "src/common/splinterlands";
import { getUsernameFromLocalStorage } from "src/common/user";
import { CardLevelInfo, ForSaleListing } from "src/interfaces/splinterlands.interface";

export class CombineModal {
  private launched: boolean = false;
  private globalModal: any = null;
  private cardsToCombine: string[] = [];
  public combineInProgress: boolean = false;
  public inProgressPurchase: ForSaleListing[] = [];

  private modalToAdd: string = `
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

  private setPrice(modal: HTMLElement, price: string): void {
    const priceElement: HTMLElement = modal.querySelector('#price') as HTMLElement;
    priceElement.innerHTML = `${price} `;
  }

  private validate(data: any[]): boolean {
    const hasSameProperties = data.every((card: any) => {
      return card.gold === data[0].gold
        && card.rental_type === null
        && card.delegated_to === null
        && card.buy_price === null
        && card.edition === data[0].edition
        && card.card_detail_id === data[0].card_detail_id;
    });

    if (!hasSameProperties) {
      alert('Some of your selected cards do not meet the requirements for combining. Please check that all cards are not listed on the market or rented.');
      return false;
    }

    return true;
  }

  private createModal(): HTMLElement {
    const modalWrapper: HTMLDivElement = document.createElement('div');
    modalWrapper.innerHTML = this.modalToAdd;
    return modalWrapper.querySelector('#combine_dialog') as HTMLElement;
  }

  private setCombineInfo(modal: HTMLElement, level: number, cardsToCombine: number): void {
    const combineInfo: HTMLElement = modal.querySelector('#combine-info') as HTMLElement;
    combineInfo.innerHTML = `You can combine your selected card(s) to <b>level ${level}</b>, by purchasing the equivalent of <b>${cardsToCombine} card(s) </b> from the market. We've found the cheapest card combination available and you can find a quote below.`;
  }

  private addModalEventListeners(modal: HTMLElement, buyAndCombineHandler: () => void): void {
    const closeButton: HTMLElement | null = modal.querySelector('.modal-close-new');
    closeButton?.addEventListener('click', () => {
      this.launched = false;
      modal.remove();
    });

    const buyAndCombineButton: HTMLElement = modal.querySelector('#btn_sell') as HTMLElement;
    buyAndCombineButton.addEventListener('click', buyAndCombineHandler);

    const cancelButton: HTMLElement = modal.querySelector('#btn_cancel') as HTMLElement;
    cancelButton.addEventListener('click', () => {
      this.launched = false;
      modal.remove();
    });
  }

  public async launchModal(cardIds: string): Promise<void> {
    if (this.launched) return;

    this.launched = true;
    this.cardsToCombine = [];

    const data = await fetchCardData(cardIds);

    if (!this.validate(data)) {
      this.launched = false;
      return;
    }

    this.cardsToCombine = cardIds.split(',');

    const combinedCards = await sumCards(data);
    const levelInfo: CardLevelInfo = await getCardLevelInfo(combinedCards);

    const { card_detail_id, gold, edition } = data[0];

    const marketData: ForSaleListing[] = await fetchCardSaleData(card_detail_id, gold, edition, 300);
    const cheapestCards: ForSaleListing[] | null = await calculateCheapestCards(marketData, levelInfo.xp_required, levelInfo.base_xp);
    const modal: HTMLElement = this.createModal();

    this.globalModal = modal;

    this.setCombineInfo(modal, levelInfo.level + 1, levelInfo.cards_required);

    document.body.appendChild(modal);

    const prices = await getPricesFromLocalStorage();

    if (cheapestCards && prices) {
      const totalPriceUSD = cheapestCards.reduce((sum, card) => sum + parseFloat(card.buy_price), 0).toFixed(2)
      const totalPriceDEC = (parseFloat(totalPriceUSD) / prices.dec).toFixed(3);
      this.setPrice(modal, `~${totalPriceDEC} DEC ($${totalPriceUSD})`);
    } else {
      this.setPrice(modal, '0');
    }

    const buyAndCombineHandler = async () => {
      const username = await getUsernameFromLocalStorage();
      this.submitBuyRequest(username, cheapestCards);
    };

    this.addModalEventListeners(modal, buyAndCombineHandler);
  }

  private async submitBuyRequest(username: string | null, cheapestCards: ForSaleListing[] | null): Promise<any | null> {
    if (!cheapestCards) {
      this.addResultContainer("We weren't able to find any cards on the market.", "Unfortunately, we couldn't find any available cards in the market at this time. Please check back later for updates. We apologize for any inconvenience caused.")
      return null;
    }

    if (!username) {
      this.addResultContainer("An unexpected error occurred", "We're very sorry, but an unexpected error occurred while processing your request. Please try again later.")
      return null;
    }

    this.inProgressPurchase = cheapestCards;

    buyCardsFromMarket(username, cheapestCards, 'DEC');
  }

  public async handlePurchase(data: any) {
    this.addLoadingIndicator("Hang tight! We're processing your card purchase.");

    const { tx_id } = data;
    const cardsBought = await verifySuccessfulPurchases(tx_id);

    const { allSuccessful, successful, unsuccessful } = cardsBought;

    let cardCombine: string[] = this.cardsToCombine;
    let successfulCards: any[] = [];
    let unsuccessfulCards: any[] = [];

    if (successful && successful.length > 0) {
      successful.forEach((purchase: any) => {
        if (purchase.cards && purchase.cards.length > 0) {
          purchase.cards.forEach((card: any) => {
            this.cardsToCombine.push(card.uid);
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
        this.combineInProgress = true;
        await combineCards(username, cardCombine);
      }
    } else {
      this.addResultContainer('There has been an error purchasing your cards', "We're sorry, but an error occurred while trying to process your card purchase. Please ensure you have the correct amount to complete the purchase and try again.")
    }
  }

  public async handleCombine(data: any) {
    this.addLoadingIndicator("Your cards we're purchased successfully. We're processing your card combine.");

    const { tx_id } = data;
    const success = await waitForTransactionSuccess(tx_id, 4, 5);

    if (success) {
      this.addResultContainer('Your cards have been combined successfully!', 'Congratulations! Your cards were successfully combined. You can now view the combined card in your inventory.')
    } else {
      this.addResultContainer('There has been an error combining your cards', "We're sorry, but an error occurred while trying to process your card combine.")
    }

    this.combineInProgress = false;
  }

  private setModalBodyContent(modal: HTMLElement, content: HTMLElement | string): void {
    const modalBody: HTMLElement = modal.querySelector('.modal-body') as HTMLElement;
    modalBody.innerHTML = ''; // Clear the existing content
    if (typeof content === 'string') {
      modalBody.innerHTML = content;
    } else {
      modalBody.appendChild(content);
    }
  }

  private createLoadingIndicator(loadingText: string): HTMLDivElement {
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

  public addLoadingIndicator(text: string) {
    const loadingIndicator = this.createLoadingIndicator(text);
    this.setModalBodyContent(this.globalModal, loadingIndicator);
  }

  public addResultContainer(header: string, description: string) {
    const resultContainer = this.createResultContent(header, description, this.globalModal, 'Done');
    this.setModalBodyContent(this.globalModal, resultContainer);
  }

  public createResultContent(header: string, text: string, modal: HTMLElement, buttonText: string): HTMLElement {
    const resultContent: HTMLDivElement = document.createElement('div');
    resultContent.classList.add("result-content");

    const closeButton: HTMLButtonElement = document.createElement('button');
    closeButton.setAttribute("class", "gradient-button green");
    closeButton.textContent = buttonText;

    // Add event listener to the button
    closeButton.addEventListener('click', () => {
      this.launched = false;
      modal.remove();
    });

    resultContent.innerHTML = `<h2 class="result-header">${header}</h2><p>${text}</p>`;

    resultContent.appendChild(closeButton); // Appending the button to the resultContent div

    return resultContent;
  }

}


