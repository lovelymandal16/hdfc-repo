function updateLoanSliderWithTicks(input, element, config) {
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
  const offerBadge = element.querySelector('.stepper-offer-badge');
  
  // Reset tracks
  sliderTrack.style.width = '0%';
  sliderTrackOrange.style.width = '0%';
  sliderTrackOrange.style.left = '0%';
  
  if (value <= splitPoint) {
    // Blue track follows thumb up to split point
    sliderTrack.style.width = percent + '%';
    // Update thumb color to blue
    document.documentElement.style.setProperty('--thumb-bg-stepper', '#2563eb');
  } else {
    // Blue track up to split point
    sliderTrack.style.width = splitPercent + '%';
    // Orange track from split point to current position
    sliderTrackOrange.style.left = splitPercent + '%';
    sliderTrackOrange.style.width = (percent - splitPercent) + '%';
    // Update thumb color to orange
    document.documentElement.style.setProperty('--thumb-bg-stepper', '#f59e0b');
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

// Create tick marks and labels
function createTicks(element, config) {
  const sliderTicks = element.querySelector('.slider-ticks');
  const tickLabels = element.querySelector('.tick-labels');
  const input = element.querySelector('input');
  
  const min = parseInt(input.min);
  const max = parseInt(input.max);
  
  // Tick configuration - can be customized via config
  const tickValues = config.tickValues || [12, 24, 36, 48,60,72,84];
  
  // Clear existing ticks and labels
  sliderTicks.innerHTML = '';
  tickLabels.innerHTML = '';
  
  tickValues.forEach(value => {
    const percent = ((value - min) / (max - min)) * 100;
    
    // Create tick mark
    const tick = document.createElement('div');
    tick.className = 'tick';
    tick.style.left = percent + '%';
    sliderTicks.appendChild(tick);
    
    // Create tick label
    const label = document.createElement('div');
    label.className = 'tick-label';
    label.style.left = percent + '%';
    
    // Format label text - display number value as is
    label.textContent = value;
    
    tickLabels.appendChild(label);
  });
}

export default async function decorate(fieldDiv, fieldJson) {
  const input = fieldDiv.querySelector('input');
  input.className = 'loan-stepper';
  
  // Get configuration from fieldJson properties
  const config = {
    minValue: fieldJson?.properties?.minValue || 50000,
    maxValue: fieldJson?.properties?.maxValue || 1250000,
    splitValue: fieldJson?.properties?.splitValue || 400000,
    defaultValue: fieldJson?.properties?.default || 400000,
    offerText: fieldJson?.properties?.offerText || 'Pre-approved offer',
    stepValue: fieldJson?.properties?.stepValue || 12,
    tickValues: fieldJson?.properties?.tickValues || [12, 24, 36, 48,60,72,84]
  };

  // Modify the input type to range
  input.type = 'range';
  input.min = config.minValue;
  input.max = config.maxValue;
  input.value = config.defaultValue;
  input.step = config.stepValue;

  // Create wrapper div for the loan range slider with ticks
  const div = document.createElement('div');
  div.className = 'loan-range-slider-with-ticks-wrapper decorated';
  input.after(div);

  // Create slider container
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-container';

  // Create slider background
  const sliderBackground = document.createElement('div');
  sliderBackground.className = 'slider-background';

  // Create tick elements
  const sliderTicks = document.createElement('div');
  sliderTicks.className = 'slider-ticks';

  // Create track elements
  const sliderTrack = document.createElement('div');
  sliderTrack.className = 'slider-track';

  const sliderTrackOrange = document.createElement('div');
  sliderTrackOrange.className = 'slider-track-orange';

  // Create tick labels
  const tickLabels = document.createElement('div');
  tickLabels.className = 'tick-labels';

  // Create offer badge
  const offerBadge = document.createElement('span');
  offerBadge.className = 'stepper-offer-badge';
  offerBadge.textContent = config.offerText;

  // Create range labels

  // Assemble slider container
  sliderContainer.appendChild(sliderBackground);
  sliderContainer.appendChild(sliderTicks);
  sliderContainer.appendChild(sliderTrack);
  sliderContainer.appendChild(sliderTrackOrange);
  sliderContainer.appendChild(tickLabels);
  sliderContainer.appendChild(offerBadge);

  // Assemble wrapper
  div.appendChild(sliderContainer);
  div.appendChild(input);
  // div.appendChild(rangeLabels);

  // Create ticks
  createTicks(div, config);

  // Add event listener
  input.addEventListener('input', (e) => {
    updateLoanSliderWithTicks(e.target, div, config);
  });

  // Add smooth transitions
  sliderTrack.style.transition = 'width 0.2s ease';
  sliderTrackOrange.style.transition = 'width 0.2s ease, left 0.2s ease';

  // Initialize slider
  updateLoanSliderWithTicks(input, div, config);

  return fieldDiv;
}
