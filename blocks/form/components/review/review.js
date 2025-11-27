/* eslint-disable no-use-before-define */
import { subscribe } from '../../rules/index.js';
import { generateFormRendition } from '../../form.js';

const panelRenderers = {
  default: replaceInputs,
  singleAccountCard: createAccountVariantReview,
  multiAccountCard: createAccountVariantReview,
  accountChoiceField: createAccountVariantReview,
  'image-upload': createFileUploadReview,
  passportPanel: createFileUploadReview,
  address_proof: createFileUploadReview,
  drivinglicensepanel: createFileUploadReview,
  voterIdPanel: createFileUploadReview,
  addressProofPanel: createFileUploadReview,
  selfiePanel: createFileUploadReview,
  personalDetailsPanel: createPersonalDetailsReview,
  contactDetails: createContactDetailsReview,
  nomineePanel: createNomineeDetailsReview,
  financialDetailsPanel: createFinancialDetailsReview,
  verifyEmailPanel: createEmailReview,
  otherInfoPanel: createOtherInfoReview,
  branchDetails: createBranchDetailsReview,
};

function replaceInputs(element, model) {
  function processItem(item) {
    if (item.isContainer) {
      item.items?.forEach(processItem);
      return;
    }

    if (!item.value) {
      element.querySelector(`[data-id="${item.id}"]`)?.remove(); // empty fields need not be rendered
      return;
    }

    const {
      id, value, name, fieldType, enumNames,
    } = item;
    if (id) {
      const divElement = document.createElement('div');
      divElement.className = `review-field-value ${name}`;
      if (fieldType === 'radio-group' || fieldType === 'checkbox-group' || fieldType === 'drop-down') {
        const index = item?.enum?.indexOf(value);
        if (index !== -1) {
          if (enumNames.length > 0) {
            divElement.textContent = enumNames[index];
          } else {
            divElement.textContent = item?.enum?.[index] || value;
          }
        }
      } else {
        divElement.textContent = value || '';
      }

      if (fieldType === 'radio-group' || fieldType === 'checkbox-group') {
        const radioOrCheckboxGroup = element.querySelector(`fieldset[data-id="${id}"]`);
        if (radioOrCheckboxGroup) {
          const wrappers = radioOrCheckboxGroup.querySelectorAll('.radio-wrapper') || radioOrCheckboxGroup.querySelectorAll('.checkbox-wrapper');
          wrappers.forEach((wrapper) => wrapper.remove());
          radioOrCheckboxGroup.appendChild(divElement);
        }
      } else if (fieldType === 'checkbox') {
        const inputElement = element.querySelector(`input[id="${id}"]`);
        if (inputElement) {
          const label = inputElement.parentNode.querySelector('label');
          inputElement.parentNode.insertBefore(divElement, label.nextSibling);
          inputElement.remove();
        }
      } else {
        const inputElement = element.querySelector(`input[id="${id}"], select[id="${id}"], textarea[id="${id}"]`);
        if (inputElement) {
          inputElement.parentNode.replaceChild(divElement, inputElement);
        }
      }
    }

    // Special case for dynamic dropdowns that has an additional input field
    const dynamicDropdown = element.querySelectorAll('.dynamic-dropdown-wrapper');
    dynamicDropdown?.forEach((wrapper) => wrapper.remove());
  }
  model.items?.forEach(processItem);
  return element;
}

async function createPersonalDetailsReview(element, model) {
  const familyDetailsQN = '$form.wizard.yourDetailsPanel.yourDetailsSubPanel.yourDetailsFragment.yourDetailsTabLayout.familyDetails.familyDetailsFragment.familyDetails';
  const form = model?.form;
  const familyDetails = form.resolveQualifiedName(familyDetailsQN);
  const familyDetailsWrapper = document.createElement('div');
  await generateFormRendition(familyDetails.getState(), familyDetailsWrapper, form?.id);
  const familyDetailsReview = replaceInputs(familyDetailsWrapper, familyDetails);
  const personalDetailsReview = replaceInputs(element, model);
  const familyDetailsTitle = personalDetailsReview.children[0].cloneNode(true);
  familyDetailsTitle.classList.add('field-familydetailstitle');
  familyDetailsTitle.innerHTML = '<p><p><strong>Family Details</strong></p></p>';
  familyDetailsReview.prepend(familyDetailsTitle);
  const maritalDetailsWrapper = familyDetailsReview.querySelector('.field-maritalstatus');
  maritalDetailsWrapper?.classList.add('col-4', 'text-wrapper');
  maritalDetailsWrapper?.classList.remove('radio-group-wrapper');
  const maritalDetailsLabel = document.createElement('label');
  maritalDetailsLabel.textContent = 'Marital Status';
  maritalDetailsLabel.classList.add('field-maritalstatustitle');
  maritalDetailsLabel.setAttribute('for', 'maritalstatus');
  const maritalDetailsLegend = maritalDetailsWrapper?.querySelector('legend');
  maritalDetailsLegend?.replaceWith(maritalDetailsLabel);
  Array.from(familyDetailsReview.children).forEach((child) => {
    personalDetailsReview.appendChild(child);
  });
  const titleDiv = document.createElement('div');
  titleDiv.className = 'review-section-title';
  titleDiv.textContent = 'Personal Details';
  personalDetailsReview.prepend(titleDiv);
  return personalDetailsReview;
}

