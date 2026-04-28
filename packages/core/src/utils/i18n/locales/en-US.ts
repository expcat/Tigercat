/**
 * English (en-US) — default locale for Tigercat UI.
 */

import type { TigerLocale } from '../../../types/locale'

export const enUS: TigerLocale = {
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
    pageAriaLabel: 'Page {page}'
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
