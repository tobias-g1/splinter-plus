import '../../styles/common.scss';
import '../../styles/deck.scss';
import '../../styles/modal.scss';

import { getDecks } from 'src/common/splinter-plus';
import { getCardDetails, getCollection } from 'src/common/splinterlands';
import { getUsernameFromLocalStorage } from 'src/common/user';
import { DeckResponse } from 'src/interfaces/spinter-plus.interface';
import { Card, CardDetail, CardDetailOwnership, Collection } from 'src/interfaces/splinterlands.interface';
import { createCardItem, createContentHeader, createHeader, createLoadingIndicator, createResultContent, extractElementText, getValueFromLocalStorage } from '../common/common';

const selectTeamUrl = 'https://splinterlands.com/?p=create_team2';
let panelAdded = false;
let observer: MutationObserver | null = null;
let panel: HTMLDivElement | null = null;

// Function to check for the existence of the panel and add it if it doesn't already exist
const checkPanelExists = async () => {
  const battleContainer = document.querySelector('.deck-builder-page2__conflict');

  // Check if the battleContainer exists and the panel has not been added
  if (battleContainer && !panelAdded) {
    panelAdded = true;

    // Check if the panel already exists
    const existingPanel = battleContainer.querySelector('.deck-panel');
    if (!existingPanel) {

      document.addEventListener('purchaseCompleted', requestRefresh);

      const format: string = await getValueFromLocalStorage('format');

      panel = document.createElement('div');
      panel.classList.add('deck-panel');

      const headerDiv = createHeader('Recommended Deck', format);
      panel.appendChild(headerDiv);

      const panelContent = document.createElement('div');
      panelContent.classList.add('panel-content');

      panel.appendChild(panelContent);

      const contentHeader = createContentHeader(
        'Discover the ultimate deck tailored to your ruleset, splinters, mana, league, and game format. Our expert analysis has identified the top-performing decks, ensuring you have access to the very best. Choose from the options below to purchase or rent the cards you need to dominate the game.'
      );
      panelContent.appendChild(contentHeader);

      battleContainer.appendChild(panel);

      const recommendedCards = await buildRecommendedCards();

      panelContent.appendChild(recommendedCards);

      if (observer) {
        observer.disconnect();
      }
    }
  } else {
    setTimeout(checkPanelExists, 1000);
  }
};

// Function to observe changes in the DOM and trigger the logic when required elements are added
const observeDOMChanges = () => {
  observer = new MutationObserver(() => {
    checkPanelExists();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// Check if the current page is the battle history page
if (window.location.href === selectTeamUrl) {
  // Call the checkPanelExists function on initial load
  window.onload = () => {
    checkPanelExists();
  };

  // Start observing changes in the DOM
  observeDOMChanges();
}

console.log('Script loaded');

async function buildRecommendedCards(): Promise<HTMLDivElement> {
  document.addEventListener('purchaseCompleted', refreshDeckPanel);

  const recommendedCards = document.createElement('div');
  recommendedCards.classList.add('recommended-cards');

  let league: string = await getValueFromLocalStorage('league');
  const format: string = await getValueFromLocalStorage('format');
  const mana: string = extractElementText('.mana-cap');

  // Extract Ruleset
  const createTeamRulesetDiv: any = document.querySelector('#create-team-ruleset > div > div > img');
  const originalTitle: any = createTeamRulesetDiv.getAttribute('data-original-title');
  const trimmedText: any = originalTitle.split('-')[0].trim();
  const ruleset = trimmedText;

  // Extract Elements
  const elementsDiv: any = document.querySelector('#create-team-splinters > .splinter-grid');
  const splinterElements: any = elementsDiv.querySelectorAll('.splinter');
  const filteredElements: string[] = [];

  splinterElements.forEach((splinterElement: any) => {
    const originalTitle = splinterElement.querySelector('img').getAttribute('data-original-title');
    if (originalTitle.includes('Active')) {
      // Filter out the ": Active" part and add to the array
      const filteredElement = originalTitle.split(': Active')[0].trim();
      filteredElements.push(filteredElement);
    }
  });

  let decks: DeckResponse;
  let loadingIndicator: HTMLElement = createLoadingIndicator(`We're loading your recommended deck for this battle.`);
  let resultContainer: HTMLElement = createResultContent('Oops, something went wrong', 'An unexpected error occurred. Please try again later.', null, null);
  const content = document.querySelector('.panel-content');

  try {
    content?.appendChild(loadingIndicator);
    decks = await getDecks(parseInt(mana), [ruleset], filteredElements, league, format, 1, 0);
  } catch (error) {
    loadingIndicator.remove();
    content?.appendChild(resultContainer);
    console.error('An error occurred in getCards:', error);
    throw error;
  }

  loadingIndicator.remove();

  const deck = decks.decks[0];
  const cardIds: number[] = [];
  const cardKeys: string[] = [];

  if ('summoner_id' in deck) {
    const summonerId = deck['summoner_id'];
    if (typeof summonerId === 'number') {
      cardIds.push(summonerId);
      cardKeys.push('Summoner');
    }
  }

  for (const property in deck) {
    if (property.startsWith('monster') || property === 'summoner_id') {
      const cardId = deck[property as keyof typeof deck];
      if (typeof cardId === 'number') {
        cardIds.push(cardId);
        cardKeys.push('Monster ' + (parseInt(property.slice(7)) + 1));
      }
    }
  }

  const cardData: CardDetail[] = await getCardDetails(cardIds);
  const username: string | null = await getUsernameFromLocalStorage();

  let collection: Collection | null = null;
  if (username) {
    collection = await getCollection(username);
  }

  const ownership: CardDetailOwnership[] = cardData.map((card, index) => {
    const ownedCards: Card[] = [];
    if (username && collection) {
      const cards = collection.cards.filter((c) => c.card_detail_id === card.id);
      ownedCards.push(...cards);
    }

    return {
      ...card,
      cards: ownedCards.sort((a, b) => b.level - a.level),
      key: cardKeys[index], // Using the corresponding key from cardKeys array
    };
  });

  // Create and append card items to the recommendedCards div
  for (const card of ownership) {
    const cardItem = await createCardItem(card, format, card.avg_rating);
    recommendedCards.appendChild(cardItem);
  }

  return recommendedCards;
}

async function refreshDeckPanel() {
  if (panel) {
    const cardDiv = panel.querySelector('.recommended-cards');
    if (cardDiv) {
      cardDiv.remove();
    }

    const cards = await buildRecommendedCards();

    const contentDiv = panel.querySelector('.panel-content');
    if (contentDiv) {
      contentDiv.appendChild(cards);
    }
  }
}

async function requestRefresh() {
  const refreshChoice = confirm("To make your newly purchased/rented cards available for battle, please refresh the page. Click 'OK' to do so now.");

  if (refreshChoice) {
    location.reload();
  }
}

checkPanelExists();

console.log('Recommneded Deck Loaded.')