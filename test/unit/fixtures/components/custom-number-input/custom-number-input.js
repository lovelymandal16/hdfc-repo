// eslint-disable-next-line import/prefer-default-export
export const fieldDef = {
  items: [{
    id: 'custom-numberinput-40db827550',
    fieldType: 'number-input',
    name: 'amount',
    visible: true,
    type: 'number',
    required: true,
    enabled: true,
    readOnly: false,
    placeholder: 'Enter amount',
    default: 1000,
    minimum: 100,
    maximum: 10000,
    displayFormat: '₹#,##0.00',
    enableFormatting: true,
    allowNegative: false,
    label: {
      visible: true,
      value: 'Amount (INR)',
    },
    events: {
      'custom:setProperty': [
        '$event.payload',
      ],
    },
    properties: {
      'afs:layout': {
        tooltipVisible: true,
      },
      'fd:dor': {
        dorExclusion: false,
      },
      'fd:viewType': 'custom-number-input',
      'fd:path': '/content/forms/af/payment-form/jcr:content/guideContainer/numberinput',
    },
    ':type': 'forms-components-examples/components/form/numberinput',
  },
  ],
};
