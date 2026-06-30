/**
 * German (Germany) (de-DE).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'
import { DE_DE_DATEPICKER_LOCALE } from '../datepicker-locales/de-DE'

export const deDE: TigerLocale = defineLocale({
  locale: 'de-DE',
  direction: 'ltr',
  datePicker: DE_DE_DATEPICKER_LOCALE,
  common: {
    okText: 'OK',
    cancelText: 'Abbrechen',
    closeText: 'Schließen',
    loadingText: 'Wird geladen...',
    emptyText: 'Keine Daten',
    noMoreText: 'Keine weiteren Daten'
  },
  modal: {
    closeAriaLabel: 'Schließen',
    okText: 'OK',
    cancelText: 'Abbrechen'
  },
  drawer: {
    closeAriaLabel: 'Schließen'
  },
  qrcode: {
    ariaLabel: 'QR-Code',
    expiredText: 'QR-Code abgelaufen',
    refreshText: 'Aktualisieren',
    loadingText: 'Wird geladen...'
  },
  timeline: {
    pendingText: 'Wird geladen...'
  },
  upload: {
    dragAreaAriaLabel: 'Datei per Klick oder Drag-and-drop hochladen',
    buttonAriaLabel: 'Datei hochladen',
    clickToUploadText: 'Zum Hochladen klicken',
    dragAndDropText: 'oder hierher ziehen',
    acceptInfoText: 'Akzeptiert: {accept}',
    maxSizeInfoText: 'Maximale Größe: {maxSize}',
    selectFileText: 'Datei auswählen',
    uploadedFilesAriaLabel: 'Hochgeladene Dateien',
    successAriaLabel: 'Erfolg',
    errorAriaLabel: 'Fehler',
    uploadingAriaLabel: 'Wird hochgeladen',
    removeFileAriaLabel: '{fileName} entfernen',
    previewFileAriaLabel: 'Vorschau von {fileName}'
  },
  pagination: {
    totalText: 'Insgesamt {total} Elemente',
    itemsPerPageText: '/ Seite',
    jumpToText: 'Gehe zu',
    pageText: 'Seite',
    prevPageAriaLabel: 'Vorherige Seite',
    nextPageAriaLabel: 'Nächste Seite',
    pageAriaLabel: 'Seite {page}',
    pageIndicatorText: 'Seite {current} von {total}'
  },
  table: {
    emptyText: 'Keine Daten',
    loadingText: 'Wird geladen',
    expandText: 'Erweitern',
    collapseText: 'Reduzieren',
    selectAllText: 'Alle auswählen',
    selectRowAriaLabel: 'Zeile {row} auswählen',
    sortByText: 'Nach {column} sortieren',
    clearSortText: 'Sortierung löschen',
    toolbarAriaLabel: 'Datentabellen-Werkzeugleiste',
    searchPlaceholder: 'Suchen',
    searchButtonText: 'Suchen',
    selectedText: 'Ausgewählt',
    selectedItemsText: 'Einträge',
    columnSettingsText: 'Spalteneinstellungen',
    columnSettingsAriaLabel: 'Spalteneinstellungen',
    lockColumnAriaLabel: 'Spalte {column} sperren',
    unlockColumnAriaLabel: 'Spalte {column} entsperren'
  },
  formWizard: {
    prevText: 'Zurück',
    nextText: 'Weiter',
    finishText: 'Fertigstellen'
  },
  taskBoard: {
    emptyColumnText: 'Keine Aufgaben',
    addCardText: 'Aufgabe hinzufügen',
    wipLimitText: 'WIP-Limit: {limit}',
    dragHintText: 'Zum Verschieben ziehen',
    boardAriaLabel: 'Aufgabenboard'
  },
  select: {
    doneText: 'Fertigstellen'
  }
})

export default deDE
