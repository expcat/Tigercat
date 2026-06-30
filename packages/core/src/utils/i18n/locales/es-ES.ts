/**
 * Spanish (Spain) (es-ES).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'
import { ES_ES_DATEPICKER_LOCALE } from '../datepicker-locales/es-ES'

export const esES: TigerLocale = defineLocale({
  locale: 'es-ES',
  direction: 'ltr',
  datePicker: ES_ES_DATEPICKER_LOCALE,
  common: {
    okText: 'Aceptar',
    cancelText: 'Cancelar',
    closeText: 'Cerrar',
    loadingText: 'Cargando...',
    emptyText: 'Sin datos',
    noMoreText: 'No hay más datos'
  },
  modal: {
    closeAriaLabel: 'Cerrar',
    okText: 'Aceptar',
    cancelText: 'Cancelar'
  },
  drawer: {
    closeAriaLabel: 'Cerrar'
  },
  qrcode: {
    ariaLabel: 'Código QR',
    expiredText: 'El código QR ha caducado',
    refreshText: 'Actualizar',
    loadingText: 'Cargando...'
  },
  timeline: {
    pendingText: 'Cargando...'
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
    selectedItemsText: 'elementos',
    columnSettingsText: 'Configuración de columnas',
    columnSettingsAriaLabel: 'Configuración de columnas',
    lockColumnAriaLabel: 'Bloquear columna {column}',
    unlockColumnAriaLabel: 'Desbloquear columna {column}'
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
  },
  select: {
    doneText: 'Finalizar'
  }
})

export default esES
