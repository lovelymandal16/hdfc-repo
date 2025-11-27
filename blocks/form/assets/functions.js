/**
 * @typedef {Object} EncryptionContext
 * @property {string} SEC_KEY_HEADER
 * @property {string} SEC_SECRET_HEADER
 * @property {string} SEC_IV_HEADER
 * @property {Crypto} crypto
 * @property {boolean} supportsES6
 * @property {string} symmetricAlgo
 * @property {number} symmetricKeyLength
 * @property {number} ivLength
 * @property {number} tagLength
 * @property {string} aSymmetricAlgo
 * @property {string} digestAlgo
 * @property {boolean} initStatus
 * @property {CryptoKey|null} symmetricKey
 * @property {string|null} encSymmetricKey
 * @property {CryptoKey|null} aSymmetricPublicKey
 */

/* ========== Utility Functions ========== */

/**
 * Set a form property value
 * @param {string} propertyName Name of the property to set
 * @param {string|object|Array} propertyValue Value to set for the property
 * @param {scope} globals Global scope object
 */
function setProperty(propertyName, propertyValue, globals) {
  // Get existing properties or initialize empty object
  const existingProperties = globals.form.$properties || {};

  // Merge new property with existing properties
  const updatedProperties = { ...existingProperties, [propertyName]: propertyValue };

  globals.functions.setProperty(globals.form, {
    properties: updatedProperties,
  });
}

/**
 * Get a form property value
 * @param {string} propertyName Name of the property to get (supports dot notation e.g. 'address.city')
 * @param {scope} globals Global scope object
 * @returns {object|string|Array} The value of the requested property
 */
function getProperty(propertyName, globals) {
  if (!propertyName || !globals.form.$properties) {
    return undefined;
  }

  // Handle dot notation by splitting and traversing the object
  const properties = propertyName.split('.');
  let value = globals.form.$properties;

  for (const prop of properties) {
    if (value === undefined || value === null) {
      return undefined;
    }
    value = value[prop];
  }

  return value;
}

/**
 * Creates a journey ID by combining various parameters
 * @param {string} journeyAbbreviation The journey abbreviation
 * @param {string} channel The channel
 * @param {scope} globals Global scope object
 * @returns {string} The generated journey ID
 */
function createJourneyId(journeyAbbreviation, channel, globals) {
  const visitMode = "U"; // TODO: confirm if this is correct
  let journeyId = getProperty("journeyId", globals);

  if (!journeyId) {
    const dynamicUUID = generateUUID();
    const dispatcher = getDispatcherInstance();
    journeyId = `${dynamicUUID}_${dispatcher}_${journeyAbbreviation}_${visitMode}_${channel}`;
  }

  return {
    properties: {
      ...globals.form.$properties,
      journeyId
    }
  };
}

/**
 * Converts a date string from one format to another.
 * Supported format tokens: YYYY, YY, MM, DD
 *
 * @param {string} dateStr - The original date string (e.g., '2000-02-10').
 * @param {string} [outputFormat='DD/MM/YYYY'] - Desired output format (e.g., 'DD/MM/YYYY').
 * @returns {string} - Reformatted date string (e.g., '10/02/2000').
 *
 * @example
 * convertDateFormat('2000-02-10'); // '10/02/2000'
 * convertDateFormat('2000-02-10', 'DD/MM/YY'); // '10/02/00'
 */
function convertDateFormat(dateStr, outputFormat = 'DD/MM/YYYY') { // TODO: Needs to be a part of the product.
  const inputFormat = 'YYYY-MM-DD';
  const formatParts = inputFormat.match(/(YYYY|YY|MM|DD)/g);
  const dateParts = dateStr.split(/[-/]/);

  const dateMap = {};
  formatParts.forEach((part, idx) => {
    dateMap[part] = dateParts[idx];
  });

  return outputFormat
    .replace(/YYYY/, dateMap['YYYY'] || ('20' + dateMap['YY']))
    .replace(/YY/, dateMap['YY'] || dateMap['YYYY'].slice(-2))
    .replace(/MM/, dateMap['MM'])
    .replace(/DD/, dateMap['DD']);
}


/**
 * @private
 */
function generateUUID() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
    return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
  });
}

/**
 * @private
 */
function getDispatcherInstance() {
  // todo: in EDS, there is no dispatcher instance
  return '00';
}


/* Custom functions of Assisted Journey goes in this block 

/**
 * Handles the reinitiate journey flow based on the journey state
 * @param {scope} globals - Global scope object
 */
function assetsAssistedReinitiateJourney(globals) {
  let initiatedJourneyState = globals.form.$properties.journeyState || '';

  /* Default hide the OTP Section */
  globals.functions.setProperty(
    globals.form?.otpValidationWrapper, { visible: false }
  );

  //show EKYC selection page
  if(initiatedJourneyState === "RM_REINITIATE_EKYC_CUSTOMER_LINK"){
    globals.functions.setProperty(
      globals.form?.kycConsentWrapper, { visible: true }
    );
  }
  // show Perfios choice All page
  else if(initiatedJourneyState === "RM_RE_SHARED_PERFIOS_LINK" || initiatedJourneyState === "RM_SHARED_PERFIOS_LINK"){
    globals.functions.setProperty(
      globals.form?.choiceAll, { visible: true }
    );
  }
}

/**
* Generates an array of application status information based on step name, user type, and source.
 * @param {string} stepName 
 * @param {string} userType 
 * @param {Date} timeStamp
 * @param {string} source 
*  @returns {array} of objects with stepName, userType, timeStamp and source
*/

function assetsAssistedApplicationStatusInfoArray(stepName, userType, timeStamp, source) {
  const infoObject = [{
    stepName: stepName || '',
    userType: userType || '',
    timeStamp: new Date().toISOString(),
    source: source || ''
  }];

  // Check for hidden field and add stored data if it exists
  try {
    const hiddenField = document.querySelector('input[name="tenSecondHiddenData"]');
    
    if (hiddenField && hiddenField.value) {
      const storedData = JSON.parse(hiddenField.value);
      infoObject[0] = { ...infoObject[0], ...storedData };
    }
  } catch (error) {
    // Silently continue if field doesn't exist or data can't be parsed
  }

  // Returning the array 
   return infoObject;
}
  
function assetsAssistedValidateEmail(emailField) {
  const email = document.querySelector('#emailinput-b42f2801ba');
  
  if (!email) return false;

  // Focus the email field
  email.focus();
  
  const userEmail = email.value || "";
  if(userEmail.trim() === ""){
    return false;
  }
  
  let userName = userEmail;
  if(userEmail.includes('@')){
     userName = userEmail.split('@')[0];
  }

  // Set new email value
  email.value = userName + emailField;

  // Trigger validation like typing
  email.dispatchEvent(new Event('input', { bubbles: true }));
  email.dispatchEvent(new Event('change', { bubbles: true }));

  return true;
}

function assetsAssistedWorkEmailValidation(emailField) {

}

/**
 * Retrieves the user input value for a specific consent type from dynamic optional consents
 * @param {string} dataRefParam - data ref parameter 
 * @param {scope} globals - Global scope object
 * @returns {array} 
 */
function assetsAssistedDataRefParamTrim(dataRefParam, globals) {
  const formattedURLArray = dataRefParam.split('/').map(item => item.trim());
  return formattedURLArray[1]; 
}


/**
 * Prefill the binding data inside globals form Object
 * @param {string} stateInfoArray - data ref parameter 
 * @param {number} leadProfileID - leadProfileID
 * @param {scope} globals - Global scope object
 */
function assetsAssistedFormatStateInfo(stateInfoArray, leadProfileID, globals) {
 var latestStateData = {};
 if (stateInfoArray != null && stateInfoArray.length > 0) {
    latestStateData = JSON.parse(stateInfoArray[stateInfoArray.length - 1].stateInfo);
    globals.form.$properties.customerName = latestStateData.customerName;
    globals.form.$properties.gender = latestStateData.customerName;
    globals.form.$properties.dob = latestStateData.dob;
    globals.form.$properties.mob = latestStateData.RegisteredPhoneNum;
    globals.form.$properties.pan = latestStateData.panNumber;
    globals.form.$properties.offerAvailable = latestStateData.offerAvailable;
    globals.form.$properties.customerType = latestStateData.customerType;
    globals.form.$properties.existingCustomer = latestStateData.existingCustomer;
    globals.form.$properties.CPLCMFlag = latestStateData.CPLCMFlag;    
    globals.form.hiddenFieldsPanel.hiddenMobileNumber.$value = latestStateData.RegisteredPhoneNum;
    globals.form.$properties.bankJourneyID = latestStateData.bankJourneyID;
    globals.form.$properties.partnerJourneyID = latestStateData.partnerJourneyID;
    globals.form.$properties.identifierName = latestStateData.identifierName;
    globals.form.$properties.identifierValue = latestStateData.identifierValue;
 }
  globals.form.$properties.leadProfileID = leadProfileID;
}

/**
 * formats array of application status info 
 * @param {array} applicationStatusInfo - arrayInfo parameter 
 * @param {scope} globals - Global scope object
 */
