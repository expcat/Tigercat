/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, it, expect } from 'vitest'
import { render, waitFor } from '@testing-library/vue'
import { defineComponent, h, ref } from 'vue'
import { ConfigProvider, useTigerConfig } from '@expcat/tigercat-vue/ConfigProvider'
import {
  getGlobalTigerLocale,
  resetDocumentConfigScope,
  resetTigerLocaleScope,
  ThemeManager,
  type TigerLocale
} from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

const LocaleDisplay = defineComponent({
  name: 'LocaleDisplay',
  setup() {
    const config = useTigerConfig()
    return () =>
      h('div', [
        h('span', { 'data-testid': 'ok' }, config.value.locale?.common?.okText ?? 'default'),
        h('span', { 'data-testid': 'loading' }, config.value.localeLoading ? 'loading' : 'ready'),
        h('span', { 'data-testid': 'direction' }, config.value.direction ?? 'none'),
        h('span', { 'data-testid': 'theme' }, config.value.theme ?? 'none')
      ])
  }
})

function resetDocument(): void {
  resetDocumentConfigScope()
  resetTigerLocaleScope()
  ThemeManager.setTheme('default')
  ThemeManager.setColorScheme('light')
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('data-tiger-dir')
  document.documentElement.removeAttribute('lang')
  document.documentElement.removeAttribute('data-tiger-style')
  document.documentElement.classList.remove('dark')
}

