/**
 * Korean (ko-KR).
 */

import type { TigerLocale } from '../../../types/locale'
import { defineLocale } from '../define-locale'
import { KO_KR_DATEPICKER_LOCALE } from '../datepicker-locales/ko-KR'

export const koKR: TigerLocale = defineLocale({
  locale: 'ko-KR',
  direction: 'ltr',
  datePicker: KO_KR_DATEPICKER_LOCALE,
  common: {
    okText: '확인',
    cancelText: '취소',
    closeText: '닫기',
    loadingText: '로딩 중...',
    emptyText: '데이터 없음',
    noMoreText: '더 이상 없습니다'
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
  timeline: {
    pendingText: '로딩 중...'
  },
  pagination: {
    totalText: '총 {total}개',
    itemsPerPageText: '개/페이지',
    jumpToText: '이동',
    pageText: '페이지',
    prevPageAriaLabel: '이전 페이지',
    nextPageAriaLabel: '다음 페이지',
    pageAriaLabel: '{page} 페이지',
    pageIndicatorText: '전체 {total}페이지 중 {current}페이지'
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
    unlockColumnAriaLabel: '{column} 열 고정 해제'
  },
  formWizard: {
    prevText: '이전',
    nextText: '다음',
    finishText: '완료'
  },
  taskBoard: {
    emptyColumnText: '작업 없음',
    addCardText: '작업 추가',
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
    doneText: '완료'
  },
  inputOtp: {
    groupLabel: '일회용 비밀번호',
    slotLabel: '총 {total}자 중 {index}번째'
  },
  tagsInput: {
    removeTagLabel: '{tag} 제거',
    clearAllLabel: '모든 태그 지우기'
  }
})
