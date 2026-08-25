import { describe, it, expect } from 'vitest'
import {
  defineText,
  getPaginationLabels,
  getTableLabels,
  getFormWizardLabels,
  getTaskBoardLabels,
  getSelectLabels,
  getChatWindowLabels,
  getCodeLabels,
  getCommentThreadLabels,
  getActivityFeedLabels,
  getNotificationCenterLabels,
  getChatMessageStatusInfo,
  buildChatMessageStatusInfo,
  DEFAULT_PAGINATION_LABELS,
  DEFAULT_TABLE_LABELS,
  DEFAULT_FORM_WIZARD_LABELS,
  DEFAULT_TASK_BOARD_LABELS,
  DEFAULT_SELECT_LABELS,
  DEFAULT_CHAT_WINDOW_LABELS,
  DEFAULT_CODE_LABELS,
  DEFAULT_COMMENT_THREAD_LABELS,
  DEFAULT_ACTIVITY_FEED_LABELS,
  DEFAULT_NOTIFICATION_CENTER_LABELS,
  ZH_CN_CHAT_WINDOW_LABELS,
  ZH_CN_CODE_LABELS,
  ZH_CN_COMMENT_THREAD_LABELS,
  ZH_CN_ACTIVITY_FEED_LABELS,
  ZH_CN_NOTIFICATION_CENTER_LABELS
} from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'

