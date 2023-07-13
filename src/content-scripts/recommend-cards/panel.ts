import { getCards } from 'src/common/splinter-plus';
import { getCardDetails, getCollection } from 'src/common/splinterlands';
import { getUsernameFromLocalStorage } from 'src/common/user';
import { BuyModal } from 'src/content-scripts/common/buy-modal';
import { CombineModal } from 'src/content-scripts/common/combine-modal';
import { RentModal } from 'src/content-scripts/common/rental-modal';
import { CardResponse } from 'src/interfaces/spinter-plus.interface';
import { Card, CardDetail, CardDetailOwnership, Collection } from 'src/interfaces/splinterlands.interface';

const EDITIONS: Record<string, string> = {
    "0": 'alpha',
    "1": 'beta',
    "2": 'promo',
    "3": 'reward',
    "4": 'untamed',
    "5": 'dice',
    "6": 'rift',
    "7": 'chaos'
};

function createCardItem(detail: CardDetailOwnership): HTMLDivElement {
    const cardItem = document.createElement('div');
    cardItem.classList.add('card-item');

    const cardImage = document.createElement('img');
    cardImage.classList.add('card-img');

    const edition = EDITIONS[detail.editions];

    cardImage.src = `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/${edition}/${detail.name}_lv1.png`;
    cardItem.appendChild(cardImage);

    const cardButtonsContainer = document.createElement('div');
    cardButtonsContainer.classList.add('card-buttons-container');

    const description = document.createElement('p');
    description.classList.add('card-description');

    let buttons: { text: string; action: () => void }[] = [];

    if (!detail.owned && !detail.rented) {
        description.innerText =
            "You don't have this in your collection. Use the options below to buy or rent to add it to your collection.";

        buttons = [
            {
                text: 'Buy',
                action: () => {
                    const buyModal = new BuyModal(454, false, 3, 500)
                    buyModal.launchBuyModal()
                },
            },
            {
                text: 'Rent',
                action: () => {
                    const rentModal = new RentModal(1, false, 0, 500)
                    rentModal.launchRentModal()
                },
            },
        ];

    } else if (detail.rented) {
        description.innerText = 'You have this card rented, but you can own it.';
        buttons = [
            {
                text: 'Buy',
                action: () => {
                    const buyModal = new BuyModal(1, false, 0, 500)
                    buyModal.launchBuyModal()
                },
            },
        ];

    } else if (detail.owned) {
        description.innerText = 'Upgrade';
        buttons = [
            {
                text: 'Upgrade',
                action: () => {
                    const combineModal = new CombineModal()
                    combineModal.launchModal('1')
                },
            },
        ];
    }

    const buyAction = buttons.find((button) => button.text === 'Buy')?.action;

    if (buyAction) {
        const buyButton = createButton('Buy');
        buyButton.addEventListener('click', buyAction);
        cardButtonsContainer.appendChild(buyButton);
    }

    buttons
        .filter((button) => button.text !== 'Buy')
        .forEach(({ text, action }) => {
            const button = createButton(text);
            button.addEventListener('click', action);
            cardButtonsContainer.appendChild(button);
        });

    const cardButtons = document.createElement('div');
    cardButtons.classList.add('card-buttons');
    cardButtons.appendChild(description);
    cardButtons.appendChild(cardButtonsContainer);

    cardItem.appendChild(cardButtons);

    return cardItem;
}


function createButton(text: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('buy-button');
    button.innerText = text;
    return button;
}

function createHeader(): HTMLDivElement {
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header-wrapper');

    const header = document.createElement('span');
    header.classList.add('header');
    header.innerText = 'Recommended Collection';
    headerDiv.appendChild(header);

    const exploreButton = document.createElement('button');
    exploreButton.classList.add('explore-button');
    exploreButton.innerText = 'Explore';
    exploreButton.onclick = (event: any) => {
        event.stopPropagation();
        const panelDiv: any = event.target.closest('.custom-panel');
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

function createCardList(details: CardDetailOwnership[]): HTMLDivElement {
    const cardList = document.createElement('div');
    cardList.classList.add('card-list');

    for (const detail of details) {
        const cardItemElement = createCardItem(detail);
        cardList.appendChild(cardItemElement);
    }

    return cardList;
}

function createContentHeader(): HTMLDivElement {
    const contentHeader = document.createElement('div');
    contentHeader.classList.add('content-header');

    const description = document.createElement('p');
    description.innerText = 'Unlock your full potential in every battle with the ultimate collection handpicked for your league and collection! Based on our extensive analysis of thousands of battles, we recommend these cards. ';
    contentHeader.append(description);

    // Elements selection UI for a later release

    /*     const options = document.createElement('div');
        options.classList.add('options');
    
        elementsData.forEach(element => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');
    
            const img = document.createElement('img');
            img.src = chrome.runtime.getURL(element.image);
            img.alt = element.name;
            optionDiv.appendChild(img);
    
            optionDiv.addEventListener('click', () => {
                alert(element.name);
            });
    
            options.appendChild(optionDiv);
        });
    
        contentHeader.appendChild(options); */

    return contentHeader;
}

export async function buildAndInsertPanel(format: string) {
    console.log(`Building and inserting panel for format: ${format}`);

    const panelDiv = document.createElement('div');
    panelDiv.classList.add('custom-panel');

    const headerDiv = createHeader();
    panelDiv.appendChild(headerDiv);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('panel-content');

    const contentHeader = createContentHeader();
    contentDiv.appendChild(contentHeader);

    const recommendedCards = document.createElement('div');
    recommendedCards.classList.add('recommended-cards');

    const cards: CardResponse = await getCards(
        [99], [], [], "Novice", "modern", 15
    )
    const cardIds: number[] = cards.cards.map(card => card.card_id);
    const cardData: CardDetail[] = await getCardDetails(cardIds);

    const username: string | null = await getUsernameFromLocalStorage();
    let collection: Collection | null = null;
    if (username) {
        collection = await getCollection(username);
    }

    const ownership: CardDetailOwnership[] = cardData.map((card) => {
        const ownedCards: Card[] = [];
        let rented = false;
        if (username && collection) {
            const cards = collection.cards.filter((c) => c.card_detail_id === card.id);
            ownedCards.push(...cards);
            // Check if any card is listed for rent
            rented = cards.some((c) => c.market_listing_type === "RENT");
        }
        const owned: boolean = ownedCards.length > 0;

        return {
            ...card,
            owned,
            rented,
            cards: ownedCards.sort((a, b) => b.level - a.level)
        };
    });


    recommendedCards.appendChild(createCardList(ownership));
    contentDiv.appendChild(recommendedCards);

    panelDiv.appendChild(contentDiv);

    const historyHeaderDiv = document.querySelector('.history-header');
    if (historyHeaderDiv) {
        historyHeaderDiv.parentNode?.insertBefore(panelDiv, historyHeaderDiv.nextSibling);
    }
}
