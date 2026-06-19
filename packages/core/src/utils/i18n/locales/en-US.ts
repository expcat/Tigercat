/**
 * English (en-US) — default locale for Tigercat UI.
 */

import type { TigerLocale } from '../../../types/locale'

export const enUS: TigerLocale = {
  locale: 'en-US',
  direction: 'ltr',
  common: {
    okText: 'OK',
    cancelText: 'Cancel',
    closeText: 'Close',
    loadingText: 'Loading...',
    emptyText: 'No data',
    searchPlaceholder: 'Search',
    clearText: 'Clear'
  },
  modal: {
    closeAriaLabel: 'Close',
    okText: 'OK',
    cancelText: 'Cancel'
  },
  drawer: {
    closeAriaLabel: 'Close'
  },
  pagination: {
    totalText: 'Total {total} items',
    itemsPerPageText: '/ page',
    jumpToText: 'Go to',
    pageText: 'page',
    prevPageAriaLabel: 'Previous page',
    nextPageAriaLabel: 'Next page',
    pageAriaLabel: 'Page {page}',
    pageIndicatorText: 'Page {current} of {total}'
  },
  table: {
    emptyText: 'No data',
    loadingText: 'Loading',
    expandText: 'Expand',
    collapseText: 'Collapse',
    selectAllText: 'Select all',
    selectRowAriaLabel: 'Select row {row}',
    sortByText: 'Sort by {column}',
    clearSortText: 'Clear sort',
    toolbarAriaLabel: 'Data table toolbar',
    searchPlaceholder: 'Search',
    searchButtonText: 'Search',
    selectedText: 'Selected',
    selectedItemsText: 'items',
    columnSettingsText: 'Column settings',
    columnSettingsAriaLabel: 'Column settings',
    lockColumnAriaLabel: 'Lock column {column}',
    unlockColumnAriaLabel: 'Unlock column {column}'
  },
  formWizard: {
    prevText: 'Previous',
    nextText: 'Next',
    finishText: 'Finish'
  },
  taskBoard: {
    emptyColumnText: 'No tasks',
    addCardText: 'Add task',
    wipLimitText: 'WIP limit: {limit}',
    dragHintText: 'Drag to move',
    boardAriaLabel: 'Task Board'
  },
  formValidation: {
    required: 'This field is required',
    typeString: 'Value must be a string',
    typeNumber: 'Value must be a number',
    typeBoolean: 'Value must be a boolean',
    typeArray: 'Value must be an array',
    typeObject: 'Value must be an object',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    date: 'Please enter a valid date',
    idCard: 'Please enter a valid ID card number',
    minLength: 'Minimum length is {min} characters',
    maxLength: 'Maximum length is {max} characters',
    minValue: 'Minimum value is {min}',
    maxValue: 'Maximum value is {max}',
    minItems: 'Minimum {min} items required',
    maxItems: 'Maximum {max} items allowed',
    patternMismatch: 'Value does not match the required pattern',
    validatorFailed: 'Validation failed',
    validatorError: 'Validation error occurred'
  }
}
