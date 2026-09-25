/**
 * @vitest-environment node
 */

import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  DEFAULT_DEMO_MIN_HEIGHT,
  clampDemoFrameHeight,
  resolveDemoViewport
} from '../../examples/example/shared/playground/viewport'
import type { DemoViewport } from '../../examples/example/shared/playground/types'

const FRAMEWORK_ROOTS = [
  'examples/example/vue3/src/examples',
  'examples/example/react/src/examples'
] as const

function collectDemoJson(root: string): string[] {
  const files: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(resolve(process.cwd(), dir), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`
      if (entry.isDirectory()) walk(path)
      else if (entry.name === 'demo.json') files.push(path)
    }
  }
  walk(root)
  return files
}

function readDemo(relativePath: string): { viewport?: DemoViewport } {
  return JSON.parse(readFileSync(resolve(process.cwd(), relativePath), 'utf-8')) as {
    viewport?: DemoViewport
  }
}

const allDemos = FRAMEWORK_ROOTS.flatMap(collectDemoJson)

describe('overlay demo viewports', () => {
  it('keeps short demos at their declared minimum instead of a route-wide floor', () => {
    const splitButton = allDemos.find((path) => path.includes('/split-button/01/demo.json'))
    expect(splitButton).toBeTruthy()
    const demo = readDemo(splitButton!)
    const resolved = resolveDemoViewport('split-button', demo.viewport)
    expect(resolved.mode).toBe('auto')
    expect(resolved.minHeight).toBe(120)
    expect(resolved.maxHeight).toBe(280)
    expect(clampDemoFrameHeight(88, resolved)).toBe(120)
    expect(clampDemoFrameHeight(180, resolved)).toBe(180)
    expect(clampDemoFrameHeight(400, resolved)).toBe(280)
  })

  it('leaves non-overlay routes such as button/01 unraised', () => {
    const resolved = resolveDemoViewport('button', {
      mode: 'auto',
      minHeight: 120,
      maxHeight: 720
    })
    expect(resolved.minHeight).toBe(DEFAULT_DEMO_MIN_HEIGHT)
    expect(resolved.minHeight).toBeLessThan(200)
  })

  it('lets a closed modal shrink to the content floor and still grow up to its cap', () => {
    const modal = allDemos.find((path) => path.includes('/modal/01/demo.json'))
    expect(modal).toBeTruthy()
    const demo = readDemo(modal!)
    const resolved = resolveDemoViewport('modal', demo.viewport)
    expect(resolved.mode).toBe('auto')
    expect(resolved.minHeight).toBe(DEFAULT_DEMO_MIN_HEIGHT)
    expect(resolved.maxHeight).toBe(720)
    expect(clampDemoFrameHeight(80, resolved)).toBe(120)
    expect(clampDemoFrameHeight(360, resolved)).toBe(360)
    expect(clampDemoFrameHeight(900, resolved)).toBe(720)
  })

  it('lets message demos shrink to the content floor', () => {
    const messages = allDemos.filter(
      (path) => path.includes('/message/') && path.endsWith('/demo.json')
    )
    expect(messages).toHaveLength(10)
    for (const path of messages) {
      const resolved = resolveDemoViewport('message', readDemo(path).viewport)
      expect(resolved.mode).toBe('auto')
      expect(resolved.minHeight).toBe(DEFAULT_DEMO_MIN_HEIGHT)
      expect(resolved.maxHeight).toBe(720)
      expect(clampDemoFrameHeight(64, resolved)).toBe(120)
      expect(clampDemoFrameHeight(160, resolved)).toBe(160)
    }
  })

  it('lets a closed select shrink to the content floor', () => {
    const selects = allDemos.filter(
      (path) => path.includes('/select/') && path.endsWith('/demo.json')
    )
    expect(selects).toHaveLength(10)
    for (const path of selects) {
      const resolved = resolveDemoViewport('select', readDemo(path).viewport)
      expect(resolved.mode).toBe('auto')
      expect(resolved.minHeight).toBe(DEFAULT_DEMO_MIN_HEIGHT)
      expect(resolved.maxHeight).toBe(720)
      expect(clampDemoFrameHeight(82, resolved)).toBe(120)
      expect(clampDemoFrameHeight(240, resolved)).toBe(240)
    }
  })

  it('does not cap chart iframes at 720 unless the demo asked for a fixed viewport', () => {
    const auto = resolveDemoViewport('bar-chart', { mode: 'auto', minHeight: 120, maxHeight: 720 })
    expect(auto.maxHeight).toBeUndefined()
    const fixed = resolveDemoViewport('bar-chart', {
      mode: 'fixed',
      height: 400,
      maxHeight: 400
    })
    expect(fixed.maxHeight).toBe(400)
  })
})