function assetsAssistedRMDashBoardArrayFormat(applicationStatusInfo, globals){
  const stepMapping = {
    "Link Shared": "consentLinkShared",
    "Consent Given": "consentGiven",
    "Consent Given Error" : "consentLinkSharedError",
    "KYC Initiated": "kycInitiated",
    "KYC Completed": "kycCompleted",
    "KYC Completed Error": "kycCompletedErrorCheck"
  };

  const stepMappingCustomerDetails = {
    "Personal Details Entered": "rmPersonalDetails",
    "Employment Details Entered": "rmEmploymentDetails",
    "Offer Shared": "rmOfferShared",
    "Offer Accepted": "rmOfferAccepted"
  };

  const stepMappingTenSecondLoan = {
    "Ten Second Loan Trigger": "tenSecondOfferLoan"
  };

  const stepMappingLoanOffer = {
    "Income EVerification": "loanOfferincomeEVerification",
    "Offer Shared": "loanOfferShared"
  };

  // Check if either Personal Details or Employment Details are present
  const hasPersonalDetails = applicationStatusInfo.some(item => item.stepName === "Personal Details Entered");
  const hasEmploymentDetails = applicationStatusInfo.some(item => item.stepName === "Employment Details Entered");
  const shouldTickBothCustomerDetails = hasPersonalDetails || hasEmploymentDetails;
  let statusStepName;

  // Iterate only through the items that exist in applicationStatusInfo
  applicationStatusInfo.forEach((statusItem) => {
    const section = stepMapping[statusItem.stepName];
    const customerDetailSection = stepMappingCustomerDetails[statusItem.stepName];
    statusStepName = statusItem.stepName;
    
    if (section) {
      const sectionObj = globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.[`${section}Section`];
      
      if (sectionObj) {
        // Handle checkbox field
        const checkboxField = sectionObj[`${section}Check`];
        if (checkboxField) {
          checkboxField.$value = "yes";
          globals.functions.setProperty(checkboxField, {
            valid: true,
            checked: true,
          });
        }

        // Handle timestamp field
        const timeField = sectionObj[`${section}Time`];
        if (timeField && statusItem.timeStamp) {
          const formattedTime = getRJDateFormat(statusItem.timeStamp);
          const wrappedTime = `<p><p>${formattedTime}</p></p>`;
          globals.functions.setProperty(timeField, {
            value: wrappedTime,
            visible: true,
          });
        }

        if(statusItem.stepName === "KYC Completed"){
          globals.functions.setProperty(globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.kycCompletedErrorCheck, { visible: false });
          globals.functions.setProperty(globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.kycCompletedSection, { visible: true });
          globals.functions.setProperty(globals.form?.rmDashboardWrapper.rmDashboardSection.rmConsentWrapper?.rmConsentStatusSection?.reshareCountDownTimerSection?.consentLinkExpiryTimer, { visible: false });
          globals.functions.setProperty(globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.reshareCountDownTimerSection?.rmReInitiateKYCLink, { visible: false });
        }

      } else {
        if(statusItem.stepName === "KYC Completed Error"){
          globals.functions.setProperty(globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.kycCompletedErrorCheck, { visible: true });
          globals.functions.setProperty(globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.kycCompletedSection, { visible: false });
        }
        if(statusItem.stepName === "Consent Given Error"){
          globals.functions.setProperty(globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.consentLinkSharedError, { visible: true });
          globals.functions.setProperty(globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.consentGivenSection, { visible: false });
        }
      }
    }
    
    // Handle customer details section (Next Steps)
    if (customerDetailSection) {
      const nextSectionWrapper = globals.form?.rmDashboardWrapper?.rmDashboardSection?.nextSectionMainWrapper?.nextSectionWrapper;
      const sectionObj = nextSectionWrapper?.[`${customerDetailSection}Section`];
      
      if (sectionObj) {
        // Handle checkbox field
        const checkboxField = sectionObj[`${customerDetailSection}Check`];
        if (checkboxField) {
          checkboxField.$value = "yes";
          globals.functions.setProperty(checkboxField, {
            valid: true,
            checked: true,
          });
        }

        // Handle timestamp field
        const timeField = sectionObj[`${customerDetailSection}CheckTime`];
        if (timeField && statusItem.timeStamp) {
          const formattedTime = getRJDateFormat(statusItem.timeStamp);
          const wrappedTime = `<p><p>${formattedTime}</p></p>`;
          globals.functions.setProperty(timeField, {
            value: wrappedTime,
            visible: true,
          });
        }
      }
    }

    // Handle ten second loan section
    const tenSecondLoanSection = stepMappingTenSecondLoan[statusItem.stepName];
    if (tenSecondLoanSection) {
      // Use actual API data from statusItem
      const testOfferAmount = statusItem.offerAmount;
      const testRedirectUrl = statusItem.redirectUrl;
      const rateOfInterest = statusItem.rateOfInterest;
      
      // Check if we have valid data from API
      if (testOfferAmount > 0 && testRedirectUrl && testRedirectUrl.trim() !== '') {
        // Access the ten second loan wrapper
        const tenSecondOfferWrapper = globals.form?.tenSecondOfferLoanWrapper ||
          globals.form?.rmDashboardWrapper?.rmDashboardSection?.tenSecondOfferLoanWrapper ||
          globals.form?.rmDashboardWrapper?.tenSecondOfferLoanWrapper;
        
        if (tenSecondOfferWrapper) {
          // Show the ten second loan wrapper
          globals.functions.setProperty(tenSecondOfferWrapper, { visible: true });
          
          const tenSecondOfferLoan = tenSecondOfferWrapper.tenSecondOfferLoan;
          const consentSection = tenSecondOfferLoan?.consentLinkSharedSection;
          
          if (consentSection) {
            // Update pre-approved limit checkbox with offer amount
            const preApprovedLimit = consentSection.preApprovedLimit;
            if (preApprovedLimit) {
              const formattedAmount = new Intl.NumberFormat('en-IN').format(testOfferAmount);
              preApprovedLimit.$value = "on";
              globals.functions.setProperty(preApprovedLimit, { 
                value: "on",
                checked: true,
                valid: true,
                label: `Pre-Approved (₹${formattedAmount}, ROI ${rateOfInterest})`
              });
              
              // Also set the label directly on the DOM element as backup
              const labelElement = document.querySelector('label[for="checkbox-fa68162fe8"]');
              if (labelElement) {
                labelElement.textContent = `Pre-Approved (₹${formattedAmount}, ROI ${rateOfInterest})`;
                labelElement.setAttribute('data-visible', 'true');
              }
            }

            // Show and enable the share link button
            const shareLinkButton = consentSection.shareLinkTenSecLoan;
            if (shareLinkButton) {
              globals.functions.setProperty(shareLinkButton, { 
                visible: true,
                enabled: true
              });
            }
          }

          // Store actual API data
          globals.form.$properties.tenSecondLoanOfferAmount = testOfferAmount;
          globals.form.$properties.tenSecondLoanRedirectUrl = testRedirectUrl;
          globals.form.$properties.tenSecondLoanOfferType = statusItem.offerType;
          globals.form.$properties.tenSecondLoanCustomerOfferType = statusItem.customerOfferType;
        }
      }
    }

    // Handle loan offer section
    const loanOfferSection = stepMappingLoanOffer[statusItem.stepName];
    if (loanOfferSection) {
      const loanOfferWrapper = globals.form?.loanOfferWrapper ||
        globals.form?.rmDashboardWrapper?.rmDashboardSection?.loanOfferWrapper ||
        globals.form?.rmDashboardWrapper?.loanOfferWrapper;
      
      if (loanOfferWrapper) {
        const loanOfferSectionObj = loanOfferWrapper?.loanOfferSection;
        
        if (loanOfferSectionObj) {
          let sectionObj;
          
          if (statusItem.stepName === "Income EVerification") {
            sectionObj = loanOfferSectionObj.LoanOfferIncomeEVerificationSection;
          } else if (statusItem.stepName === "Offer Shared") {
            sectionObj = loanOfferSectionObj.loanofferSharedSection || 
                        loanOfferSectionObj.loanOfferSharedSection ||
                        loanOfferSectionObj.loanoffersharedsection;
          }
          
          if (sectionObj) {
            // Handle checkbox field
            const checkboxFieldName = statusItem.stepName === "Offer Shared" ? "loanOfferSharedCheck" : `${loanOfferSection}Check`;
            const checkboxField = sectionObj[checkboxFieldName];
            
            if (checkboxField) {
              checkboxField.$value = "yes";
              globals.functions.setProperty(checkboxField, {
                valid: true,
                checked: true,
              });
            }
            
            if ( statusItem.stepName === 'Income EVerification' && statusItem.timeStamp) {
              const formattedTime = getRJDateFormat(statusItem.timeStamp);
              const wrappedTime = `<p><p>${formattedTime}</p></p>`;
              globals.functions.setProperty(globals.form.rmDashboardWrapper.rmDashboardSection.loanOfferWrapper.loanOfferSection.LoanOfferIncomeEVerificationSection.loanOfferIncomeEVerificationTime, {
                value: wrappedTime,
                visible: true,
              });
            }
            if(statusItem.stepName === "Offer Shared" && statusItem.destination){
              const wrappedDestination = `<p><p>Mode - ${statusItem.destination}</p></p>`
              globals.functions.setProperty(globals.form.rmDashboardWrapper.rmDashboardSection.loanOfferWrapper.loanOfferSection.loanofferSharedSection.offerSharedMode, {
                value: wrappedDestination,
                visible: true,
              });
            }
            if(statusItem.stepName === "Offer Shared" && statusItem.retryCount){
              const wrappedretryCount = `<p><p>Attempt - ${statusItem.retryCount}</p></p>`
              globals.functions.setProperty(globals.form.rmDashboardWrapper.rmDashboardSection.loanOfferWrapper.loanOfferSection.loanofferSharedSection.offerSharedAttempt, {
                value: wrappedretryCount,
                visible: true,
              });
              if(statusItem.retryCount === 3){
                globals.functions.setProperty(globals.form.rmDashboardWrapper.rmDashboardSection.loanOfferWrapper.loanOfferSection.loanofferSharedSection.loanOfferSharedErrorCheck, { visible: true });
                globals.functions.setProperty(globals.form.rmDashboardWrapper.rmDashboardSection.loanOfferWrapper.loanOfferSection.loanofferSharedSection.loanOfferSharedCheck, { visible: false });
              } else{
                globals.functions.setProperty(globals.form.rmDashboardWrapper.rmDashboardSection.loanOfferWrapper.loanOfferSection.loanofferSharedSection.loanOfferSharedCheck, { visible: true });
                globals.functions.setProperty(globals.form.rmDashboardWrapper.rmDashboardSection.loanOfferWrapper.loanOfferSection.loanofferSharedSection.loanOfferSharedErrorCheck, { visible: false });
              }
            }
          }
        }
      }
    }
  });

  // If either Personal Details or Employment Details is present, tick both checkboxes
  if (shouldTickBothCustomerDetails) {
    const nextSectionWrapper = globals.form?.rmDashboardWrapper?.rmDashboardSection?.nextSectionMainWrapper?.nextSectionWrapper;

    // Tick both Personal Details and Employment Details checkboxes
    ["rmPersonalDetails", "rmEmploymentDetails"].forEach(sectionName => {
      const sectionObj = nextSectionWrapper?.[`${sectionName}Section`];

      if (sectionObj) {
        // Handle checkbox field
        const checkboxField = sectionObj[`${sectionName}Check`];
        if (checkboxField) {
          checkboxField.$value = "yes";
          globals.functions.setProperty(checkboxField, {
            valid: true,
            checked: true,
          });
        }

        // Handle timestamp field - use the timestamp from the available item
        const timeField = sectionObj[`${sectionName}CheckTime`];
        if (timeField) {
          const relevantItem = applicationStatusInfo.find(item =>
            item.stepName === "Personal Details Entered" || item.stepName === "Employment Details Entered"
          );

          if (relevantItem && relevantItem.timeStamp) {
            const formattedTime = getRJDateFormat(relevantItem.timeStamp);
            const wrappedTime = `<p><p>${formattedTime}</p></p>`;
            globals.functions.setProperty(timeField, {
              value: wrappedTime,
              visible: true,
            });
          }
        }
      }
    });
  }

  // Helper function to check if checkbox is ticked
  const isCheckboxTicked = (checkbox) => {
    return checkbox?.$value === "yes" || checkbox?.$value === "on" || checkbox?.checked === true;
  };

  // Check completion status
  const consentSection = globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection;
  
  // Check if checkboxes are ticked
  const isLinkSharedTicked = isCheckboxTicked(consentSection?.consentLinkSharedSection?.consentLinkSharedCheck);
  const isConsentGivenTicked = isCheckboxTicked(consentSection?.consentGivenSection?.consentGivenCheck);

  // Show Next Steps if both checkboxes are ticked
  const showNextSectionWrapper = isLinkSharedTicked && isConsentGivenTicked;

  if(showNextSectionWrapper){
    globals.functions.setProperty(globals.form?.rmDashboardWrapper.rmDashboardSection.rmConsentWrapper?.rmConsentStatusSection?.reshareCountDownTimerSection?.consentLinkExpiryTimer, { visible: !showNextSectionWrapper });
  }

  // Show re-initiate KYC button when KYC Completed Error is shown
  const isKYCCompletedErrorShown = globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.kycCompletedErrorCheck.$visible === true && globals.form.hiddenFieldsPanel?.hiddenExistingCustomer.$value === "N";
  const rmReInitiateKYCLink = globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.reshareCountDownTimerSection?.rmReInitiateKYCLink;
  if(showNextSectionWrapper && isKYCCompletedErrorShown){
    //const rmReInitiateKYCLink = globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.reshareCountDownTimerSection?.rmReInitiateKYCLink;
    if (rmReInitiateKYCLink) {
      globals.functions.setProperty(rmReInitiateKYCLink, { visible: true });
      //globals.functions.setProperty(rmReInitiateKYCLink, { enabled: true });
    }

    const addressDetailWrapper = globals.form?.customerPersonalDetailsWrapper?.customerPersonalDetailsSection?.customerDetailMainPanel?.customerDetailBodyPanel?.addressDetailWrapper;
    if (addressDetailWrapper) {
      globals.functions.setProperty(addressDetailWrapper, { visible: false });
    }
    
    const currentAddress = globals.form?.customerPersonalDetailsWrapper?.customerPersonalDetailsSection?.customerDetailMainPanel?.customerDetailBodyPanel?.currentaddress;
    if (currentAddress) {
      globals.functions.setProperty(currentAddress, { visible: true });
    }
    
    const customerName = globals.form?.customerPersonalDetailsWrapper?.customerPersonalDetailsSection?.customerDetailMainPanel?.customerDetailBodyPanel?.customerNameWrapper?.customerName;
    if (customerName) {
      globals.functions.setProperty(customerName, { visible: false });
    }
  }
  else{
    globals.functions.setProperty(rmReInitiateKYCLink, { visible: false });
    if(statusStepName === "KYC Completed" || statusStepName === "KYC Completed Error"){
      globals.functions.setProperty(globals.form?.rmDashboardWrapper.rmDashboardSection.rmConsentWrapper?.rmConsentStatusSection?.reshareCountDownTimerSection?.consentLinkExpiryTimer, { visible: false });
    }
  }

  // Try both paths to find nextSectionMainWrapper
  const nextSectionMainWrapper = globals.form?.nextSectionMainWrapper || 
    globals.form?.rmDashboardWrapper?.rmDashboardSection?.nextSectionMainWrapper;


  if (nextSectionMainWrapper) {
    globals.functions.setProperty(nextSectionMainWrapper, { 
      visible: showNextSectionWrapper
    });
  }

  // Force visibility through multiple paths if needed
  if (showNextSectionWrapper) {
    const paths = [
      globals.form.rmDashboardWrapper.rmDashboardSection.rmDetailsWrapper.rmDetailsPanel.rmCustOfferTypeDetailsPanel,
      globals.form?.nextSectionMainWrapper,
      globals.form?.rmDashboardWrapper?.rmDashboardSection?.nextSectionMainWrapper,
      globals.form?.rmDashboardWrapper?.nextSectionMainWrapper
    ];

    paths.forEach(element => {
      if (element) {
        globals.functions.setProperty(element, { visible: true });
      }
    });
  }

  /* Handle Customer Type and Offer Type Section visibility */
    let customerType, OfferType;
    const OfferTypePanel = globals.form.rmDashboardWrapper.rmDashboardSection.rmDetailsWrapper.rmDetailsPanel.rmCustOfferTypeDetailsPanel;
    if(globals.form.hiddenFieldsPanel?.hiddenExistingCustomer.$value === "N" && globals.form.hiddenFieldsPanel?.hiddenOfferAvailable.$value === "N"){
        customerType = "NTB";
        OfferType = "No Offer";
    }
    else if(globals.form.hiddenFieldsPanel?.hiddenExistingCustomer.$value === "Y" && globals.form.hiddenFieldsPanel?.hiddenOfferAvailable.$value === "N"){
        customerType = "ETB";
        OfferType = "No Offer";
    }
    else{
        customerType = "ETB";
        OfferType = "Pre-Approved Offer";
    }

    // Set the values to the fields
    globals.functions.setProperty(OfferTypePanel?.rmCustType, { value: customerType });
    globals.functions.setProperty(OfferTypePanel?.rmOfferType, { value: OfferType });

    // hide the re-initiate KYC button on RM Dashboard
    /*const rmReInitiateKYCLinkToHide = globals.form?.rmDashboardWrapper?.rmDashboardSection?.rmConsentWrapper?.rmConsentStatusSection?.reshareCountDownTimerSection?.rmReInitiateKYCLink;
    if (rmReInitiateKYCLinkToHide) {
      globals.functions.setProperty(rmReInitiateKYCLinkToHide, { visible: false });
    }*/

  // Check if both Personal Details and Employment Details checkboxes are ticked
  const nextSectionWrapper = globals.form?.rmDashboardWrapper?.rmDashboardSection?.nextSectionMainWrapper?.nextSectionWrapper;

  const isPersonalDetailsTicked = isCheckboxTicked(nextSectionWrapper?.rmPersonalDetailsSection?.rmPersonalDetailsCheck);
  const isEmploymentDetailsTicked = isCheckboxTicked(nextSectionWrapper?.rmEmploymentDetailsSection?.rmEmploymentDetailsCheck);

  // Check if Ten Second Loan Trigger is present with valid API data
  const tenSecondLoanItem = applicationStatusInfo.find(item => 
    item.stepName === "Ten Second Loan Trigger" && 
    item.offerAmount > 0 && 
    item.redirectUrl && 
    item.redirectUrl.trim() !== ''
  );
  const hasTenSecondLoanTrigger = tenSecondLoanItem;

  // Show Loan Offer section if both Personal Details and Employment Details are ticked
  // OR if shouldTickBothCustomerDetails is true (since we tick both when either is present)
  const showLoanOfferWrapper = (isPersonalDetailsTicked && isEmploymentDetailsTicked) || shouldTickBothCustomerDetails;

  // Show Ten Second Loan Wrapper if trigger is present with valid API data
  if (hasTenSecondLoanTrigger) {
    const tenSecondPaths = [
      globals.form?.tenSecondOfferLoanWrapper,
      globals.form?.rmDashboardWrapper?.rmDashboardSection?.tenSecondOfferLoanWrapper,
      globals.form?.rmDashboardWrapper?.tenSecondOfferLoanWrapper
    ];

    tenSecondPaths.forEach(element => {
      if (element) {
        globals.functions.setProperty(element, { visible: true });
      }
    });
  }

  // Try multiple paths to find loanOfferWrapper
  const loanOfferWrapper = globals.form?.loanOfferWrapper ||
    globals.form?.rmDashboardWrapper?.rmDashboardSection?.loanOfferWrapper ||
    globals.form?.rmDashboardWrapper?.loanOfferWrapper;

  if (loanOfferWrapper) {
    globals.functions.setProperty(loanOfferWrapper, {
      visible: showLoanOfferWrapper
    });
  }

  // Force visibility through multiple paths if needed
  if (showLoanOfferWrapper) {
    const loanOfferPaths = [
      globals.form?.loanOfferWrapper,
      globals.form?.rmDashboardWrapper?.rmDashboardSection?.loanOfferWrapper,
      globals.form?.rmDashboardWrapper?.loanOfferWrapper
    ];

    loanOfferPaths.forEach(element => {
      if (element) {
        globals.functions.setProperty(element, { visible: true });
      }
    });
    // Hide the "Proceed" button in nextSection when loan offer wrapper is shown
    const proceedButton = nextSectionWrapper?.nextStepsProceed;
    if (proceedButton) {
      globals.functions.setProperty(proceedButton, { visible: false });
    }

    // Also try to hide via DOM element as backup
    const proceedButtonElement = document.querySelector('button[name="nextStepsProceed"]');
    if (proceedButtonElement) {
      proceedButtonElement.style.display = 'none';
    }
  }
}

