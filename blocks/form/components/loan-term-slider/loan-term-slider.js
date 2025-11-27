import { subscribe } from '../../rules/index.js';

/**
 * Creates the term markers/labels for the slider
 * @param {Array} terms - Array of term objects with value and label
 * @returns {HTMLDivElement} - The terms container element
 */
function createTermMarkers(terms) {
  const termsContainer = document.createElement('div');
  termsContainer.className = 'loan-term-slider-terms';
  
  terms.forEach((term) => {
    const termElement = document.createElement('div');
    termElement.className = 'loan-term-slider-term';
    termElement.dataset.value = term.value;
    
    const marker = document.createElement('div');
    marker.className = 'loan-term-slider-marker';
    
    const label = document.createElement('span');
    label.className = 'loan-term-slider-label';
    label.textContent = term.label;
    
    termElement.appendChild(marker);
    termElement.appendChild(label);
    termsContainer.appendChild(termElement);
  });
  
  return termsContainer;
}

/**
 * Creates the disbursement label element
 * @param {string} disbursementLabel - The label text
 * @returns {HTMLDivElement} - The disbursement label element
 */
function createDisbursementLabel(disbursementLabel) {
  const labelContainer = document.createElement('div');
  labelContainer.className = 'loan-term-slider-disbursement';
  labelContainer.textContent = disbursementLabel;
  return labelContainer;
}

/**
 * Creates the slider track with indicator
 * @param {string} activeColor - Color for the active part of the track
 * @param {string} inactiveColor - Color for the inactive part of the track
 * @returns {HTMLDivElement} - The track container element
 */
function createSliderTrack(activeColor, inactiveColor) {
  const trackContainer = document.createElement('div');
  trackContainer.className = 'loan-term-slider-track-container';
  
  const track = document.createElement('div');
  track.className = 'loan-term-slider-track';
  track.style.setProperty('--active-color', activeColor);
  track.style.setProperty('--inactive-color', inactiveColor);
  
  const indicator = document.createElement('div');
  indicator.className = 'loan-term-slider-indicator';
  indicator.style.backgroundColor = activeColor;
  
  trackContainer.appendChild(track);
  trackContainer.appendChild(indicator);
  
  return trackContainer;
}

/**
 * Updates the slider UI based on the current value
 * @param {HTMLElement} sliderContainer - The slider container element
 * @param {HTMLInputElement} input - The range input element
 * @param {Array} terms - Array of term objects with value and label
 */
function updateSliderUI(sliderContainer, input, terms) {
  const currentValue = parseInt(input.value, 10);
  
  // Find the closest term value
  let closestTerm = terms[0];
  let minDiff = Math.abs(currentValue - terms[0].value);
  
  terms.forEach(term => {
    const diff = Math.abs(currentValue - term.value);
    if (diff < minDiff) {
      minDiff = diff;
      closestTerm = term;
    }
  });
  
  // Update input value to match the closest term
  input.value = closestTerm.value;
  
  // Calculate position percentage
  const min = parseInt(input.min, 10);
  const max = parseInt(input.max, 10);
  const range = max - min;
  const percentage = ((closestTerm.value - min) / range) * 100;
  
  // Update the indicator position
  const indicator = sliderContainer.querySelector('.loan-term-slider-indicator');
  if (indicator) {
    indicator.style.left = `${percentage}%`;
  }
  
  // Update the track fill
  const track = sliderContainer.querySelector('.loan-term-slider-track');
  if (track) {
    track.style.setProperty('--percentage', `${percentage}%`);
  }
  
  // Update active term markers
  const termElements = sliderContainer.querySelectorAll('.loan-term-slider-term');
  termElements.forEach((termEl) => {
    const termValue = parseInt(termEl.dataset.value, 10);
    if (termValue <= closestTerm.value) {
      termEl.classList.add('active');
    } else {
      termEl.classList.remove('active');
    }
  });
}

export default function decorate(fieldDiv, fieldJson, container, formId) {
  // Get properties from the field JSON
  const { 
    terms = [], 
    disbursementLabel = 'Direct disbursement',
    activeColor = '#0044cc',
    inactiveColor = '#cccccc'
  } = fieldJson?.properties || {};
  
  // Find the range input element
  const input = fieldDiv.querySelector('input[type="range"]');
  if (!input) return fieldDiv;
  
  // Set up the input with the terms values
  const termsArray = Array.isArray(terms) ? terms : [];
  if (termsArray.length > 0) {
    input.min = termsArray[0].value;
    input.max = termsArray[termsArray.length - 1].value;
    
    // Set step to the smallest difference between consecutive terms
    let minStep = Infinity;
    for (let i = 1; i < termsArray.length; i++) {
      const diff = termsArray[i].value - termsArray[i - 1].value;
      if (diff < minStep) minStep = diff;
    }
    input.step = minStep;
    
    // Set default value if not already set
    if (!input.value || input.value === '0') {
      input.value = termsArray[Math.floor(termsArray.length / 2)].value;
    }
  }
  
  // Create a container for our custom slider
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'loan-term-slider-container';
  
  // Create and add the slider track with indicator
  const trackContainer = createSliderTrack(activeColor, inactiveColor);
  sliderContainer.appendChild(trackContainer);
  
  // Create and add the term markers
  const termsContainer = createTermMarkers(termsArray);
  sliderContainer.appendChild(termsContainer);
  
  // Create and add the disbursement label
  const disbursementElement = createDisbursementLabel(disbursementLabel);
  sliderContainer.appendChild(disbursementElement);
  
  // Hide the original input visually but keep it in the DOM for form submission
  input.classList.add('loan-term-slider-input');
  sliderContainer.appendChild(input);
  
  // Replace the original input's parent with our custom slider
  const inputParent = input.parentElement;
  inputParent.replaceChild(sliderContainer, input);
  
  // Add event listeners
  input.addEventListener('input', () => {
    updateSliderUI(sliderContainer, input, termsArray);
  });
  
  input.addEventListener('change', () => {
    updateSliderUI(sliderContainer, input, termsArray);
  });
  
  // Initialize the display
  updateSliderUI(sliderContainer, input, termsArray);
  
  // Subscribe to field changes
  subscribe(fieldDiv, formId, (_fieldDiv, fieldModel) => {
    fieldModel.subscribe((e) => {
      if (e.payload?.changes?.value !== undefined) {
        input.value = e.payload.changes.value;
        updateSliderUI(sliderContainer, input, termsArray);
      }
    }, 'change');
  });
  
  return fieldDiv;
}
