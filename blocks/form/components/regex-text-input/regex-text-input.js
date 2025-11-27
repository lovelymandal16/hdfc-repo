/* eslint-disable linebreak-style */
import { subscribe } from '../../rules/index.js';
import { updateOrCreateInvalidMsg, setConstraints } from '../../util.js';

/**
 * Validates input against a regex pattern and prevents invalid characters
 * @param {HTMLElement} input - The input element to validate
 * @param {string} regexPattern - The regex pattern to validate against
 * @param {string} errorMessage - The error message to display when validation fails
 */
function setupRegexValidation(input, regexPattern, errorMessage, init=false) {
  if (!regexPattern) return; // Skip if no regex pattern provided

  // Create a RegExp object from the pattern string
  let regex;
  try {
    regex = new RegExp(regexPattern);
  } catch (e) {
    console.error('Invalid regex pattern:', regexPattern, e);
    return;
  }

  // Function to validate the current input value
  const validateInput = () => {
    const isValid = regex.test(input.value);

    // Show/hide error message using the built-in utility
    if (!isValid && input.value) {
      updateOrCreateInvalidMsg(input, errorMessage);
    } else {
      updateOrCreateInvalidMsg(input, '');
    }

    return isValid;
  };

  // Handle input events to prevent invalid characters
  input.addEventListener('input', (e) => {
    const { value } = e.target;

    // If the current value doesn't match the regex, prevent the last character
    if (value && !regex.test(value)) {
      // Remove the last character that was typed
      e.target.value = value.slice(0, -1);
      // Show error message briefly
      updateOrCreateInvalidMsg(input, errorMessage);
      // Hide error after a short delay
      setTimeout(() => {
        updateOrCreateInvalidMsg(input, '');
      }, 1500);
    }
  });

  // Validate on blur for complete validation
  input.addEventListener('blur', validateInput);

  // Initial validation
  if (!init) {
    validateInput();
  }
}

export default function decorate(fieldDiv, fieldJson, container, formId) {
  // Get the regex pattern and error message from the field properties
  const { regexPattern, regexErrorMessage } = fieldJson?.properties || {};

  // Find the input element within the field div
  const input = fieldDiv.querySelector('input');

  if (input) {
    // Set up min/max length constraints using the built-in setConstraints utility
    setConstraints(input, fieldJson);

    // Add blur event listener for min/max length validation
    input.addEventListener('blur', () => {
      if (input.validity.tooShort) {
        updateOrCreateInvalidMsg(input, fieldJson.minLengthMessage || `Minimum ${input.minLength} characters required`);
      } else if (input.validity.tooLong) {
        updateOrCreateInvalidMsg(input, fieldJson.maxLengthMessage || `Maximum ${input.maxLength} characters allowed`);
      }
    });

    // Set up regex validation if pattern is provided
    if (regexPattern) {
      setupRegexValidation(input, regexPattern, regexErrorMessage, true);
    }
  }

  // Subscribe to field model changes
  subscribe(fieldDiv, formId, (_fieldDiv, fieldModel) => {
    fieldModel.subscribe((e) => {
      const { payload } = e;
      payload?.changes?.forEach((change) => {
        if (change?.propertyName === 'properties') {
          const { currentValue: properties } = change;
          if (properties && properties.regexPattern) {
            // Re-setup validation if properties change
            setupRegexValidation(fieldDiv.querySelector('input'), properties.regexPattern, properties.regexErrorMessage);
          }
        }
      });
    }, 'change');
  });
}
