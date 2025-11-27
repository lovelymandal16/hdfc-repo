export default function decorate(fieldDiv) {
  const inputField = fieldDiv.querySelector('input[type="number"]');

  inputField.addEventListener('input', (event) => {
    let { value } = event.target;

    // Remove all non-digit characters just in case (e.g., from copy-paste)
    value = value.replace(/\D/g, '');

    // If the first digit exists and is not between 6 and 9, remove it
    if (value.length > 0 && !/^[6-9]/.test(value)) {
      value = value.slice(1);
    }

    // Limit to 10 digits max
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // Check if the input is about to become 10 identical digits (6–9)
    if (value.length === 10) {
      const allSame = value.split('').every((char) => char === value[0]);
      const firstDigit = value[0];
      if (allSame && /^[6-9]$/.test(firstDigit)) {
        // Reject the 10th character
        value = value.slice(0, 9);
      }
    }

    // Update the input field with the cleaned value
    event.target.value = value;
  });

  return fieldDiv;
}
