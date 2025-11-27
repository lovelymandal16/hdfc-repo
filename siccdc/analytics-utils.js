/* eslint-disable max-len */
import { CLICK_CONFIG, LOAD_CONFIG } from './analytics-constant.js';

/**
 * evaluateApiResponse function used in the api button click events where it validates the response and return the results in objetc
 */
const evaluateApiResponse = (apiEventTrigger, payload, apiName) => {
  const result = {
    success: '',
    errorCode: '',
    errorMsg: '',
    errorPage: 'Error Page',
    nameOfApi: apiName,
    journeyState: '',
  };
  switch (apiEventTrigger) {
    case 'resendOtp-customerIdentificationOTPGen.json-click':
    case 'getOtp-customerIdentificationOTPGen.json-click': {
      result.errorCode = payload?.otpGen?.status?.errorCode;
      result.errorMsg = payload?.otpGen?.status?.errorMsg;
      if ((result.errorCode === '0')) {
        result.success = true;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = CLICK_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    case 'submitButton-otpValidationOrchestration.json-click': {
      result.errorCode = payload?.otpValidationResponse?.status?.errorCode || payload?.status?.errorCode;
      result.errorMsg = payload?.otpValidationResponse?.status?.errorMsg || payload?.status?.errorMsg;
      if ((result.errorCode === '0')) {
        result.success = true;
        result.journeyState = CLICK_CONFIG['submitButton-otpValidationOrchestration.json-click'].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = CLICK_CONFIG['submitButton-otpValidationOrchestration.json-click'].journeyStateFailureCase;
        result.errorPage = CLICK_CONFIG['submitButton-otpValidationOrchestration.json-click'].errorPage;
      }
      break;
    }
    case 'ccLoginFragment-billdesk.json-showAndSetData_setUpSPSectionFragment_CC_FLOW': {
      result.errorCode = payload?.status?.errorCode;
      result.errorMsg = payload?.status?.errorMessage;
      if ((result.errorCode === 'BD0000')) {
        result.success = true;
        result.journeyState = CLICK_CONFIG['ccLoginFragment-billdesk.json-showAndSetData_setUpSPSectionFragment_CC_FLOW'].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = CLICK_CONFIG['ccLoginFragment-billdesk.json-showAndSetData_setUpSPSectionFragment_CC_FLOW'].journeyStateFailureCase;
        result.errorPage = CLICK_CONFIG['ccLoginFragment-billdesk.json-showAndSetData_setUpSPSectionFragment_CC_FLOW'].errorPage;
      }
      break;
    }
    case 'setUpSPSectionFragment-billerDetails.json-showAndSetData_newBillerFragment':
    case 'setUpSPSectionFragment-billerDetails.json-showAndSetData_billerRegistrationSection': {
      result.errorCode = payload?.status?.errorCode;
      result.errorMsg = payload?.status?.errorMessage;
      if ((result.errorCode === '0')) {
        result.success = true;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = CLICK_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    case 'billerRegistrationSection-paymentvalidation.json-continueToReviewScreen': {
      result.errorCode = payload?.status?.errorCode;
      result.errorMsg = payload?.status?.errorMessage;
      if ((result.errorCode === 'BD0000')) {
        result.success = true;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else if ((result.errorCode === 'BD0002')) {
        result.success = false;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = CLICK_CONFIG[apiEventTrigger].errorPage;
      } else {
        result.success = false;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = 'Error Page';
      }
      break;
    }
    case 'continueToIdcom-fetchauthcode.json-click': {
      result.errorCode = payload?.status?.errorCode;
      result.errorMsg = payload?.status?.errorMessage;
      if ((result.errorCode === '0000')) {
        result.success = true;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = CLICK_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    case 'reloadAfterIdCom': {
      const response = JSON.parse(payload);
      result.errorCode = response?.status?.errorCode || response?.errorCode;
      result.errorMsg = response?.status?.errorMessage || response?.errorMessage;
      if ((result.errorCode === '0000')) {
        result.success = true;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = LOAD_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    case 'reloadAfterModifyBillApi':
    case 'reloadAfterCreateBillApi':
    case 'reloadAfterValidateAcount': {
      const response = JSON.parse(payload);
      result.errorCode = response?.status?.errorCode || response?.errorCode;
      result.errorMsg = response?.status?.errorMessage || response?.errorMessage;
      if ((result.errorCode === 'BD0000')) {
        result.success = true;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = LOAD_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    case 'reloadAfterIdComStatus': {
      const response = JSON.parse(payload);
      result.errorCode = response?.errorcode;
      result.errorMsg = response?.errormessage;
      if (response?.success === 'true') {
        result.success = true;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateFailureCase;
      }
      break;
    }
    default:
      break;
  }
  return result;
};

/**
 * Hashes a phone number using SHA-256 algorithm.
 *
 * @function hashInSha256
 * @param {string}  - The phone number to be hashed.
 * @returns {Promise<string>} A promise that resolves to the hashed phone number in hexadecimal format.
 */
const hashInSha256 = async (inputString) => {
  const encoder = new TextEncoder();
  const rawdata = encoder.encode(inputString);
  const hash = await crypto.subtle.digest('SHA-256', rawdata);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const hashPhNo = async (phoneNumber) => {
  const hashed = await hashInSha256(String(phoneNumber));
  return hashed;
};

const stripNonAlphaChars = (str) => str?.replace(/[^a-zA-Z\s]/g, '');

export {
  evaluateApiResponse,
  stripNonAlphaChars,
  hashPhNo,
};
