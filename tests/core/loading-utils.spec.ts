/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOADING_BACKGROUND,
  getLoadingIndicator,
  getSpinnerSVG,
  getLoadingLabel
} from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { enUS } from '@expcat/tigercat-core/locales/en-US'

const OLD_LOCKED_WHITE_MASK = 'rgba(255, 255, 255, 0.9)'

describe('Loading fullscreen mask default', () => {
  it('follows --tiger-surface at ~0.9 alpha instead of a locked light rgba', () => {
    expect(DEFAULT_LOADING_BACKGROUND).toContain('--tiger-surface')
    expect(DEFAULT_LOADING_BACKGROUND).toContain('color-mix')
    expect(DEFAULT_LOADING_BACKGROUND).not.toContain('--tiger-loading-mask')
    expect(DEFAULT_LOADING_BACKGROUND).not.toBe(OLD_LOCKED_WHITE_MASK)
    expect(DEFAULT_LOADING_BACKGROUND).not.toContain(OLD_LOCKED_WHITE_MASK)
  })
})

describe('Loading indicator tree', () => {
  it('returns an empty SVG for dots/bars instead of the spinner glyph', () => {
    expect(getSpinnerSVG('dots').elements).toEqual([])
    expect(getSpinnerSVG('bars').elements).toEqual([])
    expect(getSpinnerSVG('spinner').elements.length).toBeGreaterThan(0)
  })

  it('describes dots and bars as item groups', () => {
    const dots = getLoadingIndicator({
      variant: 'dots',
      size: 'md',
      color: 'primary'
    })
    const bars = getLoadingIndicator({
      variant: 'bars',
      size: 'md',
      color: 'primary'
    })
    expect(dots.kind).toBe('items')
    expect(bars.kind).toBe('items')
    if (dots.kind === 'items') expect(dots.items).toHaveLength(3)
    if (bars.kind === 'items') expect(bars.items).toHaveLength(3)
  })
})

describe('Loading accessible name', () => {
  it('falls back to official en-US common.loadingText', () => {
    expect(getLoadingLabel()).toBe(enUS.common?.loadingText)
    expect(getLoadingLabel()).toBe('Loading...')
  })

  it('reads official locale objects', () => {
    expect(getLoadingLabel(zhCN)).toBe('加载中...')
    expect(getLoadingLabel(zhTW)).toBe('載入中...')
    expect(getLoadingLabel(jaJP)).toBe('読み込み中...')
  })

  it('lets an explicit text override the locale', () => {
    expect(getLoadingLabel(zhCN, 'Syncing')).toBe('Syncing')
  })
})
