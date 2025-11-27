# Assisted Journey Analytics Implementation

This folder contains the complete analytics implementation for assisted journeys (including XPL Assisted), following the same architectural patterns as the SICCDC analytics system.

## 📁 File Structure

```
assets/assisted_journey/
├── analytics.js           # Main orchestrator (entry point)
├── analytics-actions.js   # Page load & click event handlers
├── analytics-constant.js  # Data schemas & configurations
├── analytics-utils.js     # Helper functions & API response evaluation
└── README.md             # This documentation
```

## 🎯 Key Features

### ✅ **Complete Data Capture**
- **Page Loads**: All required fields captured on every page load
- **Button Clicks**: All required fields captured on every button/link click
- **API Responses**: Success/failure evaluation with error handling
- **Offer Details**: AP Offer and Bureau Offer data always included

### ✅ **Required Data Points (All Events)**
```javascript
digitalData.page.pageInfo.pageName     // Page where event occurred
digitalData.user.journeyID             // Journey identifier
digitalData.user.journeyName           // Always "XPL Assisted"
digitalData.user.journeyLevel2         // Sub-journey level
digitalData.user.journeyState          // Current journey state
digitalData.user.casa                  // CASA status
digitalData.form.name                  // Always "assisted_journey"
digitalData.formDetails.apOffer        // AP offer details
digitalData.formDetails.bureauOffer    // Bureau offer details

// Additional for Button Clicks:
digitalData.link.linkName              // Button/link name
digitalData.link.linkType              // Button/link type
digitalData.link.linkPosition          // Position on page
```

## 🔄 **Usage Instructions**

### **1. Form Configuration**
```javascript
// In your Assisted Journey form authoring
{
  "analyticsFilePath": "../../../../assets/assisted_journey/analytics.js",
  "onLoad": "loadAnalytics",
  "triggerEventName": "initialLoad"  // or "offerPageLoad", "customerDetailsLoad", etc.
}
```

### **2. Button Configuration**
```javascript
// Set in button properties
{
  "triggerEventName": "acceptOffer"  // or "submitDetails", "completeVerification", etc.
}

// Then use setFieldProperty and dispatchEvent for UI clicks
setFieldProperty('analytics', 'triggerEventName', 'acceptOffer');
dispatchEvent(new CustomEvent('sendAnalytics'));
```

### **3. API Integration**
API calls automatically trigger analytics when they complete. No additional configuration needed.

## 📊 **Journey States**

The system tracks user progress through these predefined states:

```
XPL_JOURNEY_INITIATED
    ↓
XPL_OFFER_REQUESTED
    ↓
XPL_OFFER_ACCEPTED
    ↓
XPL_DETAILS_SUBMITTED
    ↓
XPL_VERIFICATION_COMPLETE
    ↓
XPL_APPLICATION_COMPLETE
```

## 🎯 **Event Types Supported**

### **Page Load Events**
- `initialLoad` - Landing page load
- `offerPageLoad` - Offer page load
- `customerDetailsLoad` - Customer details page load
- `verificationLoad` - Verification page load
- `confirmationLoad` - Confirmation page load
- `reloadAfterOfferApi` - Page reload after offer API
- `reloadAfterSubmitDetails` - Page reload after details submission
- `reloadAfterVerification` - Page reload after verification

### **Click Events**
- `proceedToOffer` - Navigate to offer page
- `acceptOffer` - Accept loan offer
- `rejectOffer` - Reject loan offer
- `submitDetails` - Submit customer details
- `editDetails` - Edit customer details
- `completeVerification` - Complete verification process
- `viewOfferDetails` - View offer details
- `termsAndConditions` - View terms & conditions
- `privacyPolicy` - View privacy policy
- `backButton` - Navigate back

### **API Events**
- `proceedToOffer-xpl-offer-api.json-click`
- `acceptOffer-xpl-accept-api.json-click`
- `submitDetails-xpl-submit-api.json-click`
- `completeVerification-xpl-verify-api.json-click`

## 🔧 **Configuration Details**

### **CLICK_CONFIG**
Defines button/link properties:
```javascript
acceptOffer: {
  linkType: 'button',
  linkName: 'Accept Offer',
  linkPosition: 'Form Bottom',
  pageName: 'XPL Assisted - Offer Page',
  nextPage: 'XPL Assisted - Customer Details',
  journeyStateSuccessCase: 'XPL_OFFER_ACCEPTED',
  journeyStateFailureCase: 'XPL_OFFER_ACCEPTANCE_FAILURE',
  errorPage: 'Error Page',
}
```

### **LOAD_CONFIG**
Defines page load properties:
```javascript
offerPageLoad: {
  journeyStateSuccessCase: 'XPL_OFFER_DISPLAYED',
  journeyStateFailureCase: 'XPL_OFFER_FAILURE',
  pageName: 'XPL Assisted - Offer Page',
  errorPage: 'Error Page',
}
```

## 🎯 **Data Flow Examples**

### **Page Load Flow**
```
1. User loads page
2. Analytics component calls: triggerAnalytics(event, form, 'onLoad')
3. Main analytics processes load event
4. sendPageloadEvent() called with journey state and page name
5. Digital data populated with all required fields
6. window._satellite.track('pageload') sends to Adobe Analytics
```

### **Button Click Flow**
```
1. User clicks button
2. Analytics component calls: triggerAnalytics(event, form, 'click')
3. Main analytics processes click event
4. sendClickAnalytics() called with event type and journey state
5. Digital data populated with all required fields + link details
6. window._satellite.track('submit') sends to Adobe Analytics
7. After 1 second: Auto-trigger next page load event
```

## 🛠️ **Customization**

### **Adding New Events**
1. Add configuration to `CLICK_CONFIG` or `LOAD_CONFIG` in `analytics-constant.js`
2. Add event handling in `analytics-actions.js` if custom logic needed
3. Add API response evaluation in `analytics-utils.js` if API involved

### **Adding New Data Points**
1. Update `DIGITAL_DATA_SCHEMA` in `analytics-constant.js`
2. Update data population in `setGenericClickProp` or `setGenericLoadProp`
3. Add page-specific logic in `sendPageloadEvent` or `sendClickAnalytics`

## 🔍 **Debugging**

### **Console Logs**
The system includes console warnings for unknown action types:
```javascript
console.warn(`XPL Analytics: Unknown action type: ${actionType}`);
```

### **Data Validation**
Use browser developer tools to inspect `window.digitalData` before analytics calls.

### **Adobe Analytics Verification**
Check Adobe Analytics debugger or network tab for `_satellite.track()` calls.

## 🚀 **Benefits**

1. **Consistent Data**: All events capture the same core data structure
2. **Automatic Navigation**: Page transitions tracked automatically
3. **Error Handling**: API failures and errors properly tracked
4. **Flexible Configuration**: Easy to add new events and data points
5. **Separation of Concerns**: Clean architecture with focused responsibilities
6. **Reusable Utilities**: Helper functions for common operations

## 📝 **Notes**

- This implementation is completely independent from SICCDC analytics
- Follows the same architectural patterns for consistency
- All required data points from the specification are captured
- Supports both simple UI clicks and API-integrated actions
- Automatic error handling and fallback scenarios included
- Ready for production use with comprehensive documentation
