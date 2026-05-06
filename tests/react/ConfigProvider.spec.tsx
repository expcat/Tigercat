/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import React from 'react'
import { ConfigProvider, useTigerConfig } from '@expcat/tigercat-react'
import type { TigerLocale } from '@expcat/tigercat-core'

function LocaleDisplay() {
  const config = useTigerConfig()
  return (
    <div>
      <span data-testid="ok">{config.locale?.common?.okText ?? 'default'}</span>
      <span data-testid="loading">{config.localeLoading ? 'loading' : 'ready'}</span>
    </div>
  )
}

describe('ConfigProvider', () => {
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

  describe('useTigerConfig', () => {
    it('returns empty config outside of ConfigProvider', () => {
      const { getByTestId } = render(<LocaleDisplay />)

      expect(getByTestId('ok').textContent).toBe('default')
      expect(getByTestId('loading').textContent).toBe('ready')
    })
  })
})
