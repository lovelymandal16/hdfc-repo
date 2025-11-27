/* eslint-disable max-len */
import { subscribe } from '../../rules/index.js';
import { getSubmitBaseUrl } from '../../constant.js';
import { encrypt, decrypt } from '../../functions.js';

let leadId;
let globalStateTracker = [];
let initial = true;
let unBoundDataFromJourneyCall = null;

/**
 * Returns a copy of the form data with specific fields cleared (set to empty string),
 * based on the paths provided in the global `unBoundDataFromJourneyCall` string.
 *
 * Supports:
 * - Simple field paths like 'user.email'
 * - Array paths like 'profile.contacts[*][role,regex]' to clear fields inside each object in the array
 *
 * @param {Object} formData - The form data to process.
 * @returns {Object} - A new form data object with selected fields cleared.
 *
 * @example
 * For: unBoundDataFromJourneyCall = 'user.email+profile.name'
 * const formData = {
 *   user: { email: 'test@example.com', id: 123 },
 *   profile: { name: 'John', age: 30 }
 * };
 *
 * const result = createWithUnbound(formData);
 * result = {
 *    user: { email: '', id: 123 },
 *    profile: { name: '', age: 30 }
 *  }
 *
 * @example
 * For: unBoundDataFromJourneyCall = 'profile.contacts[*][role,regex]'
 * const formData = {
 *   profile: {
 *     contacts: [
 *       { role: 'admin', regex: '.*admin.*', name: 'Alice' },
 *       { role: 'user', regex: '.*user.*', name: 'Bob' }
 *     ]
 *   }
 * };
 *
 * const result = createWithUnbound(formData);
 *  result = {
 *    profile: {
 *      contacts: [
 *       { role: '', regex: '', name: 'Alice' },
 *       { role: '', regex: '', name: 'Bob' }
 *      ]
 *    }
 *  }
 */

const createWithUnbound = (formData = {}) => {
  try {
    const unboundList = unBoundDataFromJourneyCall?.split('+') || [];
    const data = { ...formData };
    unboundList.forEach((path) => {
      const arrayPatternMatch = path.match(/(.*?)\[\*\]\[(.*)\]/);
      if (arrayPatternMatch) {
        // Handles: profile.name[*][role,regex]
        const basePath = arrayPatternMatch[1]; // "profile.name"
        const fields = arrayPatternMatch[2].split(',').map((k) => k.trim());

        const properties = basePath
          .replace(/\[/g, '.')
          .replace(/\]/g, '')
          .split('.')
          .filter(Boolean);

        let current = data;
        properties.forEach((key) => {
          if (!current[key]) current[key] = [];
          current = current[key];
        });

        if (Array.isArray(current)) {
          current.forEach((item) => {
            fields.forEach((field) => {
              item[field] = '';
            });
          });
        }
      } else {
        // Handles: user.email or profile.name
        const properties = path
          .replace(/\[/g, '.')
          .replace(/\]/g, '')
          .split('.')
          .filter(Boolean);

        let current = data;
        properties.slice(0, -1).forEach((key) => {
          if (current[key] === undefined || typeof current[key] !== 'object') {
            current[key] = {};
          }
          current = current[key];
        });
        current[properties.at(-1)] = '';
      }
    });
    return data;
  } catch {
    return formData;
  }
};

/**
 * Creates journey state info array from states array
 * @param {Array} states - Array of state names
 * @param {Object} data - Form data to include in stateInfo
 * @returns {Array} Array of journey state objects
 */
function createJourneyStateInfo(states = [], data = {}) {
  const formData = unBoundDataFromJourneyCall ? createWithUnbound(data) : data;

  if (!states || !Array.isArray(states) || states.length === 0) {
    return globalStateTracker;
  }

  const currentTime = new Date().toISOString();
  const newStateEntries = states.map((state) => ({
    stateInfo: JSON.stringify(formData),
    state,
    timeinfo: currentTime,
  }));

  globalStateTracker = [...globalStateTracker, ...newStateEntries];
  return newStateEntries;
}

/**
 * Makes a fetch request to the specified URL with the given payload
 * @param {string} url - The URL to fetch
 * @param {Object} payload - The payload to send in the request body
 * @returns {Promise} - The fetch promise
 */
