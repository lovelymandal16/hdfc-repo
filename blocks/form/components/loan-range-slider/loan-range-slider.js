import { subscribe } from '../../rules/index.js';

function updateLoanSlider(input, element, config) {
  const value = parseInt(input.value); // Value in thousands
  const min = parseInt(input.min);
  const max = parseInt(input.max);
  const percent = ((value - min) / (max - min)) * 100;
  
  // Convert slider value to actual currency
  const actualValue = value;
  
  // Split point calculation
  const splitPoint = config.splitValue;
  const splitPercent = ((splitPoint - min) / (max - min)) * 100;
  
  const sliderTrack = element.querySelector('.slider-track');
  const sliderTrackOrange = element.querySelector('.slider-track-orange');
  const offerBadge = element.querySelector('.offer-badge');
  
  // Reset tracks
  sliderTrack.style.width = '0%';
  sliderTrackOrange.style.width = '0%';
  sliderTrackOrange.style.left = '0%';
  
  if (value <= splitPoint) {
    // Blue track follows thumb up to split point
    sliderTrack.style.width = percent + '%';
    // Update thumb color to blue
    document.documentElement.style.setProperty('--thumb-bg', '#2563eb');
  } else {
    // Blue track up to split point
    sliderTrack.style.width = splitPercent + '%';
    // Orange track from split point to current position
    sliderTrackOrange.style.left = splitPercent + '%';
    sliderTrackOrange.style.width = (percent - splitPercent) + '%';
    // Update thumb color to orange
    document.documentElement.style.setProperty('--thumb-bg', '#f59e0b');
  }

  // Update offer badge position
  offerBadge.style.left = splitPercent + '%';

  // Format currency value
  function formatCurrency(value) {
    if (value >= 100000) {
      return '₹' + (value / 100000) + 'L';
    } else {
      return '₹' + (value / 1000) + 'K';
    }
  }

  // Dispatch custom event for external listeners
  const event = new CustomEvent('loanSliderChange', {
    detail: {
      value: actualValue,
      formattedValue: formatCurrency(actualValue)
    }
  });
  input.dispatchEvent(event);
}

export default async function decorate(fieldDiv, fieldJson, container, formId) {
  const input = fieldDiv.querySelector('input');
  input.className = 'loan-slider';
  
  // Get configuration from fieldJson properties
  const config = {
    minValue: fieldJson?.properties?.minValue || 50000,
    maxValue: fieldJson?.properties?.maxValue || 1250000,
    splitValue: fieldJson?.properties?.splitValue || 400000,
    defaultValue: fieldJson?.properties?.default || 400000,
    minLabel: fieldJson?.properties?.minLabel || '₹50K',
    maxLabel: fieldJson?.properties?.maxLabel || '₹12.5L',
    offerText: fieldJson?.properties?.offerText || 'Pre-approved offer:4L',
    stepValue :fieldJson?.properties?.stepValue || 1000
  };

  // Modify the input type to range
  input.type = 'range';
  input.min = config.minValue; // Convert to thousands for slider
  input.max = config.maxValue;
  input.value = config.defaultValue;
  input.step = fieldJson?.properties?.stepValue || 1000;

  // Create wrapper div for the loan range slider
  const div = document.createElement('div');
  div.className = 'loan-range-slider-wrapper decorated';
  input.after(div);

  // Create slider container
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-container';

  // Create slider background
  const sliderBackground = document.createElement('div');
  sliderBackground.className = 'slider-background';

  // Create track elements
  const sliderTrack = document.createElement('div');
  sliderTrack.className = 'slider-track';

  const sliderTrackOrange = document.createElement('div');
  sliderTrackOrange.className = 'slider-track-orange';

  // Create offer badge
  const offerBadge = document.createElement('span');
  offerBadge.className = 'offer-badge';
  offerBadge.textContent = config.offerText;

  // Create range labels
  const rangeLabels = document.createElement('div');
  rangeLabels.className = 'range-labels';
  
  const minLabel = document.createElement('span');
  minLabel.textContent = config.minLabel;
  
  const maxLabel = document.createElement('span');
  maxLabel.textContent = config.maxLabel;
  
  rangeLabels.appendChild(minLabel);
  rangeLabels.appendChild(maxLabel);

  // Assemble slider container
  sliderContainer.appendChild(sliderBackground);
  sliderContainer.appendChild(sliderTrack);
  sliderContainer.appendChild(sliderTrackOrange);
  sliderContainer.appendChild(offerBadge);

  // Assemble wrapper
  div.appendChild(sliderContainer);
  div.appendChild(input);
  div.appendChild(rangeLabels);

  // Add event listener
  input.addEventListener('input', (e) => {
    updateLoanSlider(e.target, div, config);
  });

  // // Add smooth transitions
  // sliderTrack.style.transition = 'width 0.05s ease';
  // sliderTrackOrange.style.transition = 'width 0.05s ease, left 0.05s ease';

  // Initialize slider
  updateLoanSlider(input, div, config);

  // Subscribe to field changes
  subscribe(fieldDiv, formId, (_fieldDiv, fieldModel) => {
    fieldModel.subscribe((e) => {
      const changes = e.payload?.changes || [];
      let configUpdated = false;
      
      // Process each change in the array
      changes.forEach(change => {
        const { propertyName, currentValue } = change;
        
        // Handle value changes
        if (propertyName === 'value') {
          input.value = currentValue;
          updateLoanSlider(input, div, config);
        }
        // Handle property changes
        else if (propertyName && propertyName.startsWith('properties.')) {
          // Extract the property name after 'properties.'
          const propName = propertyName.split('.')[1];
          
          switch (propName) {
            case 'minValue':
              config.minValue = currentValue;
              input.min = config.minValue;
              configUpdated = true;
              break;
              
            case 'maxValue':
              config.maxValue = currentValue;
              input.max = config.maxValue;
              configUpdated = true;
              break;
              
            case 'splitValue':
              config.splitValue = currentValue;
              configUpdated = true;
              break;
              
            case 'default':
              config.defaultValue = currentValue;
                input.value = config.defaultValue;
                configUpdated = true;
              break;
              
            case 'minLabel':
              config.minLabel = currentValue;
              const minLabel = div.querySelector('.range-labels span:first-child');
              if (minLabel) minLabel.textContent = config.minLabel;
              break;
              
            case 'maxLabel':
              config.maxLabel = currentValue;
              const maxLabel = div.querySelector('.range-labels span:last-child');
              if (maxLabel) maxLabel.textContent = config.maxLabel;
              break;
              
            case 'offerText':
              config.offerText = currentValue;
              const offerBadge = div.querySelector('.offer-badge');
              if (offerBadge) offerBadge.textContent = config.offerText;
              break;
              
            case 'stepValue':
              config.stepValue = currentValue;
              input.step = config.stepValue;
              configUpdated = true;
              break;
              
            default:
              // Handle any other properties if needed
              break;
          }
        }
      });
      
      // Update the slider if any config that affects the visual display was changed
      if (configUpdated) {
        updateLoanSlider(input, div, config);
      }
    }, 'change');
  });

  return fieldDiv;
}
