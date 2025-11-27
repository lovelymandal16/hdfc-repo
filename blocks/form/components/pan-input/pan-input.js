import { subscribe } from '../../rules/index.js';
import { updateOrCreateInvalidMsg } from '../../util.js';

/**
 * Validates and formats PAN input
 * @param {HTMLElement} input - The input element
 * @param {object} fieldJson - The field json.
 * @param {string} fourthChar - The allowed fourth character (defaults to 'P')
 */
function setupPANValidation(input, fieldJson, fourthChar = 'P') {
  // PAN format: First 5 chars are letters, next 4 are numbers, last char is letter
  // The fourth character is configurable (P, H, or any letter)
  const createPANRegex = (char) => new RegExp(`^[A-Z]{3}${char}[A-Z]\\d{4}[A-Z]$`);
  
  const formatPAN = (inputValue) => {
    // Convert to uppercase and remove non-alphanumeric characters
    const cleanValue = inputValue.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Format each character according to PAN rules
    const formatted = cleanValue.split('').map((char, index) => {
      if (index < 3) return /[A-Z]/.test(char) ? char : '';
      if (index === 3) return char === fourthChar ? char : '';
      if (index === 4) return /[A-Z]/.test(char) ? char : '';
      if (index >= 5 && index <= 8) return /[0-9]/.test(char) ? char : '';
      if (index === 9) return /[A-Z]/.test(char) ? char : '';
      return '';
    }).join('');

   return formatted.slice(0, 10); // Limit to 10 characters
  };

  const validatePAN = (value) => {
    const regex = createPANRegex(fourthChar);
    return regex.test(value);
  };

  // Handle input events
  input.addEventListener('input', (e, fieldJson) => {
    const formattedValue = formatPAN(e.target.value);
    if (formattedValue !== e.target.value) {
      e.target.value = formattedValue;
    }

    if (formattedValue.length === 10) {
      if (!validatePAN(formattedValue)) {
        updateOrCreateInvalidMsg(input, `Invalid PAN format. Fourth character must be ${fourthChar}`);
      } else {
        updateOrCreateInvalidMsg(input, '');
      }
    } else if (formattedValue.length > 0) {
      updateOrCreateInvalidMsg(input, 'PAN must be 10 characters long');
    } else {
      updateOrCreateInvalidMsg(input, '');
    }
  });

  input.addEventListener('blur', (e, fieldJson) => {
    const formattedValue = formatPAN(e.target.value);
    if (formattedValue !== e.target.value) {
      e.target.value = formattedValue;
    }

    if (formattedValue.length > 0 && formattedValue.length < 10) {
      updateOrCreateInvalidMsg(input, 'PAN must be 10 characters long');
    }
  });
}

export default function decorate(fieldDiv, fieldJson, container, formId) {
  const input = fieldDiv.querySelector('input');
  const { properties: { fourthChar = 'P' } = {} } = fieldJson || {};

  if (input) {
    // Set maxlength attribute
    input.setAttribute('maxlength', '10');

    // Initialize PAN validation
    setupPANValidation(input, fieldJson, fourthChar);

    // // Subscribe to value changes
    // subscribe(fieldDiv, formId, (_fieldDiv, fieldModel) => {
    //   fieldModel.subscribe(() => {
    //     const { value } = input;
    //     if (value) {
    //       const regex = new RegExp(`^[A-Z]{3}${fourthChar}[A-Z]\\d{4}[A-Z]$`);
    //       fieldModel.valid = regex.test(value);
    //     }
    //   }, 'change');
    // });
  }
}