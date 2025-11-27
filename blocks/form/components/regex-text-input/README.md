# Regex Text Input Component

A custom form component that validates user input against a regex pattern in real time and prevents users from entering characters that don't match the pattern.

## Features

- Real-time validation against a configurable regex pattern
- Prevents invalid characters from being entered
- Displays customizable error messages
- Extends the standard text input component

## Usage

This component extends the standard text input component and adds regex validation capabilities. It can be used anywhere a regular text input would be used, with the added benefit of enforcing input patterns.

### Configuration Options

In the Universal Editor's property sheet, you can configure:

1. **Regex Pattern** - The regular expression pattern to validate against (e.g., `^[A-Za-z0-9]+$` for alphanumeric characters only)
2. **Error Message** - Custom message to display when input doesn't match the pattern

### Example Use Cases

- **Username fields** - Restrict to alphanumeric characters: `^[A-Za-z0-9]+$`
- **Phone numbers** - Enforce numeric format: `^[0-9]+$`
- **Custom formats** - Any pattern that can be expressed as a regular expression

## How It Works

The component attaches event listeners to the input field that:

1. Check each character as it's typed against the provided regex pattern
2. Remove characters that don't match the pattern
3. Display an error message when invalid input is detected
4. Validate the entire input on blur

## Implementation Details

- The component is built on top of the standard text input component
- It uses JavaScript's RegExp object for pattern matching
- Error messages are displayed inline below the input field
- CSS animations provide visual feedback when validation occurs
