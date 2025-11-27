/** ***********************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 *
 * Adobe permits you to use and modify this file solely in accordance with
 * the terms of the Adobe license agreement accompanying it.
 ************************************************************************ */

/**
 * Loads a custom CSS file dynamically for a specific form
 * @param {string} customCssPath - The path to the custom CSS file
 * @param {string} codeBasePath - The base path for the code
 */
export default async function loadCustomCss(customCssPath, codeBasePath) {
  try {
    if (!customCssPath) {
      return;
    }

    // Construct the full CSS path
    const fullCssPath = codeBasePath ? `${codeBasePath}${customCssPath}` : customCssPath;

    // Check if the CSS file is already loaded to avoid duplicates
    const existingLink = document.querySelector(`link[href="${fullCssPath}"]`);
    if (existingLink) {
      console.log(`Custom CSS already loaded: ${fullCssPath}`);
      return;
    }

    // Create a link element to load the CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fullCssPath;
    link.type = 'text/css';

    // Add a data attribute to identify custom form CSS
    link.dataset.customFormCss = 'true';

    // Add the link element to the document head
    document.head.appendChild(link);

    console.log(`Custom CSS loaded successfully: ${fullCssPath}`);
  } catch (e) {
    console.error(`Error occurred while loading custom CSS: ${e.message}`);
  }
}