function createContactDetailsReview(element, model) {
  const excludeElements = ['addressline3', 'city'];
  excludeElements.forEach((elementName) => {
    element.querySelector(`.field-${elementName}`)?.remove();
  });
  const contactDetailsReview = replaceInputs(element, model);
  const addressLabel = contactDetailsReview.querySelector('.field-contactdetailssubtext');
  const addressSummary = contactDetailsReview.querySelector('.field-permanentaddresstext');
  const addressWrapper = document.createElement('div');
  addressWrapper.classList.add('col-4', 'field-wrapper', 'text-wrapper');
  const label = document.createElement('label');
  label.classList.add('field-label');
  label.innerHTML = addressLabel?.innerHTML;
  const divElement = document.createElement('div');
  divElement.className = 'review-field-value';
  divElement.innerHTML = addressSummary?.innerHTML;
  addressWrapper.appendChild(label);
  addressWrapper.appendChild(divElement);
  addressLabel.remove();
  addressSummary?.replaceWith(addressWrapper);
  const titleDiv = document.createElement('div');
  titleDiv.className = 'review-section-title';
  titleDiv.textContent = 'Contact Details';
  contactDetailsReview.prepend(titleDiv);
  return contactDetailsReview;
}

function createBranchDetailsReview(element, model) {
  const branchDetailsReview = replaceInputs(element, model);
  const titleDiv = document.createElement('div');
  element.querySelector('.field-addressdetailssubtext')?.remove();
  titleDiv.className = 'review-section-title';
  titleDiv.textContent = 'Branch Details';
  branchDetailsReview.prepend(titleDiv);
  return branchDetailsReview;
}

function createNomineeDetailsReview(element, model) {
  const { form } = model;
  if (form.properties.existingCustomer === 'Y' || form.properties.isNomineeCheckbox !== 'Y') {
    return null;
  }
  const nomineeDetailsReview = replaceInputs(element, model);
  const excludeElements = ['sameaspermanentaddrguardian', 'addnomineecheckbox', 'nomineedob', 'sameaspermanentaddr', 'nomineeaddresstitle'];
  excludeElements.forEach((elementName) => {
    nomineeDetailsReview.querySelector(`.field-${elementName}`)?.remove();
  });

  const addressLabel = nomineeDetailsReview.querySelector('.field-sameaddressdetailsnomineetext');
  const addressSummary = nomineeDetailsReview.querySelector('.field-samenomineeadrdetails');
  const addressWrapper = document.createElement('div');
  addressWrapper.classList.add('col-4', 'field-wrapper', 'text-wrapper');
  const label = document.createElement('label');
  label.classList.add('field-label');
  label.innerHTML = addressLabel?.innerHTML;
  const divElement = document.createElement('div');
  divElement.className = 'review-field-value';
  divElement.innerHTML = addressSummary?.innerHTML;
  addressWrapper.appendChild(label);
  addressWrapper.appendChild(divElement);
  addressLabel.remove();

  addressSummary?.replaceWith(addressWrapper);
  const titleDiv = document.createElement('div');
  titleDiv.className = 'review-section-title';
  titleDiv.textContent = 'Nominee Details';
  nomineeDetailsReview.prepend(titleDiv);
  return nomineeDetailsReview;
}

function createFinancialDetailsReview(element, model) {
  const financialDetailsReview = replaceInputs(element, model);
  const excludeElements = ['dobdeclarationcheck'];
  excludeElements.forEach((elementName) => {
    financialDetailsReview.querySelector(`.field-${elementName}`)?.remove();
  });
  const titleDiv = document.createElement('div');
  titleDiv.className = 'review-section-title';
  titleDiv.textContent = 'Financial Details';
  financialDetailsReview.prepend(titleDiv);
  return financialDetailsReview;
}

