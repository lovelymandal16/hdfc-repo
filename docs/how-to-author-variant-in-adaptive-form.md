# How to Author the "variant" Property in Adaptive Forms

This guide explains how to add and configure the "variant" property for form components in Adaptive Forms, specifically focusing on how to use the document-upload variant with file input components.

## Understanding the "variant" Property

The `variant` property is a special property that allows you to change the appearance and behavior of a form component by applying a different implementation. When you set a variant on a component, the Forms Engine will load the specified variant's JavaScript and CSS instead of (or in addition to) the default component implementation.

## Where to Add the "variant" Property

The `variant` property is added to the `properties` object of a field in your form's JSON definition. Here's where you can add it:

### 1. In the Form JSON Definition

If you're working directly with the form JSON, add the `variant` property to the `properties` object of the field:

```json
{
  "fieldType": "file-input",
  "name": "documentUpload",
  "id": "document-upload-1",
  "label": {
    "value": "Upload Document"
  },
  "properties": {
    "variant": "document-upload",
    "fd:buttonText": "Browse Files"
  }
}
```

### 2. In the AEM Adaptive Forms Editor

If you're using the AEM Adaptive Forms Editor:

1. Select the file input component in the form editor
2. Open the component properties panel (usually on the right side)
3. Look for the "Properties" tab or section
4. Find or add the "variant" property:
   - If there's a dedicated "Variant" field, select "document-upload" from the dropdown
   - If there's a "Custom Properties" or "Additional Properties" section, add a new property:
     - Name: `variant`
     - Value: `document-upload`

### 3. Using the Form Builder API

If you're programmatically creating forms using the Form Builder API:

```javascript
formBuilder.addField({
  fieldType: "file-input",
  name: "documentUpload",
  label: {
    value: "Upload Document"
  },
  properties: {
    variant: "document-upload",
    "fd:buttonText": "Browse Files"
  }
});
```

## Available Variants for File Input

The document-upload variant is now available for file input components. To use it:

1. Add a file input component to your form
2. Set its `variant` property to `document-upload`
3. Configure any additional properties specific to the document-upload variant:
   - `fd:buttonText`: Text for the upload button
   - `dragDropText`: Text for the drag and drop area
   - `maxFileSize`: Maximum allowed file size

## How the Variant System Works

When the Forms Engine renders a form:

1. It processes each field in the form definition
2. For each field, it checks if there's a `variant` property in the field's `properties` object
3. If a variant is specified and it's registered in the system (in `mappings.js`), the engine:
   - Loads the CSS file for the variant (`blocks/form/components/[variant-name]/[variant-name].css`)
   - Loads the JS file for the variant (`blocks/form/components/[variant-name]/[variant-name].js`)
   - Calls the variant's `decorate` function, passing the field element, field definition, container, and form ID

## Example: Complete Form Definition with Document Upload Variant

Here's a complete example of a form definition that includes a file input field with the document-upload variant:

```json
{
  "id": "form1",
  "action": "/api/submit",
  "items": [
    {
      "fieldType": "text-input",
      "name": "name",
      "id": "name",
      "label": {
        "value": "Full Name"
      },
      "required": true
    },
    {
      "fieldType": "file-input",
      "name": "documentUpload",
      "id": "document-upload-1",
      "label": {
        "value": "Upload Document"
      },
      "properties": {
        "variant": "document-upload",
        "fd:buttonText": "Browse Files",
        "dragDropText": "Drag and drop files here",
        "maxFileSize": "5MB",
        "accept": ".pdf,.jpg,.png"
      },
      "required": true,
      "constraintMessages": {
        "accept": "Please upload a valid document type (PDF, JPG, or PNG)",
        "maxFileSize": "File size exceeds the maximum allowed size of 5MB"
      }
    },
    {
      "fieldType": "button",
      "name": "submit",
      "id": "submit",
      "label": {
        "value": "Submit"
      }
    }
  ]
}
```

## Authoring Custom Properties for Variants

If you're creating your own variant, you can define custom properties that authors can configure:

1. Create a JSON schema file for your variant in `blocks/form/models/form-components/`
2. Define the properties you want to expose to authors
3. Reference this schema in your form definition

For example, for the document-upload variant, you might define properties like:

```json
{
  "properties": {
    "fd:buttonText": {
      "type": "string",
      "title": "Button Text",
      "description": "Text to display on the upload button"
    },
    "dragDropText": {
      "type": "string",
      "title": "Drag & Drop Text",
      "description": "Text to display in the drag and drop area"
    },
    "maxFileSize": {
      "type": "string",
      "title": "Maximum File Size",
      "description": "Maximum allowed file size (e.g., '5MB')"
    }
  }
}
```

## Testing Your Variant

After adding the variant property to your form field:

1. Preview the form in the AEM Forms editor
2. Check that the document-upload component is loaded correctly
3. Test the file upload functionality to ensure it works as expected

## Troubleshooting

If your variant isn't loading correctly:

- Check that the variant name is spelled correctly in the `variant` property
- Verify that the variant is registered in `mappings.js`
- Check the browser console for any errors during component loading
- Ensure the variant's JS and CSS files are in the correct location
