/* eslint-disable max-len */
import {
  DIGITAL_DATA_SCHEMA, CLICK_CONFIG, LOAD_CONFIG, API_EXEMPT_LIST,
} from './analytics-constant.js';
import { sendClickAnalytics, sendErrorAnalytics, sendPageloadEvent } from './analytics-actions.js';
import { evaluateApiResponse, stripNonAlphaChars } from './analytics-utils.js';

function triggerAnalytics(event, form, actionType) {
  const digitalData = structuredClone(DIGITAL_DATA_SCHEMA);
  const formData = form.exportData();
  formData.journeyId = form.properties.journeyId;
  formData.journeyName = form.properties.journeyName;
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
      const apiClickEventName = `${buttonEventName}-${apiName}-${triggerType}`; // ex: getOtp-customerIdentificationOTPGen.json-click  // event.payload.targetEvent.type
      const proccessedApiResult = evaluateApiResponse(apiClickEventName, apiResBody, apiName);
      const {
        errorCode, errorMsg, journeyState, nameOfApi, errorPage,
      } = proccessedApiResult;

      if ((proccessedApiResult.success === false)) {
        sendErrorAnalytics(errorCode, errorMsg, nameOfApi, errorPage, journeyState, formData);
      } else {
        sendClickAnalytics(apiClickEventName, proccessedApiResult, formData, journeyState, digitalData);
      }
      break;
    }
    case 'click': {
      // eslint-disable-next-line no-underscore-dangle, no-unsafe-optional-chaining
      const { triggerEventName } = event?._target?.properties; // triggerEventName;
      const journeyState = CLICK_CONFIG[triggerEventName].journeyStateSuccessCase;
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
          case 'reloadAfterIdComStatus':
          case 'reloadAfterValidateAcount':
          case 'reloadAfterCreateBillApi':
          case 'reloadAfterModifyBillApi':
          case 'reloadAfterIdCom': {
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
            break;
        }
      }
      break;
    }
    default:// do nothing
      break;
  }
}

export default triggerAnalytics;