function createEmailReview(element, model) {
  const { form } = model;
  if (form.properties.existingCustomer === 'Y') {
    return null;
  }
  const emailReview = replaceInputs(element, model);
  const excludeElements = ['verifybutton'];
  excludeElements.forEach((elementName) => {
    emailReview.querySelector(`.field-${elementName}`)?.remove();
  });
  emailReview.querySelector('.field-description')?.remove();
  const titleDiv = document.createElement('div');
  titleDiv.className = 'review-section-title';
  titleDiv.textContent = 'Verify Your Email ID';
  emailReview.prepend(titleDiv);
  return emailReview;
}

function createOtherInfoReview(element, model) {
  const otherInfoReview = replaceInputs(element, model);
  otherInfoReview.querySelectorAll('.switch').forEach((switchElement) => {
    switchElement.classList.remove('switch');
  });
  const excludeElements = ['pepdeclarationtext'];
  excludeElements.forEach((elementName) => {
    otherInfoReview.querySelector(`.field-${elementName}`)?.remove();
  });
  const titleDiv = document.createElement('div');
  titleDiv.className = 'review-section-title';
  titleDiv.textContent = 'Other Information';
  otherInfoReview.prepend(titleDiv);
  return otherInfoReview;
}

function createAccountVariantReview(element, model) {
  const value = model?.value;
  if (!value || typeof value !== 'object') return;

  // Keys to filter out
  const filterKeys = [
    'Account',
    'Link',
    'Required Consent',
    'Optional Consent',
    'Product Codes',
    'Sub Product Codes',
  ];

  // Clear the element
  element.innerHTML = '';

  // Section title
  const sectionTitle = document.createElement('div');
  sectionTitle.className = 'review-section-title';
  sectionTitle.textContent = 'Account Variant';
  element.appendChild(sectionTitle);

  // Parent div for title and features
  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'review-account-details';
  // Initially collapsed

  // Title from 'Account' key
  const titleDiv = document.createElement('div');
  titleDiv.className = 'review-account-title';
  titleDiv.textContent = value.Account || '';

  // Wrapper div for features and button
  const featuresWrapper = document.createElement('div');
  featuresWrapper.className = 'review-account-features-wrapper';
  featuresWrapper.appendChild(titleDiv);
  featuresWrapper.classList.add('collapsed');
  // Bullet points for the rest
  const ul = document.createElement('ul');
  ul.className = 'review-account-features';
  Object.entries(value).forEach(([key, val]) => {
    if (
      filterKeys.includes(key)
      || val === ''
      || val === '-'
      || val == null
    ) return;
    const li = document.createElement('li');
    li.textContent = `${key} ${val}`;
    ul.appendChild(li);
  });
  featuresWrapper.appendChild(ul);

  // 'More Benefits' as a button
  const moreBenefitsBtn = document.createElement('button');
  moreBenefitsBtn.type = 'button';
  moreBenefitsBtn.textContent = 'More Benefits';
  moreBenefitsBtn.className = 'review-account-more-benefits';
  moreBenefitsBtn.addEventListener('click', () => {
    featuresWrapper.classList.toggle('expand');
    featuresWrapper.classList.toggle('collapsed');
  });


  detailsDiv.appendChild(featuresWrapper);
  element.appendChild(detailsDiv);
  detailsDiv.appendChild(moreBenefitsBtn);
  // eslint-disable-next-line consistent-return
  return element;
}

function createFileUploadReview(element, model) {
  const { form } = model;
  if (form.properties.existingCustomer === 'Y' || form.properties.ovdFlag !== 'Y') {
    return null;
  }
  // Remove all children except all div.file-wrapper
  const fileWrapperDivs = Array.from(element.querySelectorAll('div.file-wrapper'));

  // Check if any file input has a value
  let hasFileValue = false;
  fileWrapperDivs.forEach((div) => {
    const fileInput = div.querySelector('input[type="file"]');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      hasFileValue = true;
    }
  });

  // If no file values, return null to skip this panel
  if (!hasFileValue) {
    return null;
  }

  element.innerHTML = '';
  fileWrapperDivs.forEach((div) => {
    // Remove .field-description if it exists
    const desc = div.querySelector('.field-description');
    if (desc) {
      desc.remove();
    }
    // Remove label if it exists
    const label = div.querySelector('label');
    if (label) {
      label.remove();
    }
    element.appendChild(div);
  });

  // Create and prepend a new title div
  const sectionTitle = document.createElement('div');
  sectionTitle.className = 'review-section-title';
  sectionTitle.textContent = (model?.name === 'image-upload' || model?.name === 'selfiePanel') ? 'Your Selfie' : 'Uploaded Documents';
  element.prepend(sectionTitle);

  // Find and disable all file inputs inside the wrappers
  fileWrapperDivs.forEach((div) => {
    const fileInput = div.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.disabled = true;
    }
  });

  return element;
}

