/**
 * Portuguese (Brazil) (pt-BR).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'
import { PT_BR_DATEPICKER_LOCALE } from '../datepicker-locales/pt-BR'

export const ptBR: TigerLocale = defineLocale({
  locale: 'pt-BR',
  direction: 'ltr',
  datePicker: PT_BR_DATEPICKER_LOCALE,
  common: {
    okText: 'OK',
    cancelText: 'Cancelar',
    closeText: 'Fechar',
    loadingText: 'Carregando...',
    emptyText: 'Sem dados',
    noMoreText: 'Sem mais dados'
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
    expiredText: 'Código QR expirado',
    refreshText: 'Atualizar',
    loadingText: 'Carregando...'
  },
  timeline: {
    pendingText: 'Carregando...'
  },
  upload: {
    dragAreaAriaLabel: 'Enviar arquivo clicando ou arrastando',
    buttonAriaLabel: 'Enviar arquivo',
    clickToUploadText: 'Clique para enviar',
    dragAndDropText: 'ou arraste e solte',
    acceptInfoText: 'Aceito: {accept}',
    maxSizeInfoText: 'Tamanho máximo: {maxSize}',
    selectFileText: 'Selecionar arquivo',
    uploadedFilesAriaLabel: 'Arquivos enviados',
    successAriaLabel: 'Sucesso',
    errorAriaLabel: 'Erro',
    uploadingAriaLabel: 'Enviando',
    removeFileAriaLabel: 'Remover {fileName}',
    previewFileAriaLabel: 'Pré-visualizar {fileName}'
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
    unlockColumnAriaLabel: 'Desbloquear coluna {column}'
  },
  formWizard: {
    prevText: 'Anterior',
    nextText: 'Próximo',
    finishText: 'Concluir'
  },
  taskBoard: {
    emptyColumnText: 'Sem tarefas',
    addCardText: 'Adicionar tarefa',
    wipLimitText: 'Limite WIP: {limit}',
    dragHintText: 'Arraste para mover',
    boardAriaLabel: 'Quadro de tarefas'
  },
  select: {
    doneText: 'Concluir'
  },
  inputOtp: {
    groupLabel: 'Senha de uso único',
    slotLabel: 'Caractere {index} de {total}'
  },
  tagsInput: {
    removeTagLabel: 'Remover {tag}',
    clearAllLabel: 'Limpar todas as tags'
  }
})

export default ptBR
