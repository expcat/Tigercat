/**
 * French (France) (fr-FR).
 */

import type { TigerLocale } from '../../../types/locale'
import { FR_FR_DATEPICKER_LOCALE } from '../datepicker-locales/fr-FR'

export const frFR: TigerLocale = {
  locale: 'fr-FR',
  direction: 'ltr',
  datePicker: FR_FR_DATEPICKER_LOCALE,
  common: {
    okText: 'OK',
    cancelText: 'Annuler',
    closeText: 'Fermer',
    loadingText: 'Chargement...',
    emptyText: 'Aucune donnée',
    noMoreText: 'Plus de données',
    searchPlaceholder: 'Rechercher',
    clearText: 'Effacer',
    closeMessageAriaLabel: 'Fermer le message',
    closeNotificationAriaLabel: 'Fermer la notification',
    sidebarAriaLabel: 'Barre latérale'
  },
  empty: {
    noData: 'Aucune donnée',
    noDataAvailable: 'Aucune donnée disponible',
    noResults: 'Aucun résultat',
    error: 'Une erreur est survenue'
  },
  modal: {
    closeAriaLabel: 'Fermer',
    okText: 'OK',
    cancelText: 'Annuler'
  },
  drawer: {
    closeAriaLabel: 'Fermer'
  },
  qrcode: {
    ariaLabel: 'Code QR',
    expiredText: 'Le code QR a expiré',
    refreshText: 'Actualiser',
    loadingText: 'Chargement...'
  },
  marquee: {
    ariaLabel: 'Contenu défilant'
  },
  image: {
    previewAriaLabel: 'Aperçu de {alt}',
    previewFallbackAlt: 'image',
    groupAriaLabel: "Groupe d'images"
  },
  imageCompare: {
    ariaLabel: "Comparaison d'images"
  },
  descriptions: {
    colon: ':'
  },
  list: {
    avatarAlt: 'Photo de profil',
    dragHandleAriaLabel: 'Réorganiser'
  },
  scrollArea: {
    ariaLabel: 'Zone défilante'
  },
  printLayout: {
    pageBreak: 'Saut de page'
  },
  timeline: {
    pendingText: 'Chargement...'
  },
  progress: {
    ariaLabel: 'Progression'
  },
  splitter: {
    gutterAriaLabel: 'Redimensionner les panneaux {index}'
  },
  resizable: {
    handleAriaLabel: 'Redimensionner {handle}'
  },
  upload: {
    dragAreaAriaLabel: 'Téléverser un fichier en cliquant ou en le déposant',
    buttonAriaLabel: 'Téléverser un fichier',
    clickToUploadText: 'Cliquer pour téléverser',
    dragAndDropText: 'ou glisser-déposer',
    acceptInfoText: 'Accepté : {accept}',
    maxSizeInfoText: 'Taille max. : {maxSize}',
    selectFileText: 'Sélectionner un fichier',
    uploadedFilesAriaLabel: 'Fichiers téléversés',
    successAriaLabel: 'Succès',
    errorAriaLabel: 'Erreur',
    uploadingAriaLabel: 'Téléversement',
    removeFileAriaLabel: 'Supprimer {fileName}',
    previewFileAriaLabel: 'Prévisualiser {fileName}'
  },
  pagination: {
    totalText: 'Total {total} éléments',
    itemsPerPageText: 'par page',
    jumpToText: 'Aller à',
    pageText: 'p.',
    prevPageAriaLabel: 'Page précédente',
    nextPageAriaLabel: 'Page suivante',
    pageAriaLabel: 'Page n° {page}',
    pageIndicatorText: 'Page {current} sur {total}'
  },
  table: {
    emptyText: 'Aucune donnée',
    loadingText: 'Chargement',
    expandText: 'Développer',
    collapseText: 'Réduire',
    selectAllText: 'Tout sélectionner',
    selectRowAriaLabel: 'Sélectionner la ligne {row}',
    sortByText: 'Trier par {column}',
    clearSortText: 'Effacer le tri',
    toolbarAriaLabel: 'Barre d’outils du tableau de données',
    searchPlaceholder: 'Rechercher',
    searchButtonText: 'Rechercher',
    selectedText: 'Sélectionné',
    selectedItemsText: 'éléments',
    columnSettingsText: 'Paramètres des colonnes',
    columnSettingsAriaLabel: 'Paramètres des colonnes',
    lockColumnAriaLabel: 'Verrouiller la colonne {column}',
    unlockColumnAriaLabel: 'Déverrouiller la colonne {column}',
    allText: 'Tout',
    filterPlaceholder: 'Filtrer...',
    exportCsvText: 'Exporter en CSV',
    exportExcelText: 'Exporter en Excel',
    exportCsvAriaLabel: 'Exporter au format CSV',
    exportExcelAriaLabel: 'Exporter au format Excel',
    expandRowAriaLabel: 'Développer la ligne',
    collapseRowAriaLabel: 'Réduire la ligne'
  },
  dataExport: {
    triggerText: 'Exporter',
    triggerAriaLabel: 'Exporter les données',
    xlsxText: 'Exporter Excel',
    markdownText: 'Exporter Markdown',
    csvText: 'Exporter CSV',
    exportingText: 'Exportation...',
    errorText: "Échec de l'export"
  },
  timePicker: {
    hour: 'Heure',
    minute: 'Mn',
    second: 'S',
    period: 'Période',
    now: 'Maintenant',
    ok: 'OK',
    start: 'Début',
    end: 'Fin',
    clear: 'Effacer l’heure',
    toggle: 'Ouvrir le sélecteur d’heure',
    dialog: 'Sélecteur d’heure',
    selectTime: 'Sélectionner une heure',
    selectTimeRange: 'Sélectionner une plage horaire'
  },
  formWizard: {
    prevText: 'Précédent',
    nextText: 'Suivant',
    finishText: 'Terminer'
  },
  tour: {
    prevText: 'Précédent',
    nextText: 'Suivant',
    finishText: 'Terminer',
    closeAriaLabel: 'Fermer la visite'
  },
  calendar: {
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    previousYear: 'Année précédente',
    nextYear: 'Année suivante'
  },
  fileManager: {
    rootText: 'Racine'
  },
  imageViewer: {
    dialogAriaLabel: 'Visionneuse d’images',
    previewDialogAriaLabel: 'Aperçu de l’image',
    closeAriaLabel: 'Fermer',
    closePreviewAriaLabel: 'Fermer l’aperçu',
    previousImageAriaLabel: 'Image précédente',
    nextImageAriaLabel: 'Image suivante',
    zoomOutAriaLabel: 'Zoom arrière',
    resetAriaLabel: 'Réinitialiser',
    zoomInAriaLabel: 'Zoom avant',
    rotateLeftAriaLabel: 'Rotation à gauche',
    rotateRightAriaLabel: 'Rotation à droite',
    previewImageAriaLabel: 'Image {index} sur {total}'
  },
  imageEditor: {
    selectImageText: 'Sélectionner une image',
    selectImageAriaLabel: 'Sélectionner une image à recadrer et téléverser',
    cropModalTitle: 'Recadrer l’image',
    cropCancelText: 'Annuler',
    cropConfirmText: 'Confirmer le recadrage',
    cropperDialogAriaLabel: 'Outil de recadrage',
    imageToCropAriaLabel: 'Image à recadrer',
    moveCropAreaAriaLabel: 'Déplacer la zone de recadrage',
    resizeCropAreaAriaLabel: 'Redimensionner la zone de recadrage {handle}',
    resizeHandleNw: 'haut gauche',
    resizeHandleN: 'haut',
    resizeHandleNe: 'haut droit',
    resizeHandleE: 'droit',
    resizeHandleSe: 'bas droit',
    resizeHandleS: 'bas',
    resizeHandleSw: 'bas gauche',
    resizeHandleW: 'gauche',
    loadingCropImageAriaLabel: 'Chargement de l’image à recadrer',
    loadErrorAriaLabel: 'Impossible de charger l’image à recadrer',
    fileTooLargeText: 'Le fichier dépasse {maxSize}',
    fileTypeRejectedText: 'Ce type de fichier n’est pas accepté',
    annotationToolbarAriaLabel: 'Outils d’annotation',
    annotationEditorAriaLabel: 'Éditeur d’annotation d’image',
    annotationCanvasAriaLabel: 'Canevas d’annotation',
    loadingAnnotationImageAriaLabel: 'Chargement de l’image à annoter',
    selectToolText: 'Sélection',
    rectangleToolText: 'Forme rectangle',
    ellipseToolText: 'Forme ellipse',
    polygonToolText: 'Polygone',
    freehandToolText: 'Main levée',
    deleteText: 'Supprimer'
  },
  status: {
    tagCloseAriaLabel: 'Fermer l’étiquette',
    badgeLabel: 'alerte',
    badgeCountLabel: '{count} alertes'
  },
  taskBoard: {
    emptyColumnText: 'Aucune tâche',
    addCardText: 'Ajouter une tâche',
    addColumnText: 'Ajouter une colonne',
    wipLimitText: 'Limite WIP : {limit}',
    dragHintText: 'Glisser pour déplacer',
    boardAriaLabel: 'Tableau des tâches'
  },
  chatWindow: {
    emptyText: 'Aucun message',
    sendText: 'Envoyer',
    placeholder: 'Saisir un message',
    sendingText: 'Envoi...',
    sentText: 'Distribué',
    failedText: "Échec de l'envoi"
  },
  code: {
    copyLabel: 'Copier',
    copiedLabel: 'Copié',
    copyFailedLabel: 'Échec de la copie'
  },
  commentThread: {
    emptyText: 'Aucun commentaire',
    replyPlaceholder: 'Écrire une réponse...',
    replyButtonText: 'Répondre',
    cancelReplyText: 'Annuler',
    likeText: "J'aime",
    likedText: 'Aimé',
    replyText: 'Répondre',
    moreText: 'Plus',
    loadMoreText: 'Charger plus',
    collapseRepliesText: '▾ Réduire les réponses',
    expandRepliesText: '▸ Afficher {count} réponses'
  },
  activityFeed: {
    emptyText: 'Aucune activité',
    loadingText: 'Chargement...'
  },
  notificationCenter: {
    title: 'Centre de notifications',
    emptyText: 'Aucune notification',
    loadingText: 'Chargement...',
    allLabel: 'Toutes',
    unreadLabel: 'Non lues',
    readLabel: 'Lues',
    markAllReadText: 'Tout marquer comme lu',
    markReadText: 'Marquer comme lu',
    markUnreadText: 'Marquer comme non lu'
  },
  select: {
    doneText: 'Terminer',
    placeholder: 'Sélectionner une option',
    emptyText: 'Aucune option',
    searchPlaceholder: 'Rechercher',
    clearAriaLabel: 'Effacer la sélection',
    createOptionLabel: 'Créer « {label} »',
    moreCountText: '+{count} de plus',
    loadingText: 'Chargement...',
    levelLabel: 'Niveau {level}',
    backText: 'Retour',
    expandAriaLabel: 'Développer',
    collapseAriaLabel: 'Réduire'
  },
  colorPicker: {
    trigger: 'Choisir une couleur',
    panelTitle: 'Couleur',
    clear: 'Effacer',
    hue: 'Teinte',
    saturation: 'Saturation',
    brightness: 'Luminosité',
    alpha: 'Opacité',
    value: 'Valeur',
    preview: 'Aperçu',
    selectPreset: 'Sélectionner {color}',
    done: 'Terminé',
    formatHex: 'HEX',
    formatRgb: 'RGB',
    formatHsl: 'HSL',
    swatches: 'Nuancier',
    primaryGroup: 'Primaire',
    accentGroup: 'Accent'
  },
  tabs: {
    addTabAriaLabel: 'Ajouter un onglet',
    closeTabAriaLabel: 'Fermer {label}'
  },
  rate: {
    ariaLabel: 'Note',
    valueText: '{value} étoiles'
  },
  avatarGroup: {
    ariaLabel: 'Groupe d’avatars',
    overflowAriaLabel: '{count} de plus'
  },
  carousel: {
    ariaLabel: 'Carrousel',
    roleDescription: 'carrousel',
    slideRoleDescription: 'diapositive',
    navigationAriaLabel: 'Navigation du carrousel',
    previousSlideAriaLabel: 'Diapositive précédente',
    nextSlideAriaLabel: 'Diapositive suivante',
    pauseAriaLabel: 'Mettre en pause le défilement automatique',
    playAriaLabel: 'Lancer le défilement automatique',
    goToSlideAriaLabel: 'Aller à la diapositive {index}',
    slideAriaLabel: 'Diapositive {index} sur {total}'
  },
  transfer: {
    sourceTitle: 'Origine',
    targetTitle: 'Cible',
    searchAriaLabel: 'Rechercher {title}',
    itemsAriaLabel: 'Éléments de {title}',
    moveToTargetAriaLabel: 'Déplacer la sélection vers la cible',
    moveToSourceAriaLabel: 'Déplacer la sélection vers la source',
    selectAllAriaLabel: 'Tout sélectionner dans {title}'
  },
  chart: {
    legendAriaLabel: 'Légende du graphique',
    pointAriaLabel: 'Point {index} : ({x}, {y})'
  },
  markdownEditor: {
    formattingToolbarAriaLabel: 'Mise en forme Markdown',
    modeToolbarAriaLabel: 'Mode d’affichage Markdown',
    editorAriaLabel: 'Éditeur Markdown',
    previewAriaLabel: 'Aperçu Markdown',
    editModeLabel: 'Modifier',
    splitModeLabel: 'Fractionner',
    previewModeLabel: 'Aperçu',
    bold: 'Gras',
    italic: 'Italique',
    strikethrough: 'Barré',
    heading: 'Titre',
    blockquote: 'Citation',
    unorderedList: 'Liste à puces',
    orderedList: 'Liste numérotée',
    inlineCode: 'Code en ligne',
    codeBlock: 'Bloc de code',
    link: 'Lien',
    image: 'Illustration',
    table: 'Tableau',
    horizontalRule: 'Ligne horizontale'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: 'Mise en forme du texte',
    editorAriaLabel: 'Éditeur de texte enrichi',
    bold: 'Gras',
    italic: 'Italique',
    underline: 'Souligné',
    strikethrough: 'Barré',
    heading1: 'Titre 1',
    heading2: 'Titre 2',
    heading3: 'Titre 3',
    bulletList: 'Liste à puces',
    orderedList: 'Liste numérotée',
    blockquote: 'Citation',
    codeBlock: 'Bloc de code',
    link: 'Lien',
    image: 'Illustration',
    horizontalRule: 'Ligne',
    undo: 'Annuler',
    redo: 'Rétablir',
    clear: 'Effacer la mise en forme'
  },
  cronEditor: {
    ariaLabel: 'Éditeur Cron',
    expressionAriaLabel: 'Expression Cron',
    presetAriaLabel: 'Préréglage Cron',
    presetPlaceholder: 'Préréglage',
    everyMinutePreset: 'Chaque minute',
    hourlyPreset: 'Chaque heure',
    dailyPreset: 'Chaque jour',
    weeklyPreset: 'Chaque semaine',
    monthlyPreset: 'Chaque mois',
    minuteLabel: 'Min.',
    hourLabel: 'Heure',
    dayOfMonthLabel: 'Jour',
    monthLabel: 'Mois',
    dayOfWeekLabel: 'Jour de la semaine',
    modeAnyLabel: 'Tous',
    modeEveryLabel: 'Chaque',
    modeSpecificLabel: 'Spécifique',
    modeRangeLabel: 'Plage',
    modeCustomLabel: 'Personnalisé',
    modeAriaLabel: 'Mode de {field}',
    stepAriaLabel: 'Pas de {field}',
    valueAriaLabel: 'Valeur de {field}',
    rangeStartAriaLabel: 'Début de plage de {field}',
    rangeEndAriaLabel: 'Fin de plage de {field}',
    customValueAriaLabel: 'Valeur personnalisée de {field}',
    expressionFieldsError: 'L’expression Cron doit contenir 5 champs',
    fieldRequiredError: '{field} est obligatoire',
    invalidStepError: '{field} a une expression de pas invalide',
    stepRangeError: 'Le pas de {field} doit être entre 1 et {max}',
    fieldRangeError: '{field} doit être entre {min} et {max}',
    rangeOrderError: 'Le début de plage de {field} doit être inférieur ou égal à la fin',
    invalidFieldError:
      '{field} doit être *, un nombre, une plage, un pas ou une liste séparée par des virgules'
  },
  formValidation: {
    required: 'Ce champ est obligatoire',
    typeString: 'La valeur doit être une chaîne',
    typeNumber: 'La valeur doit être un nombre',
    typeBoolean: 'La valeur doit être un booléen',
    typeArray: 'La valeur doit être un tableau',
    typeObject: 'La valeur doit être un objet',
    email: 'Saisissez une adresse e-mail valide',
    phone: 'Saisissez un numéro de téléphone valide',
    url: 'Saisissez une URL valide',
    date: 'Saisissez une date valide',
    idCard: 'Saisissez un numéro de pièce d’identité valide',
    minLength: 'La longueur minimale est de {min} caractères',
    maxLength: 'La longueur maximale est de {max} caractères',
    minValue: 'La valeur minimale est {min}',
    maxValue: 'La valeur maximale est {max}',
    minItems: '{min} éléments minimum requis',
    maxItems: '{max} éléments maximum autorisés',
    patternMismatch: 'La valeur ne correspond pas au motif requis',
    validatorFailed: 'La validation a échoué',
    validatorError: 'Une erreur de validation s’est produite'
  },
  inputOtp: {
    groupLabel: 'Mot de passe à usage unique',
    slotLabel: 'Caractère {index} sur {total}'
  },
  tagsInput: {
    removeTagLabel: 'Supprimer {tag}',
    clearAllLabel: 'Effacer toutes les étiquettes'
  },
  input: {
    clearAriaLabel: 'Effacer la saisie',
    showPasswordAriaLabel: 'Afficher le mot de passe',
    hidePasswordAriaLabel: 'Masquer le mot de passe'
  },
  inputNumber: {
    incrementAriaLabel: 'Augmenter',
    decrementAriaLabel: 'Diminuer',
    emptyAriaValueText: 'Vide'
  },
  slider: {
    ariaLabel: 'Curseur',
    minAriaLabel: 'Valeur minimale',
    maxAriaLabel: 'Valeur maximale'
  },
  stepper: {
    ariaLabel: 'Compteur',
    valueAriaLabel: 'Valeur',
    incrementAriaLabel: 'Augmenter',
    decrementAriaLabel: 'Diminuer'
  },
  signature: {
    ariaLabel: 'Pavé de signature',
    undoText: 'Annuler'
  },
  numberKeyboard: {
    ariaLabel: 'Clavier numérique',
    deleteText: 'Supprimer',
    decimalAriaLabel: 'Séparateur décimal',
    idCardXAriaLabel: 'X de la carte'
  }
}

export default frFR
