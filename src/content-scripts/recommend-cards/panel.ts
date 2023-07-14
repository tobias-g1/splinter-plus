import { getCards } from 'src/common/splinter-plus';
import { getCardDetails, getCollection } from 'src/common/splinterlands';
import { getUsernameFromLocalStorage } from 'src/common/user';
import { createCardItem, createHeader } from 'src/content-scripts/common/common';
import { CardResponse } from 'src/interfaces/spinter-plus.interface';
import { Card, CardDetail, CardDetailOwnership, Collection } from 'src/interfaces/splinterlands.interface';

async function createCardList(details: CardDetailOwnership[], format: string): Promise<HTMLDivElement> {
    const cardList = document.createElement('div');
    cardList.classList.add('card-list');

    for (const detail of details) {
        const cardItemElement = await createCardItem(detail, format, detail.avg_rating);
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

    return contentHeader;
}

export async function buildAndInsertPanel(format: string) {
    console.log(`Building and inserting panel for format: ${format}`);

    const panelDiv = document.createElement('div');
    panelDiv.classList.add('custom-panel');

    const headerDiv = createHeader("Recommended Collection", format);
    panelDiv.appendChild(headerDiv);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('panel-content');

    const contentHeader = createContentHeader();
    contentDiv.appendChild(contentHeader);

    const recommendedCards = document.createElement('div');
    recommendedCards.classList.add('recommended-cards');

    const cards: CardResponse = await getCards(
        [99], [], [], "Novice", format, 15
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
        if (username && collection) {
            const cards = collection.cards.filter((c) => c.card_detail_id === card.id);
            ownedCards.push(...cards);
        }

        return {
            ...card,
            cards: ownedCards.sort((a, b) => b.level - a.level),
            avg_rating: cards.cards.find(c => c.card_id === card.id)?.avg_rating || 0
        };
    });

    recommendedCards.appendChild(await createCardList(ownership, format));
    contentDiv.appendChild(recommendedCards);

    panelDiv.appendChild(contentDiv);

    const historyHeaderDiv = document.querySelector('.history-header');
    if (historyHeaderDiv) {
        historyHeaderDiv.parentNode?.insertBefore(panelDiv, historyHeaderDiv.nextSibling);
    }
}
