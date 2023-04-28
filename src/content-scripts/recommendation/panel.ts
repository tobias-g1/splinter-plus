export function buildAndInsertPanel(format: string) {
    console.log(`Building and inserting panel for format: ${format}`);

    // Create a new div with the required styles and functionality
    const panelDiv = document.createElement('div');
    panelDiv.classList.add('custom-panel');
    panelDiv.onclick = () => {
        panelDiv.classList.toggle('expanded');
    };

    // Create the header with the specified class and styles
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header');
    headerDiv.innerText = 'Recommended Deck';

    // Append the header to the panel
    panelDiv.appendChild(headerDiv);

    // Create the expandable content container
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('panel-content');

    // Create the description element
    const description = document.createElement('p');
    description.innerText = 'Unlock your full potential in every battle with the ultimate deck handpicked just for you! Based on our extensive analysis of thousands of battles, we recommend this deck specifically tailored for your league and game mode selection. Get ready to dominate the competition like never before!';

    // Append the description to the content container
    contentDiv.appendChild(description);

    // Create the recommended cards container
    const recommendedCards = document.createElement('div');
    recommendedCards.classList.add('recommended-cards');

    // Create the card list
    const cardList = document.createElement('div');
    cardList.classList.add('card-list');

    // Create the card items
    for (let i = 1; i <= 12; i++) {
        const cardItem = document.createElement('div');
        cardItem.classList.add('card-item');

        // Create the card image
        const cardImage = document.createElement('img');
        cardImage.classList.add('card-img');
        cardImage.src = `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/beta/Spineback%20Turtle_lv4_gold.png`;

        // Create the card buttons
        const cardButtons = document.createElement('div');
        cardButtons.classList.add('card-buttons');

        // Create the buy button
        const buyButton = document.createElement('button');
        buyButton.classList.add('buy-button');
        buyButton.innerText = 'Buy';

        // Create the rent button
        const rentButton = document.createElement('button');
        rentButton.classList.add('rent-button');
        rentButton.innerText = 'Rent';

        // Append the buttons to the card buttons container
        cardButtons.appendChild(buyButton);
        cardButtons.appendChild(rentButton);

        // Append the card image and buttons to the card item
        cardItem.appendChild(cardImage);
        cardItem.appendChild(cardButtons);

        // Append the card item to the card list
        cardList.appendChild(cardItem);
    }

    // Append the card list to the recommended cards container
    recommendedCards.appendChild(cardList);

    // Append the recommended cards container to the content container
    contentDiv.appendChild(recommendedCards);

    // Append the content container to the panel
    panelDiv.appendChild(contentDiv);

    // Insert the new div after the history-header div
    const historyHeaderDiv = document.querySelector('.history-header');
    if (historyHeaderDiv) {
        historyHeaderDiv.parentNode?.insertBefore(panelDiv, historyHeaderDiv.nextSibling);
    }


}