/**
 * Update City and state ID Data
 * @param {Object} pinCodeData
 * @param {scope} globals
 */
function assetsAssistedUpdateCityStateID(pinCodeData,globals){
  var pinCodeData = pinCodeData[0];
  globals.form.$properties.cityID = pinCodeData.CITY_ID;
  globals.form.$properties.stateID = pinCodeData.STATEID;
}

/**
 * Creates a journey ID by combining various parameters
 * @param {string} journeyAbbreviation The journey abbreviation
 * @param {string} channel The channel
 * @param {scope} globals Global scope object
 * @returns {string} The generated journey ID
 */
function assetsAssistedCreatePartnerJourneyId(journeyAbbreviation, channel, globals) {
  var visitMode = "U"; // todo check if this is correct
  var dynamicUUID = generateUUID();
  var dispInstance = getDispatcherInstance();
  var journeyId = dynamicUUID + '_' + dispInstance + "_" + journeyAbbreviation;
  // todo: this is done since setProperty is asynchronous
  // and return values is immediately set as updates on the form object in which this is written
  return journeyId
}

/**
 * Get credit promo code
 * @param {string} loanType  Type of loan customer selected
 * @returns {string} generated credit promocode
 */
function getCreditPromoCode(loanType){
        var creditPromoCode = "";
        if(loanType === "Fresh Loan") {
            creditPromoCode = "502528"; 
        } else if(loanType === "Balance Transfer") {
            creditPromoCode = "505349"; 
        } else if(loanType === "Existing Enhancement") {
            creditPromoCode = "503519"; 
        } else if(loanType === "Existing Top-up") {
            creditPromoCode = "507354"; 
        }
        return creditPromoCode;
}

/**
 * Retrieves the consents and its values in Array of Objects
 * @param {string} consentState - consent state parameter 
 * @param {scope} globals - Global scope object
 * @returns {array} 
 */
function assetsAssistedCreateConsentFormatData(consentState, globals) {
    let consents = [];
    let consentValues;
    if (consentState == "LandingPage") {
        consentValues = {
          "personalDataCaptureConsent" : globals.form.hiddenFieldsPanel.hiddenPersonalDataCaptureConsent.$value,
          "personalizedOffersCaptureConsent" : globals.form.hiddenFieldsPanel.hiddenPersonalizedOffersCaptureConsent.$value,
          "channelCaptureConsent" : globals.form.hiddenFieldsPanel.hiddenChannelCaptureConsent.$value
        };
    }

    /* Store the array of objects */
    consents = Object.entries(consentValues).map(([consentName, consentValue]) => ({ [consentName]: consentValue }));

    return consents;
}

/**
 * Retrieves the first name from customer name
 * @param {string} customerName - customerName parameter 
 * @returns {string} 
 */
function assetsAssistedGetFirstNameFromCustName(customerName) {
  let firstName = customerName.trim().split(' ');
  return firstName[0] || ''; 
}

/**
 * Retrieves the last name from customer name
 * @param {string} customerName - customerName parameter 
 * @returns {string} 
 */
function assetsAssistedGetLastNameFromCustName(customerName) {
  let lastName = customerName.trim().split(' ').slice(1).join(' ') || '';
  return lastName;
}

/**
 * converts the customer name to titlecase
 * @param {string} customerName - customerName parameter 
 * @returns {string} 
 */
