import { MarketListing } from "src/interfaces/splinterlands.interface";

export function createMarketTable(forSaleListings: MarketListing[]): HTMLElement {
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
    forSaleListings.forEach(listing => {
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
        actionButton.addEventListener('click', () => alert(`Clicked ${actionButton.innerText} for card ID: ${listing.card_id}`));
        actionButtonCell.appendChild(actionButton);

        row.appendChild(priceCell);
        row.appendChild(lvlCell);
        row.appendChild(bcxCell);
        row.appendChild(pricePerBcxCell);
        row.appendChild(cardIdCell);
        row.appendChild(actionButtonCell);
        table.appendChild(row);
    });

    // Append table to its container
    tableContainer.appendChild(table);

    return tableContainer;
}
