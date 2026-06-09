import { describe, it, expect } from 'vitest'
import {
  defineText,
  getPaginationLabels,
  getFormWizardLabels,
  getTaskBoardLabels,
  DEFAULT_PAGINATION_LABELS,
  DEFAULT_FORM_WIZARD_LABELS,
  DEFAULT_TASK_BOARD_LABELS
} from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'

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
})

describe('defineText()', () => {
  it('produces a fully-populated locale from a flat text overlay', () => {
    const text = defineText({
      modal: { okText: 'Confirm' },
      pagination: { totalText: '{total} items found' }
    })
    expect(text.modal?.okText).toBe('Confirm')
    expect(text.pagination?.totalText).toBe('{total} items found')
    // Untouched fields inherit the enUS baseline
    expect(text.modal?.cancelText).toBe(enUS.modal?.cancelText)
    expect(text.formWizard?.finishText).toBe(enUS.formWizard?.finishText)
  })

  it('returns the enUS baseline when called without arguments', () => {
    expect(defineText()).toEqual(enUS)
  })
})
