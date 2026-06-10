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
    emptyText: 'No data'
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
    columnSettingsAriaLabel: 'Column settings'
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
  }
}
