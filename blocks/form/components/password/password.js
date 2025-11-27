export default function passwordLayout(fieldDiv) {
  const inputField = fieldDiv.querySelector('input[type="text"]');
  inputField.type = 'password';

  // Add the event listener to the input field
  inputField.addEventListener('input', (event) => {
  // Get the current value of the input
    let { value } = event.target;

    // Allow only digits and limit the length to 6 characters
    value = value.replace(/\D/g, ''); // Remove non-digit characters

    // Set the sanitized value back to the input field
    event.target.value = value;

    inputField.dispatchEvent(new Event('change', { bubbles: true }));
  });

  const togglePasswordIcon = document.createElement('i');
  togglePasswordIcon.classList.add('bi-eye-slash');
  togglePasswordIcon.id = 'togglePassword';
  inputField.insertAdjacentElement('afterend', togglePasswordIcon);

  togglePasswordIcon.addEventListener('click', () => {
    const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
    inputField.setAttribute('type', type);
    togglePasswordIcon.classList.toggle('bi-eye', type !== 'password');
    togglePasswordIcon.classList.toggle('bi-eye-slash', type === 'password');
  });
  return fieldDiv;
}
