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
    closeNotificationAriaLabel: 'Tutup notifikasi',
    sidebarAriaLabel: 'Bilah sisi',
    moreOptionsText: 'Opsi lainnya',
    confirmTitle: 'Yakin ingin melanjutkan?'
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
    cancelText: 'Batal',
    dialogAriaLabel: 'Kotak dialog'
  },
  drawer: {
    closeAriaLabel: 'Tutup',
    dialogAriaLabel: 'Laci'
  },
  alert: {
    closeAriaLabel: 'Tutup peringatan'
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
  image: {
    previewAriaLabel: 'Pratinjau {alt}',
    previewFallbackAlt: 'gambar',
    groupAriaLabel: 'Grup gambar'
  },
  imageCompare: {
    ariaLabel: 'Perbandingan gambar'
  },
  descriptions: {
    colon: ':'
  },
  list: {
    avatarAlt: 'Foto profil',
    dragHandleAriaLabel: 'Ubah urutan'
  },
  scrollArea: {
    ariaLabel: 'Area gulir'
  },
  printLayout: {
    pageBreak: 'Pemisah halaman'
  },
  timeline: {
    pendingText: 'Memuat...'
  },
  progress: {
    ariaLabel: 'Progres'
  },
  splitter: {
    gutterAriaLabel: 'Ubah ukuran panel {index}'
  },
  resizable: {
    handleAriaLabel: 'Ubah ukuran {handle}'
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
    pageIndicatorText: 'Halaman {current} dari {total}',
    paginationAriaLabel: 'Paginasi',
    pageSizeAriaLabel: 'Item per halaman'
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
    csvText: 'Ekspor CSV',
    exportingText: 'Mengekspor...',
    errorText: 'Ekspor gagal'
  },
  timePicker: {
    hour: 'Jam',
    minute: 'Menit',
    second: 'Detik',
    period: 'Periode',
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
    closeAriaLabel: 'Tutup tur',
    dialogAriaLabel: 'Tur panduan'
  },
  calendar: {
    previousMonth: 'Bulan sebelumnya',
    nextMonth: 'Bulan berikutnya',
    previousYear: 'Tahun sebelumnya',
    nextYear: 'Tahun berikutnya'
  },
  fileManager: {
    rootText: 'Akar',
    pathAriaLabel: 'Jalur berkas',
    listboxAriaLabel: 'Berkas',
    searchAriaLabel: 'Cari berkas',
    emptyText: 'Folder kosong'
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
    rotateRightAriaLabel: 'Putar kanan',
    previewImageAriaLabel: 'Gambar {index} dari {total}'
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
    resizeHandleNw: 'kiri atas',
    resizeHandleN: 'atas',
    resizeHandleNe: 'kanan atas',
    resizeHandleE: 'kanan',
    resizeHandleSe: 'kanan bawah',
    resizeHandleS: 'bawah',
    resizeHandleSw: 'kiri bawah',
    resizeHandleW: 'kiri',
    loadingCropImageAriaLabel: 'Memuat gambar untuk dipotong',
    loadErrorAriaLabel: 'Gagal memuat gambar untuk dipotong',
    fileTooLargeText: 'Ukuran file melebihi {maxSize}',
    fileTypeRejectedText: 'Jenis file ini tidak diterima',
    annotationToolbarAriaLabel: 'Alat anotasi',
    annotationEditorAriaLabel: 'Editor anotasi gambar',
    annotationCanvasAriaLabel: 'Kanvas anotasi',
    loadingAnnotationImageAriaLabel: 'Memuat gambar untuk dianotasi',
    loadAnnotationErrorAriaLabel: 'Gagal memuat gambar untuk dianotasi',
    defaultAnnotationAlt: 'Gambar untuk dianotasi',
    annotationShapeAriaLabel: 'anotasi {type}',
    annotationLabeledShapeAriaLabel: '{label}, anotasi {type}',
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
    emptyText: 'Tidak ada opsi',
    searchPlaceholder: 'Cari',
    clearAriaLabel: 'Hapus pilihan',
    createOptionLabel: 'Buat "{label}"',
    moreCountText: '+{count} lagi',
    loadingText: 'Memuat...',
    levelLabel: 'Tingkat {level}',
    backText: 'Kembali',
    expandAriaLabel: 'Bentangkan',
    collapseAriaLabel: 'Ciutkan'
  },
  colorPicker: {
    trigger: 'Pilih warna',
    panelTitle: 'Warna',
    clear: 'Hapus',
    hue: 'Rona',
    saturation: 'Saturasi',
    brightness: 'Kecerahan',
    alpha: 'Opasitas',
    value: 'Nilai warna',
    preview: 'Pratinjau',
    selectPreset: 'Pilih {color}',
    done: 'Selesai',
    formatHex: 'HEX',
    formatRgb: 'RGB',
    formatHsl: 'HSL',
    swatches: 'Sampel warna',
    primaryGroup: 'Utama',
    accentGroup: 'Aksen'
  },
  tabs: {
    addTabAriaLabel: 'Tambah tab',
    closeTabAriaLabel: 'Tutup {label}',
    tablistAriaLabel: 'Tab'
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
    ariaLabel: 'Karusel',
    roleDescription: 'karusel',
    slideRoleDescription: 'salindia',
    navigationAriaLabel: 'Navigasi karusel',
    previousSlideAriaLabel: 'Slide sebelumnya',
    nextSlideAriaLabel: 'Slide berikutnya',
    pauseAriaLabel: 'Jeda putar otomatis',
    playAriaLabel: 'Mulai putar otomatis',
    goToSlideAriaLabel: 'Ke slide {index}',
    slideAriaLabel: 'Slide {index} dari {total}'
  },
  transfer: {
    sourceTitle: 'Sumber',
    targetTitle: 'Tujuan',
    searchAriaLabel: 'Cari {title}',
    itemsAriaLabel: 'Item {title}',
    moveToTargetAriaLabel: 'Pindahkan pilihan ke tujuan',
    moveToSourceAriaLabel: 'Pindahkan pilihan ke sumber',
    selectAllAriaLabel: 'Pilih semua di {title}'
  },
  chart: {
    legendAriaLabel: 'Legenda bagan',
    pointAriaLabel: 'Titik {index}: ({x}, {y})',
    seriesName: 'Seri {index}',
    sliceName: 'Irisan {index}',
    sliceAriaLabel: '{label}: {value} ({percent} %)',
    stageName: 'Tahap {index}',
    heatmapTooltip: '{x} × {y} = {value}',
    treemapTooltip: '{label}: {value} ({percent} %)',
    sunburstTooltip: '{label}: {value} ({percent} %)',
    orgChartAriaLabel: 'Bagan organisasi',
    ganttAriaLabel: 'Bagan Gantt',
    ganttTaskAriaLabel: '{label}, {start} sampai {end}{progress}'
  },
  codeEditor: {
    editorAriaLabel: 'Editor kode'
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
    horizontalRule: 'Garis horizontal',
    placeholderStrong: 'teks tebal',
    placeholderEmphasis: 'teks miring',
    placeholderDeleted: 'teks terhapus',
    placeholderCode: 'kode',
    placeholderHeading: 'Judul',
    placeholderQuote: 'Kutipan',
    placeholderListItem: 'Butir daftar',
    placeholderLinkText: 'teks tautan',
    placeholderImageAlt: 'teks alt',
    placeholderTable: '| Kolom | Nilai |\n| --- | --- |\n| Nama | Tigercat |'
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
    clear: 'Hapus format',
    linkPrompt: 'Masukkan URL',
    imagePrompt: 'Masukkan URL gambar'
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
  },
  input: {
    clearAriaLabel: 'Hapus isian',
    showPasswordAriaLabel: 'Tampilkan kata sandi',
    hidePasswordAriaLabel: 'Sembunyikan kata sandi'
  },
  inputNumber: {
    incrementAriaLabel: 'Naikkan',
    decrementAriaLabel: 'Turunkan',
    emptyAriaValueText: 'Kosong'
  },
  slider: {
    ariaLabel: 'Penggeser',
    minAriaLabel: 'Nilai terendah',
    maxAriaLabel: 'Nilai tertinggi'
  },
  stepper: {
    ariaLabel: 'Pengatur angka',
    valueAriaLabel: 'Nilai',
    incrementAriaLabel: 'Tambah',
    decrementAriaLabel: 'Kurangi'
  },
  signature: {
    ariaLabel: 'Pad tanda tangan',
    undoText: 'Urungkan'
  },
  numberKeyboard: {
    ariaLabel: 'Papan tombol angka',
    deleteText: 'Hapus',
    decimalAriaLabel: 'Pemisah desimal',
    idCardXAriaLabel: 'KTP X'
  },
  breadcrumb: {
    ariaLabel: 'Jejak navigasi',
    expandAriaLabel: 'Tampilkan item yang dilipat'
  },
  pageHeader: {
    backAriaLabel: 'Kembali'
  },
  backTop: {
    ariaLabel: 'Kembali ke atas'
  },
  anchor: {
    ariaLabel: 'Di halaman ini'
  },
  floatButton: {
    ariaLabel: 'Tambah'
  },
  spotlight: {
    title: 'Palet perintah',
    placeholder: 'Cari'
  },
  scrollSpy: {
    ariaLabel: 'Navigasi bagian'
  },
  steps: {
    ariaLabel: 'Langkah',
    waitStatus: 'Menunggu',
    processStatus: 'Berjalan',
    finishStatus: 'Selesai',
    errorStatus: 'Kesalahan'
  },
  tree: {
    ariaLabel: 'Pohon',
    selectNode: 'Pilih {label}',
    expand: 'Bentangkan',
    collapse: 'Ciutkan'
  }
}

export default idID
