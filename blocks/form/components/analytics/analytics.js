/* eslint-disable max-len */
import { loadScript } from '../../../../scripts/aem.js';
import { ENV } from '../../constant.js';
import { subscribe } from '../../rules/index.js';

export default async function decorate(element, fieldJson, container, formId) {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const { devLaunchScript, prodLaunchScript, stageLaunchScript } = fieldJson?.properties;
  const scripConfig = {
    dev: devLaunchScript,
    prod: prodLaunchScript,
    stage: stageLaunchScript,
    default: '',
  };
  const script = scripConfig[ENV || 'default'];
  if ((typeof window !== 'undefined') && script) {
    await loadScript(script);
  }
  // Subscribe to requestSuccess event
  subscribe(element, formId, async (_element, fieldModel) => {
    const { form } = fieldModel;
    const analyticsFilePath = fieldModel?.properties?.analyticsFilePath;
    if ((fieldModel?.properties?.onLoad === 'loadAnalytics')) { // setkeyvalue ---> on analytics componennet - i.e : onLoad-loadAnalytics
      if (analyticsFilePath) {
        const { default: triggerAnalytics } = await import(analyticsFilePath);
        triggerAnalytics(fieldModel, form, 'onLoad'); // loadAnalytics
      }
    }
    fieldModel.subscribe(async (event) => {
      if (analyticsFilePath) {
        const { default: triggerAnalytics } = await import(analyticsFilePath);
        triggerAnalytics(event, form, 'click'); // normal button click - with no api tooling action over the button.
      }
    }, 'sendAnalytics');
    form.subscribe(async (event) => {
      if (analyticsFilePath) {
        const { default: triggerAnalytics } = await import(analyticsFilePath);
        triggerAnalytics(event, form, 'ctaClickWithBankApiResponse'); // api button click - with api tooling action over the button, will be triggered on success
      }
    }, 'requestSuccess');
    form.subscribe((event) => {
      // eslint-disable-next-line no-console
      console.log('Request success event received:', event);
      // Add your analytics tracking logic here
    }, 'requestFailure');
  });
  return element;
}
/**
 * Notes:
 * 1) Load environment-specific scripts:
 *    - Loads the correct script (`devLaunchScript`, `stageLaunchScript`, `prodLaunchScript`)
 *      based on the current `ENV` value.
 *    - In form authoring, these script paths can be authored under the field properties.
 *
 * 2) Load analytics file dynamically:
 *    - In form authoring, `analyticsFilePath` must be authored (e.g., "../../../../siccdc/analytics.js").
 *    - The analytics file must export a single default function, e.g., `export default function triggerAnalytics(event, form, actiontype)`,
 *      which is used to track user interactions and system events.
 *
 * The `triggerAnalytics` function can handle the following event types:
 *    - `onLoad`: Triggered during the initial page load.
 *    - `click`: Triggered for normal button clicks without API tooling.
 *    - `ctaClickWithBankApiResponse`: Triggered for API-integrated button actions (fires on `requestSuccess`).
 *
 * - to handle click:
 * setFieldProperty of analytics compoennet with triggert event and dispatchevent(custom:sendAnalytics) to fire the ui click and handles
 * - to handle onLoad
 * setFieldPropert with key: onLoad and value as loadAnalytics
 *
 */