async function triggerFetch(url, payload) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        console.error(`API call to ${url} failed:`, response.statusText);
        throw new Error(`API call failed: ${response.statusText}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error(`Error calling API ${url}:`, error);
      throw error;
    });
}

/**
 * Makes a fetch request with encrypted payload and decrypts the response
 * Uses a mutex to prevent parallel encryption operations
 * @param {string} url - The URL to fetch
 * @param {Object} payload - The payload to encrypt and send
 * @returns {Promise<Object|null>} - Resolves to decrypted response data or null on failure
 * @throws Will throw an error if encryption or fetch fails
 */
async function triggerEncFetch(url, payload) {
  try {
    const requestData = {
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Acquire encryption lock to serialize encryption calls
    //await encryptionMutex.lock();

    const encryptedData = await encrypt(requestData);
      // Always release the lock regardless of encrypt success/failure
      //encryptionMutex.unlock();

    const response = await fetch(url, {
      method: 'POST',
      headers: encryptedData.headers,
      body: encryptedData.body,
    });

    if (!response.ok) {
      console.error(`Encrypted API call to ${url} failed:`, response.statusText);
      throw new Error(`API call failed: ${response.statusText}`);
    }

    let responseData;
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Decrypt and parse JSON response
    const decrypted = await decrypt(responseData, encryptedData);
    return JSON.parse(decrypted);
  } catch (error) {
    console.warn('Encrypted request failed:', error);
    // You can choose to throw or return null/fallback here
    return null;
  }
}

// Mutex to serialize encryption operations
const encryptionMutex = {
  locked: false,
  queue: [],

  async lock() {
    if (this.locked) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.locked = true;
  },

  unlock() {
    this.locked = false;
    if (this.queue.length > 0) {
      const nextResolve = this.queue.shift();
      nextResolve();
    }
  },
};


async function triggerJourneyAPI(data, states, form, type) {
  const { RegisteredPhoneNum, AadharDOB } = data;
  const { browserAgent, journeyId, journeyName, mob } = form?.properties || {};
  if (form?.properties?.strayFormDataList) {
    // In form authoring, ensure `strayFormDataList` is configured in form properties
    unBoundDataFromJourneyCall = form?.properties?.strayFormDataList;
  }
  const leadProfile = {
    profile: {
      dob: AadharDOB || '',
    },
    mobileNumber: (RegisteredPhoneNum || mob || '').toString() || '',
  };
  leadId = form.properties?.leadProfileID || form.properties?.leadProfileId;
  if (leadId) {
    leadProfile.leadProfileId = leadId;
    /* leadProfileId is created as text filed along with schema */
    data.leadProfileId = leadId;
  }

  const payload = {
    RequestPayload: {
      userAgent: browserAgent,
      leadProfile,
      formData: {
        journeyName,
        journeyStateInfo: createJourneyStateInfo(states, data),
        channel: 'ADOBE WEBFORMS',
        journeyID: journeyId,
        isExisitingCustomer: form?.properties?.isExistingCustomer,
      },
    },
  };
  const url = type === 'dropoff' ? `${getSubmitBaseUrl()}/content/hdfc_commonforms/api/journeydropoff.json` : `${getSubmitBaseUrl()}/content/hdfc_commonforms/api/journeydropoffupdate.json`;
  let responseData;
  if (data?.security?.enabled === 'true') {
    responseData = await triggerEncFetch(url, payload);
  } else {
    responseData = await triggerFetch(url, payload);
  }
  // Store leadProfileId from response if not already set
  if (!leadId && responseData?.lead_profile_info?.leadProfileId) {
    leadId = responseData.lead_profile_info.leadProfileId;
    // todo : How do we set leadId to the form property
    form.properties.leadProfileId = leadId.toString();
  }
  return responseData;
}

// state button invokes the journeydropoff API when navigating to subsequent panels.
// sometimes state is updated based on the response of someother API so we rely
// on the propertyChange of successState or errorState for API invocation.
// But there are cases where when the button is clicked the state is updated,
// so there should be an currentState property
// on button that can be set via authoring or dynamically based on  user action on the form.
export default function decorate(element, fd, container, formId) {
  subscribe(element, formId, (_element, fieldModel) => {
    const { form } = fieldModel;
    fieldModel.subscribe((e) => {
      const { changes } = e?.payload || {};
      changes?.forEach((change) => {
        if (change?.propertyName.includes('properties')) {
          const { currentValue } = change;
          if (currentValue && Boolean(currentValue?.trim())) {
            if(location.href.includes("customer") || location.href.includes('RM_PERFIOS') || location.href.includes('jid')){
              initial = false;
            }
            if (initial) {
              initial = false;
              triggerJourneyAPI(form.exportData(), [currentValue], form, 'dropoff');
            } else {
              triggerJourneyAPI(form.exportData(), [currentValue], form, 'dropoffupdate');
            }
          }
        }
      });
    }, 'change');
  });

  return element;
}
