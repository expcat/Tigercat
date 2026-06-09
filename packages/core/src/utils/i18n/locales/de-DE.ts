/**
 * German (Germany) (de-DE).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'

export const deDE: TigerLocale = defineLocale({
  locale: 'de-DE',
  direction: 'ltr',
  common: {
    okText: 'OK',
    cancelText: 'Abbrechen',
    closeText: 'Schließen',
    loadingText: 'Wird geladen...',
    emptyText: 'Keine Daten'
  },
  modal: {
    closeAriaLabel: 'Schließen',
    okText: 'OK',
    cancelText: 'Abbrechen'
  },
  drawer: {
    closeAriaLabel: 'Schließen'
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
  }
})

export default deDE
