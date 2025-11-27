export const fileAttachmentText = 'Attach';
export const dragDropText = 'Drag and Drop To Upload';

export const DEFAULT_THANK_YOU_MESSAGE = 'Thank you for your submission.';

export const defaultErrorMessages = {
  accept: 'The specified file type not supported.',
  maxFileSize: 'File too large. Reduce size and try again.',
  maxItems: 'Specify a number of items equal to or less than $0.',
  minItems: 'Specify a number of items equal to or greater than $0.',
  pattern: 'Specify the value in allowed format : $0.',
  minLength: 'Please lengthen this text to $0 characters or more.',
  maxLength: 'Please shorten this text to $0 characters or less.',
  maximum: 'Value must be less than or equal to $0.',
  minimum: 'Value must be greater than or equal to $0.',
  required: 'Please fill in this field.',
};

export function getRouting() {
  const regex = /(.*?)--(.*?)--(.*?)\.(hlx|aem)\.(.*)/;
  const match = window?.location?.host?.match(regex);
  if (match) {
    const [, branch, site, org, , tier] = match;
    return {
      branch, site, org, tier,
    };
  }
  return {};
}

// eslint-disable-next-line no-useless-escape
export const emailPattern = '([A-Za-z0-9][._]?)+[A-Za-z0-9]@[A-Za-z0-9]+(\.?[A-Za-z0-9]){2}\.([A-Za-z0-9]{2,4})?';

export const ENV =  'dev'; // dev , prod, stage

let submitBaseUrl = 'https://hdfc-dev-02.adobecqms.net';

export const SUBMISSION_SERVICE = 'https://forms.adobe.com/adobe/forms/af/submit/';

export function setSubmitBaseUrl(url) {
  submitBaseUrl = url;
}

export function getSubmitBaseUrl() {
  return submitBaseUrl;
}


/*** start of mock fetch */

// Store original fetch if available
const originalFetch = typeof self !== 'undefined'
  ? (self.fetch)  // Worker context uses self instead of window
  : (typeof window !== 'undefined'
    ? (window.originalFetch || window.fetch)
    : null);

// Helper to check if we're on HDFC domain
const isHDFCDomain = () => {
  if (typeof window !== 'undefined') {
    return window?.location?.host?.toLowerCase()?.includes('hdfcbank.com');
  }
  if (typeof self !== 'undefined') {
    return self?.location?.host?.toLowerCase()?.includes('hdfcbank.com');
  }
  return false;
};

