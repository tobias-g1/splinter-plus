import '../../styles/common.scss';
import '../../styles/deck.scss';
import '../../styles/modal.scss';
import { createHeader } from '../common/common';

const battleHistoryUrl = 'https://splinterlands.com/?p=create_team2';
let format: string = 'wild';
let panelAdded = false; // Flag to track if the panel has been added

// Check if the current page is the battle history page
if (window.location.href === battleHistoryUrl) {

  // Function to check for the existence of the panel and add it if it doesn't already exist
  const checkPanelExists = async () => {
    const battleContainer = document.querySelector('.deck-builder-page2__filters');

    // Check if the battleContainer exists and the panel has not been added
    if (battleContainer && !panelAdded) {
      // Check if the panel already exists
      if (!battleContainer.querySelector('.panel-content')) {
        const panel = document.createElement('div');
        panel.classList.add('deck-panel');
        const headerDiv = createHeader("Recommended Deck", format);
        panel.appendChild(headerDiv);

        const panelWrapper = document.createElement('div');
        panelWrapper.classList.add('panel-content');
        panelWrapper.appendChild(panel);

        const recommendedCards = document.createElement('div');
        recommendedCards.classList.add('recommended-cards');

        /* const decks: DeckResponse = await getDecks(99, ["Standard"], [], 'Novice', 'modern', 1, 0);
        const deck = decks.decks[0];
        const cardIds: number[] = [];
        for (const property in deck) {
          if (property.startsWith('monster') || property === 'summoner_id') {
            const cardId = deck[property as keyof typeof deck];
            if (typeof cardId === 'number') {
              cardIds.push(cardId);
            }
          }
        }

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
            avg_rating: null
          };
        });

        // Create and append card items to the recommendedCards div
        for (const card of ownership) {
          const cardItem = await createCardItem(card, format, card.avg_rating);
          recommendedCards.appendChild(cardItem);
        }

        panel.appendChild(recommendedCards); */
        panelWrapper.appendChild(panel);
        battleContainer.appendChild(panelWrapper);

        panelAdded = true;
        observer.disconnect(); // Disconnect the observer after adding the panel
      }
    }
  };

  // Call the checkPanelExists function on initial load
  window.onload = checkPanelExists;

  // Watch for changes to the DOM and check for the existence of the panel on each change
  const observer = new MutationObserver(() => {
    if (!panelAdded) {
      checkPanelExists();
    } else {
      observer.disconnect();
    }
  });

  // Start observing changes in the document body
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
