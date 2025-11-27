import { subscribe } from '../../rules/index.js';

export default function decorate(fieldDiv, fieldJson, container, formId) {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const { initialText, finalText, time } = fieldJson?.properties;

  const button = fieldDiv.querySelector('button');
  // Style the button to look like text/link instead of a button
  button.classList.add('countdown-timer-link');
  fieldDiv.classList.add('countdown-timer-container');
  // Convert time to seconds (default to 10 seconds if not provided)
  const countdownSeconds = parseInt(time, 10) || 10;

  const startCountdown = (fieldModel) => {
    // Clear any existing countdown interval
    if (button.dataset.countdownInterval) {
      clearInterval(parseInt(button.dataset.countdownInterval, 10));
    }

    let secondsRemaining = countdownSeconds;

    // Set initial state - disabled with countdown text
    button.textContent = initialText || 'Resend OTP in: ';
    button.disabled = true;

    // Create a span for the countdown number
    const countdownSpan = document.createElement('span');
    countdownSpan.classList.add('countdown-timer-number');
    countdownSpan.textContent = `${secondsRemaining} secs`;
    button.appendChild(countdownSpan);

    // Start the countdown
    const countdownInterval = setInterval(() => {
      secondsRemaining -= 1;

      if (secondsRemaining <= 0) {
        // Countdown complete
        clearInterval(countdownInterval);

        // Update button text and enable it
        button.textContent = finalText || 'Resend OTP';
        button.disabled = false;
        // Dispatch a custom event to notify that the timer has completed
        fieldModel.dispatch({ type : 'custom:timerComplete', payload : { formId } })
        // Add a class to indicate the countdown is complete
        fieldDiv.classList.add('countdown-complete');
      } else {
        // Update the countdown display
        countdownSpan.textContent = `${secondsRemaining} secs`;
      }
      fieldJson.properties = { ...fieldJson?.properties, timeLeft: secondsRemaining };
    }, 1000);

    // Store the interval ID on the button element ,so it can be cleared if needed
    button.dataset.countdownInterval = countdownInterval;
  };

  subscribe(fieldDiv, formId, (_fieldDiv, fieldModel) => {
    if (fieldModel.properties.startTimer) {
      startCountdown(fieldModel);
    }
    fieldModel.subscribe(() => {
      const { retries } = fieldModel.properties || {};
      if (retries > 0) {
        startCountdown(fieldModel);
        fieldModel.properties.retries = retries - 1;
      }
    }, 'resetOtpCounter');
  });

  return fieldDiv;
}
