/**
 * Spanish (Spain) (es-ES).
 */

import type { TigerLocale } from '../../../types/locale'
import { ES_ES_DATEPICKER_LOCALE } from '../datepicker-locales/es-ES'

export const esES: TigerLocale = {
  locale: 'es-ES',
  direction: 'ltr',
  datePicker: ES_ES_DATEPICKER_LOCALE,
  common: {
    okText: 'Aceptar',
    cancelText: 'Cancelar',
    closeText: 'Cerrar',
    loadingText: 'Cargando...',
    emptyText: 'Sin datos',
    noMoreText: 'No hay más datos',
    searchPlaceholder: 'Buscar',
    clearText: 'Borrar',
    closeMessageAriaLabel: 'Cerrar mensaje',
    closeNotificationAriaLabel: 'Cerrar notificación',
    sidebarAriaLabel: 'Barra lateral'
  },
  empty: {
    noData: 'Sin datos',
    noDataAvailable: 'No hay datos disponibles',
    noResults: 'No se encontraron resultados',
    error: 'Algo salió mal'
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
  marquee: {
    ariaLabel: 'Contenido en desplazamiento'
  },
  image: {
    previewAriaLabel: 'Vista previa de {alt}',
    previewFallbackAlt: 'imagen',
    groupAriaLabel: 'Grupo de imágenes'
  },
  imageCompare: {
    ariaLabel: 'Comparación de imágenes'
  },
  descriptions: {
    colon: ':'
  },
  list: {
    avatarAlt: 'Retrato',
    dragHandleAriaLabel: 'Reordenar'
  },
  scrollArea: {
    ariaLabel: 'Región desplazable'
  },
  printLayout: {
    pageBreak: 'Salto de página'
  },
  timeline: {
    pendingText: 'Cargando...'
  },
  progress: {
    ariaLabel: 'Progreso'
  },
  splitter: {
    gutterAriaLabel: 'Redimensionar paneles {index}'
  },
  resizable: {
    handleAriaLabel: 'Redimensionar {handle}'
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
    errorAriaLabel: 'Fallido',
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
    unlockColumnAriaLabel: 'Desbloquear columna {column}',
    allText: 'Todo',
    filterPlaceholder: 'Filtrar...',
    exportCsvText: 'Exportar CSV',
    exportExcelText: 'Exportar Excel',
    exportCsvAriaLabel: 'Exportar a CSV',
    exportExcelAriaLabel: 'Exportar a Excel',
    expandRowAriaLabel: 'Expandir fila',
    collapseRowAriaLabel: 'Contraer fila'
  },
  dataExport: {
    triggerText: 'Exportar',
    triggerAriaLabel: 'Exportar datos',
    xlsxText: 'Exportar Excel',
    markdownText: 'Exportar Markdown',
    exportingText: 'Exportando...'
  },
  timePicker: {
    hour: 'Hora',
    minute: 'Minuto',
    second: 'Seg',
    now: 'Ahora',
    ok: 'Aceptar',
    start: 'Inicio',
    end: 'Fin',
    clear: 'Borrar hora',
    toggle: 'Abrir selector de hora',
    dialog: 'Selector de hora',
    selectTime: 'Seleccionar hora',
    selectTimeRange: 'Seleccionar rango de horas'
  },
  formWizard: {
    prevText: 'Anterior',
    nextText: 'Siguiente',
    finishText: 'Finalizar'
  },
  tour: {
    prevText: 'Anterior',
    nextText: 'Siguiente',
    finishText: 'Finalizar',
    closeAriaLabel: 'Cerrar recorrido'
  },
  calendar: {
    previousMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    previousYear: 'Año anterior',
    nextYear: 'Año siguiente',
    yearSelectAriaLabel: 'Año',
    monthSelectAriaLabel: 'Mes',
    daySelectAriaLabel: 'Día'
  },
  fileManager: {
    rootText: 'Raíz'
  },
  imageViewer: {
    dialogAriaLabel: 'Visor de imágenes',
    previewDialogAriaLabel: 'Vista previa de imagen',
    closeAriaLabel: 'Cerrar',
    closePreviewAriaLabel: 'Cerrar vista previa',
    previousImageAriaLabel: 'Imagen anterior',
    nextImageAriaLabel: 'Imagen siguiente',
    zoomOutAriaLabel: 'Alejar',
    resetAriaLabel: 'Restablecer',
    zoomInAriaLabel: 'Acercar',
    rotateLeftAriaLabel: 'Girar a la izquierda',
    rotateRightAriaLabel: 'Girar a la derecha',
    previewImageAriaLabel: 'Imagen {index} de {total}'
  },
  imageEditor: {
    selectImageText: 'Seleccionar imagen',
    selectImageAriaLabel: 'Seleccionar imagen para recortar y subir',
    cropModalTitle: 'Recortar imagen',
    cropCancelText: 'Cancelar',
    cropConfirmText: 'Confirmar recorte',
    cropperDialogAriaLabel: 'Recortador de imagen',
    imageToCropAriaLabel: 'Imagen a recortar',
    moveCropAreaAriaLabel: 'Mover área de recorte',
    resizeCropAreaAriaLabel: 'Redimensionar área de recorte {handle}',
    resizeHandleNw: 'superior izquierda',
    resizeHandleN: 'superior',
    resizeHandleNe: 'superior derecha',
    resizeHandleE: 'derecha',
    resizeHandleSe: 'inferior derecha',
    resizeHandleS: 'inferior',
    resizeHandleSw: 'inferior izquierda',
    resizeHandleW: 'izquierda',
    loadingCropImageAriaLabel: 'Cargando imagen para recortar',
    loadErrorAriaLabel: 'No se pudo cargar la imagen para recortar',
    annotationToolbarAriaLabel: 'Herramientas de anotación',
    annotationEditorAriaLabel: 'Editor de anotación de imagen',
    annotationCanvasAriaLabel: 'Lienzo de anotación',
    loadingAnnotationImageAriaLabel: 'Cargando imagen para anotar',
    selectToolText: 'Seleccionar',
    rectangleToolText: 'Rectángulo',
    ellipseToolText: 'Elipse',
    polygonToolText: 'Polígono',
    freehandToolText: 'Trazo libre',
    deleteText: 'Eliminar'
  },
  status: {
    tagCloseAriaLabel: 'Cerrar etiqueta',
    badgeLabel: 'notificación',
    badgeCountLabel: '{count} notificaciones'
  },
  taskBoard: {
    emptyColumnText: 'Sin tareas',
    addCardText: 'Agregar tarea',
    addColumnText: 'Agregar columna',
    wipLimitText: 'Límite WIP: {limit}',
    dragHintText: 'Arrastra para mover',
    boardAriaLabel: 'Tablero de tareas'
  },
  chatWindow: {
    emptyText: 'No hay mensajes',
    sendText: 'Enviar',
    placeholder: 'Escribe un mensaje',
    sendingText: 'Enviando',
    sentText: 'Entregado',
    failedText: 'Error al enviar'
  },
  code: {
    copyLabel: 'Copiar',
    copiedLabel: 'Copiado',
    copyFailedLabel: 'Error al copiar'
  },
  commentThread: {
    emptyText: 'No hay comentarios',
    replyPlaceholder: 'Escribe una respuesta...',
    replyButtonText: 'Responder',
    cancelReplyText: 'Cancelar',
    likeText: 'Me gusta',
    likedText: 'Te gusta',
    replyText: 'Responder',
    moreText: 'Más',
    loadMoreText: 'Cargar más',
    collapseRepliesText: '▾ Ocultar respuestas',
    expandRepliesText: '▸ Mostrar {count} respuestas'
  },
  activityFeed: {
    emptyText: 'No hay actividad',
    loadingText: 'Cargando...'
  },
  notificationCenter: {
    title: 'Notificaciones',
    emptyText: 'No hay notificaciones',
    loadingText: 'Cargando...',
    allLabel: 'Todas',
    unreadLabel: 'No leídas',
    readLabel: 'Leídas',
    markAllReadText: 'Marcar todas como leídas',
    markReadText: 'Marcar como leída',
    markUnreadText: 'Marcar como no leída'
  },
  select: {
    doneText: 'Finalizar',
    placeholder: 'Seleccione una opción',
    emptyText: 'No hay opciones',
    searchPlaceholder: 'Buscar',
    clearAriaLabel: 'Borrar selección',
    createOptionLabel: 'Crear "{label}"',
    moreCountText: '+{count} más',
    loadingText: 'Cargando...'
  },
  colorPicker: {
    trigger: 'Elegir color',
    panelTitle: 'Tono de color',
    clear: 'Borrar',
    hue: 'Tono',
    alpha: 'Alfa',
    value: 'Valor de color',
    preview: 'Vista previa',
    selectPreset: 'Seleccionar {color}'
  },
  tabs: {
    addTabAriaLabel: 'Añadir pestaña',
    closeTabAriaLabel: 'Cerrar {label}'
  },
  rate: {
    ariaLabel: 'Valoración',
    valueText: '{value} estrellas'
  },
  avatarGroup: {
    ariaLabel: 'Grupo de avatares',
    overflowAriaLabel: '{count} más'
  },
  carousel: {
    ariaLabel: 'Carrusel',
    roleDescription: 'carrusel',
    slideRoleDescription: 'diapositiva',
    navigationAriaLabel: 'Navegación del carrusel',
    previousSlideAriaLabel: 'Diapositiva anterior',
    nextSlideAriaLabel: 'Diapositiva siguiente',
    pauseAriaLabel: 'Pausar reproducción automática',
    playAriaLabel: 'Reanudar reproducción automática',
    goToSlideAriaLabel: 'Ir a la diapositiva {index}',
    slideAriaLabel: 'Diapositiva {index} de {total}'
  },
  transfer: {
    sourceTitle: 'Origen',
    targetTitle: 'Destino',
    searchAriaLabel: 'Buscar {title}',
    itemsAriaLabel: 'Elementos de {title}',
    moveToTargetAriaLabel: 'Mover selección al destino',
    moveToSourceAriaLabel: 'Mover selección al origen'
  },
  chart: {
    legendAriaLabel: 'Leyenda del gráfico',
    pointAriaLabel: 'Punto {index}: ({x}, {y})'
  },
  markdownEditor: {
    formattingToolbarAriaLabel: 'Formato Markdown',
    modeToolbarAriaLabel: 'Modo de vista Markdown',
    editorAriaLabel: 'Editor Markdown',
    previewAriaLabel: 'Vista previa Markdown',
    editModeLabel: 'Editar',
    splitModeLabel: 'Dividir',
    previewModeLabel: 'Vista previa',
    bold: 'Negrita',
    italic: 'Cursiva',
    strikethrough: 'Tachado',
    heading: 'Título',
    blockquote: 'Cita',
    unorderedList: 'Lista con viñetas',
    orderedList: 'Lista numerada',
    inlineCode: 'Código en línea',
    codeBlock: 'Bloque de código',
    link: 'Enlace',
    image: 'Imagen',
    table: 'Tabla',
    horizontalRule: 'Línea horizontal'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: 'Formato de texto',
    editorAriaLabel: 'Editor de texto enriquecido',
    bold: 'Negrita',
    italic: 'Cursiva',
    underline: 'Subrayado',
    strikethrough: 'Tachado',
    heading1: 'Título 1',
    heading2: 'Título 2',
    heading3: 'Título 3',
    bulletList: 'Lista con viñetas',
    orderedList: 'Lista numerada',
    blockquote: 'Cita',
    codeBlock: 'Código',
    link: 'Enlace',
    image: 'Imagen',
    horizontalRule: 'Línea',
    undo: 'Deshacer',
    redo: 'Rehacer',
    clear: 'Borrar formato'
  },
  cronEditor: {
    ariaLabel: 'Editor Cron',
    expressionAriaLabel: 'Expresión Cron',
    presetAriaLabel: 'Preajuste Cron',
    presetPlaceholder: 'Preajuste',
    everyMinutePreset: 'Cada minuto',
    hourlyPreset: 'Cada hora',
    dailyPreset: 'Cada día',
    weeklyPreset: 'Cada semana',
    monthlyPreset: 'Cada mes',
    minuteLabel: 'Minuto',
    hourLabel: 'Hora',
    dayOfMonthLabel: 'Día',
    monthLabel: 'Mes',
    dayOfWeekLabel: 'Día de la semana',
    modeAnyLabel: 'Cualquiera',
    modeEveryLabel: 'Cada',
    modeSpecificLabel: 'Específico',
    modeRangeLabel: 'Rango',
    modeCustomLabel: 'Personalizado',
    modeAriaLabel: 'Modo de {field}',
    stepAriaLabel: 'Paso de {field}',
    valueAriaLabel: 'Valor de {field}',
    rangeStartAriaLabel: 'Inicio del rango de {field}',
    rangeEndAriaLabel: 'Fin del rango de {field}',
    customValueAriaLabel: 'Valor personalizado de {field}',
    expressionFieldsError: 'La expresión Cron debe tener 5 campos',
    fieldRequiredError: '{field} es obligatorio',
    invalidStepError: '{field} tiene una expresión de paso no válida',
    stepRangeError: 'El paso de {field} debe estar entre 1 y {max}',
    fieldRangeError: '{field} debe estar entre {min} y {max}',
    rangeOrderError: 'El inicio del rango de {field} debe ser menor o igual que el fin',
    invalidFieldError:
      '{field} debe ser *, un número, un rango, un paso o una lista separada por comas'
  },
  formValidation: {
    required: 'Este campo es obligatorio',
    typeString: 'El valor debe ser una cadena',
    typeNumber: 'El valor debe ser un número',
    typeBoolean: 'El valor debe ser un booleano',
    typeArray: 'El valor debe ser una matriz',
    typeObject: 'El valor debe ser un objeto',
    email: 'Introduce un correo electrónico válido',
    phone: 'Introduce un teléfono válido',
    url: 'Introduce una URL válida',
    date: 'Introduce una fecha válida',
    idCard: 'Introduce un número de documento válido',
    minLength: 'La longitud mínima es {min} caracteres',
    maxLength: 'La longitud máxima es {max} caracteres',
    minValue: 'El valor mínimo es {min}',
    maxValue: 'El valor máximo es {max}',
    minItems: 'Se requieren al menos {min} elementos',
    maxItems: 'Se permiten como máximo {max} elementos',
    patternMismatch: 'El valor no coincide con el patrón requerido',
    validatorFailed: 'La validación ha fallado',
    validatorError: 'Se ha producido un error de validación'
  },
  inputOtp: {
    groupLabel: 'Contraseña de un solo uso',
    slotLabel: 'Carácter {index} de {total}'
  },
  tagsInput: {
    removeTagLabel: 'Eliminar {tag}',
    clearAllLabel: 'Borrar todas las etiquetas'
  },
  input: {
    clearAriaLabel: 'Borrar entrada',
    showPasswordAriaLabel: 'Mostrar contraseña',
    hidePasswordAriaLabel: 'Ocultar contraseña'
  },
  inputNumber: {
    incrementAriaLabel: 'Aumentar',
    decrementAriaLabel: 'Disminuir',
    emptyAriaValueText: 'Vacío'
  },
  slider: {
    ariaLabel: 'Control deslizante',
    minAriaLabel: 'Valor mínimo',
    maxAriaLabel: 'Valor máximo'
  },
  stepper: {
    ariaLabel: 'Contador',
    valueAriaLabel: 'Valor',
    incrementAriaLabel: 'Aumentar',
    decrementAriaLabel: 'Disminuir'
  }
}

export default esES
