/* eslint-disable max-len */
import {
  DIGITAL_DATA_SCHEMA, CLICK_CONFIG, LOAD_CONFIG, API_EXEMPT_LIST,
} from './analytics-constant.js';
import { sendClickAnalytics, sendErrorAnalytics, sendPageloadEvent } from './analytics-actions.js';
import { evaluateApiResponse, stripNonAlphaChars } from './analytics-utils.js';

/**
 * Main analytics function for XPL Assisted journey
 * This function handles all analytics events for the XPL Assisted form
 * 
 * @param {object} event - The event object containing interaction data
 * @param {object} form - The form instance with all form data
 * @param {string} actionType - Type of action ('onLoad', 'click', 'ctaClickWithBankApiResponse')
 */
function triggerAnalytics(event, form, actionType) {
  const digitalData = structuredClone(DIGITAL_DATA_SCHEMA);
  const formData = form.exportData();
  formData.journeyId = form.properties.journeyId;
  formData.journeyName = form.properties.journeyName || 'XPL Assisted';
  
  switch (actionType) {
    case 'ctaClickWithBankApiResponse': {
      const buttonEventName = event?.payload?.response?.submitter?.$name;
      const apiName = event?.payload?.request?.url?.split('/').pop() || '';
      const triggerType = event?.payload?.targetEvent?.type;
      const excludedApi = API_EXEMPT_LIST.some((el) => stripNonAlphaChars(el) === (stripNonAlphaChars(apiName)));
      
      if (excludedApi) {
        return;
      }
      
      const apiResBody = event?.payload?.response?.body;
      const apiClickEventName = `${buttonEventName}-${apiName}-${triggerType}`; // ex: acceptOffer-xpl-accept-api.json-click
      const processedApiResult = evaluateApiResponse(apiClickEventName, apiResBody, apiName);
      const {
        errorCode, errorMsg, journeyState, nameOfApi, errorPage,
      } = processedApiResult;

      if (processedApiResult.success === false) {
        sendErrorAnalytics(errorCode, errorMsg, nameOfApi, errorPage, journeyState, formData);
      } else {
        sendClickAnalytics(apiClickEventName, processedApiResult, formData, journeyState, digitalData);
      }
      break;
    }
    case 'click': {
      // eslint-disable-next-line no-underscore-dangle, no-unsafe-optional-chaining
      const { triggerEventName } = event?._target?.properties; // triggerEventName from button properties
      const journeyState = CLICK_CONFIG[triggerEventName]?.journeyStateSuccessCase || 'XPL_CLICK_EVENT';
      sendClickAnalytics(triggerEventName, null, formData, journeyState, digitalData);
      break;
    }
    case 'onLoad': {
      const {
        triggerEventName, triggerEventApiPayload, triggerEventApiName, formQueryParamData,
        // eslint-disable-next-line no-unsafe-optional-chaining
      } = event?.properties;
      
      if (formQueryParamData) {
        formData.queryParams = JSON.parse(formQueryParamData);
      }
      
      if (LOAD_CONFIG[triggerEventName]) {
        switch (triggerEventName) {
          case 'initialLoad': // page initial load
            sendPageloadEvent(LOAD_CONFIG[triggerEventName].journeyStateSuccessCase, formData, LOAD_CONFIG[triggerEventName].pageName);
            break;
          case 'offerPageLoad':
          case 'customerDetailsLoad':
          case 'verificationLoad':
          case 'confirmationLoad':
          case 'reloadAfterOfferApi':
          case 'reloadAfterSubmitDetails':
          case 'reloadAfterVerification': {
            const {
              success,
              errorCode,
              errorMsg,
              errorPage,
              nameOfApi,
              journeyState,
            } = evaluateApiResponse(triggerEventName, triggerEventApiPayload, triggerEventApiName);
            
            if (success === false) {
              sendErrorAnalytics(errorCode, errorMsg, nameOfApi, errorPage, journeyState, formData);
            } else {
              const { pageName } = LOAD_CONFIG[triggerEventName];
              if (pageName) {
                sendPageloadEvent(journeyState, formData, pageName);
              }
            }
            break;
          }
          default:
            // Handle unknown load events with default behavior
            const defaultJourneyState = LOAD_CONFIG[triggerEventName]?.journeyStateSuccessCase || 'XPL_UNKNOWN_LOAD';
            const defaultPageName = LOAD_CONFIG[triggerEventName]?.pageName || 'XPL Assisted - Unknown Page';
            sendPageloadEvent(defaultJourneyState, formData, defaultPageName);
            break;
        }
      }
      break;
    }
    default:
      // Log unknown action types for debugging
      // eslint-disable-next-line no-console
      console.warn(`Assisted Journey Analytics: Unknown action type: ${actionType}`);
      break;
  }
}

export default triggerAnalytics;

/**
 * Usage Notes for XPL Assisted Analytics:
 * 
 * 1) Configuration in Form Authoring:
 *    - Set analyticsFilePath: "../../../../assets/assisted_journey/analytics.js"
 *    - Set onLoad: "loadAnalytics" for page load tracking
 *    - Set triggerEventName based on the page/event (e.g., "initialLoad", "offerPageLoad")
 * 
 * 2) Button Click Configuration:
 *    - Set triggerEventName in button properties (e.g., "acceptOffer", "submitDetails")
 *    - Use setFieldProperty and dispatchEvent(custom:sendAnalytics) for UI clicks
 * 
 * 3) API Integration:
 *    - API calls automatically trigger 'ctaClickWithBankApiResponse' events
 *    - API responses are evaluated for success/failure
 *    - Error scenarios automatically send error analytics
 * 
 * 4) Data Captured on ALL Events:
 *    - digitalData.page.pageInfo.pageName
 *    - digitalData.user.journeyID, journeyName, journeyLevel2, journeyState, casa
 *    - digitalData.form.name (always "assisted_journey")
 *    - digitalData.formDetails.apOffer, bureauOffer (critical for XPL)
 *    - digitalData.link.linkName, linkType, linkPosition (for clicks)
 * 
 * 5) Journey States:
 *    - XPL_JOURNEY_INITIATED → XPL_OFFER_REQUESTED → XPL_OFFER_ACCEPTED → 
 *      XPL_DETAILS_SUBMITTED → XPL_VERIFICATION_COMPLETE → XPL_APPLICATION_COMPLETE
 * 
 * 6) Error Handling:
 *    - All API failures automatically tracked
 *    - Error codes and messages captured
 *    - Fallback to error pages configured
 * 
 * 7) Page Navigation:
 *    - Automatic page load events after successful clicks
 *    - 1-second delay for proper sequencing
 *    - Dynamic navigation based on form context
 */
