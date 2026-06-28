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

function readText(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf-8')
}

function readPackageJson(path: string) {
  return JSON.parse(readText(path)) as {
    sideEffects?: boolean | string[]
  }
}

async function flushMicrotasks() {
  await Promise.resolve()
  await Promise.resolve()
}

async function actImperativeReact(callback: () => void) {
  act(callback)
  await act(async () => {
    await flushMicrotasks()
  })
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
  beforeEach(async () => {
    await actImperativeReact(clearImperativeDom)
  })

  afterEach(async () => {
    await actImperativeReact(clearImperativeDom)
    vi.useRealTimers()
  })

  it('marks React and Vue framework packages as side-effect free', () => {
    for (const packagePath of ['packages/react/package.json', 'packages/vue/package.json']) {
      const packageJson = readPackageJson(packagePath)

      expect(packageJson.sideEffects).toBe(false)
      expect(JSON.stringify(packageJson.sideEffects)).not.toContain('dist/chunk-*')
      expect(JSON.stringify(packageJson.sideEffects)).not.toContain('dist/components/*')
    }
  })

  it.each([
    'packages/react/src/components/MessageContainer.tsx',
    'packages/react/src/components/NotificationContainer.tsx',
    'packages/vue/src/components/MessageContainer.ts',
    'packages/vue/src/components/NotificationContainer.ts'
  ])('%s stays free of singleton mounting logic', (sourcePath) => {
    const source = readText(sourcePath)

    expect(source).not.toContain('createRoot')
    expect(source).not.toContain('react-dom')
    expect(source).not.toContain('createApp')
    expect(source).not.toContain('isBrowser')
    expect(source).not.toContain('normalizeStringOption')
    expect(source).not.toContain('createInstanceCounter')
    expect(source).not.toContain('createNotificationStackUpdateScheduler')
  })

  it.each([
    ['React Message', 'packages/react/src/components/Message.tsx', './MessageContainer'],
    [
      'React notification',
      'packages/react/src/components/Notification.tsx',
      './NotificationContainer'
    ],
    ['Vue Message', 'packages/vue/src/components/Message.ts', './MessageContainer'],
    ['Vue notification', 'packages/vue/src/components/Notification.ts', './NotificationContainer']
  ])('%s singleton imports its pure container module', (_label, sourcePath, importPath) => {
    expect(readText(sourcePath)).toContain(importPath)
  })

  it.each([
    [
      'React',
      'packages/react/src/index.tsx',
      'MessageContainer',
      'Message',
      './components/MessageContainer',
      './components/MessageRoot',
      './components/Message'
    ],
    [
      'React',
      'packages/react/src/index.tsx',
      'NotificationContainer',
      'notification',
      './components/NotificationContainer',
      './components/NotificationRoot',
      './components/Notification'
    ],
    [
      'Vue',
      'packages/vue/src/index.ts',
      'MessageContainer',
      'Message',
      './components/MessageContainer',
      './components/MessageRoot',
      './components/Message'
    ],
    [
      'Vue',
      'packages/vue/src/index.ts',
      'NotificationContainer',
      'notification',
      './components/NotificationContainer',
      './components/NotificationRoot',
      './components/Notification'
    ]
  ])(
    '%s root entry keeps %s export separate from %s imperative module',
    (
      _framework,
      sourcePath,
      containerExport,
      imperativeExport,
      containerPath,
      rootPath,
      imperativePath
    ) => {
      const source = readText(sourcePath)

      expect(source).toContain(`export { ${containerExport} } from '${containerPath}'`)
      expect(source).toContain(`export { ${imperativeExport} } from '${rootPath}'`)
      expect(source).not.toContain(
        `export { ${containerExport}, ${imperativeExport} } from '${imperativePath}'`
      )
      expect(source).not.toContain(
        `export { ${imperativeExport}, ${containerExport} } from '${imperativePath}'`
      )
    }
  )

  it('mounts React Message and Notification from the package root entry', async () => {
    await actImperativeReact(() => {
      ReactMessage.info({ content: 'React root message', duration: 0 })
      reactNotification.info({ title: 'React root notification', duration: 0 })
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