// Mock fetch function for testing environments
export function mockFetch(url, options = {}) {
  // Helper to safely parse body
  const getBodyContent = (body) => {
    if (!body) return undefined;
    if (typeof body === "string") {
      try {
        return JSON.parse(body);
      } catch (e) {
        return body;
      }
    }
    return body;
  };

  /**
  * List of keywords that must NOT be present in the URL.
  * If any of these exist in the URL, the condition will fail.
  */
const excludeKeywords = [
    "state.india.json",
    "city",
    "product",
    "branchdata",
    "branchSelection",
    "threedigitpincode",
    "mdm.INSTA.BRANCH_MASTER.PINCODE",
    "mdm.INSTA.IIN_MASTER",
    "panValNameMatch",
    "consentreceipts",
    "journeyinit",
    "journeydropoffupdate",
    "journeydropoff",
    "aadharInit",
    "hdfc_customerinfo",
    "aadharcheck"
  ];

  // Check if we should use mock based on URL
  /**
   (!url.includes('etb_is_customeridentificationandotpgen') && !url.includes('etb_is_otpvalidation') && !url.includes('aadharcheck') && !url.includes('aadharInit') &&
  !url.includes('journeydropoff') && !url.includes('journeydropoffupdate') && !url.includes('mdm.INSTA.IIN_MASTER')
   */
  if (excludeKeywords.every(keyword => !url.includes(keyword)) && !url.includes('threedigitpincode') && !url.includes('mdm.INSTA.IIN_MASTER') && (url.includes('hdfc_customerinfo') || url.includes('adobe') || url.includes('hdfc_savings') || url.includes('hdfcbank') || url.includes('hdfc_common'))) {
    // Detailed request logging
    console.group('[Mock Fetch] Request Details');
    console.log('URL:', url);
    console.log('Method:', options.method || 'GET');
    console.log('Headers:', options.headers || {});
    console.log('Body:', getBodyContent(options.body));
    console.log('Other Options:', { ...options, headers: undefined, body: undefined });
    console.groupEnd();

    return new Promise((resolve) => {
      // Mock response based on URL
      let mockResponse = {};

      switch (url) {
        case `${submitBaseUrl}/content/hdfc_customerinfo/api/genericServlet.json`:
          console.log(getBodyContent(options.body)?.requestString?.context?.scenario)
          const scenario = getBodyContent(options.body)?.requestString?.context?.scenario;
          console.log("Scenario: ", scenario);
          switch (scenario) {
            case 'login':
            // case 'CustomerIdentificationOTPGen':
              mockResponse = {
                status: 200,
                data: {
                  "original": {
                    "otpGenApiService-V2": {
                      "status": {
                        "errorCode": "00000",
                        "errorMsg": "defaultError"
                      }
                    },
                    "api-customerIdentification": {
                      "existingCustomer": "Y",
                      "status": {
                        "errorCode": "0",
                        "errorMsg": "defaultError"
                      }
                    }
                  },
                  "data": {
                    "existingCustomer": "Y",
                    "status": {
                      "errorCode": "00",
                      "errorMsg": "defaultError"
                    }
                  }
                }
              };
              break;
            case 'otp-NTB':
              mockResponse = {
                status: 200,
                data: {
                  "original": {
                    "otpValidation-V2": {
                      "jwtToken": "AaPRv-3q96_75Q09xpBB_O1yx8neaPxvZC0D10XRi5vvGU4E5KE92yCjLOAd21K8J-54eoNXmDtfnL1A99VZsZu--PuZF7obhsrGpA27f3uj0GYpJERyJJVvwJZhV7tibi9KQCH7c5s6x4c8ewR-ls3aaafOW9Ubd-8YCdTpkEkMD1hJG9P7WQ4AAf4JfCrAS_01B7y6UI5766h7hhW1zLPIOn2C0OHSzECjCI_CIXO3Sy7D2KIwhzx-ZwJe5RoTtgSHgGCli24EuVt4dQaRso_cVQzbYhzWE1E1Qdyo0qI4YBSKgap1h6uLuk63REp2N319DN-9my_OueUeHUiouA.LtYNO-vMFCoZ0RcecwQCPg.TCiaYeynNMYOLDn-ii6zRIL9QJecvkb7tMC4g3D0if87MvmL5yqwpHEw6zoKJ9WC2fDqH5xd6qn3NvdWSGOGW3NgeYJDhf9m_yRD1JsSVgjHLOun_Uhdyae0IwKd4c8QWPe4uFuOS93FfAkuGTamfkWDzY62ltEUZpPG5luJhJFbg_x-BvSN6fdhfrB4IXD2jP4ohP48XTHMKXtY1-4Of3Gloz760lsYVsCkfWdSp3McF45v50laYiXI6FkU8JURCPvL3rDyDZv_gDzXdcDFc9VsScalhfYg7OF_S_myLGv-8ga0Pie6szc7zmZfVBkRtP1kfyUvNNaatedzOrreaO8mRMwQVW04FXj3ENccQfX9DCSEAbDl_BbXZkI3NuadmQ8s9seCAjKySwjKvFbt1doDO85qKqIeHp3fpGD9XTXVdt36HnDrVDPqxPrQF9j8W2AHTc5zNzVZM2-iTROlZuqxScYAc_ZK3DeIrUdsc5d0rSMhJfgDvxlxvdynEbVSEybOuPfzILIuNx2nMbuvt63zgmYzyXR-fRhD3K2EqtxhKnshOX0BZvc5i-s99mLntnxfMOmZeWct_11Y6QtqegxVZpVaaC9si0nuhpnaN02PWGW9h4hJU-En_p9ri1smJgiudJhLdHxVFwpdbFEPFMKMh6bBz6q0oAsrwgaO_XguTWRigoKwVxP1W_nX7hj_SykuPeBovDwSvi-YIRKBp3mC6AMvSikDmuhvXB5FRK9hGwYlQhWI9NiUHKrjcTE3QQitFv12Pr9crKBn0yqCrpnEmRHMKIAT0JY3cqOl8JAgOW9XKP10-PU7dtv0LdFwhgP2u7W-CwxVH7y6wAd9VmzPCA-dFDqkfhGnIKgvP8Lp5xVa0x73svkJVQhLwi_l.uMq8TQw0GXkTUEYRK0dbqA",
                      "status": {
                        "errorCode": "00",
                        "errorMsg": "defaultError"
                      }
                    }
                  },
                  "data": {
                    "jwtToken": "AaPRv-3q96_75Q09xpBB_O1yx8neaPxvZC0D10XRi5vvGU4E5KE92yCjLOAd21K8J-54eoNXmDtfnL1A99VZsZu--PuZF7obhsrGpA27f3uj0GYpJERyJJVvwJZhV7tibi9KQCH7c5s6x4c8ewR-ls3aaafOW9Ubd-8YCdTpkEkMD1hJG9P7WQ4AAf4JfCrAS_01B7y6UI5766h7hhW1zLPIOn2C0OHSzECjCI_CIXO3Sy7D2KIwhzx-ZwJe5RoTtgSHgGCli24EuVt4dQaRso_cVQzbYhzWE1E1Qdyo0qI4YBSKgap1h6uLuk63REp2N319DN-9my_OueUeHUiouA.LtYNO-vMFCoZ0RcecwQCPg.TCiaYeynNMYOLDn-ii6zRIL9QJecvkb7tMC4g3D0if87MvmL5yqwpHEw6zoKJ9WC2fDqH5xd6qn3NvdWSGOGW3NgeYJDhf9m_yRD1JsSVgjHLOun_Uhdyae0IwKd4c8QWPe4uFuOS93FfAkuGTamfkWDzY62ltEUZpPG5luJhJFbg_x-BvSN6fdhfrB4IXD2jP4ohP48XTHMKXtY1-4Of3Gloz760lsYVsCkfWdSp3McF45v50laYiXI6FkU8JURCPvL3rDyDZv_gDzXdcDFc9VsScalhfYg7OF_S_myLGv-8ga0Pie6szc7zmZfVBkRtP1kfyUvNNaatedzOrreaO8mRMwQVW04FXj3ENccQfX9DCSEAbDl_BbXZkI3NuadmQ8s9seCAjKySwjKvFbt1doDO85qKqIeHp3fpGD9XTXVdt36HnDrVDPqxPrQF9j8W2AHTc5zNzVZM2-iTROlZuqxScYAc_ZK3DeIrUdsc5d0rSMhJfgDvxlxvdynEbVSEybOuPfzILIuNx2nMbuvt63zgmYzyXR-fRhD3K2EqtxhKnshOX0BZvc5i-s99mLntnxfMOmZeWct_11Y6QtqegxVZpVaaC9si0nuhpnaN02PWGW9h4hJU-En_p9ri1smJgiudJhLdHxVFwpdbFEPFMKMh6bBz6q0oAsrwgaO_XguTWRigoKwVxP1W_nX7hj_SykuPeBovDwSvi-YIRKBp3mC6AMvSikDmuhvXB5FRK9hGwYlQhWI9NiUHKrjcTE3QQitFv12Pr9crKBn0yqCrpnEmRHMKIAT0JY3cqOl8JAgOW9XKP10-PU7dtv0LdFwhgP2u7W-CwxVH7y6wAd9VmzPCA-dFDqkfhGnIKgvP8Lp5xVa0x73svkJVQhLwi_l.uMq8TQw0GXkTUEYRK0dbqA",
                    "status": {
                      "errorCode": "00",
                      "errorMsg": "defaultError"
                    }
                  }
                }
              };
              break;
            case 'otp-ETB':
              mockResponse = {
                status: 200,
                data: {
                  "original": {},
                  "data": {
                    "customerFullName": "roshan narendra sabale",
                    "annualIncome": null,
                    "fathersName": "narendra",
                    "sourceOfFunds": null,
                    "mailingAddrPinCode": "403705",
                    "mailingAddr1": "LOTUS HERBALS LTD",
                    "mailingAddr2": "8-9 SECTOR 58",
                    "mailingAddr3": "CLARK AMER",
                    "customerMiddleName": null,
                    "residenceType": null,
                    "permanentAddrState": "Maharashtra",
                    "mailingAddrState": "GOA",
                    "customerEmail": "FEDAAB@EACBE.com",
                    "mailingAddrCity": "PANAJI",
                    "customerDOB": "19650214",
                    "permanentAddrPinCode": "400708",
                    "annualIncomeDescription": null,
                    "customerLastName": null,
                    "nomineeDOB": [
                      null,
                      null,
                      null
                    ],
                    "maritalStatusDescription": "Married",
                    "permanentAddrCity": "THANE",
                    "Id-token-jwt": "QthYLfrss4BJzHSa_ncNtO1kw50UgFVnzgRSVpxWNAcbdmz2CViu-eKBnRcwwuBmGL-GyfyvxYJoyRnpMyrctbR4JCpheV2L65GzGstgs9CSWyunWa4yAO1_t6sFRUwlz94T6PE4zFoH5InEXY2EcFoqjpB3FVgDB35GiWK3LVaY-QvGgucxECw3tPP1zrsP96AjVmbTIgBMjeC26IsKrw03RrEH25ySDgsOyVJ_jO8NsglbW54yx4DNuhSmOFM9oq4UMFqLkdlNiCPwWhV6BY47gLjrwTU310tDnL8q8lzq02GC1yyUMa56J5TN9HKAq6wwc8ZGnvDjnmBeMVQaRg.kDVbENoBwVB523GJl_o-CA.2_lm8yJtov8fg2a6cesX1PmjUkFL6uvjJ1DalIMhqJf3iqOizkb7IcOccR-qhGejw7YtwpkAX3xcIV3HxeRK6fgONGA07CJdtJPS-HOtDvj51lJjABOoKCjjv1IEe2syzU3MiqAApltld1xstk1bvxZ4zWHVfxukUqGDVdt9zyb2zGnsfQECO10_OgY7NcOmf-JrkuoE_dDUeZGwkTj1g08T1rgviLx7-_36G7EU5QXr5KnIfnbAIWKrlL2vOnurOXTBRJps_Pc2nnoFunSNLPoKXLUe4E8kPOgVEzn4BaDLAE_D-Vpf-Bu1OKAb9u4piTo_cjSM4UPSQx-HX5hwkN3EiWihQXd7IA1sngUXNkDsAGquxeU439NZjD4uP92JdD_AdXTbZZjUrYVtjVHFgof8UVjkuLW-756crODikc8WzryVvdaeZZjVJuQWADDg2UCJb9zC4xOjpui-A_Ar7yQlTffTAINRsBiSLTfpkccymeBmjP6srwP7b-wLEU9xLilxe1-6ghJTRTupqRhL2Yn_Di3A0VNuVDS-nFqEICyj_Z9LHnq-c2iZRYBw5TgdeFNZ3ui1tYvMWI3f581ljhM1mi9ZyizMEXLNo2RrCLq_blvP3iXFyzIl4vQzloCW5893-XVbVcFxbnm3PT1ErzRxljw3PAUgRuzDMftVB1PZE4BkYA7aGwJSVZsenpQ35ucRfmCNKebGPXGb-YuS_ZHhEGgg1OQvFICBlmxZ950P_uOxnF-pBswBfJ_07PRmf9ELf6R8zpfxECv6uCp6YfE5uo6qDQ68qkwYMGDRNPtXmL3aG1qqixyNfWRRzBNM8APiKHYRuFh6i56YBXA3xbn4EFqkWmKmBwtpOmnGwkvLyctlZgqZ057nIVLU0pbpJTUXdNaIvqvP-ACm92Y__wiol5EximZ6JtqtJysikY3pFzEqFIfQB3fceth8ArTWi1F9WmpMwNJuqMmgTCSwGANzurxDFoyJucXEM3oKbNY.VF1_t0lRBohBZMagyNfT3A",
                    "employmentType": null,
                    "mailingAddrCountry": "IN",
                    "nomineeName": [
                      null,
                      null,
                      null
                    ],
                    "panNumber": "ELUCW3404J",
                    "permanentAddrCountry": "IN",
                    "branchNames": [
                      "MEMARI ANKAR-SUNDER NIWAS-HOSHIARP ",
                      "QUEPEM",
                      "ANJUNA"
                    ],
                    "residenceTypeDescription": null,
                    "customerFirstName": null,
                    "typeOfOrganization": null,
                    "permanentAddr1": "LOTUS HERBALS LTD",
                    "permanentAddr2": "8-9 SECTOR 58",
                    "spouseName": null,
                    "relations": [
                      0,
                      0,
                      0
                    ],
                    "customerPhoneNumber": null,
                    "permanentAddr3": "CLARK AMER",
                    "maritalStatus": 2,
                    "status": {
                      "referenceNumber": "",
                      "errorCode": "00",
                      "externalReferenceNo": "AD20250602115517034",
                      "errorMsg": "Ineligible Product Code found"
                    }
                  }
                }
              };
              break;
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_common/api/etb_is_customeridentificationandotpgen.json`:
          mockResponse = {
            status: 200,
            data: {
              "Existing_Customer": "N",
              "formURL": "/content/forms/af/hdfc/hdfc_savings_forms/forms/insta_savings/instasavingsform.html?dataRef=service://HDFCFormsDefaultPrefillService/",
              "status": {
                "errorCode": "00000",
                "errorMsg": "Your request could not be processed, Please try again to continue"
              },
              "clientIpAddr": "10.43.0.50"
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_common/api/etb_is_otpvalidation.json`:
          mockResponse = {
            status: 200,
            data: {
              "status": {
                "errorCode": "00",
                "Id_token_jwt": "BsXz5P1U0DjuT5CfYvFEPoA7Ys_hahsMcIygf9ohriCub4vmIrDcN-95S9Bakl6Hbka_FYCdBcE0wRVCkz3teIiwvp6E3vg0owz8F801ZAAWklTtDAWa2Vj3hgylLYKD5yiPhAnYpctAut9kMXeiprxVwbNu0iFbvQb7WRVnVInl-GXLwYK4X0Z8sGt6R4adXo2V_75UH21YNyKRzkes4xCJLS-46J761v-UUi0lbxLxlZB6ErHoQUBBxuNi8UT4W8inGLQnGpMuwJoAjRXRHU0c-cgucDakDbeeuvP1ksWkUue3-xf6HMshL8bCa2EE_XOdcWqljIbnnpKInQBraA.40P-6Pk5yA21B3f0Pu_33Q.69jxerL8yMSnbXGYLVlgGQccdXMY2zniwtpque7bkRiowpfQi7KhbNf9lBgwOYEWiAEMCwUCy4YanEFB69BWEXk_xnIRJsg6JnlOkK6B4Sr7jY2wGMYdHOhI6a-o8DAy2VM4CPEuLMr5zx1iMBn9d7JeJCmdIDqyt4i6D6itntm8xX1bmB0kM2OY_0qJeTYlFQQvNEGTIosgQKXKIh1I23hk9FKtTNNwSAi8Hbgy3aR1yD4Dr6yYYS8uq0RI6JflryG48FDMV8D7EBFToHwQ4wujMXZJPRhu9bklJ4rEeqEdcAeA0wC31Y-HjQZdO9MJT604GeJK6bwE5sprIJg1rS7bC69YYiY2QwaKBvSWVY5IfhjyKKPn4tAP-fRwmIBkDPldFVQcDXNLOtuRV6r24hTHlvn8_Q-ivexDxnj1RLadYYBIRQzb1UAQmw3CgPfzFYKA8PUmmf-31Sayb_JxAqvtN86bqdTOaCOOp_wVhxfYugWLR5vsHFXyNoIFeBZj7XoTAh7VnAeNnlyvnIB8W91PrZI75tnt_JMTguKf_q_IHJfdbeIZ9SQDmJafbTIRDBHpfxhKeoEMNmi46_CfD4-peCsFDxEKV6WH_PYdITf000RTA6-TPbJo7g9zlXV3XqjHosoaBfXVPT4mAkkXy1GJDgd7iePUWL9ENi3ys-RXBJk1_CJUwtfIAYIHSaYqER01npg_9ncjRQEcccoUV-RCh6nWeBMO27aTiHB1lOxljE8X25uilZfBAOgUvFat7UEc2T4L8SXJsCBLZqIW3Ts5YDb8meMZlx9WCurQBumSyBJnDHaYrpMEB9WoJjCljJMRBTslMGTeBFFuc0AYGBl9jzaKrgOw9S4IvA8vliavuts4r4b1IGujYmQQV8Q9.yuDvotxjC0eH9gt1HRLLng",
                "errorMsg": "Your request could not be processed, Please try again to continue"
              }
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_forms/api/customeridentificationandotpgen.json`:
          mockResponse = {
            status: 200,
            data: {
              "Existing_Customer": "N",
              "formURL": "/content/forms/af/hdfc/hdfc_savings_forms/forms/insta_savings/instasavingsform.html?dataRef=service://HDFCFormsDefaultPrefillService/",
              "status": {
                "errorCode": "nonExistingCustomer",
                "errorMsg": "Hey! At the moment, we do not have a Pre-Approved offer ready for you"
              }
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_forms/api/otpgeneration.json`:
          mockResponse = {
            status: 200,
            data: {
              "status": {
                "errorCode": "00000",
                "errorMsg": "Your request could not be processed, Please try again to continue"
              }
            }
          };
          break;

        case `${submitBaseUrl}/content/hdfc_savings_forms/api/otpvalidation.json`:
          mockResponse = {
            status: 200,
            data: {
              "status": {
                "errorCode": "00",
                "errorMsg": "Your request could not be processed, Please try again to continue"
              }
            }
          };
          break;

        case `${submitBaseUrl}/content/hdfcbankformssecurity/api/journeyinit.json`:
          mockResponse = {
            status: 200,
            data: {
              "statusMsg": "Session is disabled",
              "statusCode": "SM00"
            }
          };
          break;

        case `${submitBaseUrl}/content/hdfc_savings_forms/api/sessionExpiry.json`:
          mockResponse = {
            status: 200,
            data: {
              "statusMsg": "Session is disabled",
              "statusCode": "SM00"
            }
          };
          break;

        case `${submitBaseUrl}/content/hdfc_savings_common/api/getdefaultconfigs.json`:
          mockResponse = {
            status: 200,
            data: {
              "isAadharSeeded": "false",
              "upiTransactionLimit": "25000",
              "gigaProductKey": "1000051",
              "lastNameEnablement": "false",
              "nameMatchPercentage": "0",
              "OnePanOneAccCheck": "false",
              "newPanImpl": "true"
            }
          };
          break;

        case `${submitBaseUrl}/content/hdfc_commonforms/api/currentDateTime.json`:
          mockResponse = {
            status: 200,
            data: {
              "currentDateTime": "04 08 2025 02:46:17"
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_forms/api/recommendedSubProducts.json`:
          mockResponse = {
            status: 200,
            data: {
              "total": 2,
              "offset": 0,
              "success": "true",
              "results": 2,
              "subproducts": [{
                "ProductName": "Regular Savings Account",
                "SubProductId": "412",
                "AMB": 10000,
                "SubProductCode": "100",
                "Features": "FD Cushion facility available | Waiver on Annual Maintenance Charge on Demat Account for 1st year | Cashback and offers on shopping on Payzapp and SmartBuy",
                "ParentProductCategoryId": "483"
              }, {
                "ProductName": "Savings Max Account",
                "SubProductId": "413",
                "AMB": 25000,
                "SubProductCode": "193",
                "Features": "FD Cushion facility: 1.5 lakh (Metro & Urban) ; 1 lakh (Semi Urban & Rural) | Choose Auto Sweep FD facility and earn higher interest | 50% waiver on Locker fees of 1st year on pro rata basis",
                "ParentProductCategoryId": "483"
              }]
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_commonforms/api/emailid.json`:
          mockResponse = {
            status: 200,
            data: {
              response: true
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_commonforms/api/mdm.INSTA.BRANCH_MASTER.CODE-9082.json`:
            mockResponse = {
              status: 200,
              data: [
                {
                "MODIFIEDBY": "0",
                "CREATEDON": null,
                "CITYID": "2743",
                "CLASSIFICATION": "DM",
                "MODIFIEDON": "06/27/2024",
                "ISACTIVE": "TRUE",
                "PINCODE": "123503",
                "NAME": "Jamalpur Village",
                "IFSC": "HDFC0009082",
                "CODE": "9082",
                "DESCRIPTION": null,
                "FOCUSEDBRANCH": null,
                "TERRITORYKEY": "13788",
                "SMCODE": null,
                "ID": "21011",
                "STATEID": "0",
                "CREATEDBY": "0",
                "RBIClass": "Any"
                }
                ]
            };
          break;
        case `${submitBaseUrl}/content/hdfc_commonforms/api/state.india.json`:
          mockResponse = {
            status: 200,
            data: {
              "total": 38,
              "offset": 0,
              "success": "true",
              "results": 38,
              "states": [
                {
                  "StateId": "100",
                  "Name": "MAHARASHTRA"
                },
                {
                  "StateId": "101",
                  "Name": "Andhra Pradesh"
                }]
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_common/api/employer.adobe.json`:
          mockResponse = {
            status: 200,
            data: {
              "total": 3,
              "offset": 0,
              "success": "true",
              "employer": [
                {
                  "CompanyId": "498720",
                  "ProductCode": "105",
                  "DisplayName": "ADOBE EYEZ (INDIA) PRIVATE LIMITED",
                  "ProductId": "6",
                  "CompanyType": "Private Ltd",
                  "CompanyCode": "1253R"
                },
                {
                  "CompanyId": "185838",
                  "ProductCode": "113",
                  "DisplayName": "ADOBE SOFTWARE INDIA PRIVATE LIMITED ( E",
                  "ProductId": "6",
                  "CompanyType": "",
                  "CompanyCode": "M0877"
                }
              ],
              "results": 3
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_common/api/branchdata.2676.json`:
        case `${submitBaseUrl}/content/hdfc_savings_common/api/branchdata.2694.json`:
          mockResponse = {
            status: 200,
            data: {
              "total": 30,
              "offset": 0,
              "success": "true",
              "results": 30,
              "branchDetails": [
                {
                  "Classification": "DM",
                  "Id": "23713",
                  "TerritoryKey": "2308",
                  "Code": "1020",
                  "IFSC": "HDFC0001020",
                  "Name": "Naigaon West Branch"
                },
                {
                  "Classification": "X",
                  "Id": "23712",
                  "TerritoryKey": "2349",
                  "Code": "1024",
                  "IFSC": "HDFC0001024",
                  "Name": "Bhayander West"
                }]
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_common/api/branchSelection.400.101.json`:
        case `${submitBaseUrl}/content/hdfc_savings_common/api/branchSelection.400.100.json`:
        case `${submitBaseUrl}/content/hdfc_savings_common/api/branchSelection.500.100.json`:
        case `${submitBaseUrl}/content/hdfc_savings_common/api/branchSelection.500.101.json`:
          mockResponse = {
            status: 200,
            data: {
              "resultSet": [
                {
                  "CityId": "2676",
                  "CityName": "MUMBAI"
                },
                {
                  "CityId": "2694",
                  "CityName": "NAVI MUMBAI"
                }
              ]
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_common/api/threedigitpincode.400.json`:
        case `${submitBaseUrl}/content/hdfc_savings_common/api/threedigitpincode.500.json`:
          mockResponse = {
            status: 200,
            data: {
              "Results": 12,
              "Total": 12,
              "citiesAndStates": [
                {
                  "city_name": "AGASHI",
                  "first_three_dig_pin": "400",
                  "state_hd": "MAHARASHTRA"
                },
                {
                  "city_name": "AGASHIVNAGAR",
                  "first_three_dig_pin": "400",
                  "state_hd": "MAHARASHTRA"
                },
                {
                  "city_name": "AIROLI",
                  "first_three_dig_pin": "400",
                  "state_hd": "MAHARASHTRA"
                }]
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_common/api/product.2676.json`:
        case `${submitBaseUrl}/content/hdfc_savings_common/api/product.2694.json`:
          mockResponse = {
            status: 200,
            data: {
              "total": 3,
              "offset": 0,
              "success": "true",
              "results": 3,
              "products": [
                {
                  "ProductName": "Corporate Salary Account",
                  "ProductId": "6"
                },
                {
                  "ProductName": "Current Account",
                  "ProductId": "5"
                },
                {
                  "ProductName": "Saving Account",
                  "ProductId": "4"
                }
              ]
            }
          };
          break;
        case '/content/hdfc_savings_common/api/city.100.json':
        case '/content/hdfc_savings_common/api/city.101.json':
          mockResponse = {
            status: 200,
            data: {
              "total": 239,
              "offset": 0,
              "cities": [
                {
                  "CityId": "3052",
                  "Classification": "D",
                  "StateId": "100",
                  "CityName": "AFZALPUR"
                },
                {
                  "CityId": "58488",
                  "Classification": "D",
                  "StateId": "100",
                  "CityName": "AJJAMPURA"
                },
                {
                  "CityId": "69322",
                  "Classification": "D",
                  "StateId": "100",
                  "CityName": "ALAND"
                }]
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_forms_common_v2/api/panValNameMatch.json`:
          mockResponse = {
            status: 200,
            data: {
              "panValidation": {
                "validDob": "",
                "validName": "",
                "seedingStatus": "",
                "panStatus": "N",
                "status": {
                  "errorCode": "1",
                  "errorMsg": "Success"
                }
              },
              "statusMessage": "Success",
              "nameMatch": {
                "percentage": "9",
                "status": {
                  "errorCode": "0",
                  "errorMsg": "Completed"
                }
              },
              "statusCode": "FC00"
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_commonforms/api/journeydropoff.json`:
          mockResponse = {
            status: 200,
            data: {
              "errorMessage": null,
              "errorCode": null,
              "message": "Record successfully saved.",
              "lead_profile_info": {
                "leadProfileId": 27075903
              },
              "TransactionId": null,
              "path": null,
              "Scope": null,
              "responseString": null,
              "success": null,
              "originCode": null,
              "originMessage": null,
              "ResponseEncryptedValue": null,
              "GWSymmetricKeyEncryptedValue": null,
              "status": "success"
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_commonforms/api/journeydropoffupdate.json`:
          mockResponse = {
            status: 200,
            data: {
              "errorMessage": null,
              "errorCode": null,
              "message": "Record successfully saved.",
              "lead_profile_info": {
                "leadProfileId": 27075903
              },
              "TransactionId": null,
              "path": null,
              "Scope": null,
              "responseString": null,
              "success": null,
              "originCode": null,
              "originMessage": null,
              "ResponseEncryptedValue": null,
              "GWSymmetricKeyEncryptedValue": null,
              "status": "success"
            }
          };
          break;
        case `${submitBaseUrl}/api/consent/dummy`:
          mockResponse = {
            status: 200,
            data: {
              "status": {
                "errorCode": "00"
              }
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_forms/api/aadharInit.json`:
          mockResponse = {
            status: 200,
            data: {
              "encKey": "LNizgFYJFulVOTCSkzh7AbutaYTtUMC/vzg+taNeVrn7g65oXTgJ42X0+L9ny/UX3zEXUaP2hSE9Vk5YAmFrQx1RVbkHs6Su1BJrnQMt75/AQ/N5EUMsrN3CyB55gSsksBe46p+29J8Ke3ygJUl/mbMJ/foeQXtmLRWPpuqICYWl39gkeoRd/GkF7hSOJsXdivo2Up1EfwVIsgFgTK950fL6d4ldtGxZpAtVz50OQWu9Hnm4ov50nWExs/DGBRXLE7zmSTihwA7JpEYYifZhpcyZ2soYnlPkgtareyAeyWHLPmV+hac67G+5QeQaHlsqnuUI3U2o2GU9z4Ka06titw==",
              "encSecret": "o/GIWnOm8wHUxK2N1EMYdSwXjHY674ntx9diNpL8UWx3ikU+iEN+WwvWySqr/tIhGZUdUsfBRHrFZxnn5tundiUbMcsESXjc5XW1cjhS7OnLtApzsd1BaOJSQcIxphopvzRFENWn72hoJqGaCHiNhtfxzhGy/eORGJrDwU2a4dGB/pgSm7Q9eFJdnTezMJBIJmfCWL1jcX1CrEoGKiItM9h1fDVsl86DtSstKfRo13DuzpvwmTbvRjDCCy7DMpv+vWvsngnNWDcRUEg+Grr0WvwywXqKh09fnRV/9ZY3c02MQJQvPELO3HYuUV49ehEy3dmaf7JM6nPZKoZyLjwJSg==",
              "vendorId": "HDFCBankForms",
              "encData": "6B6mpYWELrFDrYgXOGoQwH2ecY4F4hGHR25uyR/d/ilFXQIbuz3ik6sYCZZXOtFHF6w7yMGPmhgDhqSjJ6hUZXW4avGNSmIk509RIQ7gcsxbC/OG+lz41oIxcIgbdUlZL0oEQltAoTXZV7p+0M3eGwsZ6Aw9+BmAXlJjo52YO4wncNCm2a/Nf7/+7n9uICaB+1Jo33Msd5BENqm5JF1vjT3g5P7at8KLeiJE3Xex0MJ9YwmJxmDHhZoH0mN4NdYyYxCea2ke1/4pBDx7xwblQNCNdX+/MNLaAqTn0nuOGs6amVqm+KI3HGrAcu5r6o/Q1kuPI6NFE3B6tHJ8lWgUOIERvI5cLonFYzS2eccUvUEWy/c2oHx1m2/RIa00wUe8uWQ5P2rrjuNY9xKRk58jzIaK90lMLgqsNjqhFgjwO7Q2SWL5Qnlfi1vO64W4zrp2y+ZsMiiYTWlJY3+cJuuhd7VQO3m5XufbchhzuWVHMNGZpqycoF0wDrlgG8ZGauScwnTUjaHrfpx+F0a7NQM6v+EHKy8k+CyMUXsbmEK3Xp9FgqHBOq8Sy9LTlOM0k/i7RKSAgxTGNfMcfA+nsS5ehzL9qmomYZhE3EhWHy/FQh8rz2cKMNAn0uBpWC2RnxTfMVnikUA1+QR5CZDFxqfY6RHHAbQGUScWGGZ1UMwpxOBcHX/syi6O0JWC9+/NjvvskzAyTMwdALR0TcUf8dIlcMliddv4OCJBfEysjOwBMPrhYYIQwae0T3o/s9KEZOvJtyOJhaTqrBURukxdullyHnq6B9el4mal0MEqWvQcK9M5Exyq/sCRoHxvdASOAbAJhatvkbD+srVkWmYRHfcBLOid16434gurdaCfJeh0Jdt8gKkElNMUUJ2srzDW9Z936xFemK2THgg/gW2Ui5YXw3px4HQN/QnnHv6rQkB6KTHbAF2NrqX1VLArN16U+f5RnNWiIOxR+1N6a1rnuPg/7Aobs2wCjdGGBXHtky2kLHDPhcb1SylEKozA71tNk478ZQuLiectAzgg2kzOpTUeCF0F022W8987WEDBJ7ftjEiWzTJdP/wcmkUrpnm0oaxOyJrCKn8utlpDYTqd6Mqo6ldiYYW6f+KSYQ7vqfTB4uXMcC1zntxd/uKG/CNyibIpTUGxQToYkdASVNuuMHn0dqyzqu0rDdL7eaO/cOC2Q3y5Dg/8ztPMHCX4pnNGQimfm/ZNJIe5LmjfP/t2GDRwzhLVuAkyBIMrLxRQCVI23/fylaXiarr5XdM5yK5eFuv81Nkovxvsch7AH+xJXCucsS6Lv0QlCML5j6rNXOyUXjxQHQGzEFHPPdezrH46xWTKatWUI/v7n7GoKaWo7AcOBdsL4xBqATNnDO1cUAw+vI42mRqILiah+YdK7SSEVSEaIICszHlFbVeMyTGusxF2sbqUd0wYuRbS9w47YMUYiV8pX68g9eheGs6yKyvzwBTtfPdlEwdZ7HdozyyZf898eDza8D6wOqdh+9A2lucJ9SEWj+KVlM0L2QzRsL/DnL6Zl0LwUkzTc4pJR4Os/gkKZKfHGUSWnAUaxWSnCilzAyIzKub7xei2bPfyQC9vpp5Onf5IGOifHrl2964TZ23qziZL3nmDTLy0dxubUQIDG/3mR+toEJFYaVMDtBIEq+ymLS8oKDtj9BBWWNI8Uurj7yCwcZhreVppjOv9V++yh0g=",
              "RedirectUrl": "https://aadhaaruat.hdfcbank.com:8443/ekyc/api/validateUserRedirect"
            }
          };
          break;
        case `${submitBaseUrl}/adobe/forms/af/data/L2NvbnRlbnQvZm9ybXMvYWYvc2F2aW5ncy1hY2NvdW50L2luc3RhLXNhdmluZ3Mvb3Blbi1pbnN0YW50LXNhdmluZ3MtYWNjb3VudC1vbmxpbmU=?visitType=EKYC_AUTH`:
          mockResponse = {
            status: 200,
            data: {
              "data": {
                "tncCheckbox": "on",
                "nomineeAddress": {},
                "dbtCheckbox": "no",
                "RegisteredPhoneNum": "8594859485948",
                "LeadProfileId": "27101469",
                "AadharDOB": "2000-01-10",
                "accountfeatures": [
                  {}
                ],
                "aadhaar_otp_val_data": {
                  "result": {
                    "State": "Maharashtra",
                    "Address2": "Enclave flat no 201",
                    "Customerfullname": "Rupesh Mohan Nagdive",
                    "Zipcode": "400042",
                    "Address3": "",
                    "Country": "INDIA",
                    "Address1": "369 5th 6th cross",
                    "City": "Mumbai",
                    "Gender": "1"
                  }
                },
                "contactAddress": {},
                "formData": {
                  "transactionID": "1fa883a07f394d68b14391dd153abafeInstaSavings"
                },
                "KYCChoice": "0",
                "queryParams": {
                  "journeyId": "1fa883a0-7f39-4d68-b143-91dd153abafe_00_InstaSavings_U_WEB",
                  "ifsc": "1744897219106",
                  "dob": "Y"
                },
                "dataSecurityJSON": {
                  "dataSecEnbld": "true",
                  "captchaEnabled": "true",
                  "prefillStatus": "true",
                  "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoAatblmEzZTQOT732FU38hiT9vCvGK12+pUD3yENyHXjk7oN1uWPlpItm5OAcsPZt52WznDkpOb/AxLBeJKFYZPvOk75lo6ZAA1qyJEOekQru5XQUtpMzsC9w96T2zTYQQ4HUwMNXmYkWIVo4Ek/KCfX2yklRHxwm3Pqj93vJkUmoddLctXArddtm75HUjtYzf5jecQCGk//pyjTDJEswMpg3oXNiI2F1PnDUiKdQBE7+a1s5KB7CAKKYQLFNN48kjiOdDutMByjZxW0elPs9ETVU+NVNQ6ru9vKQYzvR/2YD7NNSHPUCpdexIpfiYeWrxUNgpHLM2qfXTOvn6UztQIDAQAB",
                  "captchaClientKey": "6LcX1HYaAAAAAES-TodRl1H5Z0DZHm9gLS4sY0BS"
                }
              },
              "metadata": {
                "lastFocusField": null,
                "formSaveTime": null,
                "formSubmitTime": null
              }
            }
          };
          break;
        case `${submitBaseUrl}/content/hdfc_savings_forms/api/aadharcheck.json`:
          mockResponse = {
            status: 200,
            data: {
              "journeyName": "INSTA_SAVINGS_JOURNEY",
              "pseudoID": "pseudoID",
              "leadProfileId": "27088547",
              "mobileNumber": "7565646747",
              "errorCode": "0",
              "journeyId": "ce227e63-0e4c-4e79-ade2-e70dbed0eafa_00_InstaSavings_U_WEB",
              "errorMsg": "Success"
            }
          }
          break;
        case `${submitBaseUrl}/content/hdfckyc/dbt/consent/hindi/jcr:content/root/container/container.model.json`:
          mockResponse = {
            status: 200,
            data: {
              "columnClassNames": {},
              "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
              "columnCount": 12,
              "allowedComponents": {},
              ":itemsOrder": [],
              ":items": {
                "text": {
                  "id": "consentText",
                  "text": "<p>(1) मैं भारत सरकार या राज्य सरकार के समेकित कोष से वित्त पोषित कल्याणकारी योजनाओं की सब्सिडी के अपने हकदार लाभ प्राप्त करना चाहता/चाहती हूँ।<\/p>\r\n<p>(2) मैं अपने चुने हुए एचडीएफसी बैंक खाते में ऊपर दिए गए बिंदु 1 में उल्लिखित सब्सिडी लाभ प्राप्त करने हेतु अपना आधार नंबर लिंक करना चाहता/चाहती हूँ।<\/p>\r\n<p>(3) मुझे एचडीएफसी बैंक द्वारा केवाईसी के लिए अन्य वैकल्पिक तरीके जैसे कि आधार के अलावा आधिकारिक वैध दस्तावेज़ों के माध्यम से भौतिक केवाईसी की जानकारी दी गई है। हालांकि, मैं अपने खाते में प्रत्यक्ष लाभ अंतरण (DBT) के रूप में सब्सिडी प्राप्त करना चाहता/चाहती हूँ जैसा कि बिंदु (1) और (2) में उल्लिखित है, इसलिए मैंने स्वेच्छा से आधार आधारित केवाईसी या ई-केवाईसी या ऑफलाइन सत्यापन को चुना है, और बैंक को अपना आधार नंबर, वर्चुअल आईडी, ई-आधार, एक्सएमएल, मास्क्ड आधार, आधार विवरण, जनसांख्यिकीय जानकारी, पहचान जानकारी, आधार पंजीकृत मोबाइल नंबर, फेस ऑथेंटिकेशन विवरण और/या बायोमेट्रिक जानकारी (सामूहिक रूप से “जानकारी”) प्रस्तुत करता/करती हूँ।<\/p>\r\n<p>(4) मैं बैंक (और इसके सेवा प्रदाताओं) को मेरी पहचान, ऑफलाइन सत्यापन या ई-केवाईसी या हां/ना प्रमाणीकरण, जनसांख्यिकीय या अन्य प्रमाणीकरण/सत्यापन/पहचान लागू कानूनों के अनुसार करने के लिए अधिकृत करता/करती हूँ और सहमति देता/देती हूँ।<\/p>\r\n<p>(5) उपर्युक्त उद्देश्यों के लिए, मैं स्वेच्छा और अपनी मर्जी से भारत सरकार द्वारा जारी मेरा आधार नंबर एचडीएफसी बैंक को प्रस्तुत करता/करती हूँ और सहमति देता/देती हूँ कि मेरा आधार नंबर मेरे एचडीएफसी बैंक खाते से जोड़ा जाए और UIDAI के साथ प्रमाणीकरण हेतु मेरे आधार विवरणों का उपयोग किया जाए।<\/p>\r\n<p>(6) मुझे स्थानीय भाषा में सहमति, आधार एकत्र करने के उद्देश्य और प्रमाणीकरण के बाद साझा की जा सकने वाली जानकारी की प्रकृति के बारे में समझाया गया है। मुझे यह समझाया गया है कि बैंक को प्रस्तुत की गई मेरी जानकारी का उपयोग केवल उपर्युक्त उद्देश्यों के लिए या कानून की आवश्यकताओं के अनुसार ही किया जाएगा।<\/p>\r\n<p>(7) एचडीएफसी बैंक ने मुझे सूचित किया है कि मेरी बायोमेट्रिक जानकारी को संग्रहित या साझा नहीं किया जाएगा और आधार विवरण केवल प्रमाणीकरण के लिए सेंट्रल आइडेंटिटीज डेटा रिपॉजिटरी (CIDR) को प्रस्तुत किए जाएंगे। बैंक ने मुझे यह भी बताया है कि यह सहमति और मेरा आधार नंबर मेरे खाता विवरणों के साथ लागू कानूनों के अनुसार संग्रहित किया जाएगा।<\/p>\r\n<p>(8) मैंने अपना ई-आधार दस्तावेज़ स्वयं अपने आधार पंजीकृत मोबाइल नंबर पर प्राप्त ओटीपी के माध्यम से डाउनलोड किया है।<\/p>\r\n<p>(9) मैं एचडीएफसी बैंक को जानकारी और प्रमाणीकरण डेटा एवं रिकॉर्ड को एकत्र करने, खुलासा करने, साझा करने, संग्रहित करने, संरक्षित करने और उपयोग करने के लिए अधिकृत करता/करती हूँ और सहमति देता/देती हूँ, जैसा कि लागू कानूनों के अंतर्गत आवश्यक हो या उपर्युक्त उद्देश्यों या एचडीएफसी बैंक की आंतरिक आवश्यकताओं के अनुसार हो।<\/p>\r\n<p>(10) मैं यह घोषणा करता/करती हूँ कि मेरे द्वारा स्वेच्छा से प्रस्तुत की गई सभी जानकारी सत्य, सही और पूर्ण है। यदि आधार सही नहीं पाया गया या मेरे द्वारा दी गई जानकारी गलत पाई गई, तो मैं एचडीएफसी बैंक या उसके किसी भी अधिकारी को उत्तरदायी नहीं ठहराऊँगा/ठहराऊँगी।<\/p>\r\n",
                  "richText": true,
                  ":type": "formsninja/components/text"
                },
                "text_1879482127": {
                  "id": "dbtConsent1",
                  "text": "<p>मेरा आधार नंबर किसी भी बैंक से लिंक नहीं है: मैं अपना आधार नंबर अपने बैंक खाते और एनपीसीआई मैपर में जोड़ना चाहता/चाहती हूँ ताकि मुझे भारत सरकार (GOI) से एलपीजी सब्सिडी सहित DBT मेरे एचडीएफसी बैंक खाते में प्राप्त हो सके। मैं समझता/समझती हूँ कि यदि मुझे एक से अधिक लाभ हस्तांतरण प्राप्त होने हैं, तो वे सभी इसी खाते में प्राप्त होंगे।<\/p>\r\n",
                  "richText": true,
                  ":type": "formsninja/components/text"
                },
                "text_9417338821": {
                  "id": "dbtConsent2",
                  "text": "<p>मैं बैंक को मेरे एचडीएफसी बैंक खाते को आधार सक्षम भुगतान प्रणाली (AePS) लेनदेन सेवाओं के लिए सक्षम करने हेतु अधिकृत करता/करती हूँ। AePS सुविधा को सक्रिय करने से मुझे आधार / वर्चुअल आईडी (VID) का उपयोग करके बायोमेट्रिक आधारित प्रमाणीकरण के माध्यम से वित्तीय (नकद निकासी, नकद जमा, आधार से आधार फंड ट्रांसफर और भीम आधार पे) और गैर-वित्तीय (बैलेंस पूछताछ और मिनी स्टेटमेंट) लेनदेन करने की सुविधा मिलेगी।<\/p>\r\n",
                  "richText": true,
                  ":type": "formsninja/components/text"
                },
                "text_941733882": {
                  "id": "additionalText",
                  "text": "<p><a href=\"https://www.hdfcbank.com/personal/save/accounts/savings-account/aadhar-updation-to-bank-account/prevent-aadhaar-funds\">यहाँ क्लिक करें</a> आधार से संबंधित अधिक जानकारी के लिए</p>\r\n",
                  "richText": true,
                  ":type": "formsninja/components/text"
                }
              },
              ":type": "formsninja/components/container"
            }
          }
          break;
        case `${submitBaseUrl}/content/hdfckyc/dbt/consent/english/jcr:content/root/container/container.model.json`:
          mockResponse = {
            status: 200,
            data: {
              "columnClassNames": {},
              "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
              "columnCount": 12,
              "allowedComponents": {},
              ":itemsOrder": [],
              ":items": {
                "text": {
                  "id": "consentText",
                  "text": "<p>(1) I am desirous of receiving my entitled benefits of subsidies for welfare schemes funded from the Consolidated Fund of India or the Consolidated Fund of State<\/p>\r\n<p>(2) I wish to seed my Aadhaar number for receiving my entitled benefits of subsidies (as mentioned in point no. 1 above) in the selected HDFC Bank account.<\/p>\r\n<p>(3) I have been given other alternative means by HDFC Bank for KYC purposes including physical KYC by submitting officially valid documents other than Aadhaar. However, since I am desirous of receiving my entitled benefits of subsidies i.e. Direct Benefit Transfer (DBT) in my Account as mentioned in point no. (1) &amp; (2) above, I have voluntarily chosen Aadhaar based KYC or e-KYC or Offline Verification, and submit to the Bank my Aadhaar number, Virtual ID, e-Aadhaar, XML, Masked Aadhaar, Aadhaar details, demographic information, identity information, Aadhaar registered mobile number, face authentication details and/or biometric information (collectively, “Information”).<\/p>\r\n<p>(4) I authorise and give my consent to the Bank (and its service providers), for carrying out my identification, offline verification or e-KYC or Yes/No authentication, demographic or other authentication / verification / identification in accordance with applicable Law.<\/p>\r\n<p>(5) For the aforesaid purposes, I submit voluntarily and at my own discretion, my Aadhaar number as issued by Govt. of India, to HDFC Bank and voluntarily give my consent to seed my Aadhaar number in my HDFC Bank Account and to use my Aadhaar details for authentication with UIDAI.<\/p>\r\n<p>(6) I have been explained in local language about the consent, purpose of collecting Aadhaar and the nature of information that may be shared upon authentication by UIDAI (Aadhaar details). I have been given to understand that my information submitted to the Bank herewith shall not be used for any purpose other than mentioned above, or as per requirements of law.<\/p>\r\n<p>(7) HDFC Bank has informed that my biometrics will not be stored / shared and; Aadhaar details will be submitted to Central Identities Data Repository (CIDR) only for the purpose of authentication for the aforementioned purpose. HDFC Bank has informed me that this consent and my Aadhaar number will be stored along with my account details within the bank in accordance with applicable Law.<\/p>\r\n<p>(8) I have downloaded the e-Aadhaar document myself using the OTP received on my Aadhaar registered mobile number.<\/p>\r\n<p>(9) I hereby authorise &amp; consent to HDFC Bank to collect, disclose, share, store, preserve and use the Information and authentication data and records, as may be required under applicable laws or for the purposes above or as per the internal requirements of HDFC Bank.<\/p>\r\n<p>(10) I hereby declare that all information voluntarily furnished by me is true, correct and complete. I will not hold HDFC Bank or any of its officials responsible in the event Aadhaar is not found to be in order or in case of any incorrect information provided by me.<\/p>\r\n",
                  "richText": true,
                  ":type": "formsninja/components/text"
                },
                "text_1879482127": {
                  "id": "dbtConsent1",
                  "text": "<p>My Aadhaar number is NOT Seeded with any Bank: I wish to seed my Aadhaar number in my Bank Account and with NPCI Mapper to enable me to receive DBT including LPG Subsidy from Govt. of India (GOI) in my HDFC Bank Account. I understand that if more than one benefit transfer is due to me, I will receive all the benefit transfers in the same Account.<\/p>\r\n",
                  "richText": true,
                  ":type": "formsninja/components/text"
                },
                "text_941733882": {
                  "id": "dbtConsent2",
                  "text": "<p>I authorise the Bank to enable my HDFC Bank account for Aadhaar enabled Payment System (AePS) transaction services. Activating AePS facility will enable me to perform financial (Cash Withdrawal, Cash Deposit, Aadhaar to Aadhaar Fund Transfer and BHIM Aadhaar Pay) and non-financial (Balance Enquiry and Mini Statement) transactions through biometric-based authentication using Aadhaar / Virtual ID (VID).<\/p>\r\n",
                  "richText": true,
                  ":type": "formsninja/components/text"
                },
                "text_94173388289": {
                  "id": "additionalText",
                  "text": "<p><a href=\"https://www.hdfcbank.com/personal/save/accounts/savings-account/aadhar-updation-to-bank-account/prevent-aadhaar-funds\">Click here</a> for more information on Aadhaar</p>\r\n",
                  "richText": true,
                  ":type": "formsninja/components/text"
                }
              },
              ":type": "formsninja/components/container"
            }
          }
          break;
        case `${submitBaseUrl}/content/hdfckyc/aadhar/consent/english/jcr:content/root/container/container.model.json`:
          mockResponse = {
            status: 200,
            data: {
              "columnClassNames": {
                "text": "aem-GridColumn aem-GridColumn--default--12"
              },
              "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
              "columnCount": 12,
              "allowedComponents": {},
              ":itemsOrder": [
                "text"
              ],
              ":items": {
                "text": {
                  "id": "consentText",
                  "text": "<p>1. I voluntarily opt for Aadhaar OVD KYC or e-KYC or offline verification, and submit to the Bank my Aadhaar number, Virtual ID, e-Aadhaar, XML, Masked Aadhaar, Aadhaar details, demographic information, identity information, Aadhaar registered mobile number, face authentication details and/or biometric information (collectively, “<b style=\"\">Information<\/b>”).<\/p>\r\n<p>2. I am informed by the Bank, that:<\/p>\r\n<p>(i) submission of Aadhaar is not mandatory, and there are alternative options for KYC and establishing identity including by way of physical KYC with officially valid documents other than Aadhaar. All options were given to me.<\/p>\r\n<p>(ii) For e-KYC/authentication/offline verification, Bank will share Aadhaar number and/or biometrics with CIDR/UIDAI, and CIDR/UIDAI will share with Bank, authentication data, Aadhaar data, demographic details, registered mobile number, identity information, which shall be used for the informed purposes mentioned in 3 below.<\/p>\r\n<p>3. I authorise and give my consent to the Bank (and its service providers), for following informed purposes:<\/p>\r\n<p>(i) KYC and periodic KYC process as per the PML Act, 2002 and rules thereunder and RBI guidelines, or for establishing my identity, carrying out my identification, offline verification or e-KYC or Yes/No authentication, demographic or other authentication/verification/identification as may be permitted as per applicable law, for all accounts, facilities, services and relationships of/through the Bank, existing and future.<\/p>\r\n<p>(ii) collecting, sharing, storing, preserving Information, maintaining records and using the Information and authentication/verification/identification records: (a) for the informed purposes above, (b) as well as for regulatory and legal reporting and filings and/or (c) where required under applicable law;<\/p>\r\n<p>(iii) enabling my account for Aadhaar enabled Payment Services (AEPS);<\/p>\r\n<p>(iv) producing records and logs of the consent, Information or of authentication, identification, verification etc. for evidentiary purposes including before a court of law, any authority or in arbitration.<\/p>\r\n<p>4. I understand that the Aadhaar number and core biometrics will not be stored/ shared except as per law and for CIDR submission. I have downloaded the e-Aadhaar myself using the OTP received on my Aadhaar registered mobile number. I will not hold the Bank or its officials responsible in the event this document is not found to be in order or in case of any incorrect information provided by me.<\/p>\r\n<p>5. The above consent and purpose of collecting Information has been explained to me in my local language.<\/p>\r\n<p>6. This will be an e-KYC OTP journey; an OTP will be sent to the Aadhaar registered mobile number. In case the mobile number is not linked to Aadhaar, it is recommended that you choose a different OVD (Officially Valid Document) for completing the journey.<\/p>\r\n",
                  "richText": true,
                  ":type": "formsninja/components/text"
                }
              },
              ":type": "formsninja/components/container"
            }
          }
          break;
        case `${submitBaseUrl}/content/hdfc_commonforms/api/journeydropoffparam.json`:
          mockResponse = {
            status: 200,
            data: {
              "errorMessage": null,
              "errorCode": "FJ0000",
              "TransactionId": null,
              "path": null,
              "leadProfile": {
                "addresses": [],
                "lastAccessTime": null,
                "resiPhone": null,
                "mpnIdentity": "",
                "isStaff": null,
                "mobileNumber": "6464646464",
                "profile": null,
                "emailId": null,
                "officialEmailId": null,
                "leadProfileId": 27077824,
                "pseudoCustomerId": "",
                "customerType": null,
                "card4Digits": null,
                "customerId": null,
                "offPhone": null,
                "aanNumber": null,
                "crmLeadKey": null
              },
              "Scope": null,
              "responseString": null,
              "originCode": null,
              "originMessage": null,
              "ResponseEncryptedValue": null,
              "GWSymmetricKeyEncryptedValue": null,
              "formData": {
                "journeyName": "INSTA_SAVINGS_JOURNEY",
                "journeyStateInfo": [
                  {
                    "stateInfo": "{\"AadharAddressCountry\":\"INDIA\",\"AadharAddressResidenceStatus\":\"Resident\",\"AadharAddressResidenceType\":\"2\",\"AadharConsentLanguage\":\"English\",\"AadharDOB\":\"\",\"AccountNumber\":\"0\",\"ApplyForEmailStatementCheckBox\":\"0\",\"CommunicationAddressCountry\":\"INDIA\",\"CountryOfBirth\":\"INDIA\",\"CurrentAddressCountry\":\"INDIA\",\"CurrentAddressResidenceStatus\":\"Resident\",\"CurrentAddressResidenceType\":\"2\",\"DeclareNomineeFlag\":\"1\",\"Dob\":\"2000-02-10\",\"EmploymentType\":\"2\",\"IDProofSelected\":\"AADHAR\",\"IndianNationalFlag\":\"1\",\"IsTaxAddressFlag\":\"1\",\"JourneyRetries\":\"0\",\"KYCChoice\":\"AadharKYC\",\"KYCDocumentSelected\":\"AADHAR\",\"KeepOriginalPanCheckBox\":\"0\",\"KeepSheetPenForSignatureCheckBox\":\"0\",\"NomineeAddressState\":\"State\",\"PermanentAddressCountry\":\"INDIA\",\"PreviewAddressType\":\"Owned\",\"PreviewNationality\":\"Indian\",\"PreviewPresentAddress\":\"Same as Communication\",\"PreviewTaxResidence\":\"Indian\",\"ProperMobileNetworkCheckBox\":\"0\",\"RegisterForThirdPartyTransferCheckBox\":\"1\",\"RegisteredPhoneNum\":\"6464646464\",\"ReturnJourneyId\":\"noValue\",\"SelfEmploymentMonth\":\"0\",\"SelfEmploymentYear\":\"00\",\"SourceOfFund\":\"2\",\"TaxResidentFlag\":\"1\",\"VKYCCloseTime\":\"23:59\",\"VKYCConsentAccepted\":\"false\",\"VKYCOpenTime\":\"10:00\",\"VideoKYCCheckBox\":\"0\",\"aadhaarConsentAccepted\":\"false\",\"addMoneyAttempts\":1,\"existingCustomer\":\"N\",\"formData\":{\"transactionID\":\"1dceee473a4c42358916a53f2021dadfInstaSavings\"},\"fundingConsentAccepted\":\"false\",\"gigaCreditCardConsent\":\"N\",\"hiddenAadharResType\":\"Owned\",\"hiddenAccountRelatedServicesConsentCheckboxValue\":\"Y\",\"hiddenCreditsDropDownList\":\"Please Select\",\"hiddenDeclareNominee\":\"Yes\",\"hiddenEmpTypeValue\":\"Salaried\",\"hiddenOtherRelatedServicesConsentCheckboxValue\":\"N\",\"hiddenOtherResType\":\"Owned\",\"hiddenProfessionalCategoryDropdown\":\"Please Select\",\"hiddenSourceOfFundsValue\":\"Salary\",\"hiddenUTMParams\":\"?dataRef=service://HDFCFormsDefaultPrefillService/RETRY\",\"isTaxAddressForOVD\":\"1\",\"monthlyCredits\":\"0\",\"pepConsent\":\"0\",\"privacyPolicyAccepted\":\"true\",\"professionalCategory\":\"0\",\"razorPayConsentFlag\":\"N\"}",
                    "state": "CUSTOMER_IDENTITY_ACQUIRED",
                    "timeinfo": "2025-04-15T23:56:23.282Z"
                  },
                  {
                    "stateInfo": "{\"AadharAddressCountry\":\"INDIA\",\"AadharAddressResidenceStatus\":\"Resident\",\"AadharAddressResidenceType\":\"2\",\"AadharConsentLanguage\":\"English\",\"AadharDOB\":\"\",\"AccountNumber\":\"0\",\"ApplyForEmailStatementCheckBox\":\"0\",\"CommunicationAddressCountry\":\"INDIA\",\"CountryOfBirth\":\"INDIA\",\"CurrentAddressCountry\":\"INDIA\",\"CurrentAddressResidenceStatus\":\"Resident\",\"CurrentAddressResidenceType\":\"2\",\"DeclareNomineeFlag\":\"1\",\"Dob\":\"2000-02-10\",\"EmploymentType\":\"2\",\"IDProofSelected\":\"AADHAR\",\"IndianNationalFlag\":\"1\",\"IsTaxAddressFlag\":\"1\",\"JourneyRetries\":\"0\",\"KYCChoice\":\"AadharKYC\",\"KYCDocumentSelected\":\"AADHAR\",\"KeepOriginalPanCheckBox\":\"0\",\"KeepSheetPenForSignatureCheckBox\":\"0\",\"NomineeAddressState\":\"State\",\"PermanentAddressCountry\":\"INDIA\",\"PreviewAddressType\":\"Owned\",\"PreviewNationality\":\"Indian\",\"PreviewPresentAddress\":\"Same as Communication\",\"PreviewTaxResidence\":\"Indian\",\"ProperMobileNetworkCheckBox\":\"0\",\"RegisterForThirdPartyTransferCheckBox\":\"1\",\"RegisteredPhoneNum\":\"6464646464\",\"ReturnJourneyId\":\"noValue\",\"SelfEmploymentMonth\":\"0\",\"SelfEmploymentYear\":\"00\",\"SourceOfFund\":\"2\",\"TaxResidentFlag\":\"1\",\"VKYCCloseTime\":\"23:59\",\"VKYCConsentAccepted\":\"false\",\"VKYCOpenTime\":\"10:00\",\"VideoKYCCheckBox\":\"0\",\"aadhaarConsentAccepted\":\"false\",\"addMoneyAttempts\":1,\"existingCustomer\":\"N\",\"formData\":{\"transactionID\":\"1dceee473a4c42358916a53f2021dadfInstaSavings\"},\"fundingConsentAccepted\":\"false\",\"gigaCreditCardConsent\":\"N\",\"hiddenAadharResType\":\"Owned\",\"hiddenAccountRelatedServicesConsentCheckboxValue\":\"Y\",\"hiddenCreditsDropDownList\":\"Please Select\",\"hiddenDeclareNominee\":\"Yes\",\"hiddenEmpTypeValue\":\"Salaried\",\"hiddenOtherRelatedServicesConsentCheckboxValue\":\"N\",\"hiddenOtherResType\":\"Owned\",\"hiddenProfessionalCategoryDropdown\":\"Please Select\",\"hiddenSourceOfFundsValue\":\"Salary\",\"hiddenUTMParams\":\"?dataRef=service://HDFCFormsDefaultPrefillService/RETRY\",\"isTaxAddressForOVD\":\"1\",\"monthlyCredits\":\"0\",\"pepConsent\":\"0\",\"privacyPolicyAccepted\":\"true\",\"professionalCategory\":\"0\",\"razorPayConsentFlag\":\"N\"}",
                    "state": "CUSTOMER_IDENTITY_RESOLVED",
                    "timeinfo": "2025-04-15T23:56:23.303Z"
                  },
                  {
                    "stateInfo": "{\"AadharAddressCountry\":\"INDIA\",\"AadharAddressResidenceStatus\":\"Resident\",\"AadharAddressResidenceType\":\"2\",\"AadharConsentLanguage\":\"English\",\"AadharDOB\":\"\",\"AccountNumber\":\"0\",\"ApplyForEmailStatementCheckBox\":\"0\",\"CommunicationAddressCountry\":\"INDIA\",\"CountryOfBirth\":\"INDIA\",\"CurrentAddressCountry\":\"INDIA\",\"CurrentAddressResidenceStatus\":\"Resident\",\"CurrentAddressResidenceType\":\"2\",\"DeclareNomineeFlag\":\"1\",\"Dob\":\"2000-02-10\",\"EmploymentType\":\"2\",\"IDProofSelected\":\"AADHAR\",\"IndianNationalFlag\":\"1\",\"IsTaxAddressFlag\":\"1\",\"JourneyRetries\":\"0\",\"KYCChoice\":\"AadharKYC\",\"KYCDocumentSelected\":\"AADHAR\",\"KeepOriginalPanCheckBox\":\"0\",\"KeepSheetPenForSignatureCheckBox\":\"0\",\"NomineeAddressState\":\"State\",\"PermanentAddressCountry\":\"INDIA\",\"PreviewAddressType\":\"Owned\",\"PreviewNationality\":\"Indian\",\"PreviewPresentAddress\":\"Same as Communication\",\"PreviewTaxResidence\":\"Indian\",\"ProperMobileNetworkCheckBox\":\"0\",\"RegisterForThirdPartyTransferCheckBox\":\"1\",\"RegisteredPhoneNum\":\"6464646464\",\"ReturnJourneyId\":\"noValue\",\"SelfEmploymentMonth\":\"0\",\"SelfEmploymentYear\":\"00\",\"SourceOfFund\":\"2\",\"TaxResidentFlag\":\"1\",\"VKYCCloseTime\":\"23:59\",\"VKYCConsentAccepted\":\"false\",\"VKYCOpenTime\":\"10:00\",\"VideoKYCCheckBox\":\"0\",\"aadhaarConsentAccepted\":\"false\",\"addMoneyAttempts\":1,\"customerNamePrefix\":\"M\",\"existingCustomer\":\"N\",\"formData\":{\"transactionID\":\"1dceee473a4c42358916a53f2021dadfInstaSavings\"},\"fullName\":\"ABCD DEF\",\"fundingConsentAccepted\":\"false\",\"gigaCreditCardConsent\":\"N\",\"hiddenAadharResType\":\"Owned\",\"hiddenAccountRelatedServicesConsentCheckboxValue\":\"Y\",\"hiddenCreditsDropDownList\":\"Please Select\",\"hiddenDeclareNominee\":\"Yes\",\"hiddenEmpTypeValue\":\"Salaried\",\"hiddenOtherRelatedServicesConsentCheckboxValue\":\"N\",\"hiddenOtherResType\":\"Owned\",\"hiddenProfessionalCategoryDropdown\":\"Please Select\",\"hiddenSourceOfFundsValue\":\"Salary\",\"hiddenUTMParams\":\"?dataRef=service://HDFCFormsDefaultPrefillService/RETRY\",\"isTaxAddressForOVD\":\"1\",\"monthlyCredits\":\"0\",\"pepConsent\":\"0\",\"privacyPolicyAccepted\":\"true\",\"professionalCategory\":\"0\",\"razorPayConsentFlag\":\"N\"}",
                    "state": "NAME_CAPTURED_FOR_NTB_CUSTOMER",
                    "timeinfo": "2025-04-15T23:56:28.805Z"
                  },
                  {
                    "stateInfo": "{\"AadharAddressCountry\":\"INDIA\",\"AadharAddressResidenceStatus\":\"Resident\",\"AadharAddressResidenceType\":\"2\",\"AadharConsentLanguage\":\"English\",\"AadharDOB\":\"\",\"AccountNumber\":\"0\",\"ApplyForEmailStatementCheckBox\":\"0\",\"CommunicationAddressCountry\":\"INDIA\",\"CountryOfBirth\":\"INDIA\",\"CurrentAddressCountry\":\"INDIA\",\"CurrentAddressResidenceStatus\":\"Resident\",\"CurrentAddressResidenceType\":\"2\",\"DeclareNomineeFlag\":\"1\",\"Dob\":\"2000-02-10\",\"EmploymentType\":\"2\",\"IDProofSelected\":\"AADHAR\",\"IndianNationalFlag\":\"1\",\"IsTaxAddressFlag\":\"1\",\"JourneyRetries\":\"0\",\"KYCChoice\":\"AadharKYC\",\"KYCDocumentSelected\":\"AADHAR\",\"KeepOriginalPanCheckBox\":\"0\",\"KeepSheetPenForSignatureCheckBox\":\"0\",\"NomineeAddressState\":\"State\",\"PermanentAddressCountry\":\"INDIA\",\"PreviewAddressType\":\"Owned\",\"PreviewNationality\":\"Indian\",\"PreviewPresentAddress\":\"Same as Communication\",\"PreviewTaxResidence\":\"Indian\",\"ProperMobileNetworkCheckBox\":\"0\",\"RegisterForThirdPartyTransferCheckBox\":\"1\",\"RegisteredPhoneNum\":\"6464646464\",\"ReturnJourneyId\":\"noValue\",\"SelfEmploymentMonth\":\"0\",\"SelfEmploymentYear\":\"00\",\"SourceOfFund\":\"2\",\"TaxResidentFlag\":\"1\",\"VKYCCloseTime\":\"23:59\",\"VKYCConsentAccepted\":\"false\",\"VKYCOpenTime\":\"10:00\",\"VideoKYCCheckBox\":\"0\",\"aadhaarConsentAccepted\":\"true\",\"aadharConsentDateTime\":\"2025-04-15T23:56:37\",\"addMoneyAttempts\":1,\"currentFormContext\":\"{\\\"sliderRef\\\":\\\"\\\",\\\"currentFormPage\\\":\\\"Aadhar eKYC Page.\\\",\\\"tenureRef\\\":\\\"\\\",\\\"initialInterestVal\\\":\\\"\\\",\\\"initialTidVal\\\":\\\"\\\",\\\"initialTenureVal\\\":\\\"\\\",\\\"interestVal\\\":\\\"\\\",\\\"tidVal\\\":\\\"\\\",\\\"tenureVal\\\":\\\"\\\",\\\"encryptedToken\\\":\\\"\\\",\\\"relationNumber\\\":\\\"\\\",\\\"transferMethod\\\":\\\"\\\",\\\"casaUser\\\":\\\"N\\\",\\\"existingCustomer\\\":\\\"N\\\",\\\"aanNumber\\\":\\\"\\\",\\\"primaryCardHolderName\\\":\\\"\\\",\\\"journeyID\\\":\\\"1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB\\\",\\\"journeyName\\\":\\\"INSTA_SAVINGS_JOURNEY\\\",\\\"journeyState\\\":\\\"CUSTOMER_LEAD_QUALIFIED\\\",\\\"errorMessage\\\":\\\"\\\",\\\"wrongOtpCount\\\":0,\\\"wrongOtpCount1\\\":0,\\\"leadNumber\\\":\\\"\\\",\\\"leadProfileId\\\":27077824,\\\"pseudoID\\\":\\\"\\\",\\\"journeyApiUri\\\":\\\"/content/hdfc_commonforms/api/journeydropoffupdate.json\\\",\\\"journeyJsonObject\\\":{\\\"RequestPayload\\\":{\\\"userAgent\\\":\\\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0\\\",\\\"leadProfile\\\":{\\\"profile\\\":{\\\"dob\\\":\\\"2000-02-10\\\",\\\"fullName\\\":\\\"ABCD  DEF\\\"},\\\"mobileNumber\\\":\\\"6464646464\\\",\\\"leadProfileId\\\":27077824,\\\"aanNumber\\\":\\\"\\\",\\\"emailId\\\":\\\"\\\",\\\"officialEmailId\\\":\\\"\\\"},\\\"formData\\\":{\\\"journeyName\\\":\\\"INSTA_SAVINGS_JOURNEY\\\",\\\"journeyStateInfo\\\":[{\\\"stateInfo\\\":\\\"{\\\\\\\"RegisteredPhoneNum\\\\\\\":\\\\\\\"6464646464\\\\\\\",\\\\\\\"AadharDOB\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"Dob\\\\\\\":\\\\\\\"2000-02-10\\\\\\\",\\\\\\\"hiddenAccountRelatedServicesConsentCheckboxValue\\\\\\\":\\\\\\\"Y\\\\\\\",\\\\\\\"hiddenOtherRelatedServicesConsentCheckboxValue\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"KYCChoice\\\\\\\":\\\\\\\"AadharKYC\\\\\\\",\\\\\\\"AadharConsentLanguage\\\\\\\":\\\\\\\"English\\\\\\\",\\\\\\\"AadharAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"AadharAddressResidenceType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"AadharAddressResidenceStatus\\\\\\\":\\\\\\\"Resident\\\\\\\",\\\\\\\"hiddenAadharResType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"hiddenOtherResType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"CurrentAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"CurrentAddressResidenceType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"CurrentAddressResidenceStatus\\\\\\\":\\\\\\\"Resident\\\\\\\",\\\\\\\"CommunicationAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"IsTaxAddressFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"PermanentAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"isTaxAddressForOVD\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"EmploymentType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"SourceOfFund\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"SelfEmploymentYear\\\\\\\":\\\\\\\"00\\\\\\\",\\\\\\\"SelfEmploymentMonth\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"pepConsent\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"IndianNationalFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"TaxResidentFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"hiddenEmpTypeValue\\\\\\\":\\\\\\\"Salaried\\\\\\\",\\\\\\\"hiddenSourceOfFundsValue\\\\\\\":\\\\\\\"Salary\\\\\\\",\\\\\\\"gigaCreditCardConsent\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"razorPayConsentFlag\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"professionalCategory\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"monthlyCredits\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"DeclareNomineeFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"NomineeAddressState\\\\\\\":\\\\\\\"State\\\\\\\",\\\\\\\"CountryOfBirth\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"hiddenDeclareNominee\\\\\\\":\\\\\\\"Yes\\\\\\\",\\\\\\\"RegisterForThirdPartyTransferCheckBox\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"ApplyForEmailStatementCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"PreviewAddressType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"PreviewPresentAddress\\\\\\\":\\\\\\\"Same as Communication\\\\\\\",\\\\\\\"PreviewNationality\\\\\\\":\\\\\\\"Indian\\\\\\\",\\\\\\\"PreviewTaxResidence\\\\\\\":\\\\\\\"Indian\\\\\\\",\\\\\\\"KYCDocumentSelected\\\\\\\":\\\\\\\"AADHAR\\\\\\\",\\\\\\\"IDProofSelected\\\\\\\":\\\\\\\"AADHAR\\\\\\\",\\\\\\\"VideoKYCCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"ProperMobileNetworkCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"KeepOriginalPanCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"KeepSheetPenForSignatureCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"JourneyRetries\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"AccountNumber\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"addMoneyAttempts\\\\\\\":1,\\\\\\\"VKYCOpenTime\\\\\\\":\\\\\\\"10:00\\\\\\\",\\\\\\\"VKYCCloseTime\\\\\\\":\\\\\\\"23:59\\\\\\\",\\\\\\\"hiddenCreditsDropDownList\\\\\\\":\\\\\\\"Please Select\\\\\\\",\\\\\\\"hiddenProfessionalCategoryDropdown\\\\\\\":\\\\\\\"Please Select\\\\\\\",\\\\\\\"privacyPolicyAccepted\\\\\\\":\\\\\\\"true\\\\\\\",\\\\\\\"aadhaarConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"VKYCConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"fundingConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"hiddenUTMParams\\\\\\\":\\\\\\\"?dataRef=service://HDFCFormsDefaultPrefillService/RETRY\\\\\\\",\\\\\\\"ReturnJourneyId\\\\\\\":\\\\\\\"noValue\\\\\\\",\\\\\\\"existingCustomer\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"customerNamePrefix\\\\\\\":\\\\\\\"M\\\\\\\",\\\\\\\"fullName\\\\\\\":\\\\\\\"ABCD DEF\\\\\\\"}\\\",\\\"state\\\":\\\"CUSTOMER_LEAD_QUALIFIED\\\",\\\"timeinfo\\\":\\\"2025-04-15T23:56:33.354Z\\\"}],\\\"channel\\\":\\\"ADOBE WEBFORMS\\\",\\\"journeyID\\\":\\\"1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB\\\"}}},\\\"emailId\\\":\\\"\\\",\\\"officialEmailId\\\":\\\"\\\",\\\"journeyUpdateStatus\\\":true,\\\"DemogAPI_Address1\\\":\\\"\\\",\\\"DemogAPI_Address2\\\":\\\"\\\",\\\"DemogAPI_Address3\\\":\\\"\\\",\\\"DemogAPI_Pin\\\":\\\"\\\",\\\"DemogAPI_City\\\":\\\"\\\",\\\"DemogAPI_State\\\":\\\"\\\",\\\"namePercentage\\\":\\\"\\\",\\\"schemaName\\\":\\\"InstaSavings\\\",\\\"formRedirectURL\\\":\\\"/content/forms/af/hdfc/hdfc_savings_forms/forms/insta_savings/instasavingsform.html?dataRef=service://HDFCFormsDefaultPrefillService/\\\",\\\"aadharEKYC\\\":\\\"Y\\\",\\\"aadharNo\\\":\\\"\\\",\\\"aadharRefNo\\\":\\\"\\\",\\\"RRN\\\":\\\"\\\",\\\"validPAN\\\":\\\"N\\\",\\\"fName\\\":\\\"ABCD\\\",\\\"mName\\\":\\\"\\\",\\\"lName\\\":\\\"DEF\\\",\\\"oneAadhaarOneAcStatus\\\":\\\"N\\\",\\\"aadharPanLink\\\":\\\"\\\",\\\"panAadharLinkingFlag\\\":\\\"\\\",\\\"validEmployerName\\\":false,\\\"aadharAddressState\\\":\\\"\\\",\\\"fullName\\\":\\\"\\\",\\\"onePanOneAccexistingUser\\\":\\\"\\\",\\\"isGigaCard\\\":\\\"N\\\",\\\"isAccountCreated\\\":\\\"No\\\",\\\"ccAvenueLeadNumber\\\":\\\"\\\",\\\"paymentCheckPollingFlag\\\":\\\"\\\",\\\"professionalTypeDropdownGIGA\\\":\\\"\\\",\\\"hiddenAadharDocuments\\\":\\\"\\\",\\\"ucicCheck\\\":false,\\\"crosscoreCheck\\\":false,\\\"corporateSalary\\\":\\\"N\\\",\\\"crosscore\\\":{\\\"requestType\\\":\\\"\\\",\\\"decision\\\":\\\"\\\",\\\"clientReferenceId\\\":\\\"\\\",\\\"decisionSourceHunter\\\":\\\"\\\",\\\"decisionSourceFraudNet\\\":\\\"\\\",\\\"errorMssg\\\":\\\"\\\"},\\\"panNameDobMatchCount\\\":\\\"3\\\",\\\"hiddenAddMoneyAttempts\\\":1,\\\"accountCreationClickCount\\\":0,\\\"isvkycRedirected\\\":\\\"false\\\",\\\"returnJourneyURL\\\":\\\"/content/forms/af/hdfc/hdfc_savingsunified_url/forms/is_unifiedUrl_form.html\\\",\\\"upiTransactionResponse\\\":\\\"\\\",\\\"callVkycPop\\\":true,\\\"errorCode\\\":\\\"\\\",\\\"errorAPI\\\":\\\"\\\",\\\"lastNameEnablement\\\":\\\"true\\\",\\\"consentManagementEnablement\\\":\\\"true\\\",\\\"XpresswayRedirection\\\":false,\\\"dobValid\\\":\\\"true\\\",\\\"genderType\\\":\\\"Male\\\"}\",\"customerNamePrefix\":\"M\",\"existingCustomer\":\"N\",\"formData\":{\"transactionID\":\"1dceee473a4c42358916a53f2021dadfInstaSavings\"},\"fullName\":\"ABCD DEF\",\"fundingConsentAccepted\":\"false\",\"gigaCreditCardConsent\":\"N\",\"hiddenAadharResType\":\"Owned\",\"hiddenAccountRelatedServicesConsentCheckboxValue\":\"Y\",\"hiddenCreditsDropDownList\":\"Please Select\",\"hiddenDeclareNominee\":\"Yes\",\"hiddenEmpTypeValue\":\"Salaried\",\"hiddenOtherRelatedServicesConsentCheckboxValue\":\"N\",\"hiddenOtherResType\":\"Owned\",\"hiddenProfessionalCategoryDropdown\":\"Please Select\",\"hiddenSourceOfFundsValue\":\"Salary\",\"hiddenUTMParams\":\"?dataRef=service://HDFCFormsDefaultPrefillService/RETRY\",\"isTaxAddressForOVD\":\"1\",\"monthlyCredits\":\"0\",\"pepConsent\":\"0\",\"privacyPolicyAccepted\":\"true\",\"professionalCategory\":\"0\",\"razorPayConsentFlag\":\"N\"}",
                    "state": "AADHAR_EKYC_SELECTED",
                    "timeinfo": "2025-04-15T23:56:37.856Z"
                  },
                  {
                    "stateInfo": "{\"AadharAddressCountry\":\"INDIA\",\"AadharAddressResidenceStatus\":\"Resident\",\"AadharAddressResidenceType\":\"2\",\"AadharConsentLanguage\":\"English\",\"AadharDOB\":\"\",\"AccountNumber\":\"0\",\"ApplyForEmailStatementCheckBox\":\"0\",\"CommunicationAddressCountry\":\"INDIA\",\"CountryOfBirth\":\"INDIA\",\"CurrentAddressCountry\":\"INDIA\",\"CurrentAddressResidenceStatus\":\"Resident\",\"CurrentAddressResidenceType\":\"2\",\"DeclareNomineeFlag\":\"1\",\"Dob\":\"2000-02-10\",\"EmploymentType\":\"2\",\"IDProofSelected\":\"AADHAR\",\"IndianNationalFlag\":\"1\",\"IsTaxAddressFlag\":\"1\",\"JourneyRetries\":\"0\",\"KYCChoice\":\"AadharKYC\",\"KYCDocumentSelected\":\"AADHAR\",\"KeepOriginalPanCheckBox\":\"0\",\"KeepSheetPenForSignatureCheckBox\":\"0\",\"NomineeAddressState\":\"State\",\"PermanentAddressCountry\":\"INDIA\",\"PreviewAddressType\":\"Owned\",\"PreviewNationality\":\"Indian\",\"PreviewPresentAddress\":\"Same as Communication\",\"PreviewTaxResidence\":\"Indian\",\"ProperMobileNetworkCheckBox\":\"0\",\"RegisterForThirdPartyTransferCheckBox\":\"1\",\"RegisteredPhoneNum\":\"6464646464\",\"ReturnJourneyId\":\"noValue\",\"SelfEmploymentMonth\":\"0\",\"SelfEmploymentYear\":\"00\",\"SourceOfFund\":\"2\",\"TaxResidentFlag\":\"1\",\"VKYCCloseTime\":\"23:59\",\"VKYCConsentAccepted\":\"false\",\"VKYCOpenTime\":\"10:00\",\"VideoKYCCheckBox\":\"0\",\"aadhaarConsentAccepted\":\"true\",\"aadharConsentDateTime\":\"2025-04-15T23:56:37\",\"addMoneyAttempts\":1,\"auditData\":{\"action\":\"CUSTOMER_AADHAR_VALIDATION\",\"auditType\":\"Regulatory\"},\"auth\":{\"journey_key\":\"1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB\",\"partner_key\":\"ADOB101\",\"product_key\":\"SA\",\"service_code\":\"XX2571ER\"},\"authenticationPurpose\":\"HDFC Bank Account Opening\",\"callback\":\"https://hdfc-uat-04.adobecqms.net/content/hdfc_savings_forms/api/aadharCallback\",\"client_info\":{\"browser\":{\"majver\":\"\",\"name\":\"Chrome\",\"version\":\"135\"},\"client_ip\":\"10.43.0.21\",\"cookie\":{\"ProductShortname\":\"IS\",\"name\":\"InstaSavings\",\"source\":\"AdobeForms\"},\"device\":{\"name\":\"Samsung G5\",\"os\":\"Windows\",\"os_ver\":\"637.38383\",\"type\":\"desktop\"},\"geo\":{\"lat\":\"72.8777Â° E\",\"long\":\"19.0760Â° N\"},\"hostname\":\"hdfc-uat-04.adobecqms.net\",\"isp\":{\"city\":\"Mumbai\",\"ip\":\"839.893.89.89\",\"pincode\":\"400828\",\"provider\":\"AirTel\",\"state\":\"Maharashrta\"}},\"currentFormContext\":\"{\\\"sliderRef\\\":\\\"\\\",\\\"currentFormPage\\\":\\\"Aadhar eKYC Page.\\\",\\\"tenureRef\\\":\\\"\\\",\\\"initialInterestVal\\\":\\\"\\\",\\\"initialTidVal\\\":\\\"\\\",\\\"initialTenureVal\\\":\\\"\\\",\\\"interestVal\\\":\\\"\\\",\\\"tidVal\\\":\\\"\\\",\\\"tenureVal\\\":\\\"\\\",\\\"encryptedToken\\\":\\\"\\\",\\\"relationNumber\\\":\\\"\\\",\\\"transferMethod\\\":\\\"\\\",\\\"casaUser\\\":\\\"N\\\",\\\"existingCustomer\\\":\\\"N\\\",\\\"aanNumber\\\":\\\"\\\",\\\"primaryCardHolderName\\\":\\\"\\\",\\\"journeyID\\\":\\\"1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB\\\",\\\"journeyName\\\":\\\"INSTA_SAVINGS_JOURNEY\\\",\\\"journeyState\\\":\\\"CUSTOMER_LEAD_QUALIFIED\\\",\\\"errorMessage\\\":\\\"\\\",\\\"wrongOtpCount\\\":0,\\\"wrongOtpCount1\\\":0,\\\"leadNumber\\\":\\\"\\\",\\\"leadProfileId\\\":27077824,\\\"pseudoID\\\":\\\"\\\",\\\"journeyApiUri\\\":\\\"/content/hdfc_commonforms/api/journeydropoffupdate.json\\\",\\\"journeyJsonObject\\\":{\\\"RequestPayload\\\":{\\\"userAgent\\\":\\\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0\\\",\\\"leadProfile\\\":{\\\"profile\\\":{\\\"dob\\\":\\\"2000-02-10\\\",\\\"fullName\\\":\\\"ABCD  DEF\\\"},\\\"mobileNumber\\\":\\\"6464646464\\\",\\\"leadProfileId\\\":27077824,\\\"aanNumber\\\":\\\"\\\",\\\"emailId\\\":\\\"\\\",\\\"officialEmailId\\\":\\\"\\\"},\\\"formData\\\":{\\\"journeyName\\\":\\\"INSTA_SAVINGS_JOURNEY\\\",\\\"journeyStateInfo\\\":[{\\\"stateInfo\\\":\\\"{\\\\\\\"RegisteredPhoneNum\\\\\\\":\\\\\\\"6464646464\\\\\\\",\\\\\\\"AadharDOB\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"Dob\\\\\\\":\\\\\\\"2000-02-10\\\\\\\",\\\\\\\"hiddenAccountRelatedServicesConsentCheckboxValue\\\\\\\":\\\\\\\"Y\\\\\\\",\\\\\\\"hiddenOtherRelatedServicesConsentCheckboxValue\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"KYCChoice\\\\\\\":\\\\\\\"AadharKYC\\\\\\\",\\\\\\\"AadharConsentLanguage\\\\\\\":\\\\\\\"English\\\\\\\",\\\\\\\"AadharAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"AadharAddressResidenceType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"AadharAddressResidenceStatus\\\\\\\":\\\\\\\"Resident\\\\\\\",\\\\\\\"hiddenAadharResType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"hiddenOtherResType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"CurrentAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"CurrentAddressResidenceType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"CurrentAddressResidenceStatus\\\\\\\":\\\\\\\"Resident\\\\\\\",\\\\\\\"CommunicationAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"IsTaxAddressFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"PermanentAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"isTaxAddressForOVD\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"EmploymentType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"SourceOfFund\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"SelfEmploymentYear\\\\\\\":\\\\\\\"00\\\\\\\",\\\\\\\"SelfEmploymentMonth\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"pepConsent\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"IndianNationalFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"TaxResidentFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"hiddenEmpTypeValue\\\\\\\":\\\\\\\"Salaried\\\\\\\",\\\\\\\"hiddenSourceOfFundsValue\\\\\\\":\\\\\\\"Salary\\\\\\\",\\\\\\\"gigaCreditCardConsent\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"razorPayConsentFlag\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"professionalCategory\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"monthlyCredits\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"DeclareNomineeFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"NomineeAddressState\\\\\\\":\\\\\\\"State\\\\\\\",\\\\\\\"CountryOfBirth\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"hiddenDeclareNominee\\\\\\\":\\\\\\\"Yes\\\\\\\",\\\\\\\"RegisterForThirdPartyTransferCheckBox\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"ApplyForEmailStatementCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"PreviewAddressType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"PreviewPresentAddress\\\\\\\":\\\\\\\"Same as Communication\\\\\\\",\\\\\\\"PreviewNationality\\\\\\\":\\\\\\\"Indian\\\\\\\",\\\\\\\"PreviewTaxResidence\\\\\\\":\\\\\\\"Indian\\\\\\\",\\\\\\\"KYCDocumentSelected\\\\\\\":\\\\\\\"AADHAR\\\\\\\",\\\\\\\"IDProofSelected\\\\\\\":\\\\\\\"AADHAR\\\\\\\",\\\\\\\"VideoKYCCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"ProperMobileNetworkCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"KeepOriginalPanCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"KeepSheetPenForSignatureCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"JourneyRetries\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"AccountNumber\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"addMoneyAttempts\\\\\\\":1,\\\\\\\"VKYCOpenTime\\\\\\\":\\\\\\\"10:00\\\\\\\",\\\\\\\"VKYCCloseTime\\\\\\\":\\\\\\\"23:59\\\\\\\",\\\\\\\"hiddenCreditsDropDownList\\\\\\\":\\\\\\\"Please Select\\\\\\\",\\\\\\\"hiddenProfessionalCategoryDropdown\\\\\\\":\\\\\\\"Please Select\\\\\\\",\\\\\\\"privacyPolicyAccepted\\\\\\\":\\\\\\\"true\\\\\\\",\\\\\\\"aadhaarConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"VKYCConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"fundingConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"hiddenUTMParams\\\\\\\":\\\\\\\"?dataRef=service://HDFCFormsDefaultPrefillService/RETRY\\\\\\\",\\\\\\\"ReturnJourneyId\\\\\\\":\\\\\\\"noValue\\\\\\\",\\\\\\\"existingCustomer\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"customerNamePrefix\\\\\\\":\\\\\\\"M\\\\\\\",\\\\\\\"fullName\\\\\\\":\\\\\\\"ABCD DEF\\\\\\\"}\\\",\\\"state\\\":\\\"CUSTOMER_LEAD_QUALIFIED\\\",\\\"timeinfo\\\":\\\"2025-04-15T23:56:33.354Z\\\"}],\\\"channel\\\":\\\"ADOBE WEBFORMS\\\",\\\"journeyID\\\":\\\"1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB\\\"}}},\\\"emailId\\\":\\\"\\\",\\\"officialEmailId\\\":\\\"\\\",\\\"journeyUpdateStatus\\\":true,\\\"DemogAPI_Address1\\\":\\\"\\\",\\\"DemogAPI_Address2\\\":\\\"\\\",\\\"DemogAPI_Address3\\\":\\\"\\\",\\\"DemogAPI_Pin\\\":\\\"\\\",\\\"DemogAPI_City\\\":\\\"\\\",\\\"DemogAPI_State\\\":\\\"\\\",\\\"namePercentage\\\":\\\"\\\",\\\"schemaName\\\":\\\"InstaSavings\\\",\\\"formRedirectURL\\\":\\\"/content/forms/af/hdfc/hdfc_savings_forms/forms/insta_savings/instasavingsform.html?dataRef=service://HDFCFormsDefaultPrefillService/\\\",\\\"aadharEKYC\\\":\\\"Y\\\",\\\"aadharNo\\\":\\\"\\\",\\\"aadharRefNo\\\":\\\"\\\",\\\"RRN\\\":\\\"\\\",\\\"validPAN\\\":\\\"N\\\",\\\"fName\\\":\\\"ABCD\\\",\\\"mName\\\":\\\"\\\",\\\"lName\\\":\\\"DEF\\\",\\\"oneAadhaarOneAcStatus\\\":\\\"N\\\",\\\"aadharPanLink\\\":\\\"\\\",\\\"panAadharLinkingFlag\\\":\\\"\\\",\\\"validEmployerName\\\":false,\\\"aadharAddressState\\\":\\\"\\\",\\\"fullName\\\":\\\"\\\",\\\"onePanOneAccexistingUser\\\":\\\"\\\",\\\"isGigaCard\\\":\\\"N\\\",\\\"isAccountCreated\\\":\\\"No\\\",\\\"ccAvenueLeadNumber\\\":\\\"\\\",\\\"paymentCheckPollingFlag\\\":\\\"\\\",\\\"professionalTypeDropdownGIGA\\\":\\\"\\\",\\\"hiddenAadharDocuments\\\":\\\"\\\",\\\"ucicCheck\\\":false,\\\"crosscoreCheck\\\":false,\\\"corporateSalary\\\":\\\"N\\\",\\\"crosscore\\\":{\\\"requestType\\\":\\\"\\\",\\\"decision\\\":\\\"\\\",\\\"clientReferenceId\\\":\\\"\\\",\\\"decisionSourceHunter\\\":\\\"\\\",\\\"decisionSourceFraudNet\\\":\\\"\\\",\\\"errorMssg\\\":\\\"\\\"},\\\"panNameDobMatchCount\\\":\\\"3\\\",\\\"hiddenAddMoneyAttempts\\\":1,\\\"accountCreationClickCount\\\":0,\\\"isvkycRedirected\\\":\\\"false\\\",\\\"returnJourneyURL\\\":\\\"/content/forms/af/hdfc/hdfc_savingsunified_url/forms/is_unifiedUrl_form.html\\\",\\\"upiTransactionResponse\\\":\\\"\\\",\\\"callVkycPop\\\":true,\\\"errorCode\\\":\\\"\\\",\\\"errorAPI\\\":\\\"\\\",\\\"lastNameEnablement\\\":\\\"true\\\",\\\"consentManagementEnablement\\\":\\\"true\\\",\\\"XpresswayRedirection\\\":false,\\\"dobValid\\\":\\\"true\\\",\\\"genderType\\\":\\\"Male\\\"}\",\"customerNamePrefix\":\"M\",\"documentUploadCheck\":true,\"existingCustomer\":\"N\",\"formData\":{\"transactionID\":\"1dceee473a4c42358916a53f2021dadfInstaSavings\"},\"fullName\":\"ABCD DEF\",\"fundingConsentAccepted\":\"false\",\"gigaCreditCardConsent\":\"N\",\"hcpPath\":\"/ekyc/\",\"hiddenAadharResType\":\"Owned\",\"hiddenAccountRelatedServicesConsentCheckboxValue\":\"Y\",\"hiddenCreditsDropDownList\":\"Please Select\",\"hiddenDeclareNominee\":\"Yes\",\"hiddenEmpTypeValue\":\"Salaried\",\"hiddenOtherRelatedServicesConsentCheckboxValue\":\"N\",\"hiddenOtherResType\":\"Owned\",\"hiddenProfessionalCategoryDropdown\":\"Please Select\",\"hiddenSourceOfFundsValue\":\"Salary\",\"hiddenUTMParams\":\"?dataRef=service://HDFCFormsDefaultPrefillService/RETRY\",\"isTaxAddressForOVD\":\"1\",\"journeyVariant\":\"\",\"leadType\":\"\",\"mobileValReq\":false,\"monthlyCredits\":\"0\",\"oneaadhaarcheck\":\"false\",\"pepConsent\":\"0\",\"privacyPolicyAccepted\":\"true\",\"proceedOnMobileValFail\":false,\"professionalCategory\":\"0\",\"razorPayConsentFlag\":\"N\",\"sendAuthSMS\":\"true\",\"subJourneyName\":\"\",\"terminateOnMobileValFail\":false}",
                    "state": "eKYC_INITIATED",
                    "timeinfo": "2025-04-15T18:27:11.231Z"
                  },
                  {
                    "stateInfo": "{\"AadharAddressCountry\":\"INDIA\",\"AadharAddressResidenceStatus\":\"Resident\",\"AadharAddressResidenceType\":\"2\",\"AadharConsentLanguage\":\"English\",\"AadharDOB\":\"\",\"AccountNumber\":\"0\",\"ApplyForEmailStatementCheckBox\":\"0\",\"CommunicationAddressCountry\":\"INDIA\",\"CountryOfBirth\":\"INDIA\",\"CurrentAddressCountry\":\"INDIA\",\"CurrentAddressResidenceStatus\":\"Resident\",\"CurrentAddressResidenceType\":\"2\",\"DeclareNomineeFlag\":\"1\",\"Dob\":\"2000-02-10\",\"EmploymentType\":\"2\",\"IDProofSelected\":\"AADHAR\",\"IndianNationalFlag\":\"1\",\"IsTaxAddressFlag\":\"1\",\"JourneyRetries\":\"0\",\"KYCChoice\":\"AadharKYC\",\"KYCDocumentSelected\":\"AADHAR\",\"KeepOriginalPanCheckBox\":\"0\",\"KeepSheetPenForSignatureCheckBox\":\"0\",\"NomineeAddressState\":\"State\",\"PermanentAddressCountry\":\"INDIA\",\"PreviewAddressType\":\"Owned\",\"PreviewNationality\":\"Indian\",\"PreviewPresentAddress\":\"Same as Communication\",\"PreviewTaxResidence\":\"Indian\",\"ProperMobileNetworkCheckBox\":\"0\",\"RegisterForThirdPartyTransferCheckBox\":\"1\",\"RegisteredPhoneNum\":\"6464646464\",\"ReturnJourneyId\":\"noValue\",\"SelfEmploymentMonth\":\"0\",\"SelfEmploymentYear\":\"00\",\"SourceOfFund\":\"2\",\"TaxResidentFlag\":\"1\",\"VKYCCloseTime\":\"23:59\",\"VKYCConsentAccepted\":\"false\",\"VKYCOpenTime\":\"10:00\",\"VideoKYCCheckBox\":\"0\",\"aadhaarConsentAccepted\":\"true\",\"aadhaar_otp_gen_data\":{\"message\":\"Aadhaar OTP Generate Failure\",\"reference_key\":\"FZSIRZEK74CK\",\"result\":{\"AcqId\":0,\"CA_ID\":null,\"CA_TA\":null,\"CA_Tid\":null,\"ErrorCode\":\"00\",\"Info\":\"\",\"Local_Trans_Time\":0,\"Local_date\":0,\"Pan\":null,\"Pos_code\":null,\"ProcCode\":0,\"RRN\":0,\"Responsecode\":null,\"Stan\":\"022785\",\"TransactionId\":0,\"Txn\":\"022785\",\"ret\":\"y\"},\"status\":\"34\"},\"aadharConsentDateTime\":\"2025-04-15T23:56:37\",\"addMoneyAttempts\":1,\"auditData\":{\"action\":\"CUSTOMER_AADHAR_VALIDATION\",\"auditType\":\"Regulatory\"},\"auth\":{\"journey_key\":\"1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB\",\"partner_key\":\"ADOB101\",\"product_key\":\"SA\",\"service_code\":\"XX2571ER\"},\"authenticationPurpose\":\"HDFC Bank Account Opening\",\"callback\":\"https://hdfc-uat-04.adobecqms.net/content/hdfc_savings_forms/api/aadharCallback\",\"client_info\":{\"browser\":{\"majver\":\"135.0\",\"name\":\"Chrome\",\"ver\":\"135.0\",\"version\":\"135\"},\"client_ip\":\"10.43.0.21\",\"cookie\":{\"ProductShortname\":\"IS\",\"id\":\"100IS9348375115202rpA51\",\"name\":\"InstaSavings\",\"source\":\"AdobeForms\",\"time_stamp\":\"4/15/2025  11:57:4 AM\",\"vintage\":\"0\"},\"device\":{\"name\":\"Samsung G5\",\"os\":\"Windows\",\"os_ver\":\"637.38383\",\"type\":\"desktop\"},\"finger_print\":\"5e67d90e6a67a522c23bb71c9f79c584\",\"geo\":{\"lat\":\"72.8777° E\",\"long\":\"19.0760° N\"},\"hostname\":\"hdfc-uat-04.adobecqms.net\",\"isp\":{\"city\":\"Mumbai\",\"ip\":\"839.893.89.89\",\"pincode\":\"400828\",\"provider\":\"AirTel\",\"state\":\"Maharashrta\"}},\"currentFormContext\":\"{\\\"sliderRef\\\":\\\"\\\",\\\"currentFormPage\\\":\\\"Aadhar eKYC Page.\\\",\\\"tenureRef\\\":\\\"\\\",\\\"initialInterestVal\\\":\\\"\\\",\\\"initialTidVal\\\":\\\"\\\",\\\"initialTenureVal\\\":\\\"\\\",\\\"interestVal\\\":\\\"\\\",\\\"tidVal\\\":\\\"\\\",\\\"tenureVal\\\":\\\"\\\",\\\"encryptedToken\\\":\\\"\\\",\\\"relationNumber\\\":\\\"\\\",\\\"transferMethod\\\":\\\"\\\",\\\"casaUser\\\":\\\"N\\\",\\\"existingCustomer\\\":\\\"N\\\",\\\"aanNumber\\\":\\\"\\\",\\\"primaryCardHolderName\\\":\\\"\\\",\\\"journeyID\\\":\\\"1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB\\\",\\\"journeyName\\\":\\\"INSTA_SAVINGS_JOURNEY\\\",\\\"journeyState\\\":\\\"CUSTOMER_LEAD_QUALIFIED\\\",\\\"errorMessage\\\":\\\"\\\",\\\"wrongOtpCount\\\":0,\\\"wrongOtpCount1\\\":0,\\\"leadNumber\\\":\\\"\\\",\\\"leadProfileId\\\":27077824,\\\"pseudoID\\\":\\\"\\\",\\\"journeyApiUri\\\":\\\"/content/hdfc_commonforms/api/journeydropoffupdate.json\\\",\\\"journeyJsonObject\\\":{\\\"RequestPayload\\\":{\\\"userAgent\\\":\\\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0\\\",\\\"leadProfile\\\":{\\\"profile\\\":{\\\"dob\\\":\\\"2000-02-10\\\",\\\"fullName\\\":\\\"ABCD  DEF\\\"},\\\"mobileNumber\\\":\\\"6464646464\\\",\\\"leadProfileId\\\":27077824,\\\"aanNumber\\\":\\\"\\\",\\\"emailId\\\":\\\"\\\",\\\"officialEmailId\\\":\\\"\\\"},\\\"formData\\\":{\\\"journeyName\\\":\\\"INSTA_SAVINGS_JOURNEY\\\",\\\"journeyStateInfo\\\":[{\\\"stateInfo\\\":\\\"{\\\\\\\"RegisteredPhoneNum\\\\\\\":\\\\\\\"6464646464\\\\\\\",\\\\\\\"AadharDOB\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"Dob\\\\\\\":\\\\\\\"2000-02-10\\\\\\\",\\\\\\\"hiddenAccountRelatedServicesConsentCheckboxValue\\\\\\\":\\\\\\\"Y\\\\\\\",\\\\\\\"hiddenOtherRelatedServicesConsentCheckboxValue\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"KYCChoice\\\\\\\":\\\\\\\"AadharKYC\\\\\\\",\\\\\\\"AadharConsentLanguage\\\\\\\":\\\\\\\"English\\\\\\\",\\\\\\\"AadharAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"AadharAddressResidenceType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"AadharAddressResidenceStatus\\\\\\\":\\\\\\\"Resident\\\\\\\",\\\\\\\"hiddenAadharResType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"hiddenOtherResType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"CurrentAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"CurrentAddressResidenceType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"CurrentAddressResidenceStatus\\\\\\\":\\\\\\\"Resident\\\\\\\",\\\\\\\"CommunicationAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"IsTaxAddressFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"PermanentAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"isTaxAddressForOVD\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"EmploymentType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"SourceOfFund\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"SelfEmploymentYear\\\\\\\":\\\\\\\"00\\\\\\\",\\\\\\\"SelfEmploymentMonth\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"pepConsent\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"IndianNationalFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"TaxResidentFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"hiddenEmpTypeValue\\\\\\\":\\\\\\\"Salaried\\\\\\\",\\\\\\\"hiddenSourceOfFundsValue\\\\\\\":\\\\\\\"Salary\\\\\\\",\\\\\\\"gigaCreditCardConsent\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"razorPayConsentFlag\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"professionalCategory\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"monthlyCredits\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"DeclareNomineeFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"NomineeAddressState\\\\\\\":\\\\\\\"State\\\\\\\",\\\\\\\"CountryOfBirth\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"hiddenDeclareNominee\\\\\\\":\\\\\\\"Yes\\\\\\\",\\\\\\\"RegisterForThirdPartyTransferCheckBox\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"ApplyForEmailStatementCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"PreviewAddressType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"PreviewPresentAddress\\\\\\\":\\\\\\\"Same as Communication\\\\\\\",\\\\\\\"PreviewNationality\\\\\\\":\\\\\\\"Indian\\\\\\\",\\\\\\\"PreviewTaxResidence\\\\\\\":\\\\\\\"Indian\\\\\\\",\\\\\\\"KYCDocumentSelected\\\\\\\":\\\\\\\"AADHAR\\\\\\\",\\\\\\\"IDProofSelected\\\\\\\":\\\\\\\"AADHAR\\\\\\\",\\\\\\\"VideoKYCCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"ProperMobileNetworkCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"KeepOriginalPanCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"KeepSheetPenForSignatureCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"JourneyRetries\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"AccountNumber\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"addMoneyAttempts\\\\\\\":1,\\\\\\\"VKYCOpenTime\\\\\\\":\\\\\\\"10:00\\\\\\\",\\\\\\\"VKYCCloseTime\\\\\\\":\\\\\\\"23:59\\\\\\\",\\\\\\\"hiddenCreditsDropDownList\\\\\\\":\\\\\\\"Please Select\\\\\\\",\\\\\\\"hiddenProfessionalCategoryDropdown\\\\\\\":\\\\\\\"Please Select\\\\\\\",\\\\\\\"privacyPolicyAccepted\\\\\\\":\\\\\\\"true\\\\\\\",\\\\\\\"aadhaarConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"VKYCConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"fundingConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"hiddenUTMParams\\\\\\\":\\\\\\\"?dataRef=service://HDFCFormsDefaultPrefillService/RETRY\\\\\\\",\\\\\\\"ReturnJourneyId\\\\\\\":\\\\\\\"noValue\\\\\\\",\\\\\\\"existingCustomer\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"customerNamePrefix\\\\\\\":\\\\\\\"M\\\\\\\",\\\\\\\"fullName\\\\\\\":\\\\\\\"ABCD DEF\\\\\\\"}\\\",\\\"state\\\":\\\"CUSTOMER_LEAD_QUALIFIED\\\",\\\"timeinfo\\\":\\\"2025-04-15T23:56:33.354Z\\\"}],\\\"channel\\\":\\\"ADOBE WEBFORMS\\\",\\\"journeyID\\\":\\\"1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB\\\"}}},\\\"emailId\\\":\\\"\\\",\\\"officialEmailId\\\":\\\"\\\",\\\"journeyUpdateStatus\\\":true,\\\"DemogAPI_Address1\\\":\\\"\\\",\\\"DemogAPI_Address2\\\":\\\"\\\",\\\"DemogAPI_Address3\\\":\\\"\\\",\\\"DemogAPI_Pin\\\":\\\"\\\",\\\"DemogAPI_City\\\":\\\"\\\",\\\"DemogAPI_State\\\":\\\"\\\",\\\"namePercentage\\\":\\\"\\\",\\\"schemaName\\\":\\\"InstaSavings\\\",\\\"formRedirectURL\\\":\\\"/content/forms/af/hdfc/hdfc_savings_forms/forms/insta_savings/instasavingsform.html?dataRef=service://HDFCFormsDefaultPrefillService/\\\",\\\"aadharEKYC\\\":\\\"Y\\\",\\\"aadharNo\\\":\\\"\\\",\\\"aadharRefNo\\\":\\\"\\\",\\\"RRN\\\":\\\"\\\",\\\"validPAN\\\":\\\"N\\\",\\\"fName\\\":\\\"ABCD\\\",\\\"mName\\\":\\\"\\\",\\\"lName\\\":\\\"DEF\\\",\\\"oneAadhaarOneAcStatus\\\":\\\"N\\\",\\\"aadharPanLink\\\":\\\"\\\",\\\"panAadharLinkingFlag\\\":\\\"\\\",\\\"validEmployerName\\\":false,\\\"aadharAddressState\\\":\\\"\\\",\\\"fullName\\\":\\\"\\\",\\\"onePanOneAccexistingUser\\\":\\\"\\\",\\\"isGigaCard\\\":\\\"N\\\",\\\"isAccountCreated\\\":\\\"No\\\",\\\"ccAvenueLeadNumber\\\":\\\"\\\",\\\"paymentCheckPollingFlag\\\":\\\"\\\",\\\"professionalTypeDropdownGIGA\\\":\\\"\\\",\\\"hiddenAadharDocuments\\\":\\\"\\\",\\\"ucicCheck\\\":false,\\\"crosscoreCheck\\\":false,\\\"corporateSalary\\\":\\\"N\\\",\\\"crosscore\\\":{\\\"requestType\\\":\\\"\\\",\\\"decision\\\":\\\"\\\",\\\"clientReferenceId\\\":\\\"\\\",\\\"decisionSourceHunter\\\":\\\"\\\",\\\"decisionSourceFraudNet\\\":\\\"\\\",\\\"errorMssg\\\":\\\"\\\"},\\\"panNameDobMatchCount\\\":\\\"3\\\",\\\"hiddenAddMoneyAttempts\\\":1,\\\"accountCreationClickCount\\\":0,\\\"isvkycRedirected\\\":\\\"false\\\",\\\"returnJourneyURL\\\":\\\"/content/forms/af/hdfc/hdfc_savingsunified_url/forms/is_unifiedUrl_form.html\\\",\\\"upiTransactionResponse\\\":\\\"\\\",\\\"callVkycPop\\\":true,\\\"errorCode\\\":\\\"\\\",\\\"errorAPI\\\":\\\"\\\",\\\"lastNameEnablement\\\":\\\"true\\\",\\\"consentManagementEnablement\\\":\\\"true\\\",\\\"XpresswayRedirection\\\":false,\\\"dobValid\\\":\\\"true\\\",\\\"genderType\\\":\\\"Male\\\"}\",\"customerNamePrefix\":\"M\",\"documentUploadCheck\":true,\"existingCustomer\":\"N\",\"formData\":{\"transactionID\":\"1dceee473a4c42358916a53f2021dadfInstaSavings\"},\"fullName\":\"ABCD DEF\",\"fundingConsentAccepted\":\"false\",\"gigaCreditCardConsent\":\"N\",\"hcpPath\":\"/ekyc/\",\"hiddenAadharResType\":\"Owned\",\"hiddenAccountRelatedServicesConsentCheckboxValue\":\"Y\",\"hiddenCreditsDropDownList\":\"Please Select\",\"hiddenDeclareNominee\":\"Yes\",\"hiddenEmpTypeValue\":\"Salaried\",\"hiddenOtherRelatedServicesConsentCheckboxValue\":\"N\",\"hiddenOtherResType\":\"Owned\",\"hiddenProfessionalCategoryDropdown\":\"Please Select\",\"hiddenSourceOfFundsValue\":\"Salary\",\"hiddenUTMParams\":\"?dataRef=service://HDFCFormsDefaultPrefillService/RETRY\",\"isTaxAddressForOVD\":\"1\",\"journeyVariant\":\"\",\"leadType\":\"\",\"mobileValReq\":false,\"monthlyCredits\":\"0\",\"oneaadhaarcheck\":\"false\",\"pepConsent\":\"0\",\"privacyPolicyAccepted\":\"true\",\"proceedOnMobileValFail\":false,\"professionalCategory\":\"0\",\"razorPayConsentFlag\":\"N\",\"sendAuthSMS\":\"true\",\"subJourneyName\":\"\",\"terminateOnMobileValFail\":false}",
                    "state": "OTP_GENERATION_SUCCESS",
                    "timeinfo": "2025-04-15T18:27:50.457Z"
                  },
                  {
                    "stateInfo": "{\"AadharAddressCountry\":\"INDIA\",\"AadharAddressResidenceStatus\":\"Resident\",\"AadharAddressResidenceType\":\"2\",\"AadharConsentLanguage\":\"English\",\"AadharDOB\":\"\",\"AccountNumber\":\"0\",\"ApplyForEmailStatementCheckBox\":\"0\",\"CommunicationAddressCountry\":\"INDIA\",\"CountryOfBirth\":\"INDIA\",\"CurrentAddressCountry\":\"INDIA\",\"CurrentAddressResidenceStatus\":\"Resident\",\"CurrentAddressResidenceType\":\"2\",\"DeclareNomineeFlag\":\"1\",\"Dob\":\"2000-02-10\",\"EmploymentType\":\"2\",\"IDProofSelected\":\"AADHAR\",\"IndianNationalFlag\":\"1\",\"IsTaxAddressFlag\":\"1\",\"JourneyRetries\":\"0\",\"KYCChoice\":\"AadharKYC\",\"KYCDocumentSelected\":\"AADHAR\",\"KeepOriginalPanCheckBox\":\"0\",\"KeepSheetPenForSignatureCheckBox\":\"0\",\"NomineeAddressState\":\"State\",\"PermanentAddressCountry\":\"INDIA\",\"PreviewAddressType\":\"Owned\",\"PreviewNationality\":\"Indian\",\"PreviewPresentAddress\":\"Same as Communication\",\"PreviewTaxResidence\":\"Indian\",\"ProperMobileNetworkCheckBox\":\"0\",\"RegisterForThirdPartyTransferCheckBox\":\"1\",\"RegisteredPhoneNum\":\"6464646464\",\"ReturnJourneyId\":\"noValue\",\"SelfEmploymentMonth\":\"0\",\"SelfEmploymentYear\":\"00\",\"SourceOfFund\":\"2\",\"TaxResidentFlag\":\"1\",\"VKYCCloseTime\":\"23:59\",\"VKYCConsentAccepted\":\"false\",\"VKYCOpenTime\":\"10:00\",\"VideoKYCCheckBox\":\"0\",\"aadhaarConsentAccepted\":\"true\",\"aadhaar_otp_gen_data\":{\"message\":\"Aadhaar OTP Generate Failure\",\"reference_key\":\"FZSIRZEK74CK\",\"result\":{\"AcqId\":0,\"CA_ID\":null,\"CA_TA\":null,\"CA_Tid\":null,\"ErrorCode\":\"00\",\"Info\":\"\",\"Local_Trans_Time\":0,\"Local_date\":0,\"Pan\":null,\"Pos_code\":null,\"ProcCode\":0,\"RRN\":0,\"Responsecode\":null,\"Stan\":\"022785\",\"TransactionId\":0,\"Txn\":\"022785\",\"ret\":\"y\"},\"status\":\"34\"},\"aadhaar_otp_val_data\":{\"message\":\"Aadhaar OTP Validate success\",\"reference_key\":\"IWNUCC2QWU6X\",\"result\":{\"ADVRefrenceKey\":\"121383571136\",\"Address1\":\"369 5th 6th cross\",\"Address2\":\"Enclave flat no 201\",\"Address3\":\"\",\"CIFCall\":null,\"CIFKycFlag\":null,\"City\":\"Mumbai\",\"Country\":\"India\",\"CustId\":null,\"CustomerDependents\":null,\"CustomerProfession\":null,\"Customerfullname\":\"Rupesh Mohan Nagdive\",\"DCErrorMessage\":null,\"DCErrorMsg\":null,\"DebitCardAttemptCount\":null,\"Dob\":\"03/05/2003\",\"DrivingLicNo\":null,\"EditAadhaarFlag\":null,\"EduQualification\":null,\"Email\":\"\",\"EmploymentType\":null,\"ErrorCode\":\"00\",\"ErrorMessage\":null,\"ExcC_Address_L1\":null,\"ExcC_Address_L2\":null,\"ExcC_Address_L3\":null,\"ExcC_PinCode\":null,\"ExcC_State\":null,\"Exc_AdhaarCard\":null,\"Exc_C_City\":null,\"Exc_CustName\":null,\"Exc_DOB\":null,\"Exc_EmailID\":null,\"Exc_FirstName\":null,\"Exc_Gender\":null,\"Exc_LastName\":null,\"Exc_MiddleName\":null,\"Exc_Mobile\":null,\"Exc_MonthlyIncome\":null,\"Exc_NameAppear\":null,\"Exc_OffAddress1\":null,\"Exc_OffAddress2\":null,\"Exc_OffCity\":null,\"Exc_OffLandMark\":null,\"Exc_OffState\":null,\"Exc_OffTelPhone\":null,\"Exc_OffZipcode\":null,\"Exc_PanNumber\":null,\"Exc_TelPhone\":null,\"FirstName\":\"Rupesh\",\"Gender\":\"1\",\"GuidUniqueNumber\":\"\",\"IdCust\":null,\"LandMark\":\"near railway station\",\"LastName\":\"Nagdive\",\"MaritalStatus\":null,\"MiddleName\":\"Mohan\",\"MobNo\":\"\",\"MobNumber\":null,\"MobileDisableFormA\":null,\"MonthlyIncome\":null,\"Nationality\":null,\"OTPErrorDesc\":null,\"OffAddress1\":null,\"OffAddress2\":null,\"OffCity\":null,\"OffEmail\":null,\"OffLandMark\":null,\"OffSTDCode\":null,\"OffState\":null,\"OffTelPhone\":null,\"OffZipcode\":null,\"PanCardNo\":null,\"PassportNo\":null,\"Profession\":null,\"RRN\":\"421412102092\",\"ReKYCflag\":null,\"ResidenceType\":null,\"Ret_Code\":\"635539ee17dd40d5a4b45d9e1706e6e7\",\"Ret_Txn\":\"UKC:102092\",\"Salutation\":null,\"State\":\"Maharashtra\",\"TelPhone\":null,\"UidaiRespTimestamp\":\"01/01/0001 12:00:00\",\"VoterID\":null,\"Zipcode\":\"400042\",\"docUpload\":[{\"fieldId\":\"FieldID_13576\",\"itemKey\":\"310826487\"},{\"fieldId\":\"FieldID_12205\",\"itemKey\":\"310826488\"}],\"mobileValid\":\"y\"},\"status\":\"36\"},\"aadharConsentDateTime\":\"2025-04-15T23:56:37\",\"accountExist\":false,\"addMoneyAttempts\":1,\"auditData\":{\"action\":\"CUSTOMER_AADHAR_VALIDATION\",\"auditType\":\"Regulatory\"},\"auth\":{\"journey_key\":\"1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB\",\"partner_key\":\"ADOB101\",\"product_key\":\"SA\",\"service_code\":\"XX2571ER\"},\"authenticationPurpose\":\"HDFC Bank Account Opening\",\"callback\":\"https://hdfc-uat-04.adobecqms.net/content/hdfc_savings_forms/api/aadharCallback\",\"client_info\":{\"browser\":{\"majver\":\"135.0\",\"name\":\"Chrome\",\"ver\":\"135.0\",\"version\":\"135\"},\"client_ip\":\"10.43.0.21\",\"cookie\":{\"ProductShortname\":\"IS\",\"id\":\"100IS1263475115202rpA51\",\"name\":\"InstaSavings\",\"source\":\"AdobeForms\",\"time_stamp\":\"4/15/2025  11:57:4 AM\",\"vintage\":0},\"device\":{\"name\":\"Samsung G5\",\"os\":\"Windows\",\"os_ver\":\"637.38383\",\"type\":\"desktop\"},\"finger_print\":\"5e67d90e6a67a522c23bb71c9f79c584\",\"geo\":{\"lat\":\"72.8777° E\",\"long\":\"19.0760° N\"},\"hostname\":\"hdfc-uat-04.adobecqms.net\",\"isp\":{\"city\":\"Mumbai\",\"ip\":\"839.893.89.89\",\"pincode\":\"400828\",\"provider\":\"AirTel\",\"state\":\"Maharashrta\"}},\"currentFormContext\":\"{\\\"sliderRef\\\":\\\"\\\",\\\"currentFormPage\\\":\\\"Aadhar eKYC Page.\\\",\\\"tenureRef\\\":\\\"\\\",\\\"initialInterestVal\\\":\\\"\\\",\\\"initialTidVal\\\":\\\"\\\",\\\"initialTenureVal\\\":\\\"\\\",\\\"interestVal\\\":\\\"\\\",\\\"tidVal\\\":\\\"\\\",\\\"tenureVal\\\":\\\"\\\",\\\"encryptedToken\\\":\\\"\\\",\\\"relationNumber\\\":\\\"\\\",\\\"transferMethod\\\":\\\"\\\",\\\"casaUser\\\":\\\"N\\\",\\\"existingCustomer\\\":\\\"N\\\",\\\"aanNumber\\\":\\\"\\\",\\\"primaryCardHolderName\\\":\\\"\\\",\\\"journeyID\\\":\\\"1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB\\\",\\\"journeyName\\\":\\\"INSTA_SAVINGS_JOURNEY\\\",\\\"journeyState\\\":\\\"CUSTOMER_LEAD_QUALIFIED\\\",\\\"errorMessage\\\":\\\"\\\",\\\"wrongOtpCount\\\":0,\\\"wrongOtpCount1\\\":0,\\\"leadNumber\\\":\\\"\\\",\\\"leadProfileId\\\":27077824,\\\"pseudoID\\\":\\\"\\\",\\\"journeyApiUri\\\":\\\"/content/hdfc_commonforms/api/journeydropoffupdate.json\\\",\\\"journeyJsonObject\\\":{\\\"RequestPayload\\\":{\\\"userAgent\\\":\\\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0\\\",\\\"leadProfile\\\":{\\\"profile\\\":{\\\"dob\\\":\\\"2000-02-10\\\",\\\"fullName\\\":\\\"ABCD  DEF\\\"},\\\"mobileNumber\\\":\\\"6464646464\\\",\\\"leadProfileId\\\":27077824,\\\"aanNumber\\\":\\\"\\\",\\\"emailId\\\":\\\"\\\",\\\"officialEmailId\\\":\\\"\\\"},\\\"formData\\\":{\\\"journeyName\\\":\\\"INSTA_SAVINGS_JOURNEY\\\",\\\"journeyStateInfo\\\":[{\\\"stateInfo\\\":\\\"{\\\\\\\"RegisteredPhoneNum\\\\\\\":\\\\\\\"6464646464\\\\\\\",\\\\\\\"AadharDOB\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"Dob\\\\\\\":\\\\\\\"2000-02-10\\\\\\\",\\\\\\\"hiddenAccountRelatedServicesConsentCheckboxValue\\\\\\\":\\\\\\\"Y\\\\\\\",\\\\\\\"hiddenOtherRelatedServicesConsentCheckboxValue\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"KYCChoice\\\\\\\":\\\\\\\"AadharKYC\\\\\\\",\\\\\\\"AadharConsentLanguage\\\\\\\":\\\\\\\"English\\\\\\\",\\\\\\\"AadharAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"AadharAddressResidenceType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"AadharAddressResidenceStatus\\\\\\\":\\\\\\\"Resident\\\\\\\",\\\\\\\"hiddenAadharResType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"hiddenOtherResType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"CurrentAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"CurrentAddressResidenceType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"CurrentAddressResidenceStatus\\\\\\\":\\\\\\\"Resident\\\\\\\",\\\\\\\"CommunicationAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"IsTaxAddressFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"PermanentAddressCountry\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"isTaxAddressForOVD\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"EmploymentType\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"SourceOfFund\\\\\\\":\\\\\\\"2\\\\\\\",\\\\\\\"SelfEmploymentYear\\\\\\\":\\\\\\\"00\\\\\\\",\\\\\\\"SelfEmploymentMonth\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"pepConsent\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"IndianNationalFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"TaxResidentFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"hiddenEmpTypeValue\\\\\\\":\\\\\\\"Salaried\\\\\\\",\\\\\\\"hiddenSourceOfFundsValue\\\\\\\":\\\\\\\"Salary\\\\\\\",\\\\\\\"gigaCreditCardConsent\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"razorPayConsentFlag\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"professionalCategory\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"monthlyCredits\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"DeclareNomineeFlag\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"NomineeAddressState\\\\\\\":\\\\\\\"State\\\\\\\",\\\\\\\"CountryOfBirth\\\\\\\":\\\\\\\"INDIA\\\\\\\",\\\\\\\"hiddenDeclareNominee\\\\\\\":\\\\\\\"Yes\\\\\\\",\\\\\\\"RegisterForThirdPartyTransferCheckBox\\\\\\\":\\\\\\\"1\\\\\\\",\\\\\\\"ApplyForEmailStatementCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"PreviewAddressType\\\\\\\":\\\\\\\"Owned\\\\\\\",\\\\\\\"PreviewPresentAddress\\\\\\\":\\\\\\\"Same as Communication\\\\\\\",\\\\\\\"PreviewNationality\\\\\\\":\\\\\\\"Indian\\\\\\\",\\\\\\\"PreviewTaxResidence\\\\\\\":\\\\\\\"Indian\\\\\\\",\\\\\\\"KYCDocumentSelected\\\\\\\":\\\\\\\"AADHAR\\\\\\\",\\\\\\\"IDProofSelected\\\\\\\":\\\\\\\"AADHAR\\\\\\\",\\\\\\\"VideoKYCCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"ProperMobileNetworkCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"KeepOriginalPanCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"KeepSheetPenForSignatureCheckBox\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"JourneyRetries\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"AccountNumber\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"addMoneyAttempts\\\\\\\":1,\\\\\\\"VKYCOpenTime\\\\\\\":\\\\\\\"10:00\\\\\\\",\\\\\\\"VKYCCloseTime\\\\\\\":\\\\\\\"23:59\\\\\\\",\\\\\\\"hiddenCreditsDropDownList\\\\\\\":\\\\\\\"Please Select\\\\\\\",\\\\\\\"hiddenProfessionalCategoryDropdown\\\\\\\":\\\\\\\"Please Select\\\\\\\",\\\\\\\"privacyPolicyAccepted\\\\\\\":\\\\\\\"true\\\\\\\",\\\\\\\"aadhaarConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"VKYCConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"fundingConsentAccepted\\\\\\\":\\\\\\\"false\\\\\\\",\\\\\\\"hiddenUTMParams\\\\\\\":\\\\\\\"?dataRef=service://HDFCFormsDefaultPrefillService/RETRY\\\\\\\",\\\\\\\"ReturnJourneyId\\\\\\\":\\\\\\\"noValue\\\\\\\",\\\\\\\"existingCustomer\\\\\\\":\\\\\\\"N\\\\\\\",\\\\\\\"customerNamePrefix\\\\\\\":\\\\\\\"M\\\\\\\",\\\\\\\"fullName\\\\\\\":\\\\\\\"ABCD DEF\\\\\\\"}\\\",\\\"state\\\":\\\"CUSTOMER_LEAD_QUALIFIED\\\",\\\"timeinfo\\\":\\\"2025-04-15T23:56:33.354Z\\\"}],\\\"channel\\\":\\\"ADOBE WEBFORMS\\\",\\\"journeyID\\\":\\\"1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB\\\"}}},\\\"emailId\\\":\\\"\\\",\\\"officialEmailId\\\":\\\"\\\",\\\"journeyUpdateStatus\\\":true,\\\"DemogAPI_Address1\\\":\\\"\\\",\\\"DemogAPI_Address2\\\":\\\"\\\",\\\"DemogAPI_Address3\\\":\\\"\\\",\\\"DemogAPI_Pin\\\":\\\"\\\",\\\"DemogAPI_City\\\":\\\"\\\",\\\"DemogAPI_State\\\":\\\"\\\",\\\"namePercentage\\\":\\\"\\\",\\\"schemaName\\\":\\\"InstaSavings\\\",\\\"formRedirectURL\\\":\\\"/content/forms/af/hdfc/hdfc_savings_forms/forms/insta_savings/instasavingsform.html?dataRef=service://HDFCFormsDefaultPrefillService/\\\",\\\"aadharEKYC\\\":\\\"Y\\\",\\\"aadharNo\\\":\\\"\\\",\\\"aadharRefNo\\\":\\\"\\\",\\\"RRN\\\":\\\"\\\",\\\"validPAN\\\":\\\"N\\\",\\\"fName\\\":\\\"ABCD\\\",\\\"mName\\\":\\\"\\\",\\\"lName\\\":\\\"DEF\\\",\\\"oneAadhaarOneAcStatus\\\":\\\"N\\\",\\\"aadharPanLink\\\":\\\"\\\",\\\"panAadharLinkingFlag\\\":\\\"\\\",\\\"validEmployerName\\\":false,\\\"aadharAddressState\\\":\\\"\\\",\\\"fullName\\\":\\\"\\\",\\\"onePanOneAccexistingUser\\\":\\\"\\\",\\\"isGigaCard\\\":\\\"N\\\",\\\"isAccountCreated\\\":\\\"No\\\",\\\"ccAvenueLeadNumber\\\":\\\"\\\",\\\"paymentCheckPollingFlag\\\":\\\"\\\",\\\"professionalTypeDropdownGIGA\\\":\\\"\\\",\\\"hiddenAadharDocuments\\\":\\\"\\\",\\\"ucicCheck\\\":false,\\\"crosscoreCheck\\\":false,\\\"corporateSalary\\\":\\\"N\\\",\\\"crosscore\\\":{\\\"requestType\\\":\\\"\\\",\\\"decision\\\":\\\"\\\",\\\"clientReferenceId\\\":\\\"\\\",\\\"decisionSourceHunter\\\":\\\"\\\",\\\"decisionSourceFraudNet\\\":\\\"\\\",\\\"errorMssg\\\":\\\"\\\"},\\\"panNameDobMatchCount\\\":\\\"3\\\",\\\"hiddenAddMoneyAttempts\\\":1,\\\"accountCreationClickCount\\\":0,\\\"isvkycRedirected\\\":\\\"false\\\",\\\"returnJourneyURL\\\":\\\"/content/forms/af/hdfc/hdfc_savingsunified_url/forms/is_unifiedUrl_form.html\\\",\\\"upiTransactionResponse\\\":\\\"\\\",\\\"callVkycPop\\\":true,\\\"errorCode\\\":\\\"\\\",\\\"errorAPI\\\":\\\"\\\",\\\"lastNameEnablement\\\":\\\"true\\\",\\\"consentManagementEnablement\\\":\\\"true\\\",\\\"XpresswayRedirection\\\":false,\\\"dobValid\\\":\\\"true\\\",\\\"genderType\\\":\\\"Male\\\"}\",\"customerNamePrefix\":\"M\",\"documentUploadCheck\":true,\"existingCustomer\":\"N\",\"formData\":{\"transactionID\":\"1dceee473a4c42358916a53f2021dadfInstaSavings\"},\"fullName\":\"ABCD DEF\",\"fundingConsentAccepted\":\"false\",\"gigaCreditCardConsent\":\"N\",\"hcpPath\":\"/ekyc/\",\"hiddenAadharResType\":\"Owned\",\"hiddenAccountRelatedServicesConsentCheckboxValue\":\"Y\",\"hiddenCreditsDropDownList\":\"Please Select\",\"hiddenDeclareNominee\":\"Yes\",\"hiddenEmpTypeValue\":\"Salaried\",\"hiddenOtherRelatedServicesConsentCheckboxValue\":\"N\",\"hiddenOtherResType\":\"Owned\",\"hiddenProfessionalCategoryDropdown\":\"Please Select\",\"hiddenSourceOfFundsValue\":\"Salary\",\"hiddenUTMParams\":\"?dataRef=service://HDFCFormsDefaultPrefillService/RETRY\",\"isTaxAddressForOVD\":\"1\",\"itemKeys\":[{\"fieldId\":\"FieldID_13576\",\"itemKey\":\"310826487\"},{\"fieldId\":\"FieldID_12205\",\"itemKey\":\"310826488\"}],\"journeyVariant\":\"\",\"leadType\":\"\",\"mobileValReq\":false,\"monthlyCredits\":\"0\",\"oneaadhaarcheck\":\"false\",\"pepConsent\":\"0\",\"privacyPolicyAccepted\":\"true\",\"proceedOnMobileValFail\":false,\"professionalCategory\":\"0\",\"razorPayConsentFlag\":\"N\",\"sendAuthSMS\":\"true\",\"subJourneyName\":\"\",\"terminateOnMobileValFail\":false}",
                    "state": "OTP_VALIDATION_SUCCESS",
                    "timeinfo": "2025-04-15T18:27:56.135Z"
                  }
                ],
                "channel": "DAP",
                "referenceJourneyID": null,
                "journeyID": "1dceee47-3a4c-4235-8916-a53f2021dadf_01_InstaSavings_U_WEB"
              },
              "status": "success"
            }
          };
          break;
        default:
          mockResponse = {
            status: 404,
            error: 'Mock endpoint not found'
          };
      }

      // Simulate network delay
      setTimeout(() => {
        const response = {
          ok: mockResponse.status === 200,
          status: mockResponse.status,
          headers: {
            get: (header) => {
              const headers = {
                'Content-Type': 'application/json'
              };
              return headers[header];
            },
            forEach: (callback) => {
              const headers = {
                'Content-Type': 'application/json'
              };
              Object.entries(headers).forEach(([key, value]) => callback(value, key));
            }
          },
          json: () => Promise.resolve(mockResponse.status === 200 ? mockResponse.data : mockResponse)
        };

        // Detailed response logging
        console.group('[Mock Fetch] Response Details');
        console.log('URL:', url);
        console.log('Status:', response.status);
        console.log('OK:', response.ok);
        console.log('Headers:', { 'Content-Type': 'application/json' });
        console.log('Data:', mockResponse.status === 200 ? mockResponse.data : mockResponse);
        console.groupEnd();

        resolve(response);
      }, 300);
    });
  }
  // For non-HDFC URLs, use original fetch if available
  if (originalFetch) {
    console.group('[Mock Fetch] Using Original Fetch');
    options.mode = 'cors';
    if (options.headers !== undefined) {
      options.headers['Content-Type'] = 'text/plain'
      options.headers.Accept = 'application/json'
    }
    console.log('URL:', url);
    console.log('Options: ', options);
    console.log('Method:', options.method || 'GET');
    console.log('Headers:', options.headers || {});
    console.log('Body:', options.body ? JSON.parse(options.body) : undefined);
    console.groupEnd();
    return originalFetch(url, options);
  }

  // If no original fetch available, return 404
  console.group('[Mock Fetch] No Fetch Available');
  console.log('URL:', url);
  console.log('Method:', options.method || 'GET');
  console.groupEnd();
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: 'Fetch not available in this context' })
  });
}

// Replace fetch in both browser and worker contexts
if (!isHDFCDomain()) {
  if (typeof window !== 'undefined') {
    // Browser context
    window.originalFetch = window.fetch;
    window.fetch = mockFetch;
  } else if (typeof self !== 'undefined') {
    // Worker context
    self.originalFetch = self.fetch;
    self.fetch = mockFetch;
  }
}

// === Enable Real or Mock Fetch ===
const USE_REAL_API  = true;  // true = realtime API; false = mock API

const scope = typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : null); // determining browser context & worker context
if (scope) {
   USE_REAL_API  && (
    scope.fetch = scope.originalFetch || fetch
  );
}
// === End of Mock Fetch Toggle ===

// === Submit URL Override for Specific Journeys ===
// const FORM_KEYS = [
//   { // siccdc - journey
//     submitUrl: 'https://applyonlinedev.hdfcbank.com',
//     journeyKey: 'siccdc',
//   },
//   // Add more form keys if needed in array of object
// ];
// if (scope) {
//    FORM_KEYS?.some((formObj) =>((scope?.location?.pathname?.includes(formObj?.journeyKey)) && setSubmitBaseUrl(formObj?.submitUrl)));
// }
// === End of Submit URL Overrides ===




