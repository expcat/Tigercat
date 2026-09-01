import { describe, it, expect } from 'vitest'
import {
  defineText,
  getPaginationLabels,
  getTableLabels,
  getFormWizardLabels,
  getTaskBoardLabels,
  getSelectLabels,
  getColorPickerLabels,
  getChatWindowLabels,
  getCodeLabels,
  getCommentThreadLabels,
  getActivityFeedLabels,
  getNotificationCenterLabels,
  getChatMessageStatusInfo,
  buildChatMessageStatusInfo,
  getTourLabels,
  getModalLabels,
  getDrawerLabels
} from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'

describe('custom-text overrides on label resolvers', () => {
  describe('getPaginationLabels', () => {
    it('falls back to English defaults with no locale or overrides', () => {
      expect(getPaginationLabels()).toEqual(enUS.pagination)
    })

    it('uses flat overrides without needing a locale (single-language use)', () => {
      const labels = getPaginationLabels(undefined, { totalText: '{total} results' })
      expect(labels.totalText).toBe('{total} results')
      expect(labels.itemsPerPageText).toBe(enUS.pagination?.itemsPerPageText)
    })

    it('ranks overrides above the locale object', () => {
      const labels = getPaginationLabels(
        { pagination: { totalText: 'from-locale', jumpToText: 'locale-jump' } },
        { totalText: 'from-overrides' }
      )
      expect(labels.totalText).toBe('from-overrides')
      expect(labels.jumpToText).toBe('locale-jump')
    })

    it('does not guess Simplified Chinese from a locale id', () => {
      expect(getPaginationLabels({ locale: 'zh-CN' }).totalText).toBe(enUS.pagination?.totalText)
      expect(getPaginationLabels(zhCN).totalText).toBe(zhCN.pagination?.totalText)
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
      expect(labels.finishText).toBe(enUS.formWizard?.finishText)
    })
  })

  describe('getTableLabels', () => {
    it('falls back to English table defaults with no locale or overrides', () => {
      expect(getTableLabels()).toEqual(enUS.table)
    })

    it('reads Chinese from the zh-CN pack, not from locale: zh-CN', () => {
      expect(getTableLabels({ locale: 'zh-CN' }).searchButtonText).toBe(
        enUS.table?.searchButtonText
      )
      expect(getTableLabels(zhCN).searchButtonText).toBe('搜索')
      expect(getTableLabels(zhCN).expandText).toBe('展开')
    })

    it('ranks overrides above locale and default', () => {
      const labels = getTableLabels(
        { table: { searchButtonText: 'locale-search', selectedText: 'locale-selected' } },
        { searchButtonText: 'override-search' }
      )
      expect(labels.searchButtonText).toBe('override-search')
      expect(labels.selectedText).toBe('locale-selected')
      expect(labels.emptyText).toBe(enUS.table?.emptyText)
    })

    it('skips undefined override leaves so they do not wipe locale values', () => {
      const labels = getTableLabels(
        { table: { searchButtonText: 'locale-search' } },
        { searchButtonText: undefined, emptyText: 'override-empty' }
      )
      expect(labels.searchButtonText).toBe('locale-search')
      expect(labels.emptyText).toBe('override-empty')
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
      expect(labels.boardAriaLabel).toBe(enUS.taskBoard?.boardAriaLabel)
    })
  })

  describe('getChatWindowLabels', () => {
    it('falls back to English defaults with no locale', () => {
      expect(getChatWindowLabels()).toEqual(enUS.chatWindow)
    })

    it('reads Chinese from the zh-CN pack, not from locale: zh-CN', () => {
      expect(getChatWindowLabels({ locale: 'zh-CN' }).sendText).toBe(enUS.chatWindow?.sendText)
      expect(getChatWindowLabels(zhCN).emptyText).toBe('暂无消息')
      expect(getChatWindowLabels(zhCN)).toEqual(zhCN.chatWindow)
    })

    it('ranks overrides above locale and default', () => {
      const labels = getChatWindowLabels(
        { chatWindow: { sendText: 'locale-send', emptyText: 'locale-empty' } },
        { sendText: 'override-send' }
      )
      expect(labels.sendText).toBe('override-send')
      expect(labels.emptyText).toBe('locale-empty')
      expect(labels.placeholder).toBe(enUS.chatWindow?.placeholder)
    })
  })

  describe('getCodeLabels', () => {
    it('falls back to English Copy / Copied / Copy failed with no locale', () => {
      expect(getCodeLabels()).toEqual(enUS.code)
      expect(getCodeLabels(undefined).copyLabel).toBe('Copy')
      expect(getCodeLabels(undefined).copiedLabel).toBe('Copied')
      expect(getCodeLabels(undefined).copyFailedLabel).toBe('Copy failed')
    })

    it('reads Chinese from the zh-CN pack, not from locale: zh-CN', () => {
      expect(getCodeLabels({ locale: 'zh-CN' }).copyLabel).toBe('Copy')
      expect(getCodeLabels(zhCN)).toEqual(zhCN.code)
    })

    it('ranks overrides above locale and default', () => {
      const labels = getCodeLabels(
        { code: { copyLabel: 'locale-copy', copiedLabel: 'locale-copied' } },
        { copyLabel: 'Clone' }
      )
      expect(labels.copyLabel).toBe('Clone')
      expect(labels.copiedLabel).toBe('locale-copied')
      expect(labels.copyFailedLabel).toBe(enUS.code?.copyFailedLabel)
    })
  })

  describe('getCommentThreadLabels', () => {
    it('falls back to English defaults with no locale', () => {
      expect(getCommentThreadLabels()).toEqual(enUS.commentThread)
    })

    it('reads Chinese from the zh-CN pack, not from locale: zh-CN', () => {
      expect(getCommentThreadLabels({ locale: 'zh-CN' }).likeText).toBe(
        enUS.commentThread?.likeText
      )
      expect(getCommentThreadLabels(zhCN).expandRepliesText).toBe('▸ 展开 {count} 条回复')
      expect(getCommentThreadLabels(zhCN)).toEqual(zhCN.commentThread)
    })

    it('ranks overrides above locale and default', () => {
      const labels = getCommentThreadLabels(
        { commentThread: { likeText: 'locale-like', replyText: 'locale-reply' } },
        { likeText: 'override-like' }
      )
      expect(labels.likeText).toBe('override-like')
      expect(labels.replyText).toBe('locale-reply')
      expect(labels.emptyText).toBe(enUS.commentThread?.emptyText)
    })
  })

  describe('getActivityFeedLabels', () => {
    it('falls back to English defaults with no locale', () => {
      expect(getActivityFeedLabels()).toEqual(enUS.activityFeed)
    })

    it('reads Chinese from the zh-CN pack, not from locale: zh-CN', () => {
      expect(getActivityFeedLabels({ locale: 'zh-CN' }).emptyText).toBe(
        enUS.activityFeed?.emptyText
      )
      expect(getActivityFeedLabels(zhCN)).toEqual(zhCN.activityFeed)
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
      expect(getNotificationCenterLabels()).toEqual(enUS.notificationCenter)
    })

    it('reads Chinese from the zh-CN pack, not from locale: zh-CN', () => {
      expect(getNotificationCenterLabels({ locale: 'zh-CN' }).title).toBe(
        enUS.notificationCenter?.title
      )
      expect(getNotificationCenterLabels(zhCN).markAllReadText).toBe('全部标记已读')
      expect(getNotificationCenterLabels(zhCN)).toEqual(zhCN.notificationCenter)
    })

    it('ranks overrides above locale and default', () => {
      const labels = getNotificationCenterLabels(
        { notificationCenter: { title: 'locale-title', markAllReadText: 'locale-mark' } },
        { title: 'override-title' }
      )
      expect(labels.title).toBe('override-title')
      expect(labels.markAllReadText).toBe('locale-mark')
      expect(labels.emptyText).toBe(enUS.notificationCenter?.emptyText)
    })
  })

  describe('getChatMessageStatusInfo', () => {
    it('uses English Delivered by default', () => {
      expect(getChatMessageStatusInfo('sent').text).toBe('Delivered')
      expect(getChatMessageStatusInfo('sending').text).toBe('Sending')
      expect(getChatMessageStatusInfo('failed').text).toBe('Failed to send')
    })

    it('uses Chinese status text when given a zh labels map', () => {
      const zhMap = buildChatMessageStatusInfo(getChatWindowLabels(zhCN))
      expect(getChatMessageStatusInfo('sent', zhMap).text).toBe('已送达')
      expect(getChatMessageStatusInfo('sending', zhMap).text).toBe('发送中')
      expect(getChatMessageStatusInfo('failed', zhMap).text).toBe('发送失败')
      expect(zhMap.sent.className).toBe(getChatMessageStatusInfo('sent').className)
    })
  })

  describe('getSelectLabels', () => {
    it('falls back to English defaults with no locale or overrides', () => {
      expect(getSelectLabels()).toEqual(enUS.select)
    })

    it('reads Chinese from the zh-CN pack, not from locale: zh-CN', () => {
      expect(getSelectLabels({ locale: 'zh-CN' }).doneText).toBe(enUS.select?.doneText)
      const labels = getSelectLabels(zhCN)
      expect(labels.doneText).toBe('完成')
      expect(labels.placeholder).toBe('请选择')
      expect(labels.emptyText).toBe('暂无选项')
    })

    it('ranks overrides above locale', () => {
      const labels = getSelectLabels(
        { select: { doneText: 'LocaleDone' }, common: { okText: 'CommonOK' } },
        { doneText: 'OverrideDone' }
      )
      expect(labels.doneText).toBe('OverrideDone')
    })
  })

  describe('getColorPickerLabels', () => {
    it('falls back to English Pick color / Color / Clear with no locale', () => {
      expect(getColorPickerLabels()).toEqual(enUS.colorPicker)
      expect(getColorPickerLabels(undefined).trigger).toBe('Pick color')
    })

    it('reads Chinese from the zh-CN pack, not from locale: zh-CN', () => {
      expect(getColorPickerLabels({ locale: 'zh-CN' }).trigger).toBe('Pick color')
      expect(getColorPickerLabels(zhCN).trigger).toBe('选择颜色')
      expect(getColorPickerLabels(zhCN)).toEqual(zhCN.colorPicker)
    })

    it('ranks overrides above locale and default', () => {
      const labels = getColorPickerLabels(
        { colorPicker: { trigger: 'locale-trigger', panelTitle: 'locale-title' } },
        { trigger: 'override-trigger' }
      )
      expect(labels.trigger).toBe('override-trigger')
      expect(labels.panelTitle).toBe('locale-title')
      expect(labels.clear).toBe(enUS.colorPicker?.clear)
    })
  })

  describe('getTourLabels', () => {
    it('does not read FormWizard when tour keys are missing', () => {
      const labels = getTourLabels({
        formWizard: { prevText: 'WizardPrev', nextText: 'WizardNext', finishText: 'WizardDone' }
      })
      expect(labels.prevText).toBe(enUS.tour?.prevText)
      expect(labels.nextText).toBe(enUS.tour?.nextText)
      expect(labels.finishText).toBe(enUS.tour?.finishText)
    })

    it('can fall back to common.closeText for closeAriaLabel', () => {
      const labels = getTourLabels({ common: { closeText: 'Dismiss' } })
      expect(labels.closeAriaLabel).toBe('Dismiss')
    })

    it('falls back to official en-US including dialog name', () => {
      expect(getTourLabels().dialogAriaLabel).toBe(enUS.tour?.dialogAriaLabel)
      expect(getTourLabels().nextText).toBe(enUS.tour?.nextText)
    })
  })

  describe('getModalLabels', () => {
    it('falls back to official en-US, not mixed Chinese', () => {
      expect(getModalLabels()).toEqual({
        closeAriaLabel: 'Close',
        okText: 'OK',
        cancelText: 'Cancel',
        dialogAriaLabel: 'Dialog'
      })
    })

    it('reads the official zhCN object and ranks labels above locale', () => {
      expect(getModalLabels(zhCN).okText).toBe('确定')
      expect(getModalLabels(zhCN).closeAriaLabel).toBe('关闭')
      expect(
        getModalLabels(zhCN, { closeAriaLabel: 'Dismiss', okText: 'Confirm' }).closeAriaLabel
      ).toBe('Dismiss')
    })
  })

  describe('getDrawerLabels', () => {
    it('falls back to official en-US Close, not Close drawer', () => {
      expect(getDrawerLabels()).toEqual({
        closeAriaLabel: 'Close',
        dialogAriaLabel: 'Drawer'
      })
    })

    it('reads the official zhCN object', () => {
      expect(getDrawerLabels(zhCN).closeAriaLabel).toBe('关闭')
      expect(getDrawerLabels(zhCN).dialogAriaLabel).toBe('抽屉')
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
