import { subscribe } from '../../rules/index.js';

async function fetchAndUpdateConsentContent(contentURL, element, checkbox) {
  try {
    const response = await fetch(contentURL);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const content = doc.body;

    const consentSummary = content.querySelector('.consent-summary').innerHTML;
    const consentContent = content.querySelector('.consent-content').innerHTML;

    const consentSummaryElement = element.querySelector(`label[for="${checkbox?.id}"]`);
    const consentContentElement = element.querySelector('.modal-content > div.plain-text-wrapper');

    if (consentSummaryElement) {
      consentSummaryElement.innerHTML = consentSummary;
    }

    if (consentContentElement) {
      consentContentElement.innerHTML = consentContent;
    }
  } catch (error) {
    console.error('Error fetching consent content:', error);
  }
}

function createGoToBottomButton(modal) {
  const goToBottomBtn = document.createElement('button');
  goToBottomBtn.type = 'button';
  goToBottomBtn.className = 'go-to-bottom-btn';
  goToBottomBtn.innerHTML = 'Go to Bottom';
  goToBottomBtn.setAttribute('aria-label', 'Scroll to bottom of modal');
  
  goToBottomBtn.addEventListener('click', () => {
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.scrollTo({
        top: modalContent.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
  
  return goToBottomBtn;
}

export default function decorate(element, fd, container, formId) {
  element.classList.add('consent-popup-wrapper');
  const { consentType, contentURL } = fd.properties || {};
  subscribe(element, formId, (_element, model) => {
    if (!model) return;
    const checkbox = model.items?.find((item) => item.fieldType === 'checkbox');
    const modal = model.items?.find((item) => item[':type'] === 'modal');
    const button = modal?.items?.find((item) => item.fieldType === 'button' && item.name === 'consentbutton');
    const goToBottomButton = modal?.items?.find((item) => item.fieldType === 'button' && item.name === 'gotobottombutton');
    const consentTypeTextinput = model.items?.find((item) => (item.fieldType === 'text-input' && item.visible === false));
    model.properties = { ...model.properties, isModelVisible: false };

    // if any of the required elements are not found, return
    if (!checkbox || !modal || !button) return;

    const checkboxElement = element.querySelector(`input[id="${checkbox?.id}"]`);
    const links = element.querySelectorAll('a[href="#open-modal"]'); // for links to open modal assign this href in authoring
    const buttonElement = element.querySelector(`button[id="${button?.id}"]`);

    if (contentURL) {
      fetchAndUpdateConsentContent(contentURL, element, checkbox);
    }

    model.subscribe((e) => {
      const { payload } = e;
      payload?.changes?.forEach((change) => {
        if (change?.propertyName === 'properties') {
          const { currentValue: properties } = change;
          if (properties?.contentURL !== contentURL) {
            fetchAndUpdateConsentContent(properties?.contentURL, element, checkbox);
          }
        }
      });
    });

    if (checkbox.required) {
      const dialog = element.querySelector('dialog');
      if (dialog) {
        // Prevent modal from closing with escape key when checkbox is required
        dialog.closest('div')?.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && checkbox.required) {
            e.preventDefault();
            e.stopPropagation();
          }
        });
      }
    }

    if (checkboxElement) {
      checkboxElement.addEventListener('change', () => {
        if (!checkbox.checked && checkboxElement.checked) {
          checkboxElement.checked = false;
          modal.visible = true;
          model.properties.isModelVisible = true;
          
          // Add go to bottom button when modal opens
          setTimeout(() => {
            const modalElement = element.querySelector('dialog');
            if (modalElement && !modalElement.querySelector('.go-to-bottom-btn')) {
              const goToBottomBtn = createGoToBottomButton(modalElement);
              modalElement.appendChild(goToBottomBtn);
            }
          }, 100);
        }
      });

      if (links.length > 0) {
        links.forEach((link) => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            modal.visible = true;
            model.properties.isModelVisible = true;
            
            // Add go to bottom button when modal opens via link
            setTimeout(() => {
              const modalElement = element.querySelector('dialog');
              if (modalElement && !modalElement.querySelector('.go-to-bottom-btn')) {
                const goToBottomBtn = createGoToBottomButton(modalElement);
                modalElement.appendChild(goToBottomBtn);
              }
            }, 100);
          });
        });
      }

      if (consentTypeTextinput) {
        consentTypeTextinput.value = consentType;
      }

      if (button) {
        // checkbox should only be checked once consent is accepted
        // Only add event listener to the main consent button, not the go-to-bottom button
        buttonElement.addEventListener('click', (e) => {
          // Check if the clicked element is not the go-to-bottom button
          if (!e.target.classList.contains('go-to-bottom-btn')) {
            modal.visible = false;
            checkboxElement.checked = true;
            checkbox.checked = true;
            model.properties.isModelVisible = false;
          }
        });
      }

      if (goToBottomButton) {
        const goToBottomButtonElement = element.querySelector(`button[id="${goToBottomButton?.id}"]`);
        if (goToBottomButtonElement) {
          goToBottomButtonElement.classList.add('go-to-bottom-btn');
          goToBottomButtonElement.addEventListener('click', () => {
            const modalElement = element.querySelector('dialog');
            const modalContent = modalElement?.querySelector('.modal-content');
            if (modalContent) {
              modalContent.scrollTo({
                top: modalContent.scrollHeight,
                behavior: 'smooth'
              });
            }
          });
        }
      }
    }
    const consentTypeField = _element.querySelector('.field-consenttype');
    if (consentTypeField) {
      consentTypeField.classList.remove('field-valid');
    }
  });
}
