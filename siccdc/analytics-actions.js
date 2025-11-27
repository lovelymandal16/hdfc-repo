import { DIGITAL_DATA_SCHEMA, CLICK_CONFIG } from './analytics-constant.js';

/**
 * bindErrorDataLayer is used to bind eror code, message and name of the api,
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
 * setGenericClickProp used to sent some generic for the send submit click event function
 */
const setGenericClickProp = (eventType, formData, journeyState, digitalData) => {
  digitalData.link = {};
  digitalData.link.linkName = CLICK_CONFIG[eventType].linkName;
  digitalData.link.linkType = CLICK_CONFIG[eventType].linkType;
  digitalData.link.linkPosition = CLICK_CONFIG[eventType].linkPosition;
  digitalData.user.pseudoID = '';
  digitalData.user.journeyName = formData?.journeyName || '';
  digitalData.user.journeyID = formData?.journeyId || '';
  digitalData.user.journeyState = journeyState;
  let journeyLevel2 = '';
  if (!formData?.selectedFlowType) {
    journeyLevel2 = '';
  } else {
    journeyLevel2 = formData?.selectedFlowType === 'A' ? 'Add New Biller' : 'Set Up SmartPay';
  }
  digitalData.user.journeyLevel2 = journeyLevel2;
  digitalData.form.name = 'siccdc';
  digitalData.user.casa = 'Yes'; // for SICCDC- only for CASA
  digitalData.event.phone = String((formData?.RegisteredPhoneNum) || '');
};

/**
 * setGenericLoadProp used to sent some generic load props will be used in send pag load event
 */
const setGenericLoadProp = (journeyState, formData, digitalData) => {
  digitalData.user.pseudoID = '';// Need to check
  digitalData.user.journeyName = formData?.journeyName;
  digitalData.user.journeyID = formData?.journeyId;
  digitalData.user.journeyState = journeyState;
  let journeyLevel2 = '';
  if (!formData?.selectedFlowType) {
    journeyLevel2 = '';
  } else {
    journeyLevel2 = formData?.selectedFlowType === 'A' ? 'Add New Biller' : 'Set Up SmartPay';
  }
  digitalData.user.journeyLevel2 = journeyLevel2;
  digitalData.user.casa = 'Yes'; // for SICCDC- only for CASA
  digitalData.user.aan = '';
  digitalData.form.name = 'siccdc';
  digitalData.form.emiCategory = '';
  digitalData.event.phone = String((formData?.RegisteredPhoneNum) || '');
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
    // on load of page - required to capture some data on basis of screen
    case 'Step 3 - Smart Pay Screen': {
      digitalData.formDetails = {};
      // 👇 what  type of value ?
      // Eligible for Smartpay | Set up Smartpay | SmartPay Enabled
      const components = {
        first: (formData?.eligibleForSPCount ? 'Eligible for Smartpay|' : ''),
        second: 'Set up Smartpay',
        third: (formData?.spEnabledCount ? '|SmartPay Enabled' : ''),
      };
      const { first, second, third } = components;
      digitalData.formDetails.componentLoad = first + second + third;
      break;
    }
    case 'Step 4 - Add New Biller - Bill Details': {
      // todo - doublecheck - prepaid/postpaid case
      digitalData.formDetails.rechargeType = (!formData?.selectedBillerType) ? '' : (formData?.selectedBillerType === 'PAYEE' ? 'prepaid' : 'postpaid') || '';
      break;
    }
    case 'Step 5 - Add New Biller - Review Details': {
      // eslint-disable-next-line no-nested-ternary
      const paymentMethod = (formData?.selectedCardType === 'CC') ? 'Credit card' : (formData?.selectedCardType === 'DC') ? 'Dedit card' : '';
      digitalData.formDetails.rechargeType = (!formData?.selectedBillerType) ? '' : (formData?.selectedBillerType === 'PAYEE' ? 'prepaid' : 'postpaid') || '';
      digitalData.formDetails.paymentMethod = paymentMethod;
      break;
    }
    case 'Step 5 - Set Up SmartPay - Review Details': {
      // eslint-disable-next-line no-nested-ternary
      const paymentMethod = (formData?.selectedCardType === 'CC') ? 'Credit card' : (formData?.selectedCardType === 'DC') ? 'Dedit card' : '';
      digitalData.formDetails.paymentMethod = paymentMethod;
      break;
    }
    case 'Step 6 - Confirmation': { // onnboarderd_complete
      digitalData.user.journeyState = 'CUSTOMER_ONBOARDING_COMPLETE';
      digitalData.formDetails = {
        reference: formData?.referenceNumber || '',
        rechargeType: (!formData?.selectedBillerType) ? '' : (formData?.selectedBillerType === 'PAYEE' ? 'prepaid' : 'postpaid') || '',
        billerId: formData?.selectedBillerId || '',
        billerType: formData?.selectedBillerType || '',
        billVendor: formData?.selectedBillerName || '',
        billCategory: formData?.selectedBillerCategoryName || '',
        ownership: (formData?.billOwnershipOptions === '0') ? 'This bill is in my name' : 'This bill belongs to someone else',
        smartPayType: formData?.spLimitOptions === '0' ? 'Entire Bill Amount' : 'Set Maximum Limit',
        smartPayLimit: ((formData?.selectedBillerType !== 'PAYEE') && formData?.spLimit && formData?.spLimitOptions === '1') ? formData?.spLimit : '',
        frequency: formData?.frequency || '',
      };
      digitalData.event = {
        validationMethod: formData?.queryParams?.authmode || '',
      };
      break;
    }
    case 'Step 3 - List of bills Eligible for SmartPay': {
      digitalData.user.journeyLevel2 = 'Set Up SmartPay';
      break;
    }
    case 'Step 3 - List of Bills that can be added': {
      digitalData.user.journeyLevel2 = 'Add New Biller';
      break;
    }
    case 'Step 3 - List of bills with SmartPay Enabled': {
      digitalData.user.journeyLevel2 = 'Set Up SmartPay';
      break;
    }
    default:
      // nothing
      break;
  }
  if (typeof window !== 'undefined') {
    window.digitalData = digitalData || {};
    // eslint-disable-next-line no-underscore-dangle
    window?._satellite.track('pageload');
  }
}

