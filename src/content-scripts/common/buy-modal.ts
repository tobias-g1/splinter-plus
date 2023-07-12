
export class BuyModal {
  private launched: boolean = false;
  private globalModal: HTMLElement | null = null;

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
            <div style="display: flex" class="combine-content">
            </div>
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

  public async launchBuyModal(): Promise<void> {
    if (this.launched) return;

    this.launched = true;

    const modal: HTMLElement = this.createModal();
    this.globalModal = modal;

    document.body.appendChild(modal);

    this.addModalEventListeners(this.globalModal);

  }
}
