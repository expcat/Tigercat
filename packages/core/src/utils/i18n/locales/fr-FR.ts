/**
 * French (France) (fr-FR).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'

export const frFR: TigerLocale = defineLocale({
  locale: 'fr-FR',
  direction: 'ltr',
  common: {
    okText: 'OK',
    cancelText: 'Annuler',
    closeText: 'Fermer',
    loadingText: 'Chargement...',
    emptyText: 'Aucune donnée',
    noMoreText: 'Plus de données'
  },
  modal: {
    closeAriaLabel: 'Fermer',
    okText: 'OK',
    cancelText: 'Annuler'
  },
  drawer: {
    closeAriaLabel: 'Fermer'
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
    itemsPerPageText: '/ page',
    jumpToText: 'Aller à',
    pageText: 'page',
    prevPageAriaLabel: 'Page précédente',
    nextPageAriaLabel: 'Page suivante',
    pageAriaLabel: 'Page {page}',
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
    unlockColumnAriaLabel: 'Déverrouiller la colonne {column}'
  },
  formWizard: {
    prevText: 'Précédent',
    nextText: 'Suivant',
    finishText: 'Terminer'
  },
  taskBoard: {
    emptyColumnText: 'Aucune tâche',
    addCardText: 'Ajouter une tâche',
    wipLimitText: 'Limite WIP : {limit}',
    dragHintText: 'Glisser pour déplacer',
    boardAriaLabel: 'Tableau des tâches'
  }
})

export default frFR
