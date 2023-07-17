import '../../styles/common.scss';
import '../../styles/modal.scss';
import '../../styles/panel.scss';

import { getCards } from 'src/common/splinter-plus';
import { getCardDetails, getCollection } from 'src/common/splinterlands';
import { getUsernameFromLocalStorage } from 'src/common/user';
import { convertToTitleCase, createCardItem, createContentHeader, createHeader, extractElementText, setValueInLocalStorage } from 'src/content-scripts/common/common';
import { CardResponse } from 'src/interfaces/spinter-plus.interface';
import { Card, CardDetail, CardDetailOwnership, Collection } from 'src/interfaces/splinterlands.interface';

const battleHistoryUrl = 'https://splinterlands.com/?p=battle_history';
let panelDiv: HTMLDivElement | null = null;
let format: string = '';
let league: string = '';

// Declare a flag to indicate if the button has been added
let buttonAdded = false;

function checkBattleHistoryUrl() {
    if (window.location.href === battleHistoryUrl) {
        return true;
    } else {
        return false;
    }
}

if (checkBattleHistoryUrl()) {

    const checkPanelExists = async () => {
        const historyHeaderDiv = document.querySelector('.history-header');
        const customPanelDiv = document.querySelector('.custom-panel');

        if (historyHeaderDiv && !customPanelDiv) {
            panelDiv = document.createElement('div');
            panelDiv.classList.add('custom-panel');
            historyHeaderDiv.parentNode?.insertBefore(panelDiv, historyHeaderDiv.nextSibling);

            observer.disconnect();
            await buildAndInsertPanel();
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Set the buttonAdded flag to true
            buttonAdded = true;
        }
    };

    const observer = new MutationObserver(() => {
        checkPanelExists();
    });

    checkPanelExists();

    // Check if the button hasn't been added after a certain interval
    const interval = setInterval(() => {
        if (!buttonAdded) {
            checkPanelExists();
        }
    }, 500);

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

async function createCardList(details: CardDetailOwnership[], format: string): Promise<HTMLDivElement> {
    const cardList = document.createElement('div');
    cardList.classList.add('card-list');

    for (const detail of details) {
        const cardItemElement = await createCardItem(detail, format, detail.avg_rating);
        cardList.appendChild(cardItemElement);
    }

    return cardList;
}

async function buildRecommendedCards(): Promise<HTMLDivElement> {

    document.addEventListener('purchaseCompleted', refreshCardsPanel);

    format = extractElementText('.bh-selectable-obj a.selected')
    setValueInLocalStorage('format', format);

    league = extractElementText('#current_league_text')
    league = convertToTitleCase(league);
    setValueInLocalStorage('league', league);

    const recommendedCards = document.createElement('div');
    recommendedCards.classList.add('recommended-cards');

    const cards: CardResponse = await getCards([99], [], [], league, format, 25);
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

    ownership.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));

    recommendedCards.appendChild(await createCardList(ownership, format));

    return recommendedCards;
}

export async function buildAndInsertPanel() {

    format = extractElementText('.bh-selectable-obj a.selected')
    setValueInLocalStorage('format', format);

    const headerDiv = createHeader("Recommended Collection", format);
    panelDiv?.appendChild(headerDiv);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('panel-content');

    const contentHeader = createContentHeader('Unlock your full potential in every battle with the ultimate collection handpicked for your league and collection! Based on our extensive analysis of thousands of battles, we recommend these cards.');
    contentDiv.appendChild(contentHeader);

    const recommendedCards = await buildRecommendedCards();
    contentDiv.appendChild(recommendedCards);

    panelDiv?.appendChild(contentDiv);
}

async function refreshCardsPanel() {

    if (panelDiv) {
        const cardDiv = panelDiv.querySelector('.recommended-cards');
        if (cardDiv) {
            cardDiv.remove();
        }

        const cards = await buildRecommendedCards();

        const contentDiv = panelDiv.querySelector('.panel-content');
        if (contentDiv) {
            contentDiv.appendChild(cards);
        }
    }
}
