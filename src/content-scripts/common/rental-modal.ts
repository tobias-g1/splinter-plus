import { fetchMarketData, waitForTransactionSuccess } from 'src/common/splinterlands';
import { addLoadingIndicator, addResultContainer, createMarketTable } from 'src/content-scripts/common/common';
import { initializeBackgroundScriptConnection } from 'src/content-scripts/common/connector';
import { refreshCardsPanel } from 'src/content-scripts/recommend-cards';
import { refreshDeckPanel } from 'src/content-scripts/recommend-deck';
import { MarketListing } from 'src/interfaces/splinterlands.interface';
import '../../styles/common.scss';
export class RentModal {
  private launched: boolean = false;
  private globalModal: HTMLElement | null = null;
  private cardDetailId: number;
  private gold: boolean;
  private edition: number;
  private fee: number;

  constructor(cardDetailId: number, gold: boolean, edition: number, fee: number) {
    this.cardDetailId = cardDetailId;
    this.gold = gold;
    this.edition = edition;
    this.fee = fee;
  }

  private modalToAdd: string = `
    <div id="rent_dialog" class="sp_modal modal fade show neon in" tabindex="-1" role="dialog" style="display: block; padding-right: 10px;">
      <div class="modal-dialog battle-dialog" style="width: 800px;">
        <div class="modal-content">
          <div class="modal-header">
            <div class="banner">
              <div class="relative-position">
                <div class="title-text">RENT</div>
              </div>
            </div>
            <div class="modal-close-new" data-dismiss="modal">
              <img src="https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/popups/icon_close_onhover.svg">
            </div>
          </div>
          <div class="modal-body">
          <p>Supercharge your Splinterlands experience with SplinterPlus! Rent top-tier cards for daily battles, dominate your opponents, and seize victory like never before. Unleash your true potential on the battlefield and make the most of your gameplay with SplinterPlus. Rent now and conquer the Splinterlands!</p>
            <div style="display: flex" class="content">
            </div>
          </div>
        </div>
      </div>
    </div>`;

  private createModal(): HTMLElement {
    const modalWrapper: HTMLDivElement = document.createElement('div');
    modalWrapper.innerHTML = this.modalToAdd;
    return modalWrapper.querySelector('#rent_dialog') as HTMLElement;
  }

  private addModalEventListeners(modal: HTMLElement): void {
    const closeButton: HTMLElement | null = modal.querySelector('.modal-close-new');
    closeButton?.addEventListener('click', () => {
      this.launched = false;
      modal.remove();
    });
  }

  private async createTable(): Promise<void> {
    const contentDiv: HTMLElement | null | undefined = this.globalModal?.querySelector('.content');
    if (!contentDiv) {
      console.error('Could not find content div in modal');
      return;
    }

    try {
      const marketListings: MarketListing[] = await fetchMarketData(this.cardDetailId, this.gold, this.edition, this.fee, 'rent', 'daily', 1000, 'price_bcx_asc');
      const tableContainer = await createMarketTable(marketListings);
      contentDiv.appendChild(tableContainer);
    } catch (error) {
      console.error('An error occurred while creating the table:', error);
    }
  }

  public async handlePurchase(data: any) {
    addLoadingIndicator(this.globalModal!, "Hang tight! We're processing your card purchase.");

    const { tx_id } = data;
    const success = await waitForTransactionSuccess(tx_id, 4, 5);

    setTimeout(async () => {
      await refreshDeckPanel();
      await refreshCardsPanel();
    }, 3000);

    if (success) {
      addResultContainer(this.globalModal!, 'Your cards have been rented successfully!', 'Congratulations! Your cards were successfully rented. You can now view the rented card in your inventory.')
    } else {
      addResultContainer(this.globalModal!, 'There has been an error combining your cards', "We're sorry, but an error occurred while trying to process your card combine.")
    }

  }

  public async launchRentModal(): Promise<void> {

    initializeBackgroundScriptConnection(this);

    if (this.launched) return;

    this.launched = true;

    const modal: HTMLElement = this.createModal();
    this.globalModal = modal;

    document.body.appendChild(modal);

    this.addModalEventListeners(this.globalModal);

    // add table after modal is displayed
    await this.createTable();
  }
}