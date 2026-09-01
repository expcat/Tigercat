/**
 * @vitest-environment node
 */

import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  DEFAULT_DEMO_MIN_HEIGHT,
  OVERLAY_DEMO_MIN_HEIGHT,
  isOverlayDemoRoute,
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

function routeFromPath(relativePath: string): string {
  const match = /\/src\/examples\/([^/]+)\//.exec(relativePath)
  if (!match) throw new Error(`unexpected demo path ${relativePath}`)
  return match[1]
}

const allDemos = FRAMEWORK_ROOTS.flatMap(collectDemoJson)

describe('overlay demo viewports', () => {
  it('raises overlay-class routes so an open layer is not clipped at 120', () => {
    const overlayDemos = allDemos.filter((path) => isOverlayDemoRoute(routeFromPath(path)))
    expect(overlayDemos.length).toBeGreaterThan(20)

    for (const relativePath of overlayDemos) {
      const route = routeFromPath(relativePath)
      const demo = readDemo(relativePath)
      const resolved = resolveDemoViewport(route, demo.viewport)
      expect(resolved.minHeight, relativePath).toBeGreaterThanOrEqual(OVERLAY_DEMO_MIN_HEIGHT)
      expect(resolved.minHeight, relativePath).toBeGreaterThanOrEqual(200)
    }
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