describe('custom-text overrides on label resolvers', () => {
  describe('getPaginationLabels', () => {
    it('falls back to English defaults with no locale or overrides', () => {
      expect(getPaginationLabels()).toEqual(DEFAULT_PAGINATION_LABELS)
    })

    it('uses flat overrides without needing a locale (single-language use)', () => {
      const labels = getPaginationLabels(undefined, { totalText: '{total} results' })
      expect(labels.totalText).toBe('{total} results')
      // Unspecified fields still fall back to defaults
      expect(labels.itemsPerPageText).toBe(DEFAULT_PAGINATION_LABELS.itemsPerPageText)
    })

    it('ranks overrides above the locale object', () => {
      const labels = getPaginationLabels(
        { pagination: { totalText: 'from-locale', jumpToText: 'locale-jump' } },
        { totalText: 'from-overrides' }
      )
      expect(labels.totalText).toBe('from-overrides')
      // Locale still wins for fields the overrides omit
      expect(labels.jumpToText).toBe('locale-jump')
    })
  })

  describe('getFormWizardLabels', () => {
    it('ranks overrides above locale and default', () => {
      const labels = getFormWizardLabels(
        { formWizard: { prevText: 'locale-prev', nextText: 'locale-next' } },
        { prevText: 'override-prev' }
      )
      expect(labels.prevText).toBe('override-prev')
      expect(labels.nextText).toBe('locale-next')
      expect(labels.finishText).toBe(DEFAULT_FORM_WIZARD_LABELS.finishText)
    })
  })

  describe('getTableLabels', () => {
    it('falls back to English table defaults with no locale or overrides', () => {
      expect(getTableLabels()).toEqual(DEFAULT_TABLE_LABELS)
    })

    it('uses Chinese table defaults for zh locales', () => {
      const labels = getTableLabels({ locale: 'zh-CN' })
      expect(labels.searchButtonText).toBe('搜索')
      expect(labels.expandText).toBe('展开')
    })

    it('ranks overrides above locale and default', () => {
      const labels = getTableLabels(
        { table: { searchButtonText: 'locale-search', selectedText: 'locale-selected' } },
        { searchButtonText: 'override-search' }
      )
      expect(labels.searchButtonText).toBe('override-search')
      expect(labels.selectedText).toBe('locale-selected')
      expect(labels.emptyText).toBe(DEFAULT_TABLE_LABELS.emptyText)
    })
  })

  describe('getTaskBoardLabels', () => {
    it('ranks overrides above locale and default', () => {
      const labels = getTaskBoardLabels(
        { taskBoard: { addCardText: 'locale-add' } },
        { emptyColumnText: 'Nothing here' }
      )
      expect(labels.emptyColumnText).toBe('Nothing here')
      expect(labels.addCardText).toBe('locale-add')
      expect(labels.boardAriaLabel).toBe(DEFAULT_TASK_BOARD_LABELS.boardAriaLabel)
    })
  })

  describe('getChatWindowLabels', () => {
    it('falls back to English defaults with no locale', () => {
      expect(getChatWindowLabels()).toEqual(DEFAULT_CHAT_WINDOW_LABELS)
    })

    it('uses Chinese defaults for zh locales and zh-CN preset', () => {
      expect(getChatWindowLabels({ locale: 'zh-CN' }).sendText).toBe('发送')
      expect(getChatWindowLabels(zhCN).emptyText).toBe('暂无消息')
      expect(getChatWindowLabels(zhCN)).toEqual(ZH_CN_CHAT_WINDOW_LABELS)
    })

    it('ranks overrides above locale and default', () => {
      const labels = getChatWindowLabels(
        { chatWindow: { sendText: 'locale-send', emptyText: 'locale-empty' } },
        { sendText: 'override-send' }
      )
      expect(labels.sendText).toBe('override-send')
      expect(labels.emptyText).toBe('locale-empty')
      expect(labels.placeholder).toBe(DEFAULT_CHAT_WINDOW_LABELS.placeholder)
    })
  })

  describe('getCodeLabels', () => {
    it('falls back to English Copy / Copied / Copy failed with no locale', () => {
      expect(getCodeLabels()).toEqual(DEFAULT_CODE_LABELS)
      expect(getCodeLabels(undefined).copyLabel).toBe('Copy')
      expect(getCodeLabels(undefined).copiedLabel).toBe('Copied')
      expect(getCodeLabels(undefined).copyFailedLabel).toBe('Copy failed')
    })

    it('uses Chinese defaults for zh locales and zh-CN preset', () => {
      expect(getCodeLabels({ locale: 'zh-CN' }).copyLabel).toBe('复制')
      expect(getCodeLabels({ locale: 'zh-CN' }).copiedLabel).toBe('已复制')
      expect(getCodeLabels({ locale: 'zh-CN' }).copyFailedLabel).toBe('复制失败')
      expect(getCodeLabels(zhCN)).toEqual(ZH_CN_CODE_LABELS)
    })

    it('ranks overrides above locale and default', () => {
      const labels = getCodeLabels(
        { code: { copyLabel: 'locale-copy', copiedLabel: 'locale-copied' } },
        { copyLabel: 'Clone' }
      )
      expect(labels.copyLabel).toBe('Clone')
      expect(labels.copiedLabel).toBe('locale-copied')
      expect(labels.copyFailedLabel).toBe(DEFAULT_CODE_LABELS.copyFailedLabel)
    })
  })

  describe('getCommentThreadLabels', () => {
    it('falls back to English defaults with no locale', () => {
      expect(getCommentThreadLabels()).toEqual(DEFAULT_COMMENT_THREAD_LABELS)
    })

    it('uses Chinese defaults for zh locales and zh-CN preset', () => {
      expect(getCommentThreadLabels({ locale: 'zh-CN' }).likeText).toBe('点赞')
      expect(getCommentThreadLabels(zhCN).expandRepliesText).toBe('▸ 展开 {count} 条回复')
      expect(getCommentThreadLabels(zhCN)).toEqual(ZH_CN_COMMENT_THREAD_LABELS)
    })

    it('ranks overrides above locale and default', () => {
      const labels = getCommentThreadLabels(
        { commentThread: { likeText: 'locale-like', replyText: 'locale-reply' } },
        { likeText: 'override-like' }
      )
      expect(labels.likeText).toBe('override-like')
      expect(labels.replyText).toBe('locale-reply')
      expect(labels.emptyText).toBe(DEFAULT_COMMENT_THREAD_LABELS.emptyText)
    })
  })

  describe('getActivityFeedLabels', () => {
    it('falls back to English defaults with no locale', () => {
      expect(getActivityFeedLabels()).toEqual(DEFAULT_ACTIVITY_FEED_LABELS)
    })

    it('uses Chinese defaults for zh locales and zh-CN preset', () => {
      expect(getActivityFeedLabels({ locale: 'zh-CN' }).emptyText).toBe('暂无动态')
      expect(getActivityFeedLabels(zhCN)).toEqual(ZH_CN_ACTIVITY_FEED_LABELS)
    })

    it('ranks overrides above locale and default', () => {
      const labels = getActivityFeedLabels(
        { activityFeed: { emptyText: 'locale-empty', loadingText: 'locale-loading' } },
        { emptyText: 'override-empty' }
      )
      expect(labels.emptyText).toBe('override-empty')
      expect(labels.loadingText).toBe('locale-loading')
    })
  })

  describe('getNotificationCenterLabels', () => {
    it('falls back to English defaults with no locale', () => {
      expect(getNotificationCenterLabels()).toEqual(DEFAULT_NOTIFICATION_CENTER_LABELS)
    })

    it('uses Chinese defaults for zh locales and zh-CN preset', () => {
      expect(getNotificationCenterLabels({ locale: 'zh-CN' }).title).toBe('通知中心')
      expect(getNotificationCenterLabels(zhCN).markAllReadText).toBe('全部标记已读')
      expect(getNotificationCenterLabels(zhCN)).toEqual(ZH_CN_NOTIFICATION_CENTER_LABELS)
    })

    it('ranks overrides above locale and default', () => {
      const labels = getNotificationCenterLabels(
        { notificationCenter: { title: 'locale-title', markAllReadText: 'locale-mark' } },
        { title: 'override-title' }
      )
      expect(labels.title).toBe('override-title')
      expect(labels.markAllReadText).toBe('locale-mark')
      expect(labels.emptyText).toBe(DEFAULT_NOTIFICATION_CENTER_LABELS.emptyText)
    })
  })

  describe('getChatMessageStatusInfo', () => {
    it('uses English Delivered by default', () => {
      expect(getChatMessageStatusInfo('sent').text).toBe('Delivered')
      expect(getChatMessageStatusInfo('sending').text).toBe('Sending')
      expect(getChatMessageStatusInfo('failed').text).toBe('Failed to send')
    })

    it('uses Chinese status text when given a zh labels map', () => {
      const zhMap = buildChatMessageStatusInfo(getChatWindowLabels({ locale: 'zh-CN' }))
      expect(getChatMessageStatusInfo('sent', zhMap).text).toBe('已送达')
      expect(getChatMessageStatusInfo('sending', zhMap).text).toBe('发送中')
      expect(getChatMessageStatusInfo('failed', zhMap).text).toBe('发送失败')
      expect(zhMap.sent.className).toBe(getChatMessageStatusInfo('sent').className)
    })
  })

  describe('getSelectLabels', () => {
    it('falls back to English defaults with no locale or overrides', () => {
      expect(getSelectLabels()).toEqual(DEFAULT_SELECT_LABELS)
    })

    it('uses Chinese defaults for zh locales', () => {
      const labels = getSelectLabels({ locale: 'zh-CN' })
      expect(labels.doneText).toBe('完成')
    })

    it('ranks overrides above locale and common fallback', () => {
      const labels = getSelectLabels(
        { select: { doneText: 'LocaleDone' }, common: { okText: 'CommonOK' } },
        { doneText: 'OverrideDone' }
      )
      expect(labels.doneText).toBe('OverrideDone')
    })
  })
})

describe('defineText()', () => {
  it('returns only the flat text overlay', () => {
    const text = defineText({
      modal: { okText: 'Confirm' },
      table: { searchButtonText: 'Find' },
      pagination: { totalText: '{total} items found' }
    })
    expect(text.modal?.okText).toBe('Confirm')
    expect(text.pagination?.totalText).toBe('{total} items found')
    expect(text.table?.searchButtonText).toBe('Find')
    expect(text.modal?.cancelText).toBeUndefined()
    expect(text.formWizard).toBeUndefined()
  })

  it('returns an empty overlay when called without arguments', () => {
    expect(defineText()).toEqual({})
  })
})
