import { DIGITAL_DATA_SCHEMA, CLICK_CONFIG } from './analytics-constant.js';
import { extractOfferDetails, isAnalyticsEnabled } from './analytics-utils.js';

/**
 * bindErrorDataLayer is used to bind error code, message and name of the api,
 * which will be used in send click analytics
 */
const bindErrorDataLayer = (eventName, payload, digitalData) => {
  switch (eventName) {
    default:
      digitalData.page.pageInfo.errorCode = payload?.errorCode || '0';
      digitalData.page.pageInfo.errorMessage = payload?.errorMsg || 'success';
      digitalData.page.pageInfo.errorAPI = payload?.apiName || '';
      break;
  }
};

/**
 * setGenericLoadProp used to set some generic load props will be used in send page load event
 */
const setGenericLoadProp = (journeyState, formData, digitalData) => {
  digitalData.user.pseudoID = '';
  digitalData.user.journeyName = formData?.journeyName || 'XPL Assisted';
  digitalData.user.journeyID = formData?.journeyId || '';
  digitalData.user.journeyState = journeyState;
  digitalData.user.journeyLevel2 = formData?.journeyLevel2 || formData?.subJourney || '';
  digitalData.user.userType = formData?.userType || formData?.customerType || '';
  digitalData.user.casa = formData?.casa || formData?.casaStatus || 'Yes'; // Default for XPL
  digitalData.user.aan = '';
  digitalData.form.name = 'assisted_journey';
  digitalData.form.emiCategory = '';
  digitalData.event.phone = String(formData?.phoneNumber || formData?.mobileNumber || '');
  
  // Always include offer details on page loads
  const offerDetails = extractOfferDetails(formData);
  digitalData.formDetails.apOffer = offerDetails.apOffer;
  digitalData.formDetails.bureauOffer = offerDetails.bureauOffer;
};

/**
 * setGenericClickProp used to set some generic properties for the send submit click event function
 */
const setGenericClickProp = (eventType, formData, journeyState, digitalData) => {
  // REQUIRED FOR ALL BUTTON CLICKS - Based on requirements
  
  // Page Information
  digitalData.page.pageInfo.pageName = CLICK_CONFIG[eventType]?.pageName || formData?.currentPageName || '';
  
  // Link Information (Button/Link details)
  digitalData.link = {};
  digitalData.link.linkName = CLICK_CONFIG[eventType]?.linkName || '';
  digitalData.link.linkType = CLICK_CONFIG[eventType]?.linkType || 'button';
  digitalData.link.linkPosition = CLICK_CONFIG[eventType]?.linkPosition || 'Form';
  
  // User Journey Information
  digitalData.user.pseudoID = '';
  digitalData.user.journeyID = formData?.journeyId || '';
  digitalData.user.journeyName = formData?.journeyName || 'XPL Assisted';
  digitalData.user.journeyLevel2 = formData?.journeyLevel2 || formData?.subJourney || '';
  digitalData.user.journeyState = journeyState;
  digitalData.user.casa = formData?.casa || formData?.casaStatus || 'Yes'; // Default for XPL
  
  // Form Information
  digitalData.form.name = 'assisted_journey';
  
  // Form Details - CRITICAL for XPL Assisted (ALL CLICKS must have these)
  const offerDetails = extractOfferDetails(formData);
  digitalData.formDetails.apOffer = offerDetails.apOffer;
  digitalData.formDetails.bureauOffer = offerDetails.bureauOffer;
  digitalData.formDetails.loanAmount = offerDetails.loanAmount;
  digitalData.formDetails.tenure = offerDetails.tenure;
  digitalData.formDetails.interestRate = offerDetails.interestRate;
  
  // Event Information
  digitalData.event.phone = String(formData?.phoneNumber || formData?.mobileNumber || '');
  digitalData.event.status = '1'; // Default success status for clicks
};

/**
 * SendPageLoadEvent analytics
 * @param {string} journeyState
 * @param {object} formData
 * @param {string} pageName
 */