function addEditAction(element, model) {
  const editButton = document.createElement('button');
  editButton.className = 'review-panel-edit';
  const form = model?.form;
  editButton.addEventListener('click', () => {
    // Remove the rendered attribute when edit button is clicked
    const reviewContainer = element.closest('.review-container');
    if (reviewContainer) {
      reviewContainer.removeAttribute('data-rendered');
    }
    form.setFocus(model);
    // Map panel names to their corresponding parent in the heirarchy that needs to be made visible
    const panelQualifiedNames = {
      personalDetailsPanel: '$form.wizard.yourDetailsPanel.yourDetailsSubPanel',
      branchDetails: '$form.wizard.yourDetailsPanel.yourDetailsSubPanel',
      contactDetails: '$form.wizard.yourDetailsPanel.yourDetailsSubPanel',
      multiAccountCard: '$form.wizard.yourDetailsPanel.selectAccountVariant',
      singleAccountCard: '$form.wizard.yourDetailsPanel.selectAccountVariant',
      accountChoiceField: '$form.wizard.yourDetailsPanel.selectAccountVariant',
      nomineePanel: '$form.wizard.yourDetailsPanel.nomineeDetailsPanel',
      financialDetailsPanel: '$form.wizard.yourDetailsPanel.yourDetailsSubPanel',
      verifyEmailPanel: '$form.wizard.yourDetailsPanel.yourDetailsSubPanel',
      otherInfoPanel: '$form.wizard.yourDetailsPanel.yourDetailsSubPanel',
    };

    const qualifiedName = panelQualifiedNames[model.name];
    if (qualifiedName) {
      const section = form.resolveQualifiedName(qualifiedName);
      if (section) section.visible = true;
    }
  });
  element.prepend(editButton);
}

function render(element, fd, model) {
  // Check if already rendered - if so, don't re-render
  if (element.hasAttribute('data-rendered')) {
    return;
  }
  // Rendering logic for the review component
  if (!model) return;
  const { form } = model;
  const { properties } = fd;
  const panelModels = [];
  if (properties && form) {
    const { panelNames } = properties;
    form.visit((field) => {
      if (panelNames?.includes(field.name)) {
        panelModels.push(field);
      }
    });

    element.innerHTML = '';
    // Render each panel
    panelModels?.forEach(async (field) => {
      if (!field.isContainer && !field.value) return;

      if ((form.properties.existingCustomer === 'Y' && (
        field.name === 'nomineePanel' || field.name === 'verifyEmailPanel'
      )) || (field.name === 'nomineePanel' && form.properties.isNomineeCheckbox !== 'Y')) {
        element.setAttribute('data-visible', 'false');
        return;
      }
      const panelWrapper = document.createElement('div');
      panelWrapper.className = `review-panel-wrapper ${field.name}`;
      await generateFormRendition(field.getState(), panelWrapper, form?.id);
      const decorator = panelRenderers[field.name] || panelRenderers.default;
      const decoratedPanel = await decorator(panelWrapper, field);

      // Skip this panel if decorator returns null
      if (!decoratedPanel) return;

      // Ensure the edit button exists
      addEditAction(decoratedPanel, field);

      // Find the review-section-title and review-panel-edit button
      const sectionTitle = decoratedPanel.querySelector('.review-section-title');
      const editButton = decoratedPanel.querySelector('.review-panel-edit');
      if (sectionTitle && editButton) {
        // Create review-header div and move sectionTitle and editButton inside it
        const reviewHeader = document.createElement('div');
        reviewHeader.className = 'review-section-header';
        reviewHeader.appendChild(sectionTitle);
        reviewHeader.appendChild(editButton);
        decoratedPanel.prepend(reviewHeader);
      }

      element.appendChild(panelWrapper);
    });

    // Mark as rendered after successful rendering
    element.setAttribute('data-rendered', 'true');
  }
}

export default function decorate(element, fd, container, formId, globals) {
  element.classList.add('review-container');
  let fieldModel;
  subscribe(element, formId, (_element, model) => {
    fieldModel = model;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        render(element, fd, fieldModel);
      } else {
        // element.innerHTML = '';
      }
    });
  }, {
    threshold: 0.1,
  });
  observer.observe(element);
  return element;
}