function assetsAssistedConvertToTitleCase(customerName) {
  return customerName.trim().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Sets first 2 digits and last 2 digits are visible rest all are masked
 * @param {string} mobileNumber Mobile Number
 * @param {scope} globals
 * @returns {string}
 */
function assetsAssistedMaskMobileNumberAssetsFormat(mobileNumber, globals) {
  let str = mobileNumber;
  let otpSubTitleText = globals.form.otpValidationWrapper.otpValidationSection.aadharOtpPanel.otpMainTextPanel.otpMainText.$value;
  otpSubTitleText = otpSubTitleText.replace("****", str.slice(0, 2) + "*".repeat(str.length - 4) + str.slice(-2));

  //first 2 digits and last 2 digits are visible rest all are masked
  return otpSubTitleText;

}

/**
 * formats array of application status info 
 * @param {object} customerDemogData - customer demographic data
 */
function assetsAssistedFilterDemogDetails(customerDemogData) {
  // Use the provided customerDemogData parameter
  const data = customerDemogData;

  // Extract and store required fields in hidden text field
  try {
    const tenSecondData = {
      redirectUrl: data?.redirectUrl || '',
      offerAmount: data?.OfferDemogDetails?.[0]?.offerAmount || 0,
      offerType: data?.OfferDemogDetails?.[0]?.offerType || '',
      customerOfferType: data?.customerOfferType || '',
      tenure: data?.OfferDemogDetails?.[0]?.tenure || '',
      rateOfInterest: data?.OfferDemogDetails?.[0]?.rateOfInterest || ''
    };
    
    // Store in hidden field using querySelector
    const hiddenField = document.querySelector('input[name="tenSecondHiddenData"]');
    if (hiddenField) {
      hiddenField.value = JSON.stringify(tenSecondData);
    } else {
      // Try alternative selector by ID
      const hiddenFieldById = document.querySelector('input[id="textinput-55eb9e0b0b"]');
      if (hiddenFieldById) {
        hiddenFieldById.value = JSON.stringify(tenSecondData);
      }
    }
  } catch (error) {
    console.error('Error storing ten second data:', error);
  }

  // Defensive checks
  if (
    data &&
    Array.isArray(data.OfferDemogDetails) &&
    data.OfferDemogDetails.length > 0
  ) {
    // Get details for all offers, organized by category, excluding empty fields
    const result = data.OfferDemogDetails.map(customer => ({
      personalDetails: {
        customerFullName: customer.customerFullName || '',
        customerFirstName: customer.customerFirstName || '',
        customerLastName: customer.customerLastName || '',
        customerMiddleName: customer.customerMiddleName || '',
        customerPan: customer.customerPan || '',
        dateOfBirth: customer.dateOfBirth || '',
        customerGender: customer.customerGender || '',
        customerID: customer.customerID || '',
        custType: customer.custType || ''
      },
      contactDetails: {
        emailAddress: customer.emailAddress || '',
      },
      addressDetails: {
        customerAddress1: customer.customerAddress1 || '',
        customerAddress2: customer.customerAddress2 || '',
        customerAddress3: customer.customerAddress3 || '',
        customerCity: customer.customerCity || '',
        customerState: customer.customerState || '',
        zipCode: customer.zipCode || '',
        customerCountry: customer.customerCountry || '',
        customerOfficeAddress1: customer.customerOfficeAddress1 || '',
        customerOfficeAddress2: customer.customerOfficeAddress2 || '',
        customerOfficeAddress3: customer.customerOfficeAddress3 || '',
        customerOfficeZipCode: customer.customerOfficeZipCode || ''
      },
      financialDetails: {
        monthlyIncome: customer.monthlyIncome || '',
        profession: customer.profession || '',
      },
      accountDetails: {
        accountNumber: customer.accountNumber || '',
      }
    }));
    return result;
  }
  return [];
}
 

/**
 * Prefill the binding data inside globals form Object
 * @param {object} customerDemogData - demog data
 * @param {scope} globals - Global scope object
 * @param {string} accountNumber - account number
 */
function assetsAssistedCustomerDemogDetails(accountNumber, customerDemogData, globals) {
  // Find required state objects
  const leadQualificationObj = (customerDemogData || []).find(
    item => item.state === "CUSTOMER_LEAD_QUALIFICATION_SUCCESS"
  );
  const kycCompleteObj = (customerDemogData || []).find(
    item => item.state === "KYC_COMPLETE_SUCCESS"
  );

  // Early return if no relevant data found
  if (!leadQualificationObj && !kycCompleteObj) return;

  let result = {};

  // Process demographic data if available
  if (leadQualificationObj) {
    let stateInfoObj;
    try {
      stateInfoObj = JSON.parse(leadQualificationObj.stateInfo);
    } catch (e) {
      stateInfoObj = null;
    }
    
    if (stateInfoObj) {
      let demogDetailsArr;
      try {
        demogDetailsArr = JSON.parse(stateInfoObj.hiddenFilteredDemogData);
      } catch (e) {
        demogDetailsArr = null;
      }
      
      if (demogDetailsArr && Array.isArray(demogDetailsArr) && demogDetailsArr.length > 0) {
        // Find matching account or use first entry
        const demog = accountNumber 
          ? demogDetailsArr.find(item => item.accountDetails?.accountNumber === accountNumber) || demogDetailsArr[0]
          : demogDetailsArr[0];

        const isAccountNumberMatch = Boolean(accountNumber && demog.accountDetails?.accountNumber === accountNumber);
        
        // Build full address from address components
        const addressParts = [
          demog.addressDetails?.customerAddress1,
          demog.addressDetails?.customerAddress2,
          demog.addressDetails?.customerAddress3
        ].filter(Boolean).join(', ');
        
        const locationParts = [
          addressParts,
          demog.addressDetails?.customerState,
          demog.addressDetails?.customerCity
        ].filter(Boolean).join(', ');
        
        const fullAddress = demog.addressDetails?.zipCode 
          ? `${locationParts} - ${demog.addressDetails.zipCode}`
          : locationParts;

        result = {
          timeinfo: leadQualificationObj.timeinfo,
          customerFullName: demog.personalDetails?.customerFullName || '',
          customerFirstName: demog.personalDetails?.customerFirstName || '',
          customerLastName: demog.personalDetails?.customerLastName || '',
          customerMiddleName: demog.personalDetails?.customerMiddleName || '',
          customerPan: demog.personalDetails?.customerPan || '',
          dateOfBirth: demog.personalDetails?.dateOfBirth ? demog.personalDetails.dateOfBirth.split('-').reverse().join('-') : '',
          customerGender: demog.personalDetails?.customerGender || '',
          customerID: demog.personalDetails?.customerID || '',
          custType: demog.personalDetails?.custType || '',
          emailAddress: demog.contactDetails?.emailAddress || '',
          customerFullAddress: fullAddress,
          customerAddress1: demog.addressDetails?.customerAddress1 || '',
          customerAddress2: demog.addressDetails?.customerAddress2 || '',
          customerAddress3: demog.addressDetails?.customerAddress3 || '',
          customerCity: demog.addressDetails?.customerCity || '',
          customerState: demog.addressDetails?.customerState || '',
          zipCode: demog.addressDetails?.zipCode || '',
          customerCountry: demog.addressDetails?.customerCountry || '',
          customerOfficeAddress1: demog.addressDetails?.customerOfficeAddress1 || '',
          customerOfficeAddress2: demog.addressDetails?.customerOfficeAddress2 || '',
          customerOfficeAddress3: demog.addressDetails?.customerOfficeAddress3 || '',
          customerOfficeZipCode: demog.addressDetails?.customerOfficeZipCode || '',
          monthlyIncome: demog.financialDetails?.monthlyIncome || '',
          profession: demog.financialDetails?.profession || '',
          accountNumber: isAccountNumberMatch ? (demog.accountDetails?.accountNumber || '') : '',
        };
      }
    }
    
    // If parsing failed but no KYC fallback, return early
    if (Object.keys(result).length === 0 && !kycCompleteObj) return;
  }

  // Initialize with empty structure if no demographic data was processed
  if (Object.keys(result).length === 0) {
    result = {
      timeinfo: kycCompleteObj?.timeinfo || '',
      customerFullName: '',
      customerFirstName: '',
      customerLastName: '',
      customerMiddleName: '',
      customerPan: '',
      dateOfBirth: '',
      customerGender: '',
      customerID: '',
      custType: '',
      emailAddress: '',
      customerFullAddress: '',
      customerAddress1: '',
      customerAddress2: '',
      customerAddress3: '',
      customerCity: '',
      customerState: '',
      zipCode: '',
      customerCountry: '',
      customerOfficeAddress1: '',
      customerOfficeAddress2: '',
      customerOfficeAddress3: '',
      customerOfficeZipCode: '',
      monthlyIncome: '',
      profession: '',
      accountNumber: '',
    };
  }

  // Enhance with KYC data if available
  if (kycCompleteObj) {
    try {
      const kycStateInfo = JSON.parse(kycCompleteObj.stateInfo);
      
      // KYC field mappings - enhance result with KYC data for missing fields
      const kycMappings = [
        { resultField: 'customerFullName', kycField: 'customerName' },
        { resultField: 'customerFullAddress', kycField: 'aadhaarAddress' },
        { resultField: 'customerCity', kycField: 'aadhaarCity' },
        { resultField: 'customerState', kycField: 'aadhaarState' },
        { resultField: 'zipCode', kycField: 'aadhaarPincode' },
        { resultField: 'customerPan', kycField: 'panNumber' }
      ];

      kycMappings.forEach(({ resultField, kycField }) => {
        if (!result[resultField] && kycStateInfo[kycField]) {
          result[resultField] = kycStateInfo[kycField];
        }
      });

      // Split KYC aadhaarAddress into individual address components if missing
      if (kycStateInfo.aadhaarAddress && (!result.customerAddress1 || !result.customerAddress2 || !result.customerAddress3)) {
        const addressParts = kycStateInfo.aadhaarAddress.split(',').map(part => part.trim()).filter(Boolean);
        
        if (!result.customerAddress1 && addressParts.length > 0) {
          result.customerAddress1 = addressParts[0];
        }
        
        if (!result.customerAddress2 && addressParts.length > 1) {
          result.customerAddress2 = addressParts[1];
        }
        
        if (!result.customerAddress3 && addressParts.length > 2) {
          result.customerAddress3 = addressParts[2];
        }
      }

      // Parse customerName from KYC to populate first, middle, and last names if missing
      if (kycStateInfo.customerName && (!result.customerFirstName || !result.customerLastName)) {
        const nameParts = kycStateInfo.customerName.trim().split(' ');
        
        if (!result.customerFirstName && nameParts.length > 0) {
          result.customerFirstName = nameParts[0];
        }
        
        if (!result.customerLastName && nameParts.length > 1) {
          result.customerLastName = nameParts.slice(1).join(' ');
        }
        
        // Handle middle name if there are 3 or more parts
        if (!result.customerMiddleName && nameParts.length > 2) {
          result.customerMiddleName = nameParts.slice(1, -1).join(' ');
          result.customerLastName = nameParts[nameParts.length - 1];
        }
      }
      
    } catch (e) {
      // Ignore KYC parsing errors, keep original demog data or empty fields
    }
  }
  console.log(result);
  return result;
}

/**
 * Converts String To Integer
 * @param {string} inputField - Value ins stringFormat
 */
function assetsAssistedConvertToNumber(inputField) {
return parseInt(inputField);
};

function setBREOfferIdentificationFlag(responseString) {
  var filler_5 = responseString.FILLER5;
  var filler_5_arr = (filler_5 !== null && filler_5 !== undefined && filler_5 !== "") ? filler_5.split(',') : [''];
  var breOfferIdentificationFlag = "";
  if (filler_5_arr.includes("OFFERTYPE_BUREAU")) {
    if (responseString.STP_Status.toLowerCase() === "yes") {
      breOfferIdentificationFlag = "BRE 1 STP";
    } else if (responseString.STP_Status.toLowerCase() === "no") {
      breOfferIdentificationFlag = "BRE 1 NSTP";
    }
  } else if (filler_5_arr.includes("OFFERTYPE_PERFIOS")) {
    if (responseString.STP_Status.toLowerCase() === "yes") {
      breOfferIdentificationFlag = "BRE 2 STP";
    } else if (responseString.STP_Status.toLowerCase() === "no") {
      breOfferIdentificationFlag = "BRE 2 NSTP";
    }
  } else if (filler_5_arr.includes("OFFERTYPE_NOOFFER")) {
    breOfferIdentificationFlag = "IPA";
  } else {
    breOfferIdentificationFlag = "IPA";
  }
  return breOfferIdentificationFlag;
}

//Method To Save BRE1 Response in CurrentFormContext based on STP and Non STP
function saveBreResponse(responseString) {
  var amount = new Map();
  var irr = new Map();
  var procFee = new Map();
  var amountArray = [];
  var irrArray = [];
  var procFeeArray = [];
  var tenureArray = [];

  for (var i = 0; i < responseString.OFFER_AMOUNT.length; i++) {
    amount.set(responseString.OFFER_AMOUNT[i].tenure, responseString.OFFER_AMOUNT[i].offerAmount);
    irr.set(responseString.IRR[i].tenure, responseString.IRR[i].irr);
    procFee.set(responseString.PROCFEEPER[i].tenure, responseString.PROCFEEPER[i].procFeePer);

    amountArray.push(responseString.OFFER_AMOUNT[i].offerAmount);
    irrArray.push(responseString.IRR[i].irr);
    procFeeArray.push(responseString.PROCFEEPER[i].procFeePer);
    tenureArray.push(responseString.OFFER_AMOUNT[i].tenure);
  }

  var breResponse = {};

  breResponse.amount = amount;
  breResponse.irr = irr;
  breResponse.procFee = procFee;
  breResponse.amountArray = amountArray;
  breResponse.irrArray = irrArray;
  breResponse.procFeeArray = procFeeArray;
  breResponse.tenureArray = tenureArray;
  return breResponse;
}

/**
 * Get Resident Type of customer
 * @param {string} type 
 * @return {string}
 */
function assetsAssistedGetResidentType(type){
  if(type == "0"){
  return "Company Provided";
  }else if(type == "1"){
  return "Hostel";
  }else if(type == "2"){
  return "Owned by parent / sibling";
  }else if(type == "3"){
  return "Owned by self / spouse";
  }else if(type == "4"){
  return "Paying guest";
  }else if(type == "5"){
  return "Rented - Staying alone";
  }else if(type == "6"){
  return "Rented - with family";
  }else if(type == "7"){
  return "Rented - with friends";
  }
}

function assetsAssistedTenSecondLoanData(customerDemogData) {
  // Implement the logic for processing customerDemogData for 10-second loan data
}

/**
* Generates an array of account details for FIP
 * @param {string} accountNumber
 * @param {string} customerID
*  @returns {array} of objects with stepName, userType, timeStamp and source
*/

function getAccountdetailsFIP(accountNumber, customerID) {
  const accountDetails = [{
    accountNumber: accountNumber || '',
    customerID: customerID || ''
  }];

  // Returning the array
   return accountDetails;
}

function assetsAssistedIfscCodeFilter(ifscBankName, ifscMicrCode, ifscBankBranch) {  
  // Handle case where inputs could be arrays or single values
  const bankName = Array.isArray(ifscBankName) ? ifscBankName[0] : ifscBankName;
  const micrCode = Array.isArray(ifscMicrCode) ? ifscMicrCode[0] : ifscMicrCode;
  const bankBranch = Array.isArray(ifscBankBranch) ? ifscBankBranch[0] : ifscBankBranch;


  // Use querySelector to set values directly in the DOM
  try {
    // Set bank name using querySelector
    const bankNameField = document.querySelector('input[name="bankName"]');
    if (bankNameField) {
      bankNameField.value = bankName || '';
      console.log('Successfully set bankName via querySelector:', bankName);
    } else {
      console.log('Bank name field not found via querySelector');
    }

    // Set MICR code using querySelector  
    const micrCodeField = document.querySelector('input[name="micrCode"]');
    if (micrCodeField) {
      micrCodeField.value = micrCode || '';
      console.log('Successfully set micrCode via querySelector:', micrCode);
    } else {
      console.log('MICR code field not found via querySelector');
    }

    const bankBranchField = document.querySelector('input[name="bankBranch"]');
    if (bankBranchField) {
      bankBranchField.value = bankBranch || '';
      console.log('Successfully set bankBranch via querySelector:', bankBranch);
    } else {
      console.log('Bank branch field not found via querySelector');
    } 
  } catch (error) {
    console.error('Error using querySelector:', error);
  }

  return {
    bankName: bankName || '',
    micrCode: micrCode || '',
    bankBranch: bankBranch || ''
  };
}

/**
* Generates an array of account details for FIP
 * @param {string} demogData
 * @param {scope} globals
 *  @returns {array} of objects with accountNumber and customerId
 */
function assetsAssistedStoreAccountNumber(demogData, globals) {
  // Find the object with the required state
  const leadQualificationObj = (demogData || []).find(
    item => item.state === "CUSTOMER_LEAD_QUALIFICATION_SUCCESS"
  );
  if (!leadQualificationObj) return [];
 
  // Parse stateInfo
  let stateInfoObj;
  try {
    stateInfoObj = JSON.parse(leadQualificationObj.stateInfo);
  } catch (e) {
    return [];
  }
 
  // Parse hiddenFilteredDemogData
  let demogDetailsArr;
  try {
    demogDetailsArr = JSON.parse(stateInfoObj.hiddenFilteredDemogData);
  } catch (e) {
    return [];
  }
 
  // Extract accountNumber and customerId from each demographic detail object
  let result = [];
  if (Array.isArray(demogDetailsArr) && demogDetailsArr.length > 0) {
    result = demogDetailsArr.map(demog => ({
      accountNumber: demog.accountDetails?.accountNumber || '',
      customerId: demog.personalDetails?.customerID || ''
    })).filter(item => item.accountNumber || item.customerId); // Filter out empty objects
  }
  return result;
};
 

/**
* Get IPA loan and Tenure
 * @param {scope} globals
 */
function assetsAssistedGetIPALoanAndTenure(globals) {
        if (globals.form.$properties.IPA_tenure_array === null || globals.form.$properties.IPA_tenure_array === undefined)
            globals.form.$properties.IPA_tenure_array = [6, 12, 24, 48, 72];

        if (globals.form.$properties.IPA_tenure_loamAmt_map === null || globals.form.$properties.IPA_tenure_loamAmt_map === undefined) {
            var map1 = new Map();

            map1.set(12, 1200000);
            map1.set(24, 2400000);
            map1.set(48, 8060000);
            map1.set(6, 500000);
            map1.set(72, 1240000);

            globals.form.$properties.IPA_tenure_loamAmt_map = map1;
        }
        globals.form.$properties.maxTenureIPA = globals.form.$properties.IPA_tenure_array[globals.form.$properties.IPA_tenure_array.length - 1];
    // get the calculated loan amount based on maximum tenure
    globals.form.$properties.loanAmountIPA = Math.round(globals.form.$properties.IPA_tenure_loamAmt_map.get(globals.form.$properties.maxTenureIPA) / 1000) * 1000;		
    globals.functions.setProperty(
      globals.form?.hiddenFieldsPanel?.maxTenureIPA, { value: globals.form.$properties.maxTenureIPA }
    );
    globals.functions.setProperty(
      globals.form?.hiddenFieldsPanel?.loanAmountIPA, { value: globals.form.$properties.loanAmountIPA }
    );
    globals.functions.setProperty(
      globals.form?.hiddenFieldsPanel?.IPA_tenure_loamAmt_map, { value: globals.form.$properties.IPA_tenure_loamAmt_map }
    );
  }

/**
 * calculate IRR data
 * @param {Object} irr_pf_response 
 * @param {Object} category 
 * @param {scope} globals
 */
function assetsAssistedCalculateIRRData(irr_pf_response,category,globals) {

    if(irr_pf_response === null || irr_pf_response === undefined)
        irr_pf_response = {};

    //Check for category and filter the response
    var filtered_irr_pf_response = {};
    for(var i = 0; i < irr_pf_response.length; i++){

        if(irr_pf_response[i].EMPLOYEE_CAT === category){
            filtered_irr_pf_response = irr_pf_response[i];
            break;
        }
    }

    //Fetch Combined Key, IRR, PF & Max loan amount
    globals.form.$properties.combined_key = filtered_irr_pf_response.COMBINEDKEY;
    globals.form.$properties.IPA_irr = filtered_irr_pf_response.IRR.replace(/[%]+/g, '').trim();
    globals.functions.setProperty(
      globals.form?.hiddenFieldsPanel?.IPA_irr, { value: globals.form.$properties.IPA_irr }
    );
    globals.form.$properties.IPA_pf = filtered_irr_pf_response.PF;
    globals.functions.setProperty(
      globals.form?.hiddenFieldsPanel?.IPA_pf, { value: globals.form.$properties.IPA_pf }
    );
    globals.form.$properties.max_loan_amount = filtered_irr_pf_response.MAXLOANAMT;
}

/**
 * Tenure Multiplier Master Call - success function
 * @param {Object} tenure_multiplier_response 
 * @param {scope} globals
 */
function assetsAssistedTenureMultiplierResponse(tenure_multiplier_response,globals) {
    var income = globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.incomeDetailsWrapper.incomeDetails.monthlyNetIncome.$value;
    if(tenure_multiplier_response === null || tenure_multiplier_response === undefined)
        tenure_multiplier_response = {};

    //Fetch tenure months multiplier corrosponding to the conbined key
    var filtered_tenure_multiplier_response = {};
    for(var i = 0; i < tenure_multiplier_response.length; i++){

        if(tenure_multiplier_response[i].COMBINEDKEY.toUpperCase() === globals.form.$properties.combined_key.toUpperCase()){
            filtered_tenure_multiplier_response = tenure_multiplier_response[i];
            break;
        }
    }

    var keys = Object.keys(filtered_tenure_multiplier_response);
    var tenure_array = [];
    var tenure_loamAmt_map = new Map();

    for(var i = 0; i < keys.length; i++){

        var key = keys[i];
        var key_value = filtered_tenure_multiplier_response[key];
        var nan_check = parseInt(keys[i]);

        if(nan_check && key_value !== "0" && key_value != null){
            tenure_array.push(parseInt(keys[i]));
            var loanAmt = (globals.form.$properties.max_loan_amount < key_value*income ? globals.form.$properties.max_loan_amount : key_value*income);
            tenure_loamAmt_map.set(parseInt(keys[i]), Math.round(loanAmt/ 1000) * 1000);
        }
    }
    globals.form.$properties.IPA_tenure_array = tenure_array.sort();
    globals.form.$properties.IPA_tenure_loamAmt_map = tenure_loamAmt_map;
    assetsAssistedGetIPALoanAndTenure(globals);   

}

/**
 * IPA offer text for perfios
 * @param {scope} globals
 * @return {string}
 */
function assetsAssistedIPAOfferText(globals){
  return "Customer is eligible for a loan amount of upto ₹" + globals.form.$properties.loanAmountIPA/100000 +" lakh for a maximum tenure of " + globals.form.$properties.maxTenureIPA + " months!"
}

/**
 * update perfios count
 * @param {scope} globals
 * @return {void} - nothing to return
 */
function assetsAssistedUpdatePerfiosRetryCount(globals) {
  const urlLocation =
    typeof window !== "undefined" ? window.location.href : null;
  const journeyType =
    globals?.form?.hiddenFieldsPanel?.hiddenJourneyType?.$value ?? "";
  const customerPerfiosCount =
    globals?.form?.hiddenFieldsPanel?.hiddenPerfiosRetryCount?.$value ?? "";

  if (urlLocation) {
    let params = new URL(urlLocation).searchParams;
    if (params.get("visitType") === "RM_PERFIOS") {
      const url = new URL(urlLocation);
      const journeyId = url.searchParams.get("journeyID");
      if (journeyId) {
        setProperty("journeyId", journeyId, globals);
      }
      return globals.functions.setProperty(
        globals.form?.hiddenPerfiosRetryCount,
        { value: globals?.form?.hiddenPerfiosRetryCount?.$value + 1 }
      );
    }
  }
  if (journeyType === "RM") {
    globals.functions.setProperty(globals?.form?.hiddenPerfiosRetryCount, {
      value: globals?.form?.hiddenPerfiosRetryCount?.$value + 1,
    });
  } else {
    if (customerPerfiosCount < 3) {
      globals.functions.setProperty(
        globals.form?.hiddenFieldsPanel?.hiddenPerfiosRetryCount,
        {
          value:
            globals.form.hiddenFieldsPanel.hiddenPerfiosRetryCount.$value + 1,
        }
      );
    } else {
      globals.functions.setProperty(
        globals.form?.hiddenFieldsPanel?.hiddenPerfiosRetryCount,
        {
          value: 1,
        }
      );
    }
  }
}



/**
 * Update Employee Data
 * @param {Object} empdata
 * @param {scope} globals
 */
function assetsAssistedUpdateEmpData(empdata,globals){
  var empObj = empdata[0];
  globals.form.$properties.globalFinalCategory = empObj.FINAL_CATEGORY;
  globals.form.$properties.globalEmployerId = empObj.EMPLOYERID;
}

/**
 * Set loan slider values
 * @param {Object} bre2Response
 * @param {scope} globals
 */
function assetsAssistedSetLoanSlider(bre2Response,globals){
  globals.functions.setProperty(globals.form?.loanOfferScreen?.offerScreenTopSection?.greatNewsPanel?.loanEligibilityPanel?.loanDesTitle?.loanEligibilityText, { value: "Customer is eligible for a loan of ₹" + bre2Response.amountArray[bre2Response.amountArray.length-1] + "!"});
  globals.functions.setProperty(globals.form?.loanOfferScreen?.offerScreenTopSection?.greatNewsPanel?.loanEligibilityPanel?.loanDesTitle?.additionalDocumentsText , {value : "For a higher loan amount, customer needs to submit additional documents to avail a loan of up to ₹"+ globals.form.$properties.loanAmountIPA});
  globals.functions.setProperty(globals.form?.loanOfferScreen?.loanDetailAndDescription?.loanOfferTenureAndSlider?.loanAmountPanel?.loanAmtSlider,{splitValue :assetsAssistedConvertToNumber("234567")});	globals.functions.setProperty(globals.form?.loanOfferScreen?.loanDetailAndDescription?.loanOfferTenureAndSlider?.loanAmountPanel?.loanAmtSlider,{stepValue : assetsAssistedConvertToNumber("10000")});	globals.functions.setProperty(globals.form?.loanOfferScreen?.loanDetailAndDescription?.loanOfferTenureAndSlider?.loanAmountPanel?.loanAmtSlider,{maxValue : assetsAssistedConvertToNumber(globals.form.$properties.loanAmountIPA + "")});	globals.functions.setProperty(globals.form?.loanOfferScreen?.loanDetailAndDescription?.loanOfferTenureAndSlider?.loanAmountPanel?.loanAmtSlider,{minValue : assetsAssistedConvertToNumber("50000")});	globals.functions.setProperty(globals.form?.loanOfferScreen?.loanDetailAndDescription?.loanOfferTenureAndSlider?.loanAmountPanel?.loanAmtSlider,{minLabel : assetsAssistedConvertToNumber("50")+"K"});	globals.functions.setProperty(globals.form?.loanOfferScreen?.loanDetailAndDescription?.loanOfferTenureAndSlider?.loanAmountPanel?.loanAmtSlider,{maxLabel : assetsAssistedConvertToNumber(globals.form.$properties.loanAmountIPA/100000) + "L"});	globals.functions.setProperty(globals.form?.loanOfferScreen?.loanDetailAndDescription?.loanOfferTenureAndSlider?.loanAmountPanel?.loanAmtSlider,{default : assetsAssistedConvertToNumber(bre2Response.amountArray[bre2Response.amountArray.length-1])});
}

/**
 * Handles the selection of radio buttons within the assisted ETB account fieldset.
 * Updates hidden input fields with account number and customer ID based on the selected radio button.
 * @param {scope} globals
 */
function assetsAssistedRadioSelectionHandler(globals) {
  const wrapper = document.querySelector("fieldset.field-assistedetbaccount");
  if (!wrapper) return;
  const continueButton = document.querySelector("button[name='etbAccountSelectionButton']");
  if (!continueButton) return;

  function updateHiddenFieldsFromRadio(radio) {
    if (!radio.checked) return;

    const panel = radio.closest("fieldset[data-index]");
    if (!panel) return;

    const accInput = panel.querySelector("input[name='FipAccountNunber']");
    const custInput = panel.querySelector("input[name='custId']");

    const accNumber = accInput?.value || "";
    const custId = custInput?.value || "";

    const bankNameField = globals.form.accountSelectionDetailsFrag.accountSelectionPanel.accountSelectionWrapper.hiddenBankNameField.$value;

    if (bankNameField === "HDFC Bank") {
      // Set hidden fields only if bankNameField is HDFC Bank
      globals.functions.setProperty(
        globals.form?.hiddenFieldsPanel?.hiddenAccNumber, { value: accNumber }
      );
      globals.functions.setProperty(
        globals.form?.hiddenFieldsPanel?.hiddenCustId, { value: custId }
      );
    } else {
      // Clear hidden fields if bankNameField is not HDFC Bank
      globals.functions.setProperty(
        globals.form?.hiddenFieldsPanel?.hiddenAccNumber, { value: "" }
      );
      globals.functions.setProperty(
        globals.form?.hiddenFieldsPanel?.hiddenCustId, { value: "" }
      );
    }
  }

  // function to validate bankNameField and enable/disable continue button accordingly
  function validateBankNameField() {
    const bankNameField = globals.form.accountSelectionDetailsFrag.accountSelectionPanel.accountSelectionWrapper.hiddenBankNameField.$value;

    if (!bankNameField || bankNameField.trim() === "") {
      continueButton.disabled = true;
    } else if (bankNameField === "HDFC Bank") {
      const checkedRadio = wrapper.querySelector("input[type='radio'][name='accontNumberDetails']:checked");
      continueButton.disabled = !checkedRadio;
    } else {
      continueButton.disabled = false;
    }
  }

  function onRadioChange(event) {
    const target = event.target;
    if (target.matches("input[type='radio'][name='accontNumberDetails']")) {
      updateHiddenFieldsFromRadio(target);
      validateBankNameField();
    }
  }

  wrapper.addEventListener("change", onRadioChange);

  const radios = wrapper.querySelectorAll("input[type='radio'][name='accontNumberDetails']");

  if (radios.length === 1) {
    // Auto-select the single radio
    const singleRadio = radios[0];
    singleRadio.checked = true;
    updateHiddenFieldsFromRadio(singleRadio);
    validateBankNameField();
  } else {
    // Initially disable continue button (will be enabled after validation)
    continueButton.disabled = true;

    // If any pre-selected radio, update hidden fields and validate
    radios.forEach(radio => {
      if (radio.checked) {
        updateHiddenFieldsFromRadio(radio);
      }
    });

    validateBankNameField();
  }
}

/*
 * @param {void} - No parameters are passed. Data is pulled from the DOM directly.
 * @returns {void} - Does not return anything. Manipulates the DOM directly.
 */
function assetsAssistedPopulateEtbAccounts() {
  // Get hidden field that contains account data as JSON
  const hiddenField = document.querySelector("input[name='hiddenAccoundNumberDetails']");
  if (!hiddenField) return;

  // Parse accounts array from hidden field
  let accounts = [];
  try {
    accounts = JSON.parse(hiddenField.value || '[]');
  } catch (e) {
    return;
  }

  if (accounts.length === 0) return;

  // Get the repeatable panel wrapper
  const assistedPanel = document.querySelector("fieldset.field-assistedetbaccount");
  if (!assistedPanel) return;

  const repeatWrapper = assistedPanel.querySelector("div.repeat-wrapper");
  if (!repeatWrapper) return;

  const firstInstance = repeatWrapper.querySelector("fieldset[data-index='0']");
  if (!firstInstance) return;

  // Remove any previously cloned instances beyond the first
  const existingInstances = repeatWrapper.querySelectorAll("fieldset[data-index]");
  existingInstances.forEach((inst, idx) => {
    if (idx > 0) inst.remove();
  });

  // For each account, clone and populate a panel instance
  accounts.forEach((account, index) => {
    let instance;

    // Use first instance or clone it
    if (index === 0) {
      instance = firstInstance;
    } else {
      instance = firstInstance.cloneNode(true);
      instance.setAttribute("data-index", index);
      instance.querySelectorAll("input").forEach(input => input.value = "");
      repeatWrapper.appendChild(instance);
    }

    // === Masked Account Logic ===
    const rawAccNumber = account.accountNumber || "";
    let maskedAcc = rawAccNumber;

    if (rawAccNumber.length > 4) {
      const last4 = rawAccNumber.slice(-4);
      const maskChar = rawAccNumber[0];

      if (maskChar === 'X' || maskChar === '*') {
        maskedAcc = maskChar.repeat(rawAccNumber.length - 4) + last4;
      } else {
        // If not masked, just show last 4 digits
        maskedAcc = 'X'.repeat(rawAccNumber.length - 4) + last4;
      }
    }

    // Populate fields in the instance
    const accInput = instance.querySelector("input[name='FipAccountNunber']");
    if (accInput) accInput.value = maskedAcc;

    const custInput = instance.querySelector("input[name='custId']");
    if (custInput) custInput.value = account.customerId || "";
  });
}

/**
*  Update address based on customer selection
* @param {scope} globals
* @returns {void} - No return value
*/
function assetsAssistedUpdateAddressDataNTB(globals){
    var addreddFlag = globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.addressDetailWrapper.customerAadharAddressSelection.$value;
    if(addreddFlag == "0" || addreddFlag == "3"){
        globals.form.$properties.breAddress1=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentaddress.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddress.currentAddressLine1.$value;		globals.form.$properties.breAddress2=globals.form.$properties.breAddress1=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentaddress.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddress.currentAddressLine2.$value;	globals.form.$properties.breAddress3=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentaddress.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddress.currentAddressLine3.$value;	globals.form.$properties.breZipCode=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentaddress.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddress.currentPinCode.$value;	globals.form.$properties.breCity=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentaddress.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddress.currentCity.$value;	globals.form.$properties.breState=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentaddress.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddress.currentStateProvince.$value;	globals.form.$properties.breResidentType=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentaddress.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddress.currentResidenTtype.$value;
    }
}

/**
* Update address based on customer selection ETB
* @param {scope} globals
* @returns {void} - No return value
*/
function assetsAssistedUpdateAddressDataETB(globals){

if(globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.addressDetailWrapper.residentialAddressSelection.$value == "0"){
    globals.form.$properties.breAddress1=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentAddressEtb.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddressEtb.currentEtbAddressLine1.$value;
    globals.form.$properties.breAddress2=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentAddressEtb.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddressEtb.currentEtbAddressLine2.$value;
    globals.form.$properties.breAddress3=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentAddressEtb.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddressEtb.currentEtbAddressLine3.$value;
    globals.form.$properties.breZipCode=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentAddressEtb.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddressEtb.currentEtbPinCode.$value;
    globals.form.$properties.breCity=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentAddressEtb.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddressEtb.currentEtbCity.$value;
    globals.form.$properties.breState=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentAddressEtb.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddressEtb.currentEtbstateProvince.$value;
    globals.form.$properties.breResidentType=globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.currentAddressEtb.currentAddrressDetailsOfCustomer.currentAddressWrapper.currentAddressEtb.currentEtbResidenTtype.$value;
}
}
/**
* Update aadhar address for NTB
* @param {scope} globals
* @returns {void} - No return value
*/
function assetsAssistedUpdateAadharAddress(globals){
    globals.form.$properties.breAddress1= globals.form.$properties.demogCustomerDetails.customerAddress1;
    globals.form.$properties.breAddress2= globals.form.$properties.demogCustomerDetails.customerAddress2;
    globals.form.$properties.breAddress3= globals.form.$properties.demogCustomerDetails.customerAddress3;
    globals.form.$properties.breZipCode= globals.form.$properties.demogCustomerDetails.zipCode;
    globals.form.$properties.breCity= globals.form.$properties.demogCustomerDetails.customerCity;
    globals.form.$properties.breState= globals.form.$properties.demogCustomerDetails.customerState;
    globals.form.$properties.breResidentType= assetsAssistedGetResidentType("2");
}

/**
 * Update choice All everify section
 * @param {Object} response
 * @param {scope} globals
 */
function assetsAssistedChoiceAllEverify(response, globals){
  const data = response[0];
  const mapping = {
    ISNETBANKING: ".field-salaryaccountcheckbox input[type='checkbox']",
    ISSTATEMENT: ".field-bankstatementcheckbox input[type='checkbox']",
    ISAA: ".field-accountaggregatorcheckbox input[type='checkbox']"
  };

  const recommendationMap = {
    NETBANKING_RECOMMENDATION: ".field-salaryaccountcheckbox input[type='checkbox']",
    STATEMENT_RECOMMENDATION: ".field-bankstatementcheckbox input[type='checkbox']",
    AA_RECOMMENDATION: ".field-accountaggregatorcheckbox input[type='checkbox']"
  };

  const destinationTypeMap = {
    NETBANKING_RECOMMENDATION: "netbankingFetch",
    STATEMENT_RECOMMENDATION: "statement",
    AA_RECOMMENDATION: "accountAggregator"
  };

  const recommendedVisibilityMap = {
    AA_RECOMMENDATION: globals.form.choiceAll.e_verify_income.eVerifyMethod.eVerifyRadioButtonPanel.accountAggregatorSection.Recommended1,
    NETBANKING_RECOMMENDATION: globals.form.choiceAll.e_verify_income.eVerifyMethod.eVerifyRadioButtonPanel.salaryAccountSection.Recommended2,
    STATEMENT_RECOMMENDATION: globals.form.choiceAll.e_verify_income.eVerifyMethod.eVerifyRadioButtonPanel.bankStatementSection.Recommended3
  };

   globals.functions.setProperty(globals.form.choiceAll.e_verify_income.eVerifyMethod, { visible: true });
   globals.functions.setProperty(recommendedVisibilityMap.AA_RECOMMENDATION, { visible: false });
   globals.functions.setProperty(recommendedVisibilityMap.NETBANKING_RECOMMENDATION, { visible: false });
   globals.functions.setProperty(recommendedVisibilityMap.STATEMENT_RECOMMENDATION, { visible: false });
  //  const container = document.querySelector(".field-selectbankbtn");
 
  // container.onclick = e => {
  //   if (e.target.classList.contains("button")) {
  //     container.querySelectorAll(".button").forEach(btn => btn.classList.remove("activeBank"));
  //     e.target.classList.add("activeBank");
  //   }
  // };

  const allCheckboxes = Object.values(mapping)
    .map(selector => document.querySelector(selector))
    .filter(Boolean);

  Object.entries(mapping).forEach(([key, selector]) => {
    const checkbox = document.querySelector(selector);
    if (checkbox) {
      checkbox.disabled = (data[key] === "N");
      checkbox.checked = false;
      checkbox.onclick = function () {
        if (this.checked === false) {
        this.checked = true;
        return;
      }
        
      allCheckboxes.forEach(c => {
        if (c !== this) c.checked = false;
      });

      };
    }
  });

  for (const [key, selector] of Object.entries(recommendationMap)) {
    const checkbox = document.querySelector(selector);
    if (checkbox && data[key] === "Y" && !checkbox.disabled) {
      checkbox.checked = true;
      
       if (recommendedVisibilityMap[key]) {
        globals.functions.setProperty(recommendedVisibilityMap[key], { visible: true });
      }
      if (data.INSTITUTION_ID) {
        globals.functions.setProperty(globals.form.choiceAll.hiddenInstituteId,{ value: data.INSTITUTION_ID });
      }

      globals.functions.setProperty(globals.form.choiceAll.hiddenDestinationType,{ value: destinationTypeMap[key] });
      break;
    }
  }
}

/**
 * Function to handle "Try Again" functionality for assisted assets
 * @param {object} utmParam - UTM parameter from the URL
 * @param {string} ctaText - Call to action text
 * @param {boolean} hideTooggle - Flag to hide toggle
 * @param {scope} globals - Global scope object
 */
function assetsAssistedTryAgainFunctionality(utmParam , ctaText, hideTooggle, globals){
  // Implement the functionality here
}

/**
 * Function to handle "goToBottom" functionality 
 */
function assetsAssistedGoToBottomFunctionality(){
let popup = document.querySelector(".field-consentmodalmandatory .modal-content");
if(popup){
popup.scrollTop = popup.scrollHeight;
}
}

//EMI Calculation logic
function getCalculateEMI(loanAmountcal, rateOfInterest, tMonths) {
  var newrate = (rateOfInterest / 100) / 12;
  var rate1 = (1 + newrate);
  var rate2 = Math.pow(rate1, tMonths);
  var rate3 = (rate2 - 1);
  var principle = [(loanAmountcal) * (newrate) * rate2];
  var finalEMI = Math.round(principle / rate3);
  return finalEMI;
}

 // function to calculate Processing fee
 function procFee(loanAMount, percent) {
  if (percent.toString().indexOf("%") !== -1) {
      return (loanAMount / 100) * parseFloat(percent);
  } else {
      return percent;
  }
}

//function to generate commas in amount
function commasSepratedValue(loanAmount) {
  return parseInt(loanAmount).toLocaleString('en-IN');
}

/**
 * Update choice All everify section
 * @param {scope} globals
 */
// populates the bre loan screen with loan details: customer name, loan amount, tenure, roi and processing fee
function populateLoanDetails(globals) {


  var maxTenure = globals.form.$properties.bre1Response.tenureArray[globals.form.$properties.bre1Response.tenureArray.length-1];
  // get the calculated loan amount based on maximum tenure
  var loanAmount = Math.round(globals.form.$properties.bre1Response.amount.get(maxTenure) / 1000) * 1000;

  // get the roi on calculated loan amount
  var roi = globals.form.$properties.bre1Response.irr.get(maxTenure);
  let loanOfferMainHead = globals.form.loanOfferScreen.offerScreenTopSection.greatNewsPanel.loanEligibilityPanel.loanDesTitle.loanEligibilityText.$value;
  globals.form.loanOfferScreen.offerScreenTopSection.greatNewsPanel.loanEligibilityPanel.loanDesTitle.loanEligibilityText.$value = loanOfferMainHead.replace("₹8,00,000","₹" + commasSepratedValue(loanAmount));
  globals.form.loanOfferScreen.loanDetailAndDescription.loanOfferTenureAndSlider.loanAmountPanel.childLoanAmt.loanAmtValue.$value = commasSepratedValue(loanAmount);

  // set the tenure value
  globals.form.$properties.tenure = maxTenure;

  globals.form.loanOfferScreen.loanDetailAndDescription.loanOfferTenureAndSlider.loanTenurePanel.childLoanTenure.loanTenureValue.$value = Math.floor(globals.form.$properties.tenure) + " " + "Months";
  globals.form.loanOfferScreen.offerScreenTopSection.loanSummarySection.emiDetailsPanel.emiTopSection.rateOfInterest.$value = roi.toString() + "%" + " " + "p.a";

  // get the calculated EMI on loan amount, roi and tenure
  var monthlyInstallment = getCalculateEMI(loanAmount, roi, globals.form.$properties.tenure);

  globals.form.loanOfferScreen.offerScreenTopSection.loanSummarySection.emiDetailsPanel.emiTopSection.emiAmount.$value = "₹" + " " + commasSepratedValue(monthlyInstallment);
  globals.form.loanOfferScreen.offerScreenTopSection.loanSummarySection.emiDetailsPanel.emiBottonSectionWrapper.emiBottomSection.processingFee.$value = "₹" + " " + procFee(loanAmount, globals.form.$properties.procFee.get(maxTenure));
  var maxAmount = globals.form.loanOfferScreen.loanDetailAndDescription.loanOfferTenureAndSlider.loanAmountPanel.childLoanAmt.loanAmtValue.$value;
}

/**
 * Updates the loan tenure slider value when the input box value changes and vice versa.
 * This function provides two-way binding between the slider and input field.
 * 
 * @param {object} sliderField - The slider field object
 * @param {object} inputField - The input field object
 * @param {scope} globals - Global scope object
 * @returns {void}
 */
function updateLoanTenureSliderAndInput(sliderField, inputField, globals) {
  // Define the available tenure options (in months)
  const tenureOptions = [12, 24, 36, 48, 60, 72, 84];
  
  // Get current values
  let sliderValue = parseInt(sliderField.$value || 48);
  let inputValue = inputField.$value || '';
  
  // Extract numeric value from input (remove "Months" text if present)
  let inputNumericValue = parseInt(inputValue.toString().replace(/[^0-9]/g, ''));
  
  // Determine which field triggered the update
  if (globals.field === inputField) {
    // Input field was changed, update slider
    if (!isNaN(inputNumericValue)) {
      // Find the closest valid tenure option
      const closestTenure = tenureOptions.reduce((prev, curr) => {
        return (Math.abs(curr - inputNumericValue) < Math.abs(prev - inputNumericValue) ? curr : prev);
      });
      
      // Update slider value
      globals.functions.setProperty(sliderField, {
        value: closestTenure
      });
      
      // Update input field with formatted value (in case it was adjusted to match a valid tenure)
      globals.functions.setProperty(inputField, {
        value: `${closestTenure} Months`
      });
    }
  } else if (globals.field === sliderField) {
    // Slider was changed, update input field
    globals.functions.setProperty(inputField, {
      value: `${sliderValue} Months`
    });
  }
}

function assetsAddClassNameBankIcon(className){
  const bankBtn = document.querySelector(`button[name='${className}']`);
  const container = document.querySelector(".field-selectbankbtn");
  container.onclick = e => {
    if (e.target.classList.contains("button")) {
      container.querySelectorAll(".button").forEach(btn => btn.classList.remove("activeBank"));
      // e.target.classList.add("activeBank");
    }}
  if (bankBtn) {
    bankBtn.classList.add("activeBank");
  }
}

/**
 * Update Other Emp Data
 * @param {Object} response
 * @param {scope} globals
 */
function assetsAssistedOtherEmpData(response, globals){
  var isVerified = false;
  var income = globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.incomeDetailsWrapper.incomeDetails.monthlyNetIncome.$value;
  for(var i=0; i< response.length;i++){
    if(income >= response[i].LOW && income <= response[i].HIGH){
      globals.form.$properties.globalFinalCategory = response[i].COMPANY_CATEGORY;
      globals.form.$properties.minVerifyIncomeAmount = response[i].LOW;
      globals.form.$properties.maxVerifyIncomeAmount = response[i].HIGH;
      globals.form.$properties.govIdProofReq = response[i].ID_PROOF_REQ; 
      globals.form.$properties.workEmailReq = response[i].WORK_EMAIL_REQ;
      if(globals.form.$properties.workEmailReq === "N"){
        globals.functions.setProperty(globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.otherWorkEmailIdWrapper.otherWorkEmailId.otherWorkEmailVerification, { required: false });
      }
      isVerified = true;
    }
  }
  if(!isVerified){
    globals.form.$properties.globalFinalCategory = "CAT NEW";
    globals.form.$properties.minVerifyIncomeAmount = "100";
    globals.form.$properties.maxVerifyIncomeAmount = "9999999999";
  }
}

/**
 * Check doc upload status
 * @param {string} fieldClass
 * @param {Object} fieldData
 * @param {scope} globals
 * @returns {boolean}
 */
function assetsAssistedCheckDocUploadStatus(fieldClass,fieldData,globals){
  if(document.getElementsByClassName(fieldClass)[0].className.includes("field-valid")){
    globals.functions.setProperty(fieldData, { visible: true });
  }else{
    globals.functions.setProperty(fieldData, { visible: false });
  }
}

/**
 * Helper function to safely get field value data using optional chaining
 * @param {Object} field - The form field
 * @returns {*} - The field value data or null if not available
 */
function assetsAssistedGetFieldValue(field) {
  if(!field || !field.$value.data) {
    return null;
  }
  return field.$value.data;
}

/**
 * 
 * @param {string} journeyId 
 * @param {string} journeyName 
 * @param {string} phoneNumber 
 * @param {string} parentDocID 
 * @param {string} parentDocName 
 * @param {string} partnerJourneyID 
 * @param {string} bankJourneyID 
 * @returns {*} - The field value data or null if not available
 */
function assetsAssistedCreateDocUploadRequest(journeyId,journeyName,phoneNumber,parentDocID,parentDocName,partnerJourneyID,bankJourneyID){
    var requestString = {};
  var additionalDataMap = new Map();
    if(parentDocID === docUploadChildIDs["PhotographChildID"]) {
        requestString.parentDocID = docUploadParentIDs["PhotographID"];
        requestString.childDocID = parentDocID;
    } else if(parentDocID === docUploadParentIDs["KYC_ID"]) {
        requestString.parentDocID = docUploadParentIDs["KYC_ID"];
        requestString.childDocID = docUploadChildIDs[parentDocName];
    } else if(parentDocID === docUploadParentIDs["employmentProofID"]) {
        requestString.parentDocID = docUploadParentIDs["IncomeID"];
        requestString.childDocID = parentDocID;
    } else if(parentDocID === docUploadParentIDs["bankStatementID"]) {
        requestString.parentDocID = docUploadParentIDs["bankStmtID"];
        requestString.childDocID = parentDocID;
    } else if(parentDocID === docUploadParentIDs["government_Id"]) {
        requestString.parentDocID = docUploadParentIDs["government_Id"];
        requestString.childDocID = docUploadChildIDs[parentDocName];
    } else if(parentDocID === docUploadParentIDs["balanceTransfer_Id"]) {
        requestString.parentDocID = docUploadParentIDs["balanceTransfer_Id"];
        requestString.childDocID = docUploadChildIDs[parentDocName];
        requestString.Parent_Doc_desc = "LOAN TRANSFER DOCUMENTS";
        requestString.Child_Doc_Desc = "STATEMENT OF ACCOUNTS";

    } else if(parentDocID === docUploadParentIDs["additionalDoc_Id"]) {
          requestString.parentDocID = docUploadParentIDs["additionalDoc_Id"];
          requestString.childDocID = docUploadChildIDs[parentDocName];
    }
    requestString.documentType = "0";
    requestString.flgReupload = "No";
    requestString.flgFinalUpload = "";
    requestString.journeyID = journeyId;
    requestString.journeyName = journeyName;
    requestString.partnerJourneyID = partnerJourneyID;
    requestString.bankJourneyID = bankJourneyID;
  requestString.mobileNo = phoneNumber;
    requestString.userAgent = window.navigator.userAgent;

    additionalDataMap.set('requestString', JSON.stringify(requestString));
    additionalDataMap.set('childDocID', requestString.childDocID);
    return additionalDataMap;
}

/**
 * Helper function to extract document data from form fields
 * @param {string} docType - type of document
 * @param {object} panel - field panel
 * @returns {Object} - Document data or null if required data is missing
 */
function assetsAssistedExtractDocumentData(docType, panel) {
  var docData = {};
  if(docType === "Photograph"){
    docData.photograph = assetsAssistedGetFieldValue(panel.photographUpload);
  }else if(docType === "kycProof"){
    docData.kycProofFront = assetsAssistedGetFieldValue(panel.kycProofFront);
    docData.kycProofBack = assetsAssistedGetFieldValue(panel.kycProofBack);
  }else if(docType === "employmentProof"){
    docData.incomeProof1 = assetsAssistedGetFieldValue(panel.incomeProof1);
    docData.incomeProof2 = assetsAssistedGetFieldValue(panel.incomeProof2);
    docData.incomeProof3 = assetsAssistedGetFieldValue(panel.incomeProof3);
  }else if(docType === "incomeProof"){
    docData.bankStat = assetsAssistedGetFieldValue(panel.bankStat);
  }else if(docType === "addDoc"){
    docData.additionalDoc = assetsAssistedGetFieldValue(panel.additionalDoc);
  }else if(docType === "govtIdProof"){
    docData.govtIdProofDoc = assetsAssistedGetFieldValue(panel.govtIdProofDoc);
  }
  return docData;
}

/**
 * Helper function to upload documents to the server
 * @param {string} docType - Document data extracted from the form
 * @param {string} journeyId 
 * @param {string} journeyName 
 * @param {string} phoneNumber 
 * @param {string} parentDocID 
 * @param {string} parentDocName 
 * @param {string} partnerJourneyID
 * @param {object} panel
 * @param {string} bankJourneyID
 * @returns {Promise<Object>} - Promise resolving to the upload response
 */
function uploadDocuments(docType,journeyId,journeyName,phoneNumber,parentDocID,parentDocName,partnerJourneyID,panel,bankJourneyID) {
  return new Promise((resolve, reject) => {
    try {
      const formData = new FormData();
      const documentIds = [];
      var docData = assetsAssistedExtractDocumentData(docType, panel);
      var additionalDataMap = assetsAssistedCreateDocUploadRequest(journeyId,journeyName,phoneNumber,parentDocID,parentDocName,partnerJourneyID,bankJourneyID);
  
      // Helper function to append files
      const appendFile = (fileData) => {
        if (fileData instanceof File) {
          const uuid = generateUUID();
          formData.append(uuid, fileData); // key = uuid, value = file (binary)
          documentIds.push(uuid); // track uploaded field names
        }
      };
      
      if(docType === "Photograph"){
        appendFile(docData.photograph);
      }else if(docType === "kycProof"){
        appendFile(docData.kycProofFront);
        appendFile(docData.kycProofBack);
      }else if(docType === "employmentProof"){
        appendFile(docData.incomeProof1);
        appendFile(docData.incomeProof2);
        appendFile(docData.incomeProof3);
      }else if(docType === "incomeProof"){
        appendFile(docData.bankStat);
      }else if(docType === "addDoc"){
        appendFile(docData.additionalDoc);
      }else if(docType === "govtIdProof"){
        appendFile(docData.govtIdProofDoc);
      }
    //Populate additional data map
    if (additionalDataMap) {
    additionalDataMap.forEach(function (value, key, map) {
        formData.append(key, value);
    });
    }
    // Add document IDs
    formData.append(additionalDataMap.get("childDocID"), documentIds.join(","));

    // If no documents to upload, resolve with null
    if (documentIds.length === 0) {
    console.warn("No documents to upload");
    resolve(null);
    return;
    }

      // Send the request
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        "https://hdfc-dev-02.adobecqms.net/content/hdfc_loan_forms/api/xpressAssist/docUpload.json",
        true
      );
      // Set the custom header here
      xhr.setRequestHeader("journeyname", journeyName);
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log(response);
            resolve(xhr.responseText);
          } catch (e) {
            console.error("Error parsing upload response:", e);
            resolve(xhr.responseText);
          }
        } else {
          reject(
            new Error(
              `Upload failed with status ${xhr.status}: ${xhr.statusText}`
            )
          );
          
        }
      };

      xhr.onerror = function () {
        console.error("Document upload network error occurred");
        reject(new Error("Network error during document upload"));
      };
      xhr.send(formData);
    } catch (error) {
      console.error("Error in uploadDocuments:", error);
    }
  });
}