function sendPageloadEvent(journeyState, formData, pageName) {
  const digitalData = structuredClone(DIGITAL_DATA_SCHEMA);
  digitalData.page.pageInfo.pageName = pageName;
  setGenericLoadProp(journeyState, formData, digitalData);

  switch (pageName) {
    case 'XPL Assisted - Landing Page': {
      digitalData.user.userType = formData?.customerType || 'new';
      digitalData.formDetails.customerType = formData?.customerType || '';
      break;
    }
    case 'XPL Assisted - Offer Page': {
      // Capture all available offers
      digitalData.formDetails.availableOffers = formData?.allOffers || '';
      digitalData.formDetails.recommendedOffer = formData?.recommendedOffer || '';
      digitalData.formDetails.offerCount = formData?.offerCount || '';
      digitalData.formDetails.selectedOfferType = formData?.offerType || '';
      break;
    }
    case 'XPL Assisted - Customer Details': {
      digitalData.formDetails.customerType = formData?.customerType || '';
      digitalData.formDetails.employmentType = formData?.employmentType || '';
      digitalData.formDetails.monthlyIncome = formData?.monthlyIncome || '';
      break;
    }
    case 'XPL Assisted - Verification': {
      digitalData.formDetails.verificationType = formData?.verificationType || '';
      digitalData.formDetails.verificationMethod = formData?.verificationMethod || '';
      digitalData.event.validationMethod = formData?.authMethod || '';
      break;
    }
    case 'XPL Assisted - Confirmation': {
      digitalData.user.journeyState = 'XPL_APPLICATION_COMPLETE';
      digitalData.formDetails.applicationId = formData?.applicationId || '';
      digitalData.formDetails.finalApprovalAmount = formData?.finalAmount || formData?.approvedAmount || '';
      digitalData.formDetails.referenceNumber = formData?.referenceNumber || '';
      digitalData.formDetails.loanAccountNumber = formData?.loanAccountNumber || '';
      digitalData.event.validationMethod = formData?.queryParams?.authmode || '';
      break;
    }
    default:
      // Default case for any other pages
      break;
  }

  if (isAnalyticsEnabled()) {
    window.digitalData = digitalData || {};
    // eslint-disable-next-line no-underscore-dangle
    window?._satellite?.track('pageload');
  }
}

/**
 * send click analytics events
 * @param {string} eventType
 * @param {object | null} statusPayload - api payload if contains error code, and message
 * @param {object} formData
 * @param {string} journeyState
 * @param {object} digitalData
 */
