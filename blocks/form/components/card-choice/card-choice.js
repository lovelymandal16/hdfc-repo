import { subscribe } from '../../rules/index.js';

export default function decorate(element, fieldJson, container, formId) {
  let currentCarouselPosition = 0;
  let totalCards = 0;
  const { expandButtonLabel, collapseButtonLabel } = fieldJson.properties;

  function updateCarouselPosition(direction) {
    const cardsContainer = element.querySelector('.card-choice-container');
    if (!cardsContainer) return;
    const stepSize = 3;
    // Calculate the new position
    let newPosition = currentCarouselPosition + direction * stepSize;
    newPosition = Math.max(0, Math.min(newPosition, totalCards - 1));
    currentCarouselPosition = newPosition;
    // Apply transform to slide cards
    const translateX = -currentCarouselPosition * (100 / totalCards);
    cardsContainer.style.transform = `translateX(${translateX}%)`;
    // Show/hide arrow buttons
    const leftButton = element.querySelector('.card-choice-carousel-left');
    const rightButton = element.querySelector('.card-choice-carousel-right');
    if (leftButton) leftButton.style.display = currentCarouselPosition > 0 ? 'inline-block' : 'none';
    if (rightButton) rightButton.style.display = currentCarouselPosition < totalCards - 1 ? 'inline-block' : 'none';
  }

  function populateCards(cardsData) {
    const blacklist = ['Link', 'consent'];
    // Create a container for the cards
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'card-choice-container collapse';
    const features = document.querySelector('fieldset.field-featureswrapper');

    // Reset carousel position
    currentCarouselPosition = 0;
    totalCards = cardsData.length;

    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'card-choice-toggle';
    toggleButton.textContent = expandButtonLabel || 'View More Details';
    toggleButton.type = 'button';

    // Create cards carousel navigation buttons
    const leftButton = document.createElement('button');
    leftButton.className = 'card-choice-carousel-left';
    leftButton.textContent = '←';
    leftButton.type = 'button';
    leftButton.style.display = 'none';
    const rightButton = document.createElement('button');
    rightButton.className = 'card-choice-carousel-right';
    rightButton.textContent = '→';
    rightButton.type = 'button';
    rightButton.style.display = totalCards > 1 ? 'inline-block' : 'none';
    // Add click event to toggle classes
    toggleButton.addEventListener('click', () => {
      if (cardsContainer.classList.contains('expand')) {
        cardsContainer.classList.remove('expand');
        cardsContainer.classList.add('collapse');
        features?.classList.remove('expand');
        features?.classList.add('collapse');
        toggleButton.textContent = expandButtonLabel || 'View More Details';
      } else {
        cardsContainer.classList.remove('collapse');
        cardsContainer.classList.add('expand');
        features?.classList.remove('collapse');
        features?.classList.add('expand');
        toggleButton.textContent = collapseButtonLabel || 'View Less';
      }
    });

    // Add click events to carousel buttons
    leftButton.addEventListener('click', () => updateCarouselPosition(-1));
    rightButton.addEventListener('click', () => updateCarouselPosition(1));

    // Create a radio group name
    const radioName = `card-choice-group-${Math.random().toString(36).substr(2, 9)}`;

    cardsData.forEach((card, idx) => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'card-choice-card';
      if (card.recommended) cardDiv.classList.add('recommended');

      // Radio input
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = radioName;
      radio.dataset.fieldType = 'radio-group';
      radio.dataset.index = idx;
      radio.className = 'card-choice-radio';
      if (idx === 0) radio.checked = true;
      cardDiv.appendChild(radio);

      // Recommended badge
      if (card.recommended) {
        const badge = document.createElement('div');
        badge.className = 'card-choice-recommended';
        badge.textContent = 'Recommended';
        cardDiv.appendChild(badge);
      }

      // Card title (if present)
      if (card.Account) {
        const title = document.createElement('div');
        title.className = 'card-choice-title';
        title.textContent = card.Account;
        cardDiv.appendChild(title);
      }

      // Card features
      const featuresList = document.createElement('ul');
      featuresList.className = 'card-choice-features';
      Object.entries(card).forEach(([key, value]) => {
        if (!blacklist.includes(key) && key !== 'Account') {
          const feature = document.createElement('li');
          feature.className = 'card-choice-feature';
          feature.innerHTML = `</span> <span class='feature-value'>${value}</span>`;
          featuresList.appendChild(feature);
        }
      });
      cardDiv.appendChild(featuresList);

      cardsContainer.appendChild(cardDiv);
    });

    // Clear and append
    element.innerHTML = '';
    element.appendChild(cardsContainer);
    element.appendChild(toggleButton);
    element.appendChild(leftButton);
    element.appendChild(rightButton);
    // Initialize arrow button visibility
    leftButton.style.display = 'none';
    rightButton.style.display = totalCards > 1 ? 'inline-block' : 'none';
  }

  subscribe(element, formId, (fieldDiv, fieldModel) => {
    fieldModel.subscribe((e) => {
      const { payload } = e;
      payload?.changes?.forEach((change) => {
        const { propertyName, currentValue } = change;
        if (propertyName === 'enum') {
          populateCards(currentValue);
          fieldModel.value = fieldModel.enum?.[0]; // set the first value as the default value
        }
      });
    });

    element.addEventListener('change', (e) => {
      e.stopPropagation();
      const value = fieldModel.enum?.[parseInt(e.target.dataset.index, 10)];
      fieldModel.value = value;
    });
  });

  return element;
}