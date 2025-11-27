# How to Author a File Input Variant in Forms Engine

This guide explains how to create a custom variant for the file input component in the Forms Engine.

## Understanding Variants

In the Forms Engine, variants allow you to create specialized versions of existing components with enhanced functionality or different styling. The variant system works by:

1. Registering the variant name in the custom components list
2. Creating component files (JS and CSS) for the variant
3. Using the variant property in the form field definition

## Step 1: Create the Component Files

First, create a directory for your variant in the components folder:

```bash
mkdir -p blocks/form/components/your-variant-name
```

### Create the JavaScript File

Create a file named `your-variant-name.js` in the directory:

```javascript
import { updateOrCreateInvalidMsg, stripTags } from '../../util.js';
import { fileAttachmentText, dragDropText, defaultErrorMessages } from '../../constant.js';

/**
 * Decorates the file input component with your custom variant functionality
 * @param {HTMLElement} fieldDiv - Field container element
 * @param {Object} field - Field configuration object
 * @param {HTMLFormElement} htmlForm - Form element
 * @returns {HTMLElement} Decorated field element
 */
export default async function decorate(fieldDiv, field, htmlForm) {
  // Your custom implementation here
  // You can reuse code from the base file component or create entirely new functionality
  
  // Example: Add a custom class to the field
  fieldDiv.classList.add('decorated', 'your-variant-name-component');
  
  // Implement your custom file handling logic
  // ...
  
  return fieldDiv;
}
```

### Create the CSS File

Create a file named `your-variant-name.css` in the directory:

```css
/* Your variant-specific styles */
.your-variant-name-component {
  /* Custom styles */
}

/* Override or extend the base file component styles as needed */
```

## Step 2: Register Your Variant

Add your variant name to the `customComponents` array in `blocks/form/mappings.js`:

```javascript
let customComponents = ['dynamic-dropdown', 'dynamic-text', /* other components */, 'your-variant-name'];
```

## Step 3: Implementation Strategies

### Option 1: Extend the Base File Component

If your variant is similar to the base file component with some enhancements, you can import and reuse the base component's functionality:

```javascript
import baseFileDecorate from '../file/file.js';

export default async function decorate(fieldDiv, field, htmlForm) {
  // First apply the base file component decoration
  await baseFileDecorate(fieldDiv, field, htmlForm);
  
  // Then add your custom enhancements
  // For example, add custom styling or behavior
  fieldDiv.classList.add('your-variant-name-component');
  
  // Add custom event listeners or modify the DOM
  // ...
  
  return fieldDiv;
}
```

### Option 2: Create a Completely Custom Implementation

If your variant needs a completely different implementation:

```javascript
export default async function decorate(fieldDiv, field, htmlForm) {
  // Your custom implementation
  const input = fieldDiv.querySelector('input');
  
  // Create custom UI elements
  const customUI = document.createElement('div');
  customUI.className = 'your-variant-name-ui';
  // Add your custom UI elements
  
  // Set up event handlers
  input.addEventListener('change', (event) => {
    // Handle file selection
  });
  
  // Replace or enhance the default input
  fieldDiv.appendChild(customUI);
  
  return fieldDiv;
}
```

## Step 4: Component Loading Mechanism

Understanding how components are loaded:

1. When a form field with `fieldType: "file-input"` is encountered, the base file component is loaded.
2. If the field has a `properties.variant` value that matches a name in the `customComponents` array, that variant component is loaded.
3. The component decorator loads both the CSS and JS for the variant.

## Example: Complete Variant Implementation

Here's a complete example of a custom file input variant:

### JavaScript (blocks/form/components/custom-file/custom-file.js)

```javascript
import { updateOrCreateInvalidMsg, stripTags } from '../../util.js';
import { fileAttachmentText, dragDropText, defaultErrorMessages } from '../../constant.js';

function createCustomUI(wrapper, field) {
  const input = wrapper.querySelector('input');
  const customUI = document.createElement('div');
  customUI.className = 'custom-file-ui';
  
  // Create custom button
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'custom-file-button';
  button.textContent = field?.properties?.buttonText || 'Select File';
  button.addEventListener('click', () => input.click());
  
  // Create file display area
  const fileDisplay = document.createElement('div');
  fileDisplay.className = 'custom-file-display';
  
  customUI.appendChild(button);
  customUI.appendChild(fileDisplay);
  
  // Hide the original input
  input.style.display = 'none';
  
  // Handle file selection
  input.addEventListener('change', () => {
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      fileDisplay.textContent = `${file.name} (${formatFileSize(file.size)})`;
      fileDisplay.classList.add('has-file');
    } else {
      fileDisplay.textContent = '';
      fileDisplay.classList.remove('has-file');
    }
  });
  
  wrapper.appendChild(customUI);
  return customUI;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default async function decorate(fieldDiv, field, htmlForm) {
  // Add decorated class
  fieldDiv.classList.add('decorated', 'custom-file-component');
  
  // Create custom UI
  createCustomUI(fieldDiv, field);
  
  return fieldDiv;
}
```

### CSS (blocks/form/components/custom-file/custom-file.css)

```css
.custom-file-component {
  margin-bottom: 20px;
}

.custom-file-ui {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-file-button {
  background-color: #1c3fca;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
}

.custom-file-button:hover {
  background-color: #152d94;
}

.custom-file-display {
  padding: 8px;
  min-height: 20px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  flex-grow: 1;
}

.custom-file-display.has-file {
  border-style: solid;
  border-color: #1c3fca;
  background-color: #f0f4ff;
}
```

### Registration in mappings.js

```javascript
let customComponents = ['dynamic-dropdown', 'dynamic-text', /* other components */, 'custom-file'];
```

## Using Your Variant in a Form

Once your variant is implemented and registered, you can use it in a form by setting the `variant` property:

```json
{
  "fieldType": "file-input",
  "name": "documentFile",
  "id": "document-file",
  "label": {
    "value": "Upload Document"
  },
  "properties": {
    "variant": "your-variant-name",
    "buttonText": "Choose File"
  }
}
```

## Testing Your Variant

To test your variant:

1. Add a field with your variant to a form
2. Check the browser console for any errors during component loading
3. Verify that your custom styles are applied
4. Test the file upload functionality to ensure it works as expected

## Debugging Tips

- If your variant isn't loading, check that the name is correctly added to the `customComponents` array
- Verify that your JS and CSS files are in the correct location and named properly
- Check the browser console for any errors during component loading
- Use browser developer tools to inspect the DOM and see if your classes are being applied
