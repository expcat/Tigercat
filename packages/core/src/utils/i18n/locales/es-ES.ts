/**
 * Spanish (Spain) (es-ES).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'

export const esES: TigerLocale = defineLocale({
  locale: 'es-ES',
  direction: 'ltr',
  common: {
    okText: 'Aceptar',
    cancelText: 'Cancelar',
    closeText: 'Cerrar',
    loadingText: 'Cargando...',
    emptyText: 'Sin datos'
  },
  modal: {
    closeAriaLabel: 'Cerrar',
    okText: 'Aceptar',
    cancelText: 'Cancelar'
  },
  drawer: {
    closeAriaLabel: 'Cerrar'
  },
  upload: {
    dragAreaAriaLabel: 'Subir archivo haciendo clic o arrastrando',
    buttonAriaLabel: 'Subir archivo',
    clickToUploadText: 'Haz clic para subir',
    dragAndDropText: 'o arrastra y suelta',
    acceptInfoText: 'Aceptado: {accept}',
    maxSizeInfoText: 'Tamaño máximo: {maxSize}',
    selectFileText: 'Seleccionar archivo',
    uploadedFilesAriaLabel: 'Archivos subidos',
    successAriaLabel: 'Correcto',
    errorAriaLabel: 'Error',
    uploadingAriaLabel: 'Subiendo',
    removeFileAriaLabel: 'Eliminar {fileName}',
    previewFileAriaLabel: 'Vista previa de {fileName}'
  },
  pagination: {
    totalText: 'Total {total} elementos',
    itemsPerPageText: '/ página',
    jumpToText: 'Ir a',
    pageText: 'página',
    prevPageAriaLabel: 'Página anterior',
    nextPageAriaLabel: 'Página siguiente',
    pageAriaLabel: 'Página {page}',
    pageIndicatorText: 'Página {current} de {total}'
  },
  table: {
    emptyText: 'Sin datos',
    loadingText: 'Cargando',
    expandText: 'Expandir',
    collapseText: 'Contraer',
    selectAllText: 'Seleccionar todo',
    selectRowAriaLabel: 'Seleccionar fila {row}',
    sortByText: 'Ordenar por {column}',
    clearSortText: 'Borrar orden',
    toolbarAriaLabel: 'Barra de herramientas de tabla de datos',
    searchPlaceholder: 'Buscar',
    searchButtonText: 'Buscar',
    selectedText: 'Seleccionado',
    selectedItemsText: 'elementos'
  },
  formWizard: {
    prevText: 'Anterior',
    nextText: 'Siguiente',
    finishText: 'Finalizar'
  },
  taskBoard: {
    emptyColumnText: 'Sin tareas',
    addCardText: 'Agregar tarea',
    wipLimitText: 'Límite WIP: {limit}',
    dragHintText: 'Arrastra para mover',
    boardAriaLabel: 'Tablero de tareas'
  }
})

export default esES
