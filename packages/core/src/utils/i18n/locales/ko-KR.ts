/**
 * Korean (ko-KR).
 */

import type { TigerLocale } from '../../../types/locale'
import { KO_KR_DATEPICKER_LOCALE } from '../datepicker-locales/ko-KR'

export const koKR: TigerLocale = {
  locale: 'ko-KR',
  direction: 'ltr',
  datePicker: KO_KR_DATEPICKER_LOCALE,
  common: {
    okText: '확인',
    cancelText: '취소',
    closeText: '닫기',
    loadingText: '로딩 중...',
    emptyText: '데이터 없음',
    noMoreText: '더 이상 없습니다',
    searchPlaceholder: '검색',
    clearText: '지우기',
    closeMessageAriaLabel: '메시지 닫기',
    closeNotificationAriaLabel: '알림 닫기',
    sidebarAriaLabel: '사이드바',
    moreOptionsText: '추가 작업',
    confirmTitle: '이 작업을 계속하시겠습니까?'
  },
  empty: {
    noData: '데이터 없음',
    noDataAvailable: '사용 가능한 데이터가 없습니다',
    noResults: '검색 결과가 없습니다',
    error: '문제가 발생했습니다'
  },
  modal: {
    closeAriaLabel: '닫기',
    okText: '확인',
    cancelText: '취소'
  },
  drawer: {
    closeAriaLabel: '닫기'
  },
  qrcode: {
    ariaLabel: 'QR 코드',
    expiredText: 'QR 코드가 만료되었습니다',
    refreshText: '새로 고침',
    loadingText: '로딩 중...'
  },
  marquee: {
    ariaLabel: '스크롤 콘텐츠'
  },
  image: {
    previewAriaLabel: '{alt} 미리보기',
    previewFallbackAlt: '이미지',
    groupAriaLabel: '이미지 그룹'
  },
  imageCompare: {
    ariaLabel: '이미지 비교'
  },
  descriptions: {
    colon: ':'
  },
  list: {
    avatarAlt: '아바타',
    dragHandleAriaLabel: '순서 변경'
  },
  scrollArea: {
    ariaLabel: '스크롤 영역'
  },
  printLayout: {
    pageBreak: '페이지 나누기'
  },
  timeline: {
    pendingText: '로딩 중...'
  },
  progress: {
    ariaLabel: '진행률'
  },
  splitter: {
    gutterAriaLabel: '패널 {index} 크기 조절'
  },
  resizable: {
    handleAriaLabel: '{handle} 크기 조절'
  },
  upload: {
    dragAreaAriaLabel: '클릭하거나 끌어다 놓아 파일 업로드',
    buttonAriaLabel: '파일 업로드',
    clickToUploadText: '클릭하여 업로드',
    dragAndDropText: '또는 끌어다 놓기',
    acceptInfoText: '허용 형식: {accept}',
    maxSizeInfoText: '최대 크기: {maxSize}',
    selectFileText: '파일 선택',
    uploadedFilesAriaLabel: '업로드된 파일',
    successAriaLabel: '성공',
    errorAriaLabel: '오류',
    uploadingAriaLabel: '업로드 중',
    removeFileAriaLabel: '{fileName} 제거',
    previewFileAriaLabel: '{fileName} 미리보기'
  },
  pagination: {
    totalText: '총 {total}개',
    itemsPerPageText: '개/페이지',
    jumpToText: '이동',
    pageText: '페이지',
    prevPageAriaLabel: '이전 페이지',
    nextPageAriaLabel: '다음 페이지',
    pageAriaLabel: '{page} 페이지',
    pageIndicatorText: '전체 {total}페이지 중 {current}페이지',
    paginationAriaLabel: '페이지네이션',
    pageSizeAriaLabel: '페이지당 항목 수'
  },
  table: {
    emptyText: '데이터 없음',
    loadingText: '로딩 중',
    expandText: '펼치기',
    collapseText: '접기',
    selectAllText: '전체 선택',
    selectRowAriaLabel: '{row}행 선택',
    sortByText: '{column} 기준 정렬',
    clearSortText: '정렬 해제',
    toolbarAriaLabel: '데이터 테이블 도구 모음',
    searchPlaceholder: '검색',
    searchButtonText: '검색',
    selectedText: '선택됨',
    selectedItemsText: '개',
    columnSettingsText: '열 설정',
    columnSettingsAriaLabel: '열 설정',
    lockColumnAriaLabel: '{column} 열 고정',
    unlockColumnAriaLabel: '{column} 열 고정 해제',
    allText: '전체',
    filterPlaceholder: '필터...',
    exportCsvText: 'CSV 내보내기',
    exportExcelText: 'Excel 내보내기',
    exportCsvAriaLabel: 'CSV로 내보내기',
    exportExcelAriaLabel: 'Excel로 내보내기',
    expandRowAriaLabel: '행 펼치기',
    collapseRowAriaLabel: '행 접기'
  },
  dataExport: {
    triggerText: '내보내기',
    triggerAriaLabel: '데이터 내보내기',
    xlsxText: 'Excel 내보내기',
    markdownText: 'Markdown 내보내기',
    csvText: 'CSV 내보내기',
    exportingText: '내보내는 중...',
    errorText: '내보내기 실패'
  },
  timePicker: {
    hour: '시',
    minute: '분',
    second: '초',
    period: '오전/오후',
    now: '지금',
    ok: '확인',
    start: '시작',
    end: '종료',
    clear: '시간 지우기',
    toggle: '시간 선택기 열기',
    dialog: '시간 선택기',
    selectTime: '시간 선택',
    selectTimeRange: '시간 범위 선택'
  },
  formWizard: {
    prevText: '이전',
    nextText: '다음',
    finishText: '완료'
  },
  tour: {
    prevText: '이전',
    nextText: '다음',
    finishText: '완료',
    closeAriaLabel: '투어 닫기'
  },
  calendar: {
    previousMonth: '이전 달',
    nextMonth: '다음 달',
    previousYear: '이전 해',
    nextYear: '다음 해'
  },
  fileManager: {
    rootText: '루트'
  },
  imageViewer: {
    dialogAriaLabel: '이미지 뷰어',
    previewDialogAriaLabel: '이미지 미리보기',
    closeAriaLabel: '닫기',
    closePreviewAriaLabel: '미리보기 닫기',
    previousImageAriaLabel: '이전 이미지',
    nextImageAriaLabel: '다음 이미지',
    zoomOutAriaLabel: '축소',
    resetAriaLabel: '재설정',
    zoomInAriaLabel: '확대',
    rotateLeftAriaLabel: '왼쪽으로 회전',
    rotateRightAriaLabel: '오른쪽으로 회전',
    previewImageAriaLabel: '이미지 {index} / {total}'
  },
  imageEditor: {
    selectImageText: '이미지 선택',
    selectImageAriaLabel: '잘라 업로드할 이미지 선택',
    cropModalTitle: '이미지 자르기',
    cropCancelText: '취소',
    cropConfirmText: '자르기 확인',
    cropperDialogAriaLabel: '이미지 자르기 도구',
    imageToCropAriaLabel: '자를 이미지',
    moveCropAreaAriaLabel: '자르기 영역 이동',
    resizeCropAreaAriaLabel: '자르기 영역 {handle} 크기 조절',
    resizeHandleNw: '왼쪽 위',
    resizeHandleN: '위',
    resizeHandleNe: '오른쪽 위',
    resizeHandleE: '오른쪽',
    resizeHandleSe: '오른쪽 아래',
    resizeHandleS: '아래',
    resizeHandleSw: '왼쪽 아래',
    resizeHandleW: '왼쪽',
    loadingCropImageAriaLabel: '자를 이미지 불러오는 중',
    loadErrorAriaLabel: '자를 이미지를 불러오지 못했습니다',
    fileTooLargeText: '파일 크기가 {maxSize}을(를) 초과합니다',
    fileTypeRejectedText: '이 파일 형식은 허용되지 않습니다',
    annotationToolbarAriaLabel: '주석 도구',
    annotationEditorAriaLabel: '이미지 주석 편집기',
    annotationCanvasAriaLabel: '이미지 주석 캔버스',
    loadingAnnotationImageAriaLabel: '주석할 이미지 불러오는 중',
    selectToolText: '선택',
    rectangleToolText: '사각형',
    ellipseToolText: '타원',
    polygonToolText: '다각형',
    freehandToolText: '자유 그리기',
    deleteText: '삭제'
  },
  status: {
    tagCloseAriaLabel: '태그 닫기',
    badgeLabel: '알림',
    badgeCountLabel: '알림 {count}개'
  },
  taskBoard: {
    emptyColumnText: '작업 없음',
    addCardText: '작업 추가',
    addColumnText: '열 추가',
    wipLimitText: 'WIP 제한: {limit}',
    dragHintText: '드래그하여 이동',
    boardAriaLabel: '작업 보드'
  },
  chatWindow: {
    emptyText: '메시지가 없습니다',
    sendText: '보내기',
    placeholder: '메시지를 입력하세요',
    sendingText: '보내는 중',
    sentText: '전송됨',
    failedText: '보내기 실패'
  },
  code: {
    copyLabel: '복사',
    copiedLabel: '복사됨',
    copyFailedLabel: '복사 실패'
  },
  commentThread: {
    emptyText: '댓글이 없습니다',
    replyPlaceholder: '답글을 작성하세요...',
    replyButtonText: '답글',
    cancelReplyText: '취소',
    likeText: '좋아요',
    likedText: '좋아요 함',
    replyText: '답글',
    moreText: '더보기',
    loadMoreText: '더 불러오기',
    collapseRepliesText: '▾ 답글 접기',
    expandRepliesText: '▸ 답글 {count}개 펼치기'
  },
  activityFeed: {
    emptyText: '활동이 없습니다',
    loadingText: '로딩 중...'
  },
  notificationCenter: {
    title: '알림',
    emptyText: '알림이 없습니다',
    loadingText: '로딩 중...',
    allLabel: '전체',
    unreadLabel: '읽지 않음',
    readLabel: '읽음',
    markAllReadText: '모두 읽음으로 표시',
    markReadText: '읽음으로 표시',
    markUnreadText: '읽지 않음으로 표시'
  },
  select: {
    doneText: '완료',
    placeholder: '옵션 선택',
    emptyText: '옵션 없음',
    searchPlaceholder: '검색',
    clearAriaLabel: '선택 지우기',
    createOptionLabel: '"{label}" 만들기',
    moreCountText: '외 {count}개',
    loadingText: '불러오는 중...',
    levelLabel: '{level}단계',
    backText: '뒤로',
    expandAriaLabel: '펼치기',
    collapseAriaLabel: '접기'
  },
  colorPicker: {
    trigger: '색 선택',
    panelTitle: '색상',
    clear: '지우기',
    hue: '색조',
    saturation: '채도',
    brightness: '명도',
    alpha: '투명도',
    value: '색상 값',
    preview: '미리보기',
    selectPreset: '{color} 선택',
    done: '완료',
    formatHex: 'HEX',
    formatRgb: 'RGB',
    formatHsl: 'HSL',
    swatches: '색상 견본',
    primaryGroup: '기본',
    accentGroup: '강조'
  },
  tabs: {
    addTabAriaLabel: '탭 추가',
    closeTabAriaLabel: '{label} 닫기',
    tablistAriaLabel: '탭'
  },
  rate: {
    ariaLabel: '평점',
    valueText: '{value}점'
  },
  avatarGroup: {
    ariaLabel: '아바타 그룹',
    overflowAriaLabel: '{count}명 더보기'
  },
  carousel: {
    ariaLabel: '캐러셀',
    roleDescription: '캐러셀',
    slideRoleDescription: '슬라이드',
    navigationAriaLabel: '캐러셀 탐색',
    previousSlideAriaLabel: '이전 슬라이드',
    nextSlideAriaLabel: '다음 슬라이드',
    pauseAriaLabel: '자동 재생 일시 정지',
    playAriaLabel: '자동 재생 시작',
    goToSlideAriaLabel: '{index}번째 슬라이드로 이동',
    slideAriaLabel: '슬라이드 {index} / {total}'
  },
  transfer: {
    sourceTitle: '소스',
    targetTitle: '대상',
    searchAriaLabel: '{title} 검색',
    itemsAriaLabel: '{title} 항목',
    moveToTargetAriaLabel: '선택 항목을 대상으로 이동',
    moveToSourceAriaLabel: '선택 항목을 소스로 이동',
    selectAllAriaLabel: '{title} 모두 선택'
  },
  chart: {
    legendAriaLabel: '차트 범례',
    pointAriaLabel: '포인트 {index}: ({x}, {y})'
  },
  markdownEditor: {
    formattingToolbarAriaLabel: 'Markdown 서식',
    modeToolbarAriaLabel: 'Markdown 보기 모드',
    editorAriaLabel: 'Markdown 편집기',
    previewAriaLabel: 'Markdown 미리보기',
    editModeLabel: '편집',
    splitModeLabel: '분할',
    previewModeLabel: '미리보기',
    bold: '굵게',
    italic: '기울임',
    strikethrough: '취소선',
    heading: '제목',
    blockquote: '인용',
    unorderedList: '글머리 기호 목록',
    orderedList: '번호 매기기 목록',
    inlineCode: '인라인 코드',
    codeBlock: '코드 블록',
    link: '링크',
    image: '이미지',
    table: '표',
    horizontalRule: '가로줄'
  },
  richTextEditor: {
    formattingToolbarAriaLabel: '텍스트 서식',
    editorAriaLabel: '서식 있는 텍스트 편집기',
    bold: '굵게',
    italic: '기울임',
    underline: '밑줄',
    strikethrough: '취소선',
    heading1: '제목 1',
    heading2: '제목 2',
    heading3: '제목 3',
    bulletList: '글머리 기호 목록',
    orderedList: '번호 매기기 목록',
    blockquote: '인용',
    codeBlock: '코드',
    link: '링크',
    image: '이미지',
    horizontalRule: '가로줄',
    undo: '실행 취소',
    redo: '다시 실행',
    clear: '서식 지우기'
  },
  cronEditor: {
    ariaLabel: 'Cron 편집기',
    expressionAriaLabel: 'Cron 식',
    presetAriaLabel: 'Cron 프리셋',
    presetPlaceholder: '프리셋',
    everyMinutePreset: '매분',
    hourlyPreset: '매시간',
    dailyPreset: '매일',
    weeklyPreset: '매주',
    monthlyPreset: '매월',
    minuteLabel: '분',
    hourLabel: '시',
    dayOfMonthLabel: '일',
    monthLabel: '월',
    dayOfWeekLabel: '요일',
    modeAnyLabel: '임의',
    modeEveryLabel: '간격',
    modeSpecificLabel: '지정',
    modeRangeLabel: '범위',
    modeCustomLabel: '사용자 지정',
    modeAriaLabel: '{field} 모드',
    stepAriaLabel: '{field} 간격',
    valueAriaLabel: '{field} 값',
    rangeStartAriaLabel: '{field} 시작',
    rangeEndAriaLabel: '{field} 끝',
    customValueAriaLabel: '{field} 사용자 지정 값',
    expressionFieldsError: 'Cron 식은 필드 5개가 필요합니다',
    fieldRequiredError: '{field}은(는) 필수입니다',
    invalidStepError: '{field} 간격 식이 잘못되었습니다',
    stepRangeError: '{field} 간격은 1에서 {max} 사이여야 합니다',
    fieldRangeError: '{field}은(는) {min}에서 {max} 사이여야 합니다',
    rangeOrderError: '{field} 시작은 끝보다 작거나 같아야 합니다',
    invalidFieldError: '{field}은(는) *, 숫자, 범위, 간격 또는 쉼표 목록이어야 합니다'
  },
  formValidation: {
    required: '이 항목은 필수입니다',
    typeString: '문자열이어야 합니다',
    typeNumber: '숫자여야 합니다',
    typeBoolean: '불리언이어야 합니다',
    typeArray: '배열이어야 합니다',
    typeObject: '객체여야 합니다',
    email: '유효한 이메일 주소를 입력하세요',
    phone: '유효한 전화번호를 입력하세요',
    url: '유효한 URL을 입력하세요',
    date: '유효한 날짜를 입력하세요',
    idCard: '유효한 신분증 번호를 입력하세요',
    minLength: '{min}자 이상이어야 합니다',
    maxLength: '{max}자 이하여야 합니다',
    minValue: '{min} 이상이어야 합니다',
    maxValue: '{max} 이하여야 합니다',
    minItems: '최소 {min}개 필요합니다',
    maxItems: '최대 {max}개까지 허용됩니다',
    patternMismatch: '형식이 올바르지 않습니다',
    validatorFailed: '검증에 실패했습니다',
    validatorError: '검증 중 오류가 발생했습니다'
  },
  inputOtp: {
    groupLabel: '일회용 비밀번호',
    slotLabel: '총 {total}자 중 {index}번째'
  },
  tagsInput: {
    removeTagLabel: '{tag} 제거',
    clearAllLabel: '모든 태그 지우기'
  },
  input: {
    clearAriaLabel: '입력 지우기',
    showPasswordAriaLabel: '비밀번호 표시',
    hidePasswordAriaLabel: '비밀번호 숨기기'
  },
  inputNumber: {
    incrementAriaLabel: '증가',
    decrementAriaLabel: '감소',
    emptyAriaValueText: '비어 있음'
  },
  slider: {
    ariaLabel: '슬라이더',
    minAriaLabel: '최솟값',
    maxAriaLabel: '최댓값'
  },
  stepper: {
    ariaLabel: '스테퍼',
    valueAriaLabel: '값',
    incrementAriaLabel: '증가',
    decrementAriaLabel: '감소'
  },
  signature: {
    ariaLabel: '서명 패드',
    undoText: '실행 취소'
  },
  numberKeyboard: {
    ariaLabel: '숫자 키보드',
    deleteText: '삭제',
    decimalAriaLabel: '소수점',
    idCardXAriaLabel: '신분증 X'
  },
  breadcrumb: {
    ariaLabel: '탐색 경로',
    expandAriaLabel: '접힌 탐색 경로 표시'
  },
  pageHeader: {
    backAriaLabel: '뒤로'
  },
  backTop: {
    ariaLabel: '맨 위로'
  },
  anchor: {
    ariaLabel: '이 페이지'
  },
  steps: {
    ariaLabel: '단계',
    waitStatus: '대기',
    processStatus: '진행 중',
    finishStatus: '완료',
    errorStatus: '오류'
  },
  tree: {
    ariaLabel: '트리',
    selectNode: '{label} 선택',
    expand: '펼치기',
    collapse: '접기'
  }
}

export default koKR
