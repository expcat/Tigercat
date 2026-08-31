/**
 * Portuguese (Brazil) (pt-BR).
 */

import type { TigerLocale } from '../../../types/locale'
import { PT_BR_DATEPICKER_LOCALE } from '../datepicker-locales/pt-BR'

export const ptBR: TigerLocale = {
  locale: 'pt-BR',
  direction: 'ltr',
  datePicker: PT_BR_DATEPICKER_LOCALE,
  common: {
    okText: 'OK',
    cancelText: 'Cancelar',
    closeText: 'Fechar',
    loadingText: 'Carregando...',
    emptyText: 'Sem dados',
    noMoreText: 'Não há mais dados',
    searchPlaceholder: 'Pesquisar',
    clearText: 'Limpar',
    closeMessageAriaLabel: 'Fechar mensagem',
    closeNotificationAriaLabel: 'Fechar notificação',
    sidebarAriaLabel: 'Barra lateral',
    moreOptionsText: 'Mais opções',
    confirmTitle: 'Tem certeza de que deseja continuar?'
  },
  empty: {
    noData: 'Sem dados',
    noDataAvailable: 'Nenhum dado disponível',
    noResults: 'Nenhum resultado encontrado',
    error: 'Algo deu errado'
  },
  modal: {
    closeAriaLabel: 'Fechar',
    okText: 'OK',
    cancelText: 'Cancelar'
  },
  drawer: {
    closeAriaLabel: 'Fechar'
  },
  qrcode: {
    ariaLabel: 'Código QR',
    expiredText: 'O código QR expirou',
    refreshText: 'Atualizar',
    loadingText: 'Carregando...'
  },
  marquee: {
    ariaLabel: 'Conteúdo em rolagem'
  },
  image: {
    previewAriaLabel: 'Pré-visualizar {alt}',
    previewFallbackAlt: 'imagem',
    groupAriaLabel: 'Grupo de imagens'
  },
  imageCompare: {
    ariaLabel: 'Comparação de imagens'
  },
  descriptions: {
    colon: ':'
  },
  list: {
    avatarAlt: 'Foto de perfil',
    dragHandleAriaLabel: 'Reordenar'
  },
  scrollArea: {
    ariaLabel: 'Área rolável'
  },
  printLayout: {
    pageBreak: 'Quebra de página'
  },
  timeline: {
    pendingText: 'Carregando...'
  },
  progress: {
    ariaLabel: 'Progresso'
  },
  splitter: {
    gutterAriaLabel: 'Redimensionar painéis {index}'
  },
  resizable: {
    handleAriaLabel: 'Redimensionar {handle}'
  },
  upload: {
    dragAreaAriaLabel: 'Enviar arquivo clicando ou arrastando',
    buttonAriaLabel: 'Enviar arquivo',
    clickToUploadText: 'Clique para enviar',
    dragAndDropText: 'ou arraste e solte',
    acceptInfoText: 'Aceito: {accept}',
    maxSizeInfoText: 'Tamanho máx.: {maxSize}',
    selectFileText: 'Selecionar arquivo',
    uploadedFilesAriaLabel: 'Arquivos enviados',
    successAriaLabel: 'Sucesso',
    errorAriaLabel: 'Erro',
    uploadingAriaLabel: 'Enviando',
    removeFileAriaLabel: 'Remover {fileName}',
    previewFileAriaLabel: 'Visualizar {fileName}'
  },
  pagination: {
    totalText: 'Total de {total} itens',
    itemsPerPageText: '/ página',
    jumpToText: 'Ir para',
    pageText: 'página',
    prevPageAriaLabel: 'Página anterior',
    nextPageAriaLabel: 'Próxima página',
    pageAriaLabel: 'Página {page}',
    pageIndicatorText: 'Página {current} de {total}'
  },
  table: {
    emptyText: 'Sem dados',
    loadingText: 'Carregando',
    expandText: 'Expandir',
    collapseText: 'Recolher',
    selectAllText: 'Selecionar tudo',
    selectRowAriaLabel: 'Selecionar linha {row}',
    sortByText: 'Ordenar por {column}',
    clearSortText: 'Limpar ordenação',
    toolbarAriaLabel: 'Barra de ferramentas da tabela de dados',
    searchPlaceholder: 'Pesquisar',
    searchButtonText: 'Pesquisar',
    selectedText: 'Selecionado',
    selectedItemsText: 'itens',
    columnSettingsText: 'Configurações de colunas',
    columnSettingsAriaLabel: 'Configurações de colunas',
    lockColumnAriaLabel: 'Bloquear coluna {column}',
    unlockColumnAriaLabel: 'Desbloquear coluna {column}',
    allText: 'Tudo',
    filterPlaceholder: 'Filtrar...',
    exportCsvText: 'Exportar CSV',
    exportExcelText: 'Exportar Excel',
    exportCsvAriaLabel: 'Exportar para CSV',
    exportExcelAriaLabel: 'Exportar para Excel',
    expandRowAriaLabel: 'Expandir linha',
    collapseRowAriaLabel: 'Recolher linha'
  },
  dataExport: {
    triggerText: 'Exportar',
    triggerAriaLabel: 'Exportar dados',
    xlsxText: 'Exportar Excel',
    markdownText: 'Exportar Markdown',
    csvText: 'Exportar CSV',
    exportingText: 'Exportando...',
    errorText: 'Falha ao exportar'
  },
  timePicker: {
    hour: 'Hora',
    minute: 'Minuto',
    second: 'Seg',
    period: 'Período',
    now: 'Agora',
    ok: 'OK',
    start: 'Início',
    end: 'Fim',
    clear: 'Limpar hora',
    toggle: 'Abrir seletor de hora',
    dialog: 'Seletor de hora',
    selectTime: 'Selecionar hora',
    selectTimeRange: 'Selecionar intervalo de horas'
  },
  formWizard: {
    prevText: 'Anterior',
    nextText: 'Próximo',
    finishText: 'Concluir'
  },
  tour: {
    prevText: 'Anterior',
    nextText: 'Próximo',
    finishText: 'Concluir',
    closeAriaLabel: 'Fechar tour'
  },
  calendar: {
    previousMonth: 'Mês anterior',
    nextMonth: 'Próximo mês',
    previousYear: 'Ano anterior',
    nextYear: 'Próximo ano'
  },
  fileManager: {
    rootText: 'Raiz'
  },
  imageViewer: {
    dialogAriaLabel: 'Visualizador de imagens',
    previewDialogAriaLabel: 'Prévia da imagem',
    closeAriaLabel: 'Fechar',
    closePreviewAriaLabel: 'Fechar prévia',
    previousImageAriaLabel: 'Imagem anterior',
    nextImageAriaLabel: 'Próxima imagem',
    zoomOutAriaLabel: 'Diminuir zoom',
    resetAriaLabel: 'Redefinir',
    zoomInAriaLabel: 'Aumentar zoom',
    rotateLeftAriaLabel: 'Girar à esquerda',
    rotateRightAriaLabel: 'Girar à direita',
    previewImageAriaLabel: 'Imagem {index} de {total}'
  },
  imageEditor: {
    selectImageText: 'Selecionar imagem',
    selectImageAriaLabel: 'Selecionar imagem para recortar e enviar',
    cropModalTitle: 'Recortar imagem',
    cropCancelText: 'Cancelar',
    cropConfirmText: 'Confirmar recorte',
    cropperDialogAriaLabel: 'Recortador de imagem',
    imageToCropAriaLabel: 'Imagem a recortar',
    moveCropAreaAriaLabel: 'Mover área de recorte',
    resizeCropAreaAriaLabel: 'Redimensionar área de recorte {handle}',
    resizeHandleNw: 'superior esquerdo',
    resizeHandleN: 'superior',
    resizeHandleNe: 'superior direito',
    resizeHandleE: 'direito',
    resizeHandleSe: 'inferior direito',
    resizeHandleS: 'inferior',
    resizeHandleSw: 'inferior esquerdo',
    resizeHandleW: 'esquerdo',
    loadingCropImageAriaLabel: 'Carregando imagem para recorte',
    loadErrorAriaLabel: 'Falha ao carregar a imagem para recortar',
    fileTooLargeText: 'O arquivo excede {maxSize}',
    fileTypeRejectedText: 'Este tipo de arquivo não é aceito',
    annotationToolbarAriaLabel: 'Ferramentas de anotação',
    annotationEditorAriaLabel: 'Editor de anotação de imagem',
    annotationCanvasAriaLabel: 'Tela de anotação',
    loadingAnnotationImageAriaLabel: 'Carregando imagem para anotação',
    selectToolText: 'Selecionar',
    rectangleToolText: 'Retângulo',
    ellipseToolText: 'Elipse',
    polygonToolText: 'Polígono',
    freehandToolText: 'Mão livre',
    deleteText: 'Excluir'
  },
  status: {
    tagCloseAriaLabel: 'Fechar tag',
    badgeLabel: 'notificação',
    badgeCountLabel: '{count} notificações'
  },
  taskBoard: {
    emptyColumnText: 'Sem tarefas',
    addCardText: 'Adicionar tarefa',
    addColumnText: 'Adicionar coluna',
    wipLimitText: 'Limite WIP: {limit}',
    dragHintText: 'Arraste para mover',
    boardAriaLabel: 'Quadro de tarefas'
  },
  chatWindow: {
    emptyText: 'Nenhuma mensagem',
    sendText: 'Enviar',
    placeholder: 'Digite uma mensagem',
    sendingText: 'Enviando',
    sentText: 'Entregue',
    failedText: 'Falha ao enviar'
  },
  code: {
    copyLabel: 'Copiar',
    copiedLabel: 'Copiado',
    copyFailedLabel: 'Falha ao copiar'
  },
  commentThread: {
    emptyText: 'Nenhum comentário',
    replyPlaceholder: 'Escreva uma resposta...',
    replyButtonText: 'Responder',
    cancelReplyText: 'Cancelar',
    likeText: 'Curtir',
    likedText: 'Curtido',
    replyText: 'Responder',
    moreText: 'Mais',
    loadMoreText: 'Carregar mais',
    collapseRepliesText: '▾ Recolher respostas',
    expandRepliesText: '▸ Expandir {count} respostas'
  },
  activityFeed: {
    emptyText: 'Nenhuma atividade',
    loadingText: 'Carregando...'
  },
  notificationCenter: {
    title: 'Notificações',
    emptyText: 'Nenhuma notificação',
    loadingText: 'Carregando...',
    allLabel: 'Todas',
    unreadLabel: 'Não lidas',
    readLabel: 'Lidas',
    markAllReadText: 'Marcar todas como lidas',
    markReadText: 'Marcar como lida',
    markUnreadText: 'Marcar como não lida'
  },
  select: {
    doneText: 'Concluir',
    placeholder: 'Selecione uma opção',
    emptyText: 'Nenhuma opção encontrada',
    searchPlaceholder: 'Pesquisar',
    clearAriaLabel: 'Limpar seleção',
    createOptionLabel: 'Criar "{label}"',
    moreCountText: '+{count} mais',
    loadingText: 'Carregando...',
    levelLabel: 'Nível {level}',
    backText: 'Voltar',
    expandAriaLabel: 'Expandir',
    collapseAriaLabel: 'Recolher'
  },
  colorPicker: {
    trigger: 'Escolher cor',
    panelTitle: 'Cor',
    clear: 'Limpar',
    hue: 'Matiz',
    saturation: 'Saturação',
    brightness: 'Brilho',
    alpha: 'Opacidade',
    value: 'Valor da cor',
    preview: 'Prévia',
    selectPreset: 'Selecionar {color}',
    done: 'Concluído',
    formatHex: 'HEX',
    formatRgb: 'RGB',
    formatHsl: 'HSL',
    swatches: 'Amostras',
    primaryGroup: 'Primária',
    accentGroup: 'Destaque'
  },
  tabs: {
    addTabAriaLabel: 'Adicionar aba',
    closeTabAriaLabel: 'Fechar {label}'
  },
  rate: {
    ariaLabel: 'Avaliação',
    valueText: '{value} estrelas'
  },
  avatarGroup: {
    ariaLabel: 'Grupo de avatares',
    overflowAriaLabel: 'mais {count}'
  },
  carousel: {
    ariaLabel: 'Carrossel',
    roleDescription: 'carrossel',
    slideRoleDescription: 'diapositivo',
    navigationAriaLabel: 'Navegação do carrossel',
    previousSlideAriaLabel: 'Slide anterior',
    nextSlideAriaLabel: 'Próximo slide',
    pauseAriaLabel: 'Pausar reprodução automática',
    playAriaLabel: 'Iniciar reprodução automática',
    goToSlideAriaLabel: 'Ir para o slide {index}',
    slideAriaLabel: 'Slide {index} de {total}'
  },
  transfer: {
    sourceTitle: 'Origem',
    targetTitle: 'Destino',
    searchAriaLabel: 'Pesquisar {title}',
    itemsAriaLabel: 'Itens de {title}',
    moveToTargetAriaLabel: 'Mover seleção para o destino',
    moveToSourceAriaLabel: 'Mover seleção para a origem',
    selectAllAriaLabel: 'Selecionar tudo em {title}'
  },
  chart: {
    legendAriaLabel: 'Legenda do gráfico',
    pointAriaLabel: 'Ponto {index}: ({x}, {y})'
  },
  markdownEditor: {
    formattingToolbarAriaLabel: 'Formatação Markdown',
    modeToolbarAriaLabel: 'Modo de visualização Markdown',
    editorAriaLabel: 'Editor Markdown',
    previewAriaLabel: 'Prévia Markdown',
    editModeLabel: 'Editar',
    splitModeLabel: 'Dividir',
    previewModeLabel: 'Prévia',
    bold: 'Negrito',
    italic: 'Itálico',
    strikethrough: 'Tachado',
    heading: 'Título',
    blockquote: 'Citação',
    unorderedList: 'Lista com marcadores',
    orderedList: 'Lista numerada',
    inlineCode: 'Código em linha',
    codeBlock: 'Bloco de código',
    link: 'Ligação',
    image: 'Imagem',
    table: 'Tabela',
    horizontalRule: 'Linha horizontal'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: 'Formatação de texto',
    editorAriaLabel: 'Editor de texto rico',
    bold: 'Negrito',
    italic: 'Itálico',
    underline: 'Sublinhado',
    strikethrough: 'Tachado',
    heading1: 'Título 1',
    heading2: 'Título 2',
    heading3: 'Título 3',
    bulletList: 'Lista com marcadores',
    orderedList: 'Lista numerada',
    blockquote: 'Citação',
    codeBlock: 'Código',
    link: 'Ligação',
    image: 'Imagem',
    horizontalRule: 'Linha',
    undo: 'Desfazer',
    redo: 'Refazer',
    clear: 'Limpar formatação'
  },
  cronEditor: {
    ariaLabel: 'Editor Cron',
    expressionAriaLabel: 'Expressão Cron',
    presetAriaLabel: 'Predefinição Cron',
    presetPlaceholder: 'Predefinição',
    everyMinutePreset: 'A cada minuto',
    hourlyPreset: 'A cada hora',
    dailyPreset: 'Diariamente',
    weeklyPreset: 'Semanalmente',
    monthlyPreset: 'Mensalmente',
    minuteLabel: 'Minuto',
    hourLabel: 'Hora',
    dayOfMonthLabel: 'Dia',
    monthLabel: 'Mês',
    dayOfWeekLabel: 'Dia da semana',
    modeAnyLabel: 'Qualquer',
    modeEveryLabel: 'A cada',
    modeSpecificLabel: 'Específico',
    modeRangeLabel: 'Intervalo',
    modeCustomLabel: 'Personalizado',
    modeAriaLabel: 'Modo de {field}',
    stepAriaLabel: 'Passo de {field}',
    valueAriaLabel: 'Valor de {field}',
    rangeStartAriaLabel: 'Início do intervalo de {field}',
    rangeEndAriaLabel: 'Fim do intervalo de {field}',
    customValueAriaLabel: 'Valor personalizado de {field}',
    expressionFieldsError: 'A expressão Cron deve ter 5 campos',
    fieldRequiredError: '{field} é obrigatório',
    invalidStepError: '{field} tem uma expressão de passo inválida',
    stepRangeError: 'O passo de {field} deve estar entre 1 e {max}',
    fieldRangeError: '{field} deve estar entre {min} e {max}',
    rangeOrderError: 'O início do intervalo de {field} deve ser menor ou igual ao fim',
    invalidFieldError:
      '{field} deve ser *, um número, um intervalo, um passo ou uma lista separada por vírgulas'
  },
  formValidation: {
    required: 'Este campo é obrigatório',
    typeString: 'O valor deve ser uma string',
    typeNumber: 'O valor deve ser um número',
    typeBoolean: 'O valor deve ser um booleano',
    typeArray: 'O valor deve ser um array',
    typeObject: 'O valor deve ser um objeto',
    email: 'Informe um e-mail válido',
    phone: 'Informe um telefone válido',
    url: 'Informe uma URL válida',
    date: 'Informe uma data válida',
    idCard: 'Informe um número de documento válido',
    minLength: 'O comprimento mínimo é {min} caracteres',
    maxLength: 'O comprimento máximo é {max} caracteres',
    minValue: 'O valor mínimo é {min}',
    maxValue: 'O valor máximo é {max}',
    minItems: 'São necessários pelo menos {min} itens',
    maxItems: 'São permitidos no máximo {max} itens',
    patternMismatch: 'O valor não corresponde ao padrão exigido',
    validatorFailed: 'A validação falhou',
    validatorError: 'Ocorreu um erro de validação'
  },
  inputOtp: {
    groupLabel: 'Senha de uso único',
    slotLabel: 'Caractere {index} de {total}'
  },
  tagsInput: {
    removeTagLabel: 'Remover {tag}',
    clearAllLabel: 'Limpar todas as tags'
  },
  input: {
    clearAriaLabel: 'Limpar entrada',
    showPasswordAriaLabel: 'Mostrar senha',
    hidePasswordAriaLabel: 'Ocultar senha'
  },
  inputNumber: {
    incrementAriaLabel: 'Aumentar',
    decrementAriaLabel: 'Diminuir',
    emptyAriaValueText: 'Vazio'
  },
  slider: {
    ariaLabel: 'Controle deslizante',
    minAriaLabel: 'Valor mínimo',
    maxAriaLabel: 'Valor máximo'
  },
  stepper: {
    ariaLabel: 'Seletor numérico',
    valueAriaLabel: 'Valor',
    incrementAriaLabel: 'Aumentar',
    decrementAriaLabel: 'Diminuir'
  },
  signature: {
    ariaLabel: 'Área de assinatura',
    undoText: 'Desfazer'
  },
  numberKeyboard: {
    ariaLabel: 'Teclado numérico',
    deleteText: 'Apagar',
    decimalAriaLabel: 'Separador decimal',
    idCardXAriaLabel: 'X do documento'
  },
  tree: {
    ariaLabel: 'Árvore',
    selectNode: 'Selecionar {label}',
    expand: 'Expandir',
    collapse: 'Recolher'
  }
}

export default ptBR