/**
 * send click analytics events
 * @param {string} eventType
 * @param {object} formData
 * @param {object | null} statusPayload - api payload if contains error code, and message
 * @param {string} journeyState
 * @param {object} digitalData
 */
async function sendClickAnalytics(eventType, statusPayload, formData, journeyState, digitalData) {
  bindErrorDataLayer(eventType, statusPayload, digitalData);
  setGenericClickProp(eventType, formData, journeyState, digitalData);
  digitalData.page.pageInfo.pageName = CLICK_CONFIG[eventType].pageName;
  switch (eventType) {
    case 'getOtp-customerIdentificationOTPGen.json-click': {
      digitalData.event = {
        phone: String((formData?.RegisteredPhoneNum) || ''),
        lastDigits: formData?.ccDigits || '',
        validationMethod: (formData?.TypeOfCard === '0') ? 'CC' : 'DC',
        status: '1',
      };
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType].nextPage);
      }, 1000);
      break;
    }
    case 'ccLoginFragment-billdesk.json-showAndSetData_setUpSPSectionFragment_CC_FLOW': {
      digitalData.event.status = '1';
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType].nextPage);
      }, 1000);
      break;
    }
    case 'setUpSPSectionFragment-billerDetails.json-showAndSetData_newBillerFragment': {
      digitalData.page.pageInfo.pageName = formData?.spCurrentPage;
      digitalData.event.status = '1';
      digitalData.formDetails = {};
      digitalData.formDetails.billerType = formData?.selectedBillerType || '';
      digitalData.formDetails.billCategory = formData?.selectedBillerCategoryName || '';
      digitalData.link.linkName = `${formData?.spCategoryIconTitleValue} : ${formData?.selectedBillerCategoryName || ''}`;
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType].nextPage);
      }, 1000);
      break;
    }
    case 'setUpSPSectionFragment-billerDetails.json-showAndSetData_billerRegistrationSection': {
      digitalData.page.pageInfo.pageName = formData?.spCurrentPage;
      digitalData.event.status = '1';
      digitalData.formDetails = {};
      digitalData.formDetails.billCategory = formData?.selectedBillerCategoryName || '';
      digitalData.formDetails.billerId = formData?.selectedBillerId || '';
      digitalData.formDetails.billerType = formData?.selectedBillerType || '';
      digitalData.formDetails.billVendor = formData?.selectedBillerName || '';
      digitalData.formDetails.rechargeType = (!formData?.selectedBillerType) ? '' : (formData?.selectedBillerType === 'PAYEE' ? 'prepaid' : 'postpaid') || '';
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType].nextPage);
      }, 1000);
      break;
    }
    case 'gobackToBillerRegistration': {
      digitalData.event.status = '1';
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        const [newFlowPage, etbFlowPage] = CLICK_CONFIG[eventType].nextPage.split('|');
        const currentPage = formData?.selectedFlowType === 'A' ? newFlowPage : etbFlowPage;
        sendPageloadEvent(journeyState, formData, currentPage);
      }, 1000);
      break;
    }
    case 'goBackFromNewBiller':
    case 'backToSetupSPSection': {
      digitalData.event.status = '1';
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, formData?.spCurrentPage);
      }, 1000);
      break;
    }
    case 'addnewbillerflow_update_billerRegistrationSection': {
      digitalData.event.status = '1';
      digitalData.formDetails.billerType = formData?.selectedBillerType || '';
      digitalData.formDetails.billVendor = formData?.selectedBillerName || '';
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType].nextPage);
      }, 1000);
      break;
    }
    case 'continueToReviewScreen_flow_E': {
      digitalData.event.status = '1';
      digitalData.formDetails.frequency = formData?.frequency || '';
      digitalData.formDetails.smartPayType = formData?.spLimitOptions === '0' ? 'Entire Bill Amount' : 'Set Maximum Limit';
      digitalData.formDetails.smartPayLimit = ((formData?.selectedBillerType !== 'PAYEE') && formData?.spLimit && (formData?.spLimitOptions === '1')) ? formData?.spLimit : '';
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType].nextPage);
      }, 1000);
      break;
    }
    case 'billerRegistrationSection-paymentvalidation.json-continueToReviewScreen': {
      digitalData.event.status = '1';
      digitalData.formDetails.frequency = formData?.frequency || '';
      digitalData.formDetails.smartPayType = formData?.spLimitOptions === '0' ? 'Entire Bill Amount' : 'Set Maximum Limit';
      digitalData.formDetails.smartPayLimit = ((formData?.selectedBillerType !== 'PAYEE') && formData?.spLimit && (formData?.spLimitOptions === '1')) ? formData?.spLimit : '';
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType].nextPage);
      }, 1000);
      break;
    }
    case 'continueToIdcom-fetchauthcode.json-click': {
      const [newFlowPage, etbFlowPage] = CLICK_CONFIG[eventType].pageName.split('|');
      const currentPage = formData?.selectedFlowType === 'A' ? newFlowPage : etbFlowPage;
      digitalData.page.pageInfo.pageName = currentPage;
      digitalData.event.status = '1';
      digitalData.formDetails.frequency = formData?.frequency || '';
      digitalData.formDetails.smartPayType = formData?.spLimitOptions === '0' ? 'Entire Bill Amount' : 'Set Maximum Limit';
      digitalData.formDetails.smartPayLimit = ((formData?.selectedBillerType !== 'PAYEE') && formData?.spLimit && (formData?.spLimitOptions === '1')) ? formData?.spLimit : '';
      digitalData.formDetails.ownership = (formData?.billOwnershipOptions === '0') ? 'This bill is in my name' : 'This bill belongs to someone else';
      digitalData.formDetails.billCategory = formData?.selectedBillerCategoryName || '';
      digitalData.formDetails.billerId = formData?.selectedBillerId || '';
      digitalData.formDetails.billerType = formData?.selectedBillerType || '';
      digitalData.formDetails.rechargeType = (!formData?.selectedBillerType) ? '' : (formData?.selectedBillerType === 'PAYEE' ? 'prepaid' : 'postpaid') || '';
      digitalData.formDetails.billVendor = formData?.selectedBillerName || '';
      digitalData.assisted = {
        flag: formData?.bankUseToggle === '0' ? 'yes' : 'no',
        lg: formData?.lgCode || '',
        lc: formData?.lc1Code || '',
        lc2: formData?.lc2Code || '',
        smCode: formData?.smCode || '',
        branch: formData?.branchName || '',
        branchCity: formData?.branchCity || '',
        branchCode: formData?.branchCode || formData?.bankUse?.branchCode || '',
        tse: formData?.lgCode || '',
        empCode: formData?.lgCode || '',
        se: formData?.lgCode || '',
        dsa: formData?.dsaCode || '',
        dsaName: formData?.dsaName || '',
        promocode: formData?.promoCode || '',
        channel: formData?.channel || formData?.bankUse?.channelDdValue || '',
        tlCode: '',
      };
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType].nextPage);
      }, 1000);
      break;
    }
    case 'termsAndConditionLink': {
      const [newFlowPage, etbFlowPage] = CLICK_CONFIG[eventType].pageName.split('|');
      const currentPage = formData?.selectedFlowType === 'A' ? newFlowPage : etbFlowPage;
      digitalData.page.pageInfo.pageName = currentPage;
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, currentPage);
      }, 1000);
      break;
    }
    case 'idcomproceed_failure':
    case 'idcomproceed_success':
    case 'goBackSetupSP':
    case 'goBackEligibleForSP':
    case 'goBackEnabledSP':
    case 'backToNewBillerCategorySearchList':
    case 'spEnabledViewAllBtn':
    case 'setUpSPViewAllBtn':
    case 'eligibleForSPViewAll':
    case 'loginbackTQScreen':
    case 'resendOtp-customerIdentificationOTPGen.json-click':
    case 'editMobileNumber':
    case 'landing_privacyPolicyBtn':
    case 'landing_tnc': {
      digitalData.event.status = '1';
      //
      if ((eventType === 'eligibleForSPViewAll') || (eventType === 'spEnabledViewAllBtn')) {
        digitalData.user.journeyLevel2 = 'Set Up SmartPay';
      }
      if ((eventType === 'setUpSPViewAllBtn')) {
        digitalData.user.journeyLevel2 = 'Add New Biller';
      }
      //
      if (typeof window !== 'undefined') {
        window.digitalData = digitalData || {};
        // eslint-disable-next-line no-underscore-dangle
        window?._satellite.track('submit');
      }
      setTimeout(() => {
        sendPageloadEvent(journeyState, formData, CLICK_CONFIG[eventType].nextPage);
      }, 1000);
      break;
    }
    default:
    // do nothing
  }
}

/**
 * send eror analytics
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
  if (typeof window !== 'undefined') {
    window.digitalData = digitalData || {};
    // eslint-disable-next-line no-underscore-dangle
    window?._satellite.track('pageload');
  }
}

export {
  sendErrorAnalytics,
  sendClickAnalytics,
  sendPageloadEvent,
};
