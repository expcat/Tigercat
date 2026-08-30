/**
 * Indonesian (id-ID).
 */

import type { TigerLocale } from '../../../types/locale'
import { ID_ID_DATEPICKER_LOCALE } from '../datepicker-locales/id-ID'

export const idID: TigerLocale = {
  locale: 'id-ID',
  direction: 'ltr',
  datePicker: ID_ID_DATEPICKER_LOCALE,
  common: {
    okText: 'OK',
    cancelText: 'Batal',
    closeText: 'Tutup',
    loadingText: 'Memuat...',
    emptyText: 'Tidak ada data',
    noMoreText: 'Tidak ada data lagi',
    searchPlaceholder: 'Cari',
    clearText: 'Hapus',
    closeMessageAriaLabel: 'Tutup pesan',
    closeNotificationAriaLabel: 'Tutup notifikasi'
  },
  empty: {
    noData: 'Tidak ada data',
    noDataAvailable: 'Tidak ada data tersedia',
    noResults: 'Tidak ada hasil',
    error: 'Terjadi kesalahan'
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
  marquee: {
    ariaLabel: 'Konten bergulir'
  },
  timeline: {
    pendingText: 'Memuat...'
  },
  upload: {
    dragAreaAriaLabel: 'Unggah berkas dengan mengeklik atau menyeret',
    buttonAriaLabel: 'Unggah berkas',
    clickToUploadText: 'Klik untuk mengunggah',
    dragAndDropText: 'atau seret dan lepas',
    acceptInfoText: 'Diterima: {accept}',
    maxSizeInfoText: 'Ukuran maks.: {maxSize}',
    selectFileText: 'Pilih berkas',
    uploadedFilesAriaLabel: 'Berkas terunggah',
    successAriaLabel: 'Berhasil',
    errorAriaLabel: 'Galat',
    uploadingAriaLabel: 'Mengunggah',
    removeFileAriaLabel: 'Hapus {fileName}',
    previewFileAriaLabel: 'Pratinjau {fileName}'
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
    expandText: 'Bentangkan',
    collapseText: 'Ciutkan',
    selectAllText: 'Pilih semua',
    selectRowAriaLabel: 'Pilih baris {row}',
    sortByText: 'Urutkan menurut {column}',
    clearSortText: 'Hapus pengurutan',
    toolbarAriaLabel: 'Bilah alat tabel data',
    searchPlaceholder: 'Cari',
    searchButtonText: 'Cari',
    selectedText: 'Dipilih',
    selectedItemsText: 'item',
    columnSettingsText: 'Pengaturan kolom',
    columnSettingsAriaLabel: 'Pengaturan kolom',
    lockColumnAriaLabel: 'Kunci kolom {column}',
    unlockColumnAriaLabel: 'Buka kunci kolom {column}',
    allText: 'Semua',
    filterPlaceholder: 'Saring...',
    exportCsvText: 'Ekspor CSV',
    exportExcelText: 'Ekspor Excel',
    exportCsvAriaLabel: 'Ekspor ke CSV',
    exportExcelAriaLabel: 'Ekspor ke Excel',
    expandRowAriaLabel: 'Bentangkan baris',
    collapseRowAriaLabel: 'Ciutkan baris'
  },
  dataExport: {
    triggerText: 'Ekspor',
    triggerAriaLabel: 'Ekspor data',
    xlsxText: 'Ekspor Excel',
    markdownText: 'Ekspor Markdown',
    exportingText: 'Mengekspor...'
  },
  timePicker: {
    hour: 'Jam',
    minute: 'Menit',
    second: 'Detik',
    now: 'Sekarang',
    ok: 'OK',
    start: 'Mulai',
    end: 'Selesai',
    clear: 'Hapus waktu',
    toggle: 'Buka pemilih waktu',
    dialog: 'Pemilih waktu',
    selectTime: 'Pilih waktu',
    selectTimeRange: 'Pilih rentang waktu'
  },
  formWizard: {
    prevText: 'Sebelumnya',
    nextText: 'Selanjutnya',
    finishText: 'Selesai'
  },
  tour: {
    prevText: 'Sebelumnya',
    nextText: 'Selanjutnya',
    finishText: 'Selesai',
    closeAriaLabel: 'Tutup tur'
  },
  calendar: {
    previousMonth: 'Bulan sebelumnya',
    nextMonth: 'Bulan berikutnya',
    previousYear: 'Tahun sebelumnya',
    nextYear: 'Tahun berikutnya',
    yearSelectAriaLabel: 'Tahun',
    monthSelectAriaLabel: 'Bulan',
    daySelectAriaLabel: 'Hari'
  },
  fileManager: {
    rootText: 'Akar'
  },
  imageViewer: {
    dialogAriaLabel: 'Penampil gambar',
    previewDialogAriaLabel: 'Pratinjau gambar',
    closeAriaLabel: 'Tutup',
    closePreviewAriaLabel: 'Tutup pratinjau',
    previousImageAriaLabel: 'Gambar sebelumnya',
    nextImageAriaLabel: 'Gambar berikutnya',
    zoomOutAriaLabel: 'Perkecil',
    resetAriaLabel: 'Setel ulang',
    zoomInAriaLabel: 'Perbesar',
    rotateLeftAriaLabel: 'Putar kiri',
    rotateRightAriaLabel: 'Putar kanan'
  },
  imageEditor: {
    selectImageText: 'Pilih gambar',
    selectImageAriaLabel: 'Pilih gambar untuk dipotong dan diunggah',
    cropModalTitle: 'Potong gambar',
    cropCancelText: 'Batal',
    cropConfirmText: 'Konfirmasi potongan',
    cropperDialogAriaLabel: 'Pemotong gambar',
    imageToCropAriaLabel: 'Gambar yang akan dipotong',
    moveCropAreaAriaLabel: 'Pindahkan area potong',
    resizeCropAreaAriaLabel: 'Ubah ukuran area potong {handle}',
    loadingCropImageAriaLabel: 'Memuat gambar untuk dipotong',
    annotationToolbarAriaLabel: 'Alat anotasi',
    annotationEditorAriaLabel: 'Editor anotasi gambar',
    annotationCanvasAriaLabel: 'Kanvas anotasi',
    loadingAnnotationImageAriaLabel: 'Memuat gambar untuk dianotasi',
    selectToolText: 'Pilih',
    rectangleToolText: 'Persegi panjang',
    ellipseToolText: 'Elips',
    polygonToolText: 'Poligon',
    freehandToolText: 'Gambar bebas',
    deleteText: 'Hapus'
  },
  status: {
    tagCloseAriaLabel: 'Tutup tag',
    badgeLabel: 'notifikasi',
    badgeCountLabel: '{count} notifikasi'
  },
  taskBoard: {
    emptyColumnText: 'Tidak ada tugas',
    addCardText: 'Tambah tugas',
    addColumnText: 'Tambah kolom',
    wipLimitText: 'Batas WIP: {limit}',
    dragHintText: 'Seret untuk memindahkan',
    boardAriaLabel: 'Papan Tugas'
  },
  chatWindow: {
    emptyText: 'Tidak ada pesan',
    sendText: 'Kirim',
    placeholder: 'Tulis pesan',
    sendingText: 'Mengirim',
    sentText: 'Terkirim',
    failedText: 'Gagal mengirim'
  },
  code: {
    copyLabel: 'Salin',
    copiedLabel: 'Disalin',
    copyFailedLabel: 'Gagal menyalin'
  },
  commentThread: {
    emptyText: 'Tidak ada komentar',
    replyPlaceholder: 'Tulis balasan...',
    replyButtonText: 'Balas',
    cancelReplyText: 'Batal',
    likeText: 'Suka',
    likedText: 'Disukai',
    replyText: 'Balas',
    moreText: 'Lainnya',
    loadMoreText: 'Muat lebih banyak',
    collapseRepliesText: '▾ Ciutkan balasan',
    expandRepliesText: '▸ Perluas {count} balasan'
  },
  activityFeed: {
    emptyText: 'Tidak ada aktivitas',
    loadingText: 'Memuat...'
  },
  notificationCenter: {
    title: 'Notifikasi',
    emptyText: 'Tidak ada notifikasi',
    loadingText: 'Memuat...',
    allLabel: 'Semua',
    unreadLabel: 'Belum dibaca',
    readLabel: 'Sudah dibaca',
    markAllReadText: 'Tandai semua sudah dibaca',
    markReadText: 'Tandai sudah dibaca',
    markUnreadText: 'Tandai belum dibaca'
  },
  select: {
    doneText: 'Selesai',
    placeholder: 'Pilih opsi',
    emptyText: 'Tidak ada opsi'
  },
  colorPicker: {
    trigger: 'Pilih warna',
    panelTitle: 'Warna',
    clear: 'Hapus',
    hue: 'Rona',
    alpha: 'Opasitas',
    value: 'Nilai warna',
    preview: 'Pratinjau',
    selectPreset: 'Pilih {color}'
  },
  tabs: {
    addTabAriaLabel: 'Tambah tab',
    closeTabAriaLabel: 'Tutup {label}'
  },
  rate: {
    ariaLabel: 'Peringkat',
    valueText: '{value} bintang'
  },
  avatarGroup: {
    ariaLabel: 'Grup avatar',
    overflowAriaLabel: '{count} lainnya'
  },
  carousel: {
    ariaLabel: 'Karusel gambar',
    navigationAriaLabel: 'Navigasi karusel',
    previousSlideAriaLabel: 'Slide sebelumnya',
    nextSlideAriaLabel: 'Slide berikutnya',
    goToSlideAriaLabel: 'Ke slide {index}',
    slideAriaLabel: 'Slide {index} dari {total}'
  },
  transfer: {
    sourceTitle: 'Sumber',
    targetTitle: 'Tujuan',
    searchAriaLabel: 'Cari {title}',
    itemsAriaLabel: 'Item {title}',
    moveToTargetAriaLabel: 'Pindahkan pilihan ke tujuan',
    moveToSourceAriaLabel: 'Pindahkan pilihan ke sumber'
  },
  chart: {
    legendAriaLabel: 'Legenda bagan',
    pointAriaLabel: 'Titik {index}: ({x}, {y})'
  },
  markdownEditor: {
    formattingToolbarAriaLabel: 'Pemformatan Markdown',
    modeToolbarAriaLabel: 'Mode tampilan Markdown',
    editorAriaLabel: 'Editor Markdown',
    previewAriaLabel: 'Pratinjau Markdown',
    editModeLabel: 'Sunting',
    splitModeLabel: 'Bagi',
    previewModeLabel: 'Pratinjau',
    bold: 'Tebal',
    italic: 'Miring',
    strikethrough: 'Coret',
    heading: 'Judul',
    blockquote: 'Kutipan',
    unorderedList: 'Daftar berpoin',
    orderedList: 'Daftar bernomor',
    inlineCode: 'Kode sebaris',
    codeBlock: 'Blok kode',
    link: 'Tautan',
    image: 'Gambar',
    table: 'Tabel',
    horizontalRule: 'Garis horizontal'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: 'Pemformatan teks',
    editorAriaLabel: 'Editor teks kaya',
    bold: 'Tebal',
    italic: 'Miring',
    underline: 'Garis bawah',
    strikethrough: 'Coret',
    heading1: 'Judul 1',
    heading2: 'Judul 2',
    heading3: 'Judul 3',
    bulletList: 'Daftar berpoin',
    orderedList: 'Daftar bernomor',
    blockquote: 'Kutipan',
    codeBlock: 'Kode',
    link: 'Tautan',
    image: 'Gambar',
    horizontalRule: 'Garis',
    undo: 'Urungkan',
    redo: 'Ulangi',
    clear: 'Hapus format'
  },
  cronEditor: {
    ariaLabel: 'Editor Cron',
    expressionAriaLabel: 'Ekspresi Cron',
    presetAriaLabel: 'Prasetel Cron',
    presetPlaceholder: 'Prasetel',
    everyMinutePreset: 'Setiap menit',
    hourlyPreset: 'Setiap jam',
    dailyPreset: 'Harian',
    weeklyPreset: 'Mingguan',
    monthlyPreset: 'Bulanan',
    minuteLabel: 'Menit',
    hourLabel: 'Jam',
    dayOfMonthLabel: 'Hari',
    monthLabel: 'Bulan',
    dayOfWeekLabel: 'Hari dalam minggu',
    modeAnyLabel: 'Apa pun',
    modeEveryLabel: 'Setiap',
    modeSpecificLabel: 'Spesifik',
    modeRangeLabel: 'Rentang',
    modeCustomLabel: 'Kustom',
    modeAriaLabel: 'Mode {field}',
    stepAriaLabel: 'Langkah {field}',
    valueAriaLabel: 'Nilai {field}',
    rangeStartAriaLabel: 'Awal rentang {field}',
    rangeEndAriaLabel: 'Akhir rentang {field}',
    customValueAriaLabel: 'Nilai kustom {field}',
    expressionFieldsError: 'Ekspresi Cron harus berisi 5 bidang',
    fieldRequiredError: '{field} wajib diisi',
    invalidStepError: '{field} memiliki ekspresi langkah yang tidak valid',
    stepRangeError: 'Langkah {field} harus antara 1 dan {max}',
    fieldRangeError: '{field} harus antara {min} dan {max}',
    rangeOrderError: 'Awal rentang {field} harus lebih kecil atau sama dengan akhir',
    invalidFieldError: '{field} harus *, angka, rentang, langkah, atau daftar dipisah koma'
  },
  formValidation: {
    required: 'Bidang ini wajib diisi',
    typeString: 'Nilai harus berupa string',
    typeNumber: 'Nilai harus berupa angka',
    typeBoolean: 'Nilai harus berupa boolean',
    typeArray: 'Nilai harus berupa array',
    typeObject: 'Nilai harus berupa objek',
    email: 'Masukkan alamat email yang valid',
    phone: 'Masukkan nomor telepon yang valid',
    url: 'Masukkan URL yang valid',
    date: 'Masukkan tanggal yang valid',
    idCard: 'Masukkan nomor identitas yang valid',
    minLength: 'Panjang minimum adalah {min} karakter',
    maxLength: 'Panjang maksimum adalah {max} karakter',
    minValue: 'Nilai minimum adalah {min}',
    maxValue: 'Nilai maksimum adalah {max}',
    minItems: 'Minimal {min} item diperlukan',
    maxItems: 'Maksimal {max} item diizinkan',
    patternMismatch: 'Nilai tidak cocok dengan pola yang diperlukan',
    validatorFailed: 'Validasi gagal',
    validatorError: 'Terjadi kesalahan saat validasi'
  },
  inputOtp: {
    groupLabel: 'Kata sandi sekali pakai',
    slotLabel: 'Karakter {index} dari {total}'
  },
  tagsInput: {
    removeTagLabel: 'Hapus {tag}',
    clearAllLabel: 'Hapus semua tag'
  }
}

export default idID
