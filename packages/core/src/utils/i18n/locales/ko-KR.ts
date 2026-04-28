/**
 * Korean (ko-KR).
 */

import type { TigerLocale } from '../../../types/locale'

export const koKR: TigerLocale = {
  common: {
    okText: '확인',
    cancelText: '취소',
    closeText: '닫기',
    loadingText: '로딩 중...',
    emptyText: '데이터 없음'
  },
  modal: {
    closeAriaLabel: '닫기',
    okText: '확인',
    cancelText: '취소'
  },
  drawer: {
    closeAriaLabel: '닫기'
  },
  pagination: {
    totalText: '총 {total}개',
    itemsPerPageText: '개/페이지',
    jumpToText: '이동',
    pageText: '페이지',
    prevPageAriaLabel: '이전 페이지',
    nextPageAriaLabel: '다음 페이지',
    pageAriaLabel: '{page} 페이지'
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
  }
}
