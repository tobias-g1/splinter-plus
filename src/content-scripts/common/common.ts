import { buyCardsFromMarket, rentCardsFromMarket } from "src/common/splinterlands";
import { getUsernameFromLocalStorage } from "src/common/user";
import { BuyModal } from "src/content-scripts/common/buy-modal";
import { CombineModal } from "src/content-scripts/common/combine-modal";
import { RentModal } from "src/content-scripts/common/rental-modal";
import { CardDetailOwnership, Distribution, MarketListing } from "src/interfaces/splinterlands.interface";

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

export function createHeader(text: string, format: string): HTMLDivElement {
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header-wrapper');

    const header = document.createElement('span');
    header.classList.add('header');
    header.innerText = text;
    headerDiv.appendChild(header);

    const exploreButton = document.createElement('button');
    exploreButton.classList.add('explore-button');
    exploreButton.innerText = 'Explore';
    exploreButton.classList.add(format);
    exploreButton.onclick = (event: any) => {
        event.stopPropagation();
        const cardContainer = document.querySelector('.deck-builder-page2__cards');

        if (cardContainer) {
            cardContainer.classList.toggle('expanded');
        }

        const panelDiv: any = event.target.closest('.deck-panel, .custom-panel');
        panelDiv.classList.toggle('expanded');
        if (panelDiv.classList.contains('expanded')) {
            exploreButton.innerText = 'Close';
            exploreButton.classList.add('close-expand');
        } else {
            exploreButton.innerText = 'Explore';
            exploreButton.classList.remove('close-expand');
        }
    };
    headerDiv.appendChild(exploreButton);

    return headerDiv;
}

export async function createCardItem(detail: CardDetailOwnership, format: string, rating: number | null | undefined): Promise<HTMLDivElement> {
    const cardItem = document.createElement('div');
    cardItem.classList.add('card-item');

    const cardImage = document.createElement('img');
    cardImage.classList.add('card-img');

    const edition = getHighestEdition(detail.editions, detail.distribution);

    cardImage.src = `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/${edition}/${detail.name}_lv1.png`;
    cardItem.appendChild(cardImage);

    const cardButtonsContainer = document.createElement('div');
    cardButtonsContainer.classList.add('card-buttons-container');

    const header = document.createElement('span');
    header.classList.add('card-header');
    header.innerHTML = detail.name

    const stat = document.createElement('div');
    stat.classList.add('card-stat');
    stat.classList.add(format);
    stat.innerHTML = `Rating: ${rating}`


    const description = document.createElement('p');
    description.classList.add('card-description');

    let buttons: { text: string; action: () => void }[] = [];
    const username: string | null = await getUsernameFromLocalStorage();

    // Filter cards that are listed for rent or sale by the user
    const listedCards = detail.cards.filter((c) => (c.market_listing_type === "RENT" || c.market_listing_type === "SELL") && c.player === username);

    // Filter cards that are neither rented, listed, nor renting
    const nonAffectedCards = detail.cards.filter((c) => c.delegated_to === "" && !(c.market_listing_type === "RENT" || c.market_listing_type === "SELL"));

    if (detail.editions.includes("6") || detail.editions.includes("10")) {
        description.innerText = "This card is not available for purchase or renting.";
    } else {
        if (nonAffectedCards.length === 0) {

            if (listedCards.length !== 0) {
                description.innerText = "Please remove or replace your listed card to utilize SplinterPlus for upgrades.";
                buttons = [
                    {
                        text: 'Buy',
                        action: () => {
                            const buyModal = new BuyModal(detail.id, false, parseInt(detail.editions[0]), 500)
                            buyModal.launchBuyModal()
                        },
                    }
                ]
            } else {
                description.innerText = "To add this item to your collection, use the options below to purchase or rent it.";
                buttons = [
                    {
                        text: 'Buy',
                        action: () => {
                            const buyModal = new BuyModal(detail.id, false, parseInt(detail.editions[0]), 500)
                            buyModal.launchBuyModal()
                        },
                    },
                    {
                        text: 'Rent',
                        action: () => {
                            const rentModal = new RentModal(detail.id, false, parseInt(detail.editions[0]), 500)
                            rentModal.launchRentModal()
                        },
                    },
                ];
            }


        } else {
            description.innerText = "You own this card. Upgrade it by combining with your highest-rated card or visit the collection page for more options."
            buttons = [
                {
                    text: 'Upgrade',
                    action: () => {
                        const combineModal = new CombineModal()
                        combineModal.launchModal(detail.cards[0].uid)
                    },
                },
            ];
        }
    }

    const buyAction = buttons.find((button) => button.text === 'Buy')?.action;

    if (buyAction) {
        const buyButton = createButton('Buy', format);
        buyButton.addEventListener('click', buyAction);
        cardButtonsContainer.appendChild(buyButton);
    }

    buttons
        .filter((button) => button.text !== 'Buy')
        .forEach(({ text, action }) => {
            const button = createButton(text, format);
            button.addEventListener('click', action);
            cardButtonsContainer.appendChild(button);
        });

    const cardButtons = document.createElement('div');
    cardButtons.classList.add('card-buttons');
    cardButtons.appendChild(header);

    if (rating) {
        cardButtons.appendChild(stat);
    }

    cardButtons.appendChild(description);
    cardButtons.appendChild(cardButtonsContainer);

    cardItem.appendChild(cardButtons);

    return cardItem;
}

const EDITIONS: Record<string, string> = {
    "0": 'alpha',
    "1": 'beta',
    "2": 'promo',
    "3": 'reward',
    "4": 'untamed',
    "5": 'dice',
    "6": 'gladiator',
    "7": 'chaos',
    "8": 'rift',
    "9": 'zola',
    "10": 'soulbound'
};


function createButton(text: string, format: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('buy-button');
    button.classList.add(format);
    button.innerText = text;
    return button;
}

function getHighestEdition(editions: string, distribution: Distribution[]): string {
    const editionList = editions.split(',').map(Number);
    let highestEdition: number = editionList[0];
    let highestNumCards: number = 0;

    for (const edition of editionList) {
        const editionDistribution = distribution.find((d) => d.edition === edition && !d.gold);
        if (editionDistribution && parseInt(editionDistribution.num_cards) > highestNumCards) {
            highestNumCards = parseInt(editionDistribution.num_cards);
            highestEdition = edition;
        }
    }

    return EDITIONS[highestEdition.toString()];
}

// Function to get the value from localStorage
export function getValueFromLocalStorage<T>(key: string): Promise<T | undefined> {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
            resolve(result[key]);
        });
    });
}

// Function to set the value in localStorage
export function setValueInLocalStorage<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => {
            resolve();
        });
    });
}

export function convertToTitleCase(input: string): string {
    const words = input.toLowerCase().split(' ');

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }

    return words.join(' ');
}

