import { addCombineButton } from "src/content-scripts/combine/add-button";
import { CombineModal } from "../common/combine-modal";
import '../common/modal.scss';

let combineModal: CombineModal;

const checkButtonsExist = (): void => {
  const buttonsDivs = document.querySelectorAll('.buttons, .c-PJLV-ifKYhuQ-css > .c-PJLV-ihmcGFm-css');

  if (buttonsDivs.length && !document.getElementById('btn_combine_sp')) {
    addCombineButton();
    console.log('Conversion button added.');
  }
};

const getSelectedCards = (): NodeListOf<Element> | Element[] | null => {
  const checkedBoxesNew = document.querySelectorAll('.c-gyOReJ.c-dcDALJ.c-gyOReJ-crmSPl-adjusted-true:checked:not(#check_all)');

  if (checkedBoxesNew.length) {
    return Array.from(checkedBoxesNew).map(checkbox => checkbox.closest('tr')).filter(el => el !== null) as Element[];
  }

  const checkedBoxesLegacy = document.querySelectorAll('.card-checkbox.checked:not(#check_all)');

  if (checkedBoxesLegacy.length) {
    return checkedBoxesLegacy;
  }

  return null;
};

const getCardIds = (selectedCards: NodeListOf<Element> | Element[]): string => {
  return Array.from(selectedCards).map(card => {
    if (card instanceof HTMLTableRowElement) {
      const tds = card.querySelectorAll('td');
      return tds.length > 1 ? tds[tds.length - 3].textContent : '';
    } else if (card instanceof HTMLElement) {
      return card.getAttribute('card_id') || '';
    }
  }).filter(Boolean).join(',');
};

export const launchCollectionModal = (): void => {
  const selectedCards = getSelectedCards();

  if (!selectedCards || selectedCards.length === 0) {
    alert('Oops! No cards have been selected for combining. Please choose at least one card to proceed.');
    return;
  }

  const cardIds = getCardIds(selectedCards);

  combineModal = new CombineModal();

  combineModal.launchModal(cardIds);
}

checkButtonsExist();

const observer = new MutationObserver(checkButtonsExist);

observer.observe(document.body, { childList: true, subtree: true });

console.log('Content script loaded successfully.');
