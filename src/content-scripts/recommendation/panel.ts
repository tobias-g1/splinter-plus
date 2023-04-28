import elementsData from '../../json/elements.json';

function createHeader() {
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header-wrapper');

    const header = document.createElement('span');
    header.classList.add('header');
    header.innerText = 'Recommended Deck';
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


function createCardItem() {
    const cardItem = document.createElement('div');
    cardItem.classList.add('card-item');

    const cardImage = document.createElement('img');
    cardImage.classList.add('card-img');
    cardImage.src = `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/beta/Spineback%20Turtle_lv4_gold.png`;
    cardItem.appendChild(cardImage);

    const cardButtons = document.createElement('div');
    cardButtons.classList.add('card-buttons');

    const buyButton = document.createElement('button');
    buyButton.classList.add('buy-button');
    buyButton.innerText = 'Buy';
    cardButtons.appendChild(buyButton);

    const rentButton = document.createElement('button');
    rentButton.classList.add('rent-button');
    rentButton.innerText = 'Rent';
    cardButtons.appendChild(rentButton);

    cardItem.appendChild(cardButtons);

    return cardItem;
}

function createCardList() {
    const cardList = document.createElement('div');
    cardList.classList.add('card-list');

    for (let i = 1; i <= 12; i++) {
        cardList.appendChild(createCardItem());
    }

    return cardList;
}

function createContentHeader() {
    const contentHeader = document.createElement('div');

    const description = document.createElement('p');
    description.innerText = 'Unlock your full potential in every battle with the ultimate deck handpicked just for you! Based on our extensive analysis of thousands of battles, we recommend this deck specifically tailored for your league and game mode selection. Get ready to dominate the competition like never before!';

    contentHeader.append(description)

    contentHeader.classList.add('content-header');

    const options = document.createElement('div');
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

    contentHeader.appendChild(options);

    return contentHeader;
}


export function buildAndInsertPanel(format: string) {
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
    recommendedCards.appendChild(createCardList());
    contentDiv.appendChild(recommendedCards);

    panelDiv.appendChild(contentDiv);

    const historyHeaderDiv = document.querySelector('.history-header');
    if (historyHeaderDiv) {
        historyHeaderDiv.parentNode?.insertBefore(panelDiv, historyHeaderDiv.nextSibling);
    }
}

