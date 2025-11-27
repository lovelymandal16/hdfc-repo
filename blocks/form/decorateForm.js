import { loadCSS } from '../../scripts/aem.js';

export default function decorateForm(form, formDef) {
  const { journeyName } = formDef?.properties || {};
  form?.classList.add(journeyName);
  if (journeyName === 'x') {
    // add the relative path to the css file that needs to be loaded
    // also add classes to the form element as per journey requirements
    try {
      loadCSS(`${window.hlx.codeBasePath}/`);
    } catch (error) {
      console.error('Failed to load CSS:', error);
    }
  }
}