describe('ConfigProvider', () => {
  afterEach(() => {
    resetDocument()
  })

  describe('sync locale', () => {
    it('provides a static locale to children', () => {
      const locale: Partial<TigerLocale> = {
        common: { okText: '确定' }
      }

      const { getByTestId } = render(
        defineComponent({
          setup() {
            return () => h(ConfigProvider, { locale }, () => h(LocaleDisplay))
          }
        })
      )

      expect(getByTestId('ok').textContent).toBe('确定')
      expect(getByTestId('loading').textContent).toBe('ready')
    })

    it('derives RTL direction from locale metadata and applies document dir', () => {
      const { getByTestId } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { locale: 'ar-SA', direction: 'rtl' } }, () =>
                h(LocaleDisplay)
              )
          }
        })
      )

      expect(getByTestId('direction').textContent).toBe('rtl')
      expect(document.documentElement.getAttribute('dir')).toBe('rtl')
      expect(document.documentElement.getAttribute('data-tiger-dir')).toBe('rtl')
    })

    it('merges nested ConfigProvider locales', () => {
      const { getByTestId } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { okText: 'Outer' } } }, () =>
                h(ConfigProvider, { locale: { common: { cancelText: 'Inner Cancel' } } }, () =>
                  h(LocaleDisplay)
                )
              )
          }
        })
      )

      expect(getByTestId('ok').textContent).toBe('Outer')
    })

    it('resolves nested overlay locale direction from the overlay language, not the parent', () => {
      const { getByTestId } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { locale: 'ar-SA', direction: 'rtl' } }, () =>
                h(
                  ConfigProvider,
                  { locale: { locale: 'en-US', empty: { noResults: 'None' } } },
                  () => h(LocaleDisplay)
                )
              )
          }
        })
      )

      expect(getByTestId('direction').textContent).toBe('ltr')
      expect(document.documentElement.getAttribute('dir')).toBe('rtl')
    })
  })

  describe('async locale', () => {
    it('resolves a loader function', async () => {
      const loader = () =>
        Promise.resolve({
          common: { okText: 'Loaded' }
        } as Partial<TigerLocale>)

      const { getByTestId } = render(
        defineComponent({
          setup() {
            return () => h(ConfigProvider, { locale: loader }, () => h(LocaleDisplay))
          }
        })
      )

      expect(getByTestId('loading').textContent).toBe('loading')

      await waitFor(() => {
        expect(getByTestId('ok').textContent).toBe('Loaded')
        expect(getByTestId('loading').textContent).toBe('ready')
      })
    })

    it('resolves a Promise locale', async () => {
      const promise = Promise.resolve({
        common: { okText: 'Promised' }
      } as Partial<TigerLocale>)

      const { getByTestId } = render(
        defineComponent({
          setup() {
            return () => h(ConfigProvider, { locale: promise }, () => h(LocaleDisplay))
          }
        })
      )

      await waitFor(() => {
        expect(getByTestId('ok').textContent).toBe('Promised')
        expect(getByTestId('loading').textContent).toBe('ready')
      })
    })

    it('resolves a module-shaped loader (default export)', async () => {
      const loader = () =>
        Promise.resolve({
          default: { common: { okText: 'Module' } } as Partial<TigerLocale>
        })

      const { getByTestId } = render(
        defineComponent({
          setup() {
            return () => h(ConfigProvider, { locale: loader }, () => h(LocaleDisplay))
          }
        })
      )

      await waitFor(() => {
        expect(getByTestId('ok').textContent).toBe('Module')
      })
    })

    it('falls back gracefully when loader rejects', async () => {
      const loader = () => Promise.reject(new Error('network error'))

      const { getByTestId } = render(
        defineComponent({
          setup() {
            return () => h(ConfigProvider, { locale: loader }, () => h(LocaleDisplay))
          }
        })
      )

      expect(getByTestId('loading').textContent).toBe('loading')

      await waitFor(() => {
        expect(getByTestId('loading').textContent).toBe('ready')
      })

      expect(getByTestId('ok').textContent).toBe('default')
    })

    it('propagates localeLoading through nested providers', async () => {
      let resolveOuter!: (v: Partial<TigerLocale>) => void
      const outerPromise = new Promise<Partial<TigerLocale>>((r) => {
        resolveOuter = r
      })

      const { getByTestId } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: () => outerPromise }, () =>
                h(ConfigProvider, { locale: { common: { cancelText: 'Inner' } } }, () =>
                  h(LocaleDisplay)
                )
              )
          }
        })
      )

      expect(getByTestId('loading').textContent).toBe('loading')

      resolveOuter({ common: { okText: 'Outer Done' } })

      await waitFor(() => {
        expect(getByTestId('loading').textContent).toBe('ready')
        expect(getByTestId('ok').textContent).toBe('Outer Done')
      })
    })
  })

  describe('document ownership', () => {
    it('keeps the outer theme on the document while nested providers only change context', async () => {
      const showInner = ref(true)
      const { getByTestId } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { theme: 'vibrant' }, () =>
                showInner.value
                  ? h(ConfigProvider, { theme: 'minimal' }, () => h(LocaleDisplay))
                  : h(LocaleDisplay)
              )
          }
        })
      )

      expect(getByTestId('theme').textContent).toBe('minimal')
      expect(ThemeManager.getCurrentTheme()).toBe('vibrant')

      showInner.value = false
      await waitFor(() => {
        expect(getByTestId('theme').textContent).toBe('vibrant')
      })
      expect(ThemeManager.getCurrentTheme()).toBe('vibrant')
    })

    it('does not remove an existing html dir when unmounting a locale-only provider', () => {
      document.documentElement.setAttribute('dir', 'rtl')

      const { unmount } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { okText: 'OK' } } }, () => h(LocaleDisplay))
          }
        })
      )

      unmount()

      expect(document.documentElement.getAttribute('dir')).toBe('rtl')
    })

    it('writes lang from the locale id and restores it on unmount', () => {
      document.documentElement.setAttribute('lang', 'en')

      const { unmount } = render(
        defineComponent({
          setup() {
            return () => h(ConfigProvider, { locale: { locale: 'zh-CN' } }, () => h('span', '中文'))
          }
        })
      )

      expect(document.documentElement.getAttribute('lang')).toBe('zh-CN')

      unmount()

      expect(document.documentElement.getAttribute('lang')).toBe('en')
    })

    it('does not clear an existing html lang when the provider has no locale id', () => {
      document.documentElement.setAttribute('lang', 'en')

      const { unmount } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { okText: 'OK' } } }, () => h(LocaleDisplay))
          }
        })
      )

      expect(document.documentElement.getAttribute('lang')).toBe('en')

      unmount()

      expect(document.documentElement.getAttribute('lang')).toBe('en')
    })

    it('exposes the ConfigProvider locale to imperative APIs during setup', () => {
      const ImperativeLocale = defineComponent({
        setup() {
          return () =>
            h(
              'span',
              { 'data-testid': 'global' },
              getGlobalTigerLocale()?.common?.okText ?? 'empty'
            )
        }
      })

      const { getByTestId } = render(
        defineComponent({
          setup() {
            return () =>
              h(ConfigProvider, { locale: { common: { okText: '确定' } } }, () =>
                h(ImperativeLocale)
              )
          }
        })
      )

      expect(getByTestId('global').textContent).toBe('确定')
    })

    it('does not restore over a remaining sibling owner', () => {
      const first = render(
        defineComponent({
          setup() {
            return () => h(ConfigProvider, { direction: 'rtl' }, () => h('span', 'first'))
          }
        })
      )
      const second = render(
        defineComponent({
          setup() {
            return () => h(ConfigProvider, { direction: 'ltr' }, () => h('span', 'second'))
          }
        })
      )

      expect(document.documentElement.getAttribute('dir')).toBe('ltr')

      first.unmount()

      expect(document.documentElement.getAttribute('dir')).toBe('ltr')

      second.unmount()

      expect(document.documentElement.getAttribute('dir')).toBeNull()
    })
  })

  describe('useTigerConfig', () => {
    it('returns empty config outside of ConfigProvider', () => {
      const { getByTestId } = render(LocaleDisplay)

      expect(getByTestId('ok').textContent).toBe('default')
      expect(getByTestId('loading').textContent).toBe('ready')
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(ConfigProvider)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
