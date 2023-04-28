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
    description.innerText = 'Your description text goes here.';

    // Append the description to the content container
    contentDiv.appendChild(description);

    // Append the content container to the panel
    panelDiv.appendChild(contentDiv);

    // Insert the new div after the history-header div
    const historyHeaderDiv = document.querySelector('.history-header');
    if (historyHeaderDiv) {
        historyHeaderDiv.parentNode?.insertBefore(panelDiv, historyHeaderDiv.nextSibling);
    }
}
