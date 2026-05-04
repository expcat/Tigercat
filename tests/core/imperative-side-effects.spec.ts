/**
 * @vitest-environment happy-dom
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { Message as ReactMessage, notification as reactNotification } from '@expcat/tigercat-react'
import { Message as VueMessage, notification as vueNotification } from '@expcat/tigercat-vue'

function readPackageJson(path: string) {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf-8')) as {
    sideEffects?: boolean | string[]
  }
}

async function flushMicrotasks() {
  await Promise.resolve()
  await Promise.resolve()
}

async function flushVueDom() {
  await nextTick()
  await flushMicrotasks()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await nextTick()
  await flushMicrotasks()
}

function clearImperativeDom() {
  ReactMessage.clear()
  reactNotification.clear()
  VueMessage.clear()
  vueNotification.clear()
  document.body.innerHTML = ''
}

describe('imperative API sideEffects regression', () => {
  beforeEach(() => {
    clearImperativeDom()
  })

  afterEach(() => {
    clearImperativeDom()
    vi.useRealTimers()
  })

  it('keeps React and Vue component chunks marked as side-effectful', () => {
    for (const packagePath of ['packages/react/package.json', 'packages/vue/package.json']) {
      const packageJson = readPackageJson(packagePath)

      expect(packageJson.sideEffects).toEqual(
        expect.arrayContaining([
          './dist/chunk-*.mjs',
          './dist/chunk-*.js',
          './dist/components/*.mjs',
          './dist/components/*.js'
        ])
      )
    }
  })

  it('mounts React Message and Notification from the package root entry', async () => {
    await act(async () => {
      ReactMessage.info({ content: 'React root message', duration: 0 })
      reactNotification.info({ title: 'React root notification', duration: 0 })
      await flushMicrotasks()
    })

    await waitFor(() => {
      expect(document.querySelector('[data-tiger-message]')?.textContent).toContain(
        'React root message'
      )
      expect(document.querySelector('[data-tiger-notification]')?.textContent).toContain(
        'React root notification'
      )
    })
  })

  it('mounts Vue Message and Notification from the package root entry', async () => {
    VueMessage.info({ content: 'Vue root message', duration: 0 })
    vueNotification.info({ title: 'Vue root notification', duration: 0 })
    await flushVueDom()

    await waitFor(() => {
      expect(document.querySelector('[data-tiger-message]')?.textContent).toContain(
        'Vue root message'
      )
      expect(document.querySelector('[data-tiger-notification]')?.textContent).toContain(
        'Vue root notification'
      )
    })
  })
})