/**
 * Prepares and uploads document data from form fields to the document upload API.
 * This function extracts document data from various form fields based on the document type,
 * creates a FormData object with the appropriate metadata, and sends it to the server.
 * @param {string} docType - Document data extracted from the form
 * @param {string} journeyId 
 * @param {string} journeyName 
 * @param {string} phoneNumber 
 * @param {string} parentDocID 
 * @param {string} parentDocName 
 * @param {string} partnerJourneyID
 * @param {object} panel - field panel 
 * @param {string} bankJourneyID
 * @returns {Promise<Object>} - Promise resolving to the upload response
 */
function assetsAssistedDocuploadAPI(docType,journeyId,journeyName,phoneNumber,parentDocID,parentDocName,partnerJourneyID,panel,bankJourneyID) {
  try {    
    // Create and send the form data
    return uploadDocuments(docType,journeyId,journeyName,phoneNumber,parentDocID,parentDocName,partnerJourneyID,panel,bankJourneyID);
  } catch (error) {
    console.error("Error in document upload process:", error);
    return Promise.reject(error);
  }
}

/**
 * 
 * @param {object} data 
 * @param {scope} globals 
 */
function assetsAssistedReviewDetailsPrefill(data ,globals){

}

/**
 * Validates the two numeric fields to check if the second field value is greater than or equal to the first field value
 * @param {Object} monthlyIncome - First numeric field object
 * @param {Object} emiAmount - Second numeric field object
 * @param {scope} globals - Global scope object
 * @returns {Boolean} 
 */
