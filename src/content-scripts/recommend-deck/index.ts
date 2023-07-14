import { getDecks } from 'src/common/splinter-plus';
import { getCardDetails, getCollection } from 'src/common/splinterlands';
import { getUsernameFromLocalStorage } from 'src/common/user';
import { DeckResponse } from 'src/interfaces/spinter-plus.interface';
import { Card, CardDetail, CardDetailOwnership, Collection } from 'src/interfaces/splinterlands.interface';
import '../../styles/common.scss';
import '../../styles/deck.scss';
import '../../styles/modal.scss';
import { createCardItem, createHeader, extractElementText, getValueFromLocalStorage } from '../common/common';

const selectTeamUrl = 'https://splinterlands.com/?p=create_team2';
let panelAdded = false;

// Check if the current page is the battle history page
if (window.location.href === selectTeamUrl) {

  // Function to check for the existence of the panel and add it if it doesn't already exist
  const checkPanelExists = async () => {


    const battleContainer = document.querySelector('.deck-builder-page2__filters');
    // Check if the battleContainer exists and the panel has not been added
    if (battleContainer && !panelAdded) {

      panelAdded = true;
      // Check if the panel already exists
      const existingPanel = battleContainer.querySelector('.deck-panel');
      if (!existingPanel) {

        const league: string = await getValueFromLocalStorage('league');
        const format: string = await getValueFromLocalStorage('format');
        const mana = extractElementText('.mana-cap')

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

        const panel = document.createElement('div');
        panel.classList.add('deck-panel');

        const headerDiv = createHeader("Recommended Deck", format);
        panel.appendChild(headerDiv);

        const panelContent = document.createElement('div');
        panelContent.classList.add('panel-content');

        const recommendedCards = document.createElement('div');
        recommendedCards.classList.add('recommended-cards');

        const decks: DeckResponse = await getDecks(parseInt(mana), [ruleset], filteredElements, league, format, 1, 0);
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

        panelContent.appendChild(recommendedCards);
        panel.appendChild(panelContent);
        battleContainer.appendChild(panel);

        panelAdded = true;
        observer.disconnect();
      } else {
        panelAdded = true;
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