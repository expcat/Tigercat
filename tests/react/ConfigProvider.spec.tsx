/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, it, expect } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import React from 'react'
import { ConfigProvider, useTigerConfig } from '@expcat/tigercat-react/ConfigProvider'
import {
  getGlobalTigerLocale,
  resetDocumentConfigScope,
  resetTigerLocaleScope,
  ThemeManager,
  type TigerLocale
} from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function LocaleDisplay() {
  const config = useTigerConfig()
  return (
    <div>
      <span data-testid="ok">{config.locale?.common?.okText ?? 'default'}</span>
      <span data-testid="loading">{config.localeLoading ? 'loading' : 'ready'}</span>
      <span data-testid="direction">{config.direction ?? 'none'}</span>
      <span data-testid="theme">{config.theme ?? 'none'}</span>
    </div>
  )
}

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
        <ConfigProvider locale={locale}>
          <LocaleDisplay />
        </ConfigProvider>
      )

      expect(getByTestId('ok').textContent).toBe('确定')
      expect(getByTestId('loading').textContent).toBe('ready')
    })

    it('derives RTL direction from locale metadata and applies document dir', () => {
      const { getByTestId } = render(
        <ConfigProvider locale={{ locale: 'ar-SA', direction: 'rtl' }}>
          <LocaleDisplay />
        </ConfigProvider>
      )

      expect(getByTestId('direction').textContent).toBe('rtl')
      expect(document.documentElement.getAttribute('dir')).toBe('rtl')
      expect(document.documentElement.getAttribute('data-tiger-dir')).toBe('rtl')
    })

    it('merges nested ConfigProvider locales', () => {
      const { getByTestId } = render(
        <ConfigProvider locale={{ common: { okText: 'Outer' } }}>
          <ConfigProvider locale={{ common: { cancelText: 'Inner Cancel' } }}>
            <LocaleDisplay />
          </ConfigProvider>
        </ConfigProvider>
      )

      // Inner overrides are shallow-merged per section, but okText comes from outer
      expect(getByTestId('ok').textContent).toBe('Outer')
    })

    it('resolves nested overlay locale direction from the overlay language, not the parent', () => {
      const { getByTestId } = render(
        <ConfigProvider locale={{ locale: 'ar-SA', direction: 'rtl' }}>
          <ConfigProvider locale={{ locale: 'en-US', empty: { noResults: 'None' } }}>
            <LocaleDisplay />
          </ConfigProvider>
        </ConfigProvider>
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
        <ConfigProvider locale={loader}>
          <LocaleDisplay />
        </ConfigProvider>
      )

      // Initially loading
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
        <ConfigProvider locale={promise}>
          <LocaleDisplay />
        </ConfigProvider>
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
        <ConfigProvider locale={loader}>
          <LocaleDisplay />
        </ConfigProvider>
      )

      await waitFor(() => {
        expect(getByTestId('ok').textContent).toBe('Module')
      })
    })

    it('falls back gracefully when loader rejects', async () => {
      const loader = () => Promise.reject(new Error('network error'))

      const { getByTestId } = render(
        <ConfigProvider locale={loader}>
          <LocaleDisplay />
        </ConfigProvider>
      )

      expect(getByTestId('loading').textContent).toBe('loading')

      await waitFor(() => {
        expect(getByTestId('loading').textContent).toBe('ready')
      })

      // Falls back to default (no locale loaded)
      expect(getByTestId('ok').textContent).toBe('default')
    })

    it('propagates localeLoading through nested providers', async () => {
      let resolveOuter!: (v: Partial<TigerLocale>) => void
      const outerPromise = new Promise<Partial<TigerLocale>>((r) => {
        resolveOuter = r
      })

      const { getByTestId } = render(
        <ConfigProvider locale={() => outerPromise}>
          <ConfigProvider locale={{ common: { cancelText: 'Inner' } }}>
            <LocaleDisplay />
          </ConfigProvider>
        </ConfigProvider>
      )

      // Inner should see localeLoading=true because outer is loading
      expect(getByTestId('loading').textContent).toBe('loading')

      await act(async () => {
        resolveOuter({ common: { okText: 'Outer Done' } })
      })

      await waitFor(() => {
        expect(getByTestId('loading').textContent).toBe('ready')
        expect(getByTestId('ok').textContent).toBe('Outer Done')
      })
    })
  })

  describe('document ownership', () => {
    it('keeps the outer theme on the document while nested providers only change context', () => {
      function NestedTheme({ showInner }: { showInner: boolean }) {
        return (
          <ConfigProvider theme="vibrant">
            {showInner ? (
              <ConfigProvider theme="minimal">
                <LocaleDisplay />
              </ConfigProvider>
            ) : (
              <LocaleDisplay />
            )}
          </ConfigProvider>
        )
      }

      const { getByTestId, rerender } = render(<NestedTheme showInner />)

      expect(getByTestId('theme').textContent).toBe('minimal')
      expect(ThemeManager.getCurrentTheme()).toBe('vibrant')

      rerender(<NestedTheme showInner={false} />)

      expect(getByTestId('theme').textContent).toBe('vibrant')
      expect(ThemeManager.getCurrentTheme()).toBe('vibrant')
    })

    it('does not remove an existing html dir when unmounting a locale-only provider', () => {
      document.documentElement.setAttribute('dir', 'rtl')

      const { unmount } = render(
        <ConfigProvider locale={{ common: { okText: 'OK' } }}>
          <LocaleDisplay />
        </ConfigProvider>
      )

      unmount()

      expect(document.documentElement.getAttribute('dir')).toBe('rtl')
    })

    it('writes lang from the locale id and restores it on unmount', () => {
      document.documentElement.setAttribute('lang', 'en')

      const { unmount } = render(
        <ConfigProvider locale={{ locale: 'zh-CN' }}>
          <span>中文</span>
        </ConfigProvider>
      )

      expect(document.documentElement.getAttribute('lang')).toBe('zh-CN')

      unmount()

      expect(document.documentElement.getAttribute('lang')).toBe('en')
    })

    it('does not clear an existing html lang when the provider has no locale id', () => {
      document.documentElement.setAttribute('lang', 'en')

      const { unmount } = render(
        <ConfigProvider locale={{ common: { okText: 'OK' } }}>
          <LocaleDisplay />
        </ConfigProvider>
      )

      expect(document.documentElement.getAttribute('lang')).toBe('en')

      unmount()

      expect(document.documentElement.getAttribute('lang')).toBe('en')
    })

    it('exposes the ConfigProvider locale to imperative APIs during the first render', () => {
      function ImperativeLocale() {
        return <span data-testid="global">{getGlobalTigerLocale()?.common?.okText ?? 'empty'}</span>
      }

      const { getByTestId } = render(
        <ConfigProvider locale={{ common: { okText: '确定' } }}>
          <ImperativeLocale />
        </ConfigProvider>
      )

      expect(getByTestId('global').textContent).toBe('确定')
    })

    it('does not restore over a remaining sibling owner', () => {
      const first = render(
        <ConfigProvider direction="rtl">
          <span>first</span>
        </ConfigProvider>
      )
      const second = render(
        <ConfigProvider direction="ltr">
          <span>second</span>
        </ConfigProvider>
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
      const { getByTestId } = render(<LocaleDisplay />)

      expect(getByTestId('ok').textContent).toBe('default')
      expect(getByTestId('loading').textContent).toBe('ready')
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ConfigProvider />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
