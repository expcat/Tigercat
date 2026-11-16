import { describe, it, expect } from 'vitest'
import {
  getSegmentedContainerClasses,
  getSegmentedContainerStyle,
  getSegmentedIndicatorClasses,
  getSegmentedIndicatorStyle,
  getSegmentedKeyboardTarget,
  getSegmentedOptionClasses,
  defaultTheme,
  modernTheme,
  themeConfigOwnCssVars
} from '@expcat/tigercat-core'

describe('segmented-utils', () => {
  it('builds equal grid columns for all options', () => {
    expect(getSegmentedContainerStyle(3)).toEqual({
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
    })
  })

  it('moves the indicator on the inline axis', () => {
    const style = getSegmentedIndicatorStyle(2, 4, 'md')
    expect(style.insetInlineStart).toContain('2 *')
    expect(style.width).toContain('/ 4')
    expect(style.opacity).toBe('1')
  })

  it('hides the indicator when there is no selected option', () => {
    expect(getSegmentedIndicatorStyle(-1, 3, 'sm').opacity).toBe('0')
  })

  it('uses surface tokens for the track and indicator', () => {
    expect(getSegmentedContainerClasses('md', false)).toContain('--tiger-surface-muted')
    expect(getSegmentedIndicatorClasses('md')).toContain('--tiger-surface-raised')
  })

  it.each([defaultTheme, modernTheme])(
    'distinguishes the unfocused dark $name selection',
    (theme) => {
      const vars = themeConfigOwnCssVars(theme.dark)
      const indicatorClasses = getSegmentedIndicatorClasses('lg')
      const fill = (
        /dark:bg-\[(.*?)\](?:\s|$)/.exec(indicatorClasses)?.[1] ??
        /(?:^|\s)bg-\[(.*?)\]/.exec(indicatorClasses)![1]
      )
        .replaceAll('_', ' ')
        .replace(/var\((--[\w-]+)\)/g, (_, token: string) => vars[token])
      const trackToken = /bg-\[var\((--[\w-]+)\)\]/.exec(
        getSegmentedContainerClasses('lg', true)
      )![1]
      const mix = /color-mix\(in srgb,\s*(#[\da-f]+) (\d+)%,\s*(#[\da-f]+)\)/i.exec(fill)
      const channels = (hex: string) =>
        [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16))
      const resolvedFill = mix
        ? channels(mix[1]).map((value, index) =>
            Math.round(
              (value * Number(mix[2]) + channels(mix[3])[index] * (100 - Number(mix[2]))) / 100
            )
          )
        : channels(fill)

      expect(resolvedFill.every(Number.isFinite)).toBe(true)
      expect(resolvedFill).not.toEqual(channels(vars[trackToken]))
    }
  )

  it('leaves room for the icon and a complete lg label in the narrow demo', () => {
    const classes = getSegmentedOptionClasses('lg', false, false)
    const padding = Number(/(?:^|\s)px-(\d+)(?:\s|$)/.exec(classes)![1]) * 4
    // Reported 390px layout: 63.25px column, 16px icon, 4px gap, 16px CJK glyph.
    expect(63.25 - padding * 2 - 16 - 4).toBeGreaterThanOrEqual(16)
    const desktopPadding = Number(/sm:px-(\d+)/.exec(classes)?.[1] ?? padding / 4) * 4
    expect(desktopPadding).toBe(16)
  })

  it('moves ArrowRight toward reading start in RTL', () => {
    expect(getSegmentedKeyboardTarget('ArrowRight', 1, [0, 1, 2], false)).toBe(2)
    expect(getSegmentedKeyboardTarget('ArrowRight', 1, [0, 1, 2], true)).toBe(0)
    expect(getSegmentedKeyboardTarget('Home', 2, [0, 1, 2], true)).toBe(0)
    expect(getSegmentedKeyboardTarget('End', 0, [0, 1, 2], true)).toBe(2)
  })
})
