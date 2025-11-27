/* eslint-disable max-len */
import { CLICK_CONFIG, LOAD_CONFIG } from './analytics-constant.js';

/**
 * evaluateApiResponse function used in the api button click events where it validates the response and return the results in object
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
    case 'proceedToOffer-xpl-offer-api.json-click': {
      result.errorCode = payload?.status?.errorCode || payload?.errorCode;
      result.errorMsg = payload?.status?.errorMessage || payload?.errorMessage;
      if (result.errorCode === '0000' || result.errorCode === '0') {
        result.success = true;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = CLICK_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    case 'acceptOffer-xpl-accept-api.json-click': {
      result.errorCode = payload?.status?.errorCode || payload?.errorCode;
      result.errorMsg = payload?.status?.errorMessage || payload?.errorMessage;
      if (result.errorCode === '0000' || result.errorCode === '0') {
        result.success = true;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = CLICK_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    case 'submitDetails-xpl-submit-api.json-click': {
      result.errorCode = payload?.status?.errorCode || payload?.errorCode;
      result.errorMsg = payload?.status?.errorMessage || payload?.errorMessage;
      if (result.errorCode === '0000' || result.errorCode === '0') {
        result.success = true;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = CLICK_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    case 'completeVerification-xpl-verify-api.json-click': {
      result.errorCode = payload?.status?.errorCode || payload?.errorCode;
      result.errorMsg = payload?.status?.errorMessage || payload?.errorMessage;
      if (result.errorCode === '0000' || result.errorCode === '0') {
        result.success = true;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = CLICK_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = CLICK_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    // Handle page load API responses
    case 'reloadAfterOfferApi': {
      const response = typeof payload === 'string' ? JSON.parse(payload) : payload;
      result.errorCode = response?.status?.errorCode || response?.errorCode;
      result.errorMsg = response?.status?.errorMessage || response?.errorMessage;
      if (result.errorCode === '0000' || result.errorCode === '0') {
        result.success = true;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = LOAD_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    case 'reloadAfterSubmitDetails': {
      const response = typeof payload === 'string' ? JSON.parse(payload) : payload;
      result.errorCode = response?.status?.errorCode || response?.errorCode;
      result.errorMsg = response?.status?.errorMessage || response?.errorMessage;
      if (result.errorCode === '0000' || result.errorCode === '0') {
        result.success = true;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = LOAD_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    case 'reloadAfterVerification': {
      const response = typeof payload === 'string' ? JSON.parse(payload) : payload;
      result.errorCode = response?.status?.errorCode || response?.errorCode;
      result.errorMsg = response?.status?.errorMessage || response?.errorMessage;
      if (result.errorCode === '0000' || result.errorCode === '0') {
        result.success = true;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateSuccessCase;
      } else {
        result.success = false;
        result.journeyState = LOAD_CONFIG[apiEventTrigger].journeyStateFailureCase;
        result.errorPage = LOAD_CONFIG[apiEventTrigger].errorPage;
      }
      break;
    }
    default:
      // Default handling for unknown API events
      result.errorCode = payload?.status?.errorCode || payload?.errorCode || '9999';
      result.errorMsg = payload?.status?.errorMessage || payload?.errorMessage || 'Unknown error';
      result.success = false;
      result.journeyState = 'XPL_UNKNOWN_ERROR';
      break;
  }
  return result;
};

/**
 * Hashes a phone number using SHA-256 algorithm.
 *
 * @function hashInSha256
 * @param {string} inputString - The string to be hashed.
 * @returns {Promise<string>} A promise that resolves to the hashed string in hexadecimal format.
 */
const hashInSha256 = async (inputString) => {
  const encoder = new TextEncoder();
  const rawdata = encoder.encode(inputString);
  const hash = await crypto.subtle.digest('SHA-256', rawdata);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Hashes a phone number using SHA-256 algorithm.
 *
 * @function hashPhNo
 * @param {string} phoneNumber - The phone number to be hashed.
 * @returns {Promise<string>} A promise that resolves to the hashed phone number.
 */
const hashPhNo = async (phoneNumber) => {
  const hashed = await hashInSha256(String(phoneNumber));
  return hashed;
};

/**
 * Strips non-alphabetic characters from a string.
 *
 * @function stripNonAlphaChars
 * @param {string} str - The string to process.
 * @returns {string} String with only alphabetic characters and spaces.
 */
const stripNonAlphaChars = (str) => str?.replace(/[^a-zA-Z\s]/g, '');

/**
 * Formats currency amount for analytics.
 *
 * @function formatCurrency
 * @param {string|number} amount - The amount to format.
 * @returns {string} Formatted currency string.
 */
const formatCurrency = (amount) => {
  if (!amount) return '';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${numAmount.toLocaleString('en-IN')}`;
};

/**
 * Extracts offer details from form data for analytics.
 *
 * @function extractOfferDetails
 * @param {object} formData - The form data object.
 * @returns {object} Extracted offer details.
 */
const extractOfferDetails = (formData) => {
  return {
    apOffer: formData?.apOfferDetails || formData?.selectedApOffer || formData?.apOfferAmount || '',
    bureauOffer: formData?.bureauOfferDetails || formData?.selectedBureauOffer || formData?.bureauOfferAmount || '',
    selectedOfferType: formData?.offerType || formData?.selectedOfferType || '',
    loanAmount: formData?.loanAmount || formData?.approvedAmount || formData?.finalAmount || '',
    tenure: formData?.tenure || formData?.loanTenure || formData?.repaymentTenure || '',
    interestRate: formData?.interestRate || formData?.roi || formData?.rate || '',
  };
};

/**
 * Validates if the current environment supports analytics tracking.
 *
 * @function isAnalyticsEnabled
 * @returns {boolean} True if analytics can be tracked.
 */
const isAnalyticsEnabled = () => {
  return typeof window !== 'undefined' && window._satellite;
};

/**
 * Safely gets nested property from object.
 *
 * @function safeGet
 * @param {object} obj - The object to get property from.
 * @param {string} path - Dot notation path to property.
 * @param {any} defaultValue - Default value if property doesn't exist.
 * @returns {any} The property value or default value.
 */
const safeGet = (obj, path, defaultValue = '') => {
  return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
};

export {
  evaluateApiResponse,
  stripNonAlphaChars,
  hashPhNo,
  hashInSha256,
  formatCurrency,
  extractOfferDetails,
  isAnalyticsEnabled,
  safeGet,
};