function assetsAssistedValidateEMIAmount(monthlyIncome, emiAmount, globals) {
  if(emiAmount.$value > monthlyIncome.$value) {
    globals.functions.markFieldAsInvalid(emiAmount.$id, "Please enter amount lesser than Your Net Take Home Monthly Salary", { useId: true });
  }
  else{
    const onGoingIncomeField = globals.form.customerPersonalDetailsWrapper.customerPersonalDetailsSection.customerDetailMainPanel.customerDetailBodyPanel.incomeDetailsWrapper.incomeDetails.onGoingIncome;
    globals.functions.setProperty(onGoingIncomeField, {valid: true});
  }
}

/**
 * Retrieves the workemail by removing special characters from the email
 * @param {string} workEmail - workemail parameter 
 * @param {string} characterToRemove - make substring as empty after specified character
 * @returns {string} 
 */
function assetsAssistedFormatWorkEmail(workEmail, characterToRemove) {
  let regex = new RegExp(`(${characterToRemove}).*`);
  workEmail = workEmail.replace(regex, '$1');
  return workEmail;
}


// eslint-disable-next-line import/prefer-default-export
export {
  setProperty,
  getProperty,
  createJourneyId,
  convertDateFormat,
  generateUUID,
  getDispatcherInstance,
  assetsAssistedApplicationStatusInfoArray,
  assetsAssistedRMDashBoardArrayFormat,
  assetsAssistedDataRefParamTrim,
  assetsAssistedFormatStateInfo,
  assetsAssistedCreatePartnerJourneyId,
  assetsAssistedCreateConsentFormatData,
  assetsAssistedGetFirstNameFromCustName,
  assetsAssistedGetLastNameFromCustName,
  assetsAssistedMaskMobileNumberAssetsFormat,
  assetsAssistedFilterDemogDetails,
  assetsAssistedCustomerDemogDetails,
  assetsAssistedConvertToTitleCase,
  assetsAssistedReinitiateJourney,
  assetsAssistedConvertToNumber,
  getCreditPromoCode,
  assetsAssistedTenSecondLoanData,
  getAccountdetailsFIP,
  assetsAssistedIfscCodeFilter,
  assetsAssistedStoreAccountNumber,
  assetsAssistedGetIPALoanAndTenure,
  assetsAssistedCalculateIRRData,
  assetsAssistedTenureMultiplierResponse,
  assetsAssistedIPAOfferText,
  assetsAssistedUpdateEmpData,
  assetsAssistedPopulateEtbAccounts,
  assetsAssistedRadioSelectionHandler,
  assetsAssistedUpdateCityStateID,
  assetsAssistedUpdateAddressDataNTB,
  assetsAssistedUpdateAddressDataETB,
  assetsAssistedSetLoanSlider,
  assetsAssistedUpdatePerfiosRetryCount,
  assetsAssistedGetResidentType,
  assetsAssistedChoiceAllEverify,
  assetsAssistedTryAgainFunctionality,
  assetsAssistedGoToBottomFunctionality,
  assetsAssistedValidateEmail,
  assetsAssistedWorkEmailValidation,
  populateLoanDetails,
  assetsAssistedUpdateAadharAddress,
  updateLoanTenureSliderAndInput,
  assetsAssistedFormatWorkEmail,
  assetsAddClassNameBankIcon,
  assetsAssistedOtherEmpData,
  assetsAssistedCheckDocUploadStatus,
  assetsAssistedValidateEMIAmount,
  assetsAssistedDocuploadAPI,
  assetsAssistedReviewDetailsPrefill
};
