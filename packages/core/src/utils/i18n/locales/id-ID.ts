/**
 * Indonesian (id-ID).
 */

import type { TigerLocale } from '../../../types/locale'

export const idID: TigerLocale = {
  locale: 'id-ID',
  direction: 'ltr',
  common: {
    okText: 'OK',
    cancelText: 'Batal',
    closeText: 'Tutup',
    loadingText: 'Memuat...',
    emptyText: 'Tidak ada data',
    noMoreText: 'Tidak ada data lagi'
  },
  modal: {
    closeAriaLabel: 'Tutup',
    okText: 'OK',
    cancelText: 'Batal'
  },
  drawer: {
    closeAriaLabel: 'Tutup'
  },
  qrcode: {
    ariaLabel: 'Kode QR',
    expiredText: 'Kode QR kedaluwarsa',
    refreshText: 'Muat ulang',
    loadingText: 'Memuat...'
  },
  timeline: {
    pendingText: 'Memuat...'
  },
  pagination: {
    totalText: 'Total {total} item',
    itemsPerPageText: '/halaman',
    jumpToText: 'Ke halaman',
    pageText: 'halaman',
    prevPageAriaLabel: 'Halaman sebelumnya',
    nextPageAriaLabel: 'Halaman berikutnya',
    pageAriaLabel: 'Halaman {page}',
    pageIndicatorText: 'Halaman {current} dari {total}'
  },
  table: {
    emptyText: 'Tidak ada data',
    loadingText: 'Memuat',
    expandText: 'Perluas',
    collapseText: 'Ciutkan',
    selectAllText: 'Pilih semua',
    selectRowAriaLabel: 'Pilih baris {row}',
    sortByText: 'Urutkan berdasarkan {column}',
    clearSortText: 'Hapus urutan',
    toolbarAriaLabel: 'Toolbar tabel data',
    searchPlaceholder: 'Cari',
    searchButtonText: 'Cari',
    selectedText: 'Dipilih',
    selectedItemsText: 'item',
    columnSettingsText: 'Pengaturan kolom',
    columnSettingsAriaLabel: 'Pengaturan kolom',
    lockColumnAriaLabel: 'Kunci kolom {column}',
    unlockColumnAriaLabel: 'Buka kunci kolom {column}'
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