async function sendClickAnalytics(eventType, statusPayload, formData, journeyState, digitalData) {
  bindErrorDataLayer(eventType, statusPayload, digitalData);
  setGenericClickProp(eventType, formData, journeyState, digitalData);

  // Event-specific customizations
  switch (eventType) {
    case 'proceedToOffer':
    case 'proceedToOffer-xpl-offer-api.json-click': {
      digitalData.formDetails.customerType = formData?.customerType || '';
      digitalData.formDetails.initialRequest = 'true';
      
      if (isAnalyticsEnabled()) {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite?.track('submit');
      }
      
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType]?.nextPage || 'XPL Assisted - Offer Page');
      }, 1000);
      break;
    }
    case 'acceptOffer':
    case 'acceptOffer-xpl-accept-api.json-click': {
      // Ensure offer details are captured when accepting
      digitalData.formDetails.selectedOfferType = formData?.offerType || formData?.selectedOfferType || 'AP';
      digitalData.formDetails.acceptedAmount = formData?.acceptedAmount || formData?.selectedAmount || '';
      digitalData.formDetails.acceptedTenure = formData?.acceptedTenure || formData?.selectedTenure || '';
      digitalData.formDetails.acceptedRate = formData?.acceptedRate || formData?.selectedRate || '';
      
      if (isAnalyticsEnabled()) {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite?.track('submit');
      }
      
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType]?.nextPage || 'XPL Assisted - Customer Details');
      }, 1000);
      break;
    }
    case 'rejectOffer': {
      // Capture rejection reason if available
      digitalData.formDetails.rejectionReason = formData?.rejectionReason || 'User declined';
      digitalData.formDetails.rejectedOfferType = formData?.offerType || '';
      
      if (isAnalyticsEnabled()) {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite?.track('submit');
      }
      
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType]?.nextPage || 'XPL Assisted - Landing Page');
      }, 1000);
      break;
    }
    case 'submitDetails':
    case 'submitDetails-xpl-submit-api.json-click': {
      // Capture customer details being submitted
      digitalData.formDetails.customerType = formData?.customerType || '';
      digitalData.formDetails.employmentType = formData?.employmentType || '';
      digitalData.formDetails.monthlyIncome = formData?.monthlyIncome || '';
      digitalData.formDetails.panNumber = formData?.panNumber ? 'provided' : 'not_provided';
      digitalData.formDetails.aadharNumber = formData?.aadharNumber ? 'provided' : 'not_provided';
      
      if (isAnalyticsEnabled()) {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite?.track('submit');
      }
      
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType]?.nextPage || 'XPL Assisted - Verification');
      }, 1000);
      break;
    }
    case 'completeVerification':
    case 'completeVerification-xpl-verify-api.json-click': {
      // Capture verification method
      digitalData.event.validationMethod = formData?.verificationType || formData?.authMethod || '';
      digitalData.formDetails.verificationStatus = 'completed';
      digitalData.formDetails.verificationType = formData?.verificationType || '';
      
      if (isAnalyticsEnabled()) {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite?.track('submit');
      }
      
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType]?.nextPage || 'XPL Assisted - Confirmation');
      }, 1000);
      break;
    }
    case 'editDetails': {
      digitalData.formDetails.editAction = 'initiated';
      digitalData.formDetails.editSection = formData?.editSection || 'general';
      
      if (isAnalyticsEnabled()) {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite?.track('submit');
      }
      
      // No page navigation for edit action
      break;
    }
    case 'viewOfferDetails': {
      digitalData.formDetails.offerDetailsViewed = 'true';
      digitalData.formDetails.viewedOfferType = formData?.viewedOfferType || '';
      
      if (isAnalyticsEnabled()) {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite?.track('submit');
      }
      
      // No page navigation for view action
      break;
    }
    case 'termsAndConditions': {
      digitalData.formDetails.termsViewed = 'true';
      
      if (isAnalyticsEnabled()) {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite?.track('submit');
      }
      
      // No page navigation for terms view
      break;
    }
    case 'privacyPolicy': {
      digitalData.formDetails.privacyViewed = 'true';
      
      if (isAnalyticsEnabled()) {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite?.track('submit');
      }
      
      // No page navigation for privacy view
      break;
    }
    case 'backButton': {
      digitalData.formDetails.navigationDirection = 'back';
      digitalData.formDetails.previousPage = formData?.currentPage || '';
      
      if (isAnalyticsEnabled()) {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite?.track('submit');
      }
      
      // Dynamic page navigation based on current context
      const previousPage = formData?.previousPage || 'XPL Assisted - Landing Page';
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, previousPage);
      }, 1000);
      break;
    }
    default: {
      // For any other button clicks, ensure basic data is still captured
      if (isAnalyticsEnabled()) {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite?.track('submit');
      }
      
      // Auto-navigate to next page if configured
      const nextPage = CLICK_CONFIG[eventType]?.nextPage;
      if (nextPage && nextPage !== 'Dynamic') {
        setTimeout(() => {
          sendPageloadEvent(journeyState, formData, nextPage);
        }, 1000);
      }
      break;
    }
  }
}

/**
 * send error analytics
 * @param {string} errorCode
 * @param {string} errorMsg
 * @param {string} errorApi
 * @param {string} pageName
 * @param {string} journeyState
 * @param {object} formData
 */
function sendErrorAnalytics(errorCode, errorMsg, errorApi, pageName, journeyState, formData) {
  const digitalData = structuredClone(DIGITAL_DATA_SCHEMA);
  setGenericLoadProp(journeyState, formData, digitalData);
  digitalData.page.pageInfo.errorCode = errorCode;
  digitalData.page.pageInfo.errorMessage = errorMsg;
  digitalData.page.pageInfo.errorAPI = errorApi;
  digitalData.page.pageInfo.pageName = pageName || 'Error Page';
  
  // Include offer details even in error scenarios
  const offerDetails = extractOfferDetails(formData);
  digitalData.formDetails.apOffer = offerDetails.apOffer;
  digitalData.formDetails.bureauOffer = offerDetails.bureauOffer;
  
  if (isAnalyticsEnabled()) {
    window.digitalData = digitalData || {};
    // eslint-disable-next-line no-underscore-dangle
    window?._satellite?.track('pageload');
  }
}

export {
  sendErrorAnalytics,
  sendClickAnalytics,
  sendPageloadEvent,
};
