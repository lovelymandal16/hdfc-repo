import { createButton } from '../../util.js';

export class WizardLayout {
  inputFields = 'input,textarea,select';

  constructor(includePrevBtn = true, includeNextBtn = true) {
    this.includePrevBtn = includePrevBtn;
    this.includeNextBtn = includeNextBtn;
  }

  // eslint-disable-next-line class-methods-use-this
  getSteps(panel) {
    return [...panel.children].filter((step) => step.tagName.toLowerCase() === 'fieldset');
  }

  assignIndexToSteps(panel) {
    const steps = this.getSteps(panel);
    panel.style.setProperty('--wizard-step-count', steps.length);
    steps.forEach((step, index) => {
      step.dataset.index = index;
      step.style.setProperty('--wizard-step-index', index);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getEligibleSibling(current, forward = true) {
    const direction = forward ? 'nextElementSibling' : 'previousElementSibling';

    for (let sibling = current[direction]; sibling; sibling = sibling[direction]) {
      if (sibling.dataset.visible !== 'false' && sibling.tagName === 'FIELDSET') {
        return sibling;
      }
    }
    return null;
  }

  /**
 * @param {FormElement | Fieldset} container
 * @returns return false, if there are invalid fields
 */
  validateContainer(container) {
    const fieldElements = [...container.querySelectorAll(this.inputFields)];
    const isValid = fieldElements.reduce((valid, fieldElement) => {
      const isHidden = fieldElement.closest('.field-wrapper')?.dataset?.visible === 'false';
      let isFieldValid = true;
      if (!isHidden) {
        isFieldValid = fieldElement.checkValidity();
      }
      return valid && isFieldValid;
    }, true);

    if (!isValid) {
      container.querySelector(':invalid')?.focus();
    }
    return isValid;
  }

  navigate(panel, forward = true) {
    const current = panel.querySelector('.current-wizard-step');
    const currentMenuItem = panel.querySelector('.wizard-menu-active-item');

    let valid = true;
    if (forward) {
      valid = this.validateContainer(current);
    }
    const navigateTo = valid ? this.getEligibleSibling(current, forward) : current;

    if (navigateTo && current !== navigateTo) {
      current.classList.remove('current-wizard-step');
      navigateTo.classList.add('current-wizard-step');
      // add/remove active class from menu item
      const navigateToMenuItem = panel.querySelector(`.wizard-menu-items > [data-index="${navigateTo.dataset.index}"]`);
      currentMenuItem.classList.remove('wizard-menu-active-item');
      navigateToMenuItem.classList.add('wizard-menu-active-item');
      const event = new CustomEvent('wizard:navigate', {
        detail: {
          prevStep: { id: current.id, index: +current.dataset.index },
          currStep: { id: navigateTo.id, index: +navigateTo.dataset.index },
        },
        bubbles: false,
      });
      panel.dispatchEvent(event);
    }
  }

  static handleMutation(panel, mutationsList) {
    mutationsList.forEach((mutation) => {
      const { type, target, attributeName } = mutation;
      const menuItems = panel.querySelector('.wizard-menu-items');
      // Check if the mutation is a change in attributes(data-visible)
      if (type === 'attributes' && attributeName === 'data-visible') {
        const element = mutation.target;
        const menuItem = panel.querySelector(`li[data-index="${element.dataset.index}"]`);
        menuItem.dataset.visible = element.dataset.visible;
      } else if (type === 'attributes' && attributeName === 'data-active') {
        // for active panel
        panel.querySelector('.current-wizard-step')?.classList.remove('current-wizard-step');
        const activePanel = panel.querySelector(`#${target?.id}`);
        activePanel?.classList.add('current-wizard-step');
        // for active menu item
        panel.querySelector('.wizard-menu-active-item')?.classList.remove('wizard-menu-active-item');
        menuItems.querySelector(`[data-index="${activePanel.dataset.index}"]`)?.classList.add('wizard-menu-active-item');
        target.querySelector('[data-active="true"]')?.focus();
      }
    });
  }

  static attachMutationObserver(panel) {
    const children = panel.querySelectorAll(':scope > .panel-wrapper');
    // Options for the observer (attributes to observe for)
    const config = { attributes: true, subtree: false };
    // Create an observer instance linked to the callback function
    const observer = new window.MutationObserver((mutationsList) => {
      WizardLayout.handleMutation(panel, mutationsList);
    });
    // Start observing each target node for configured mutations
    children.forEach((targetNode) => {
      observer.observe(targetNode, config);
    });
  }

  static createHdfcMenu(children) {
    const menu = document.createElement('ul');
    menu.classList.add('wizard-menu-items', 'hdfc-wizard');
    children.forEach((child, index) => {
      const wrapper = document.createElement('li');
      wrapper.className = 'menu-items-container';
      wrapper.dataset.index = index;

      const currentStepSection = document.createElement('div');
      currentStepSection.className = 'wizard-current-step-section';
      const stepText = document.createElement('div');
      stepText.className = 'wizard-step-text';
      stepText.textContent = `Step ${index + 1}/${children.length}`;

      const currentStep = document.createElement('div');
      currentStep.className = 'wizard-current-step';
      currentStep.textContent = child.querySelector('legend')?.innerHTML || '';

      currentStepSection.append(stepText, currentStep);

      const upNextSection = document.createElement('div');
      upNextSection.className = 'wizard-up-next-section';
      const upNextLabel = document.createElement('div');
      upNextLabel.className = 'wizard-up-next-label';
      upNextLabel.textContent = 'Up Next';

      const upNextContent = document.createElement('div');
      upNextContent.className = 'wizard-up-next-content';
      upNextContent.textContent = children[index + 1]?.querySelector('legend')?.innerHTML || '';

      upNextSection.appendChild(upNextLabel);
      upNextSection.appendChild(upNextContent);
      wrapper.append(currentStepSection, upNextSection);
      if (index === 0) {
        wrapper.classList.add('wizard-menu-active-item');
      }

      if (index === children.length - 1) {
        wrapper.classList.add('wizard-menu-last-item');
      }

      menu.append(wrapper);
    });
    return menu;
  }

  static createMenu(children) {
    const ul = document.createElement('ul');
    ul.className = 'wizard-menu-items';
    children.forEach((child, index) => {
      const li = document.createElement('li');
      li.innerHTML = child.querySelector('legend')?.innerHTML || '';
      li.className = 'wizard-menu-item';
      li.dataset.index = index;
      if (child.hasAttribute('data-visible')) {
        li.dataset.visible = child.dataset.visible;
      }
      ul.append(li);
    });
    return ul;
  }

  addButton(wrapper, panel, buttonDef, forward = true) {
    const button = createButton(buttonDef);
    button.classList.add(buttonDef.id);
    button.addEventListener('click', () => this.navigate(panel, forward));
    wrapper.append(button);
  }

  applyLayout(panel, variant) {
    const children = panel.querySelectorAll(':scope > .panel-wrapper');
    if (children.length) {
      // create wizard menu
      let wizardMenu;
      if (variant !== 'hdfc-wizard') {
        wizardMenu = WizardLayout.createMenu(Array.from(children), variant);
        wizardMenu.querySelector('li').classList.add('wizard-menu-active-item');
      } else {
        wizardMenu = WizardLayout.createHdfcMenu(Array.from(children));
      }
      // Insert the menu before the first child of the wizard
      panel.insertBefore(wizardMenu, children[0]);
      WizardLayout.attachMutationObserver(panel);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'wizard-button-wrapper';
    if (this.includePrevBtn && children.length) {
      this.addButton(wrapper, panel, {
        label: { value: 'Back' }, fieldType: 'button', name: 'back', id: 'wizard-button-prev',
      }, false);
    }

    if (this.includeNextBtn && children.length) {
      this.addButton(wrapper, panel, {
        label: { value: 'Next' }, fieldType: 'button', name: 'next', id: 'wizard-button-next',
      });
    }

    this.assignIndexToSteps(panel);
    panel.append(wrapper);
    panel.querySelector('fieldset')?.classList.add('current-wizard-step');
    panel.classList.add('wizard');
  }
}

const layout = new WizardLayout();

export default function wizardLayout(panel, fieldJson) {
  const variant = fieldJson?.properties?.variant;
  layout.applyLayout(panel, variant);
  return panel;
}

export const navigate = layout.navigate.bind(layout);
export const validateContainer = layout.validateContainer.bind(layout);
