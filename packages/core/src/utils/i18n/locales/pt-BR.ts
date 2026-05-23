/**
 * Portuguese (Brazil) (pt-BR).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'

export const ptBR: TigerLocale = defineLocale({
  locale: 'pt-BR',
  direction: 'ltr',
  common: {
    okText: 'OK',
    cancelText: 'Cancelar',
    closeText: 'Fechar',
    loadingText: 'Carregando...',
    emptyText: 'Sem dados'
  },
  modal: {
    closeAriaLabel: 'Fechar',
    okText: 'OK',
    cancelText: 'Cancelar'
  },
  drawer: {
    closeAriaLabel: 'Fechar'
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
    pageAriaLabel: 'Página {page}'
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
  }
})

export default ptBR
