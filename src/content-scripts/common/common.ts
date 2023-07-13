import { buyCardsFromMarket, rentCardsFromMarket } from "src/common/splinterlands";
import { getUsernameFromLocalStorage } from "src/common/user";
import { MarketListing } from "src/interfaces/splinterlands.interface";

export async function createMarketTable(forSaleListings: MarketListing[]): Promise<HTMLElement> {
    // Create table and its container
    const table: HTMLElement = document.createElement('table');
    const tableContainer: HTMLElement = document.createElement('div');
    tableContainer.className = 'table-container';

    // Add table headers
    let headerRow: HTMLElement = document.createElement('tr');
    let priceHeader: HTMLElement = document.createElement('th');
    priceHeader.innerText = 'PRICE';
    let lvlHeader: HTMLElement = document.createElement('th');
    lvlHeader.innerText = 'LVL';
    let bcxHeader: HTMLElement = document.createElement('th');
    bcxHeader.innerText = 'BCX';
    let pricePerBcxHeader: HTMLElement = document.createElement('th');
    pricePerBcxHeader.innerText = '$/BCX';
    let cardIdHeader: HTMLElement = document.createElement('th');
    cardIdHeader.innerText = 'CARD ID';
    let actionHeader: HTMLElement = document.createElement('th');
    actionHeader.innerText = 'ACTION';
    headerRow.appendChild(priceHeader);
    headerRow.appendChild(lvlHeader);
    headerRow.appendChild(bcxHeader);
    headerRow.appendChild(pricePerBcxHeader);
    headerRow.appendChild(cardIdHeader);
    headerRow.appendChild(actionHeader);
    table.appendChild(headerRow);

    // Add table rows based on fetched data
    for (let i = 0; i < forSaleListings.length; i++) {
        const listing = forSaleListings[i];
        let row: HTMLElement = document.createElement('tr');
        let priceCell: HTMLElement = document.createElement('td');
        priceCell.innerText = listing.currency === 'USD' ? '$' + listing.buy_price.toString() : listing.buy_price.toString() + ' DEC';
        let lvlCell: HTMLElement = document.createElement('td');
        lvlCell.innerText = listing.level.toString();
        let bcxCell: HTMLElement = document.createElement('td');
        bcxCell.innerText = listing.bcx.toString();
        let pricePerBcxCell: HTMLElement = document.createElement('td');
        pricePerBcxCell.innerText = listing.currency === 'USD' ? '$' + (parseFloat(listing.buy_price.toString()) / listing.bcx).toFixed(2) : (parseFloat(listing.buy_price.toString()) / listing.bcx).toFixed(2) + ' DEC/BCX';
        let cardIdCell: HTMLElement = document.createElement('td');
        cardIdCell.innerText = listing.card_id.toString();

        // Create 'Buy' or 'Rent' button and add event listener
        let actionButtonCell: HTMLElement = document.createElement('td');
        let actionButton: HTMLButtonElement = document.createElement('button');
        actionButton.id = `action-button-${listing.card_id}`;
        actionButton.className = 'action-button';
        actionButton.innerText = listing.type === 'RENT' ? 'Rent' : 'Buy';
        actionButton.addEventListener('click', async () => {
            const username: string = (await getUsernameFromLocalStorage()) ?? '';
            if (listing.type === 'RENT') {
                const days = prompt('Enter the number of days for rent:', '2');
                if (days) {
                    rentCardsFromMarket(username, [listing], 'DEC', days);
                }
            } else {
                buyCardsFromMarket(username, [listing], 'DEC');
            }
        });
        actionButtonCell.appendChild(actionButton);

        row.appendChild(priceCell);
        row.appendChild(lvlCell);
        row.appendChild(bcxCell);
        row.appendChild(pricePerBcxCell);
        row.appendChild(cardIdCell);
        row.appendChild(actionButtonCell);
        table.appendChild(row);
    }

    // Append table to its container
    tableContainer.appendChild(table);

    return tableContainer;
}

export function setModalBodyContent(modal: HTMLElement, content: HTMLElement | string): void {
    const modalBody: HTMLElement = modal.querySelector('.modal-body') as HTMLElement;
    modalBody.innerHTML = '';
    if (typeof content === 'string') {
        modalBody.innerHTML = content;
    } else {
        modalBody.appendChild(content);
    }
}

export function createLoadingIndicator(loadingText: string): HTMLDivElement {
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

export function addLoadingIndicator(modal: HTMLElement, text: string) {
    const loadingIndicator = createLoadingIndicator(text);
    setModalBodyContent(modal, loadingIndicator);
}

export function addResultContainer(modal: HTMLElement, header: string, description: string) {
    const resultContainer = createResultContent(header, description, modal, 'Done');
    setModalBodyContent(modal, resultContainer);
}

export function createResultContent(header: string, text: string, modal: HTMLElement, buttonText: string): HTMLElement {
    const resultContent: HTMLDivElement = document.createElement('div');
    resultContent.classList.add('result-content');

    const closeButton: HTMLButtonElement = document.createElement('button');
    closeButton.setAttribute('class', 'gradient-button green');
    closeButton.textContent = buttonText;

    // Add event listener to the button
    closeButton.addEventListener('click', () => {
        modal.remove();
    });

    resultContent.innerHTML = `<h2 class="result-header">${header}</h2><p>${text}</p>`;

    resultContent.appendChild(closeButton); // Appending the button to the resultContent div

    return resultContent;
}
