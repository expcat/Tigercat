/**
 * German (Germany) (de-DE).
 */

import type { TigerLocale } from '../../../types/locale'
import { DE_DE_DATEPICKER_LOCALE } from '../datepicker-locales/de-DE'

export const deDE: TigerLocale = {
  locale: 'de-DE',
  direction: 'ltr',
  datePicker: DE_DE_DATEPICKER_LOCALE,
  common: {
    okText: 'OK',
    cancelText: 'Abbrechen',
    closeText: 'Schließen',
    loadingText: 'Wird geladen...',
    emptyText: 'Keine Daten',
    noMoreText: 'Keine weiteren Daten',
    searchPlaceholder: 'Suchen',
    clearText: 'Löschen',
    closeMessageAriaLabel: 'Nachricht schließen',
    closeNotificationAriaLabel: 'Benachrichtigung schließen',
    sidebarAriaLabel: 'Seitenleiste'
  },
  empty: {
    noData: 'Keine Daten',
    noDataAvailable: 'Keine Daten verfügbar',
    noResults: 'Keine Ergebnisse',
    error: 'Etwas ist schiefgelaufen'
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
    expiredText: 'QR-Code ist abgelaufen',
    refreshText: 'Aktualisieren',
    loadingText: 'Wird geladen...'
  },
  marquee: {
    ariaLabel: 'Laufender Inhalt'
  },
  image: {
    previewAriaLabel: 'Vorschau von {alt}',
    previewFallbackAlt: 'Bild',
    groupAriaLabel: 'Bildgruppe'
  },
  imageCompare: {
    ariaLabel: 'Bildvergleich'
  },
  descriptions: {
    colon: ':'
  },
  list: {
    avatarAlt: 'Profilbild',
    dragHandleAriaLabel: 'Neu anordnen'
  },
  scrollArea: {
    ariaLabel: 'Scrollbereich'
  },
  printLayout: {
    pageBreak: 'Seitenumbruch'
  },
  timeline: {
    pendingText: 'Wird geladen...'
  },
  upload: {
    dragAreaAriaLabel: 'Datei per Klick oder Ziehen hochladen',
    buttonAriaLabel: 'Datei hochladen',
    clickToUploadText: 'Zum Hochladen klicken',
    dragAndDropText: 'oder per Drag-and-drop',
    acceptInfoText: 'Erlaubt: {accept}',
    maxSizeInfoText: 'Max. Größe: {maxSize}',
    selectFileText: 'Datei auswählen',
    uploadedFilesAriaLabel: 'Hochgeladene Dateien',
    successAriaLabel: 'Erfolg',
    errorAriaLabel: 'Fehler',
    uploadingAriaLabel: 'Wird hochgeladen',
    removeFileAriaLabel: '{fileName} entfernen',
    previewFileAriaLabel: '{fileName} vorschau'
  },
  pagination: {
    totalText: 'Gesamt {total} Einträge',
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
    unlockColumnAriaLabel: 'Spalte {column} entsperren',
    allText: 'Alle',
    filterPlaceholder: 'Filtern...',
    exportCsvText: 'CSV exportieren',
    exportExcelText: 'Excel exportieren',
    exportCsvAriaLabel: 'Als CSV exportieren',
    exportExcelAriaLabel: 'Als Excel exportieren',
    expandRowAriaLabel: 'Zeile erweitern',
    collapseRowAriaLabel: 'Zeile reduzieren'
  },
  dataExport: {
    triggerText: 'Exportieren',
    triggerAriaLabel: 'Daten exportieren',
    xlsxText: 'Excel exportieren',
    markdownText: 'Markdown exportieren',
    exportingText: 'Exportiere...'
  },
  timePicker: {
    hour: 'Stunde',
    minute: 'Minute',
    second: 'Sek',
    now: 'Jetzt',
    ok: 'OK',
    start: 'Beginn',
    end: 'Ende',
    clear: 'Zeit löschen',
    toggle: 'Zeitauswahl öffnen',
    dialog: 'Zeitauswahl',
    selectTime: 'Zeit auswählen',
    selectTimeRange: 'Zeitbereich auswählen'
  },
  formWizard: {
    prevText: 'Zurück',
    nextText: 'Weiter',
    finishText: 'Fertigstellen'
  },
  tour: {
    prevText: 'Zurück',
    nextText: 'Weiter',
    finishText: 'Fertigstellen',
    closeAriaLabel: 'Tour schließen'
  },
  calendar: {
    previousMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat',
    previousYear: 'Vorheriges Jahr',
    nextYear: 'Nächstes Jahr',
    yearSelectAriaLabel: 'Jahr',
    monthSelectAriaLabel: 'Monat',
    daySelectAriaLabel: 'Tag'
  },
  fileManager: {
    rootText: 'Stammverzeichnis'
  },
  imageViewer: {
    dialogAriaLabel: 'Bildbetrachter',
    previewDialogAriaLabel: 'Bildvorschau',
    closeAriaLabel: 'Schließen',
    closePreviewAriaLabel: 'Vorschau schließen',
    previousImageAriaLabel: 'Vorheriges Bild',
    nextImageAriaLabel: 'Nächstes Bild',
    zoomOutAriaLabel: 'Verkleinern',
    resetAriaLabel: 'Zurücksetzen',
    zoomInAriaLabel: 'Vergrößern',
    rotateLeftAriaLabel: 'Nach links drehen',
    rotateRightAriaLabel: 'Nach rechts drehen',
    previewImageAriaLabel: 'Bild {index} von {total}'
  },
  imageEditor: {
    selectImageText: 'Bild auswählen',
    selectImageAriaLabel: 'Bild zum Zuschneiden und Hochladen auswählen',
    cropModalTitle: 'Bild zuschneiden',
    cropCancelText: 'Abbrechen',
    cropConfirmText: 'Zuschnitt bestätigen',
    cropperDialogAriaLabel: 'Bildzuschneider',
    imageToCropAriaLabel: 'Zuschneidendes Bild',
    moveCropAreaAriaLabel: 'Zuschnittbereich verschieben',
    resizeCropAreaAriaLabel: 'Zuschnittbereich {handle} skalieren',
    resizeHandleNw: 'oben links',
    resizeHandleN: 'oben',
    resizeHandleNe: 'oben rechts',
    resizeHandleE: 'rechts',
    resizeHandleSe: 'unten rechts',
    resizeHandleS: 'unten',
    resizeHandleSw: 'unten links',
    resizeHandleW: 'links',
    loadingCropImageAriaLabel: 'Bild zum Zuschneiden wird geladen',
    loadErrorAriaLabel: 'Bild zum Zuschneiden konnte nicht geladen werden',
    annotationToolbarAriaLabel: 'Annotationstools',
    annotationEditorAriaLabel: 'Bildannotations-Editor',
    annotationCanvasAriaLabel: 'Annotationsleinwand',
    loadingAnnotationImageAriaLabel: 'Bild zum Annotieren wird geladen',
    selectToolText: 'Auswählen',
    rectangleToolText: 'Rechteck',
    ellipseToolText: 'Ellipsenform',
    polygonToolText: 'Vieleck',
    freehandToolText: 'Freihand',
    deleteText: 'Löschen'
  },
  status: {
    tagCloseAriaLabel: 'Tag schließen',
    badgeLabel: 'Benachrichtigung',
    badgeCountLabel: '{count} Benachrichtigungen'
  },
  taskBoard: {
    emptyColumnText: 'Keine Aufgaben',
    addCardText: 'Aufgabe hinzufügen',
    addColumnText: 'Spalte hinzufügen',
    wipLimitText: 'WIP-Limit: {limit}',
    dragHintText: 'Zum Verschieben ziehen',
    boardAriaLabel: 'Aufgabenboard'
  },
  chatWindow: {
    emptyText: 'Keine Nachrichten',
    sendText: 'Senden',
    placeholder: 'Nachricht eingeben',
    sendingText: 'Senden...',
    sentText: 'Zugestellt',
    failedText: 'Senden fehlgeschlagen'
  },
  code: {
    copyLabel: 'Kopieren',
    copiedLabel: 'Kopiert',
    copyFailedLabel: 'Kopieren fehlgeschlagen'
  },
  commentThread: {
    emptyText: 'Keine Kommentare',
    replyPlaceholder: 'Antwort schreiben...',
    replyButtonText: 'Antworten',
    cancelReplyText: 'Abbrechen',
    likeText: 'Gefällt mir',
    likedText: 'Gefällt dir',
    replyText: 'Antworten',
    moreText: 'Mehr',
    loadMoreText: 'Mehr laden',
    collapseRepliesText: '▾ Antworten ausblenden',
    expandRepliesText: '▸ {count} Antworten anzeigen'
  },
  activityFeed: {
    emptyText: 'Keine Aktivität',
    loadingText: 'Wird geladen...'
  },
  notificationCenter: {
    title: 'Benachrichtigungen',
    emptyText: 'Keine Benachrichtigungen',
    loadingText: 'Wird geladen...',
    allLabel: 'Alle',
    unreadLabel: 'Ungelesen',
    readLabel: 'Gelesen',
    markAllReadText: 'Alle als gelesen markieren',
    markReadText: 'Als gelesen markieren',
    markUnreadText: 'Als ungelesen markieren'
  },
  select: {
    doneText: 'Fertigstellen',
    placeholder: 'Option auswählen',
    emptyText: 'Keine Optionen gefunden'
  },
  colorPicker: {
    trigger: 'Farbe wählen',
    panelTitle: 'Farbe',
    clear: 'Löschen',
    hue: 'Farbton',
    alpha: 'Deckkraft',
    value: 'Farbwert',
    preview: 'Vorschau',
    selectPreset: '{color} auswählen'
  },
  tabs: {
    addTabAriaLabel: 'Tab hinzufügen',
    closeTabAriaLabel: '{label} schließen'
  },
  rate: {
    ariaLabel: 'Bewertung',
    valueText: '{value} Sterne'
  },
  avatarGroup: {
    ariaLabel: 'Avatargruppe',
    overflowAriaLabel: '{count} weitere'
  },
  carousel: {
    ariaLabel: 'Karussell',
    roleDescription: 'Karussell',
    slideRoleDescription: 'Folie',
    navigationAriaLabel: 'Karussellnavigation',
    previousSlideAriaLabel: 'Vorherige Folie',
    nextSlideAriaLabel: 'Nächste Folie',
    pauseAriaLabel: 'Automatische Wiedergabe pausieren',
    playAriaLabel: 'Automatische Wiedergabe starten',
    goToSlideAriaLabel: 'Zu Folie {index} springen',
    slideAriaLabel: 'Folie {index} von {total}'
  },
  transfer: {
    sourceTitle: 'Quelle',
    targetTitle: 'Ziel',
    searchAriaLabel: '{title} durchsuchen',
    itemsAriaLabel: '{title}-Elemente',
    moveToTargetAriaLabel: 'Auswahl ins Ziel verschieben',
    moveToSourceAriaLabel: 'Auswahl in die Quelle verschieben'
  },
  chart: {
    legendAriaLabel: 'Diagrammlegende',
    pointAriaLabel: 'Punkt {index}: ({x}, {y})'
  },
  markdownEditor: {
    formattingToolbarAriaLabel: 'Markdown-Formatierung',
    modeToolbarAriaLabel: 'Markdown-Ansichtsmodus',
    editorAriaLabel: 'Markdown-Editor',
    previewAriaLabel: 'Markdown-Vorschau',
    editModeLabel: 'Bearbeiten',
    splitModeLabel: 'Geteilt',
    previewModeLabel: 'Vorschau',
    bold: 'Fett',
    italic: 'Kursiv',
    strikethrough: 'Durchgestrichen',
    heading: 'Überschrift',
    blockquote: 'Zitat',
    unorderedList: 'Aufzählung',
    orderedList: 'Nummerierte Liste',
    inlineCode: 'Inline-Code',
    codeBlock: 'Codeblock',
    link: 'Verknüpfung',
    image: 'Bild',
    table: 'Tabelle',
    horizontalRule: 'Trennlinie'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: 'Textformatierung',
    editorAriaLabel: 'Rich-Text-Editor',
    bold: 'Fett',
    italic: 'Kursiv',
    underline: 'Unterstrichen',
    strikethrough: 'Durchgestrichen',
    heading1: 'Überschrift 1',
    heading2: 'Überschrift 2',
    heading3: 'Überschrift 3',
    bulletList: 'Aufzählung',
    orderedList: 'Nummerierte Liste',
    blockquote: 'Zitat',
    codeBlock: 'Codeblock',
    link: 'Verknüpfung',
    image: 'Bild',
    horizontalRule: 'Linie',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    clear: 'Formatierung löschen'
  },
  cronEditor: {
    ariaLabel: 'Cron-Editor',
    expressionAriaLabel: 'Cron-Ausdruck',
    presetAriaLabel: 'Cron-Voreinstellung',
    presetPlaceholder: 'Voreinstellung',
    everyMinutePreset: 'Jede Minute',
    hourlyPreset: 'Stündlich',
    dailyPreset: 'Täglich',
    weeklyPreset: 'Wöchentlich',
    monthlyPreset: 'Monatlich',
    minuteLabel: 'Min.',
    hourLabel: 'Stunde',
    dayOfMonthLabel: 'Tag',
    monthLabel: 'Monat',
    dayOfWeekLabel: 'Wochentag',
    modeAnyLabel: 'Beliebig',
    modeEveryLabel: 'Jede',
    modeSpecificLabel: 'Bestimmte',
    modeRangeLabel: 'Bereich',
    modeCustomLabel: 'Benutzerdefiniert',
    modeAriaLabel: '{field}-Modus',
    stepAriaLabel: '{field}-Schritt',
    valueAriaLabel: '{field}-Wert',
    rangeStartAriaLabel: '{field}-Bereichsstart',
    rangeEndAriaLabel: '{field}-Bereichsende',
    customValueAriaLabel: '{field}-Benutzerwert',
    expressionFieldsError: 'Cron-Ausdruck muss 5 Felder enthalten',
    fieldRequiredError: '{field} ist erforderlich',
    invalidStepError: '{field} hat einen ungültigen Schrittautdruck',
    stepRangeError: '{field}-Schritt muss zwischen 1 und {max} liegen',
    fieldRangeError: '{field} muss zwischen {min} und {max} liegen',
    rangeOrderError: '{field}-Bereichsstart muss kleiner oder gleich dem Ende sein',
    invalidFieldError:
      '{field} muss *, eine Zahl, ein Bereich, ein Schritt oder eine Kommaliste sein'
  },
  formValidation: {
    required: 'Dieses Feld ist erforderlich',
    typeString: 'Wert muss eine Zeichenkette sein',
    typeNumber: 'Wert muss eine Zahl sein',
    typeBoolean: 'Wert muss ein Boolean sein',
    typeArray: 'Wert muss ein Array sein',
    typeObject: 'Wert muss ein Objekt sein',
    email: 'Bitte eine gültige E-Mail-Adresse eingeben',
    phone: 'Bitte eine gültige Telefonnummer eingeben',
    url: 'Bitte eine gültige URL eingeben',
    date: 'Bitte ein gültiges Datum eingeben',
    idCard: 'Bitte eine gültige Ausweisnummer eingeben',
    minLength: 'Mindestlänge ist {min} Zeichen',
    maxLength: 'Maximallänge ist {max} Zeichen',
    minValue: 'Mindestwert ist {min}',
    maxValue: 'Maximalwert ist {max}',
    minItems: 'Mindestens {min} Einträge erforderlich',
    maxItems: 'Höchstens {max} Einträge erlaubt',
    patternMismatch: 'Wert entspricht nicht dem erforderlichen Muster',
    validatorFailed: 'Validierung fehlgeschlagen',
    validatorError: 'Bei der Validierung ist ein Fehler aufgetreten'
  },
  inputOtp: {
    groupLabel: 'Einmalpasswort',
    slotLabel: 'Zeichen {index} von {total}'
  },
  tagsInput: {
    removeTagLabel: '{tag} entfernen',
    clearAllLabel: 'Alle Tags löschen'
  }
}

export default deDE
