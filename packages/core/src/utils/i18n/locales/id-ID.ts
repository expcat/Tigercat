/**
 * Indonesian (id-ID).
 */

import type { TigerLocale } from '../../../types/locale'

export const idID: TigerLocale = {
  common: {
    okText: 'OK',
    cancelText: 'Batal',
    closeText: 'Tutup',
    loadingText: 'Memuat...',
    emptyText: 'Tidak ada data'
  },
  modal: {
    closeAriaLabel: 'Tutup',
    okText: 'OK',
    cancelText: 'Batal'
  },
  drawer: {
    closeAriaLabel: 'Tutup'
  },
  pagination: {
    totalText: 'Total {total} item',
    itemsPerPageText: '/halaman',
    jumpToText: 'Ke halaman',
    pageText: 'halaman',
    prevPageAriaLabel: 'Halaman sebelumnya',
    nextPageAriaLabel: 'Halaman berikutnya',
    pageAriaLabel: 'Halaman {page}'
  },
  formWizard: {
    prevText: 'Sebelumnya',
    nextText: 'Selanjutnya',
    finishText: 'Selesai'
  },
  taskBoard: {
    emptyColumnText: 'Tidak ada tugas',
    addCardText: 'Tambah tugas',
    wipLimitText: 'Batas WIP: {limit}',
    dragHintText: 'Seret untuk memindahkan',
    boardAriaLabel: 'Papan Tugas'
  }
}
