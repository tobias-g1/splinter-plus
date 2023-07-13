import { fetchMarketData } from "src/common/splinterlands";
import { createMarketTable } from "src/content-scripts/common/common";
import { initializeBackgroundScriptConnection } from "src/content-scripts/common/connector";
import { MarketListing } from "src/interfaces/splinterlands.interface";
import '../common/common.scss';
export class BuyModal {
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
    <div id="buy_dialog" class="modal fade show neon in" tabindex="-1" role="dialog" style="display: block; padding-right: 10px;">
      <div class="modal-dialog battle-dialog" style="width: 800px;">
        <div class="modal-content">
          <div class="modal-header">
            <div class="banner">
              <div class="relative-position">
                <div class="title-text">BUY</div>
              </div>
            </div>
            <div class="modal-close-new" data-dismiss="modal">
              <img src="https://d36mxiodymuqjm.cloudfront.net/website/ui_elements/popups/icon_close_onhover.svg">
            </div>
          </div>
          <div class="modal-body">
            <p>Acquire top-tier cards from the market, dominate your adversaries, and claim victory like never before. Unleash your full potential on the battlefield and elevate your gameplay with SplinterPlus. </p>
            <div style="display: flex" class="content"></div>
          </div>
        </div>
      </div>
    </div>`;

  private createModal(): HTMLElement {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = this.modalToAdd;
    const modal = modalContainer.querySelector('#buy_dialog') as HTMLElement;
    return modal;
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
      const marketListings: MarketListing[] = await fetchMarketData(this.cardDetailId, this.gold, this.edition, this.fee, 'sell', null, 1000, 'price_bcx_asc');
      const tableContainer = await createMarketTable(marketListings);
      contentDiv.appendChild(tableContainer);
    } catch (error) {
      console.error('An error occurred while creating the table:', error);
    }
  }

  public async launchBuyModal(): Promise<void> {

    if (this.launched) return;

    initializeBackgroundScriptConnection(this);

    this.launched = true;

    const modal: HTMLElement = this.createModal();
    this.globalModal = modal;

    document.body.appendChild(modal);

    this.addModalEventListeners(this.globalModal);

    // add table after modal is displayed
    await this.createTable();
  }
}
