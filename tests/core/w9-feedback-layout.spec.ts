import { describe, expect, it } from 'vitest'
import { OVERLAY_Z_INDEX } from '@expcat/tigercat-core'
import {
  acquireOverlayZ,
  overlayZCeiling,
  resetOverlayZ
} from '../../packages/core/src/utils/overlay-z'
import {
  getFloatingArrowGeometry,
  getFloatingArrowStyle
} from '../../packages/core/src/utils/floating-arrow'
import {
  clampSheetDragDistance,
  resolveSheetReducedMotion,
  resolveSheetRelease
} from '../../packages/core/src/utils/gesture-utils'
import {
  drawerPushOffset,
  drawerShowsMask,
  registerDrawerLayer,
  resetDrawerLayers
} from '../../packages/core/src/utils/drawer-utils'
import {
  createFeedbackScope,
  destroyAllConfirmModals,
  enqueueConfirmModal,
  enqueueMessage,
  settleMessage
} from '../../packages/core/src/utils/feedback-scope'
import { formatProgressPercent, resolveProgressView } from '../../packages/core/src/utils/progress-utils'
import { resolveResizableAspectRatio } from '../../packages/core/src/utils/resizable-utils'
import { collapseSplitterSizes, restoreSplitterSize } from '../../packages/core/src/utils/splitter-utils'
import { resolveResponsiveGutter } from '../../packages/core/src/utils/grid'
import { CONTAINER_READING_MAX_WIDTH, getContainerMaxWidthStyle } from '../../packages/core/src/utils/container-utils'
import { cardTitleTag } from '../../packages/core/src/utils/card-utils'
import { createTooltipDelayGroup } from '../../packages/core/src/utils/floating-popup-utils'
import { tourArrowKey, tourTargetExempt } from '../../packages/core/src/utils/tour-utils'
import { scrollAreaMotionBehavior } from '../../packages/core/src/utils/scroll-area-utils'
import { getCarouselAxisTransform, getCarouselSlidesPerView } from '../../packages/core/src/utils/carousel-utils'
import { feedbackLayoutLabels } from '../../packages/core/src/utils/i18n/w9/feedback-layout-labels'

describe('W9 feedback and layout core', () => {
  it('stacks modal z-index under loading', () => {
    resetOverlayZ()
    const first = acquireOverlayZ()
    const second = acquireOverlayZ()
    expect(first.zIndex).toBe(OVERLAY_Z_INDEX.modal)
    expect(second.zIndex).toBeGreaterThan(first.zIndex)
    expect(second.zIndex).toBeLessThan(OVERLAY_Z_INDEX.loading)
    expect(second.zIndex).toBeLessThanOrEqual(overlayZCeiling())
    second.release()
    first.release()
  })

  it('shares arrow geometry', () => {
    const geometry = getFloatingArrowGeometry('top', { x: 12 })
    expect(geometry.staticSide).toBe('bottom')
    expect(getFloatingArrowStyle('bottom').top).toBe('-4px')
  })

  it('follows a finger and skips the snap when motion is reduced', () => {
    expect(clampSheetDragDistance(-4)).toBe(0)
    expect(resolveSheetRelease(20, 100)).toBe('snap')
    expect(resolveSheetRelease(40, 100)).toBe('close')
    expect(resolveSheetReducedMotion('snap', true)).toBe('stay')
    expect(resolveSheetReducedMotion('close', true)).toBe('close')
  })

  it('pushes a covered drawer and keeps a single mask', () => {
    resetDrawerLayers()
    const lower = registerDrawerLayer('right')
    const upper = registerDrawerLayer('right')
    expect(drawerShowsMask(lower.id, true)).toBe(false)
    expect(drawerShowsMask(upper.id, true)).toBe(true)
    expect(drawerPushOffset(lower.id, 'right').x).toBeLessThan(0)
    expect(drawerPushOffset(upper.id, 'right')).toEqual({ x: 0, y: 0 })
    upper.release()
    lower.release()
  })

  it('replaces one message key through a promise', async () => {
    const scope = createFeedbackScope()
    const task = Promise.resolve('ok')
    await settleMessage(scope, 'job', { loading: 'wait', success: 'done', error: 'bad' }, task)
    const items = scope.messages.getSnapshot()
    expect(items).toHaveLength(1)
    expect(items[0]?.id).toBe('job')
    expect(items[0]?.type).toBe('success')
    expect(items[0]?.content).toBe('done')
    expect(items[0]?.duration).toBeGreaterThan(0)
  })

  it('keeps loading from auto-dismiss and adopts the OK promise', async () => {
    const scope = createFeedbackScope()
    enqueueMessage(scope, { key: 'job', content: 'wait', duration: 0 }, 'loading')
    expect(scope.messages.getSnapshot()[0]?.duration).toBe(0)
    let ok: Promise<string> = Promise.resolve('saved')
    const pending = enqueueConfirmModal(scope, {
      title: 'Sure?',
      content: 'Go',
      onOk: () => ok
    })
    const record = scope.modals.getSnapshot()[0]
    expect(record?.showCancel).toBe(true)
    record?.resolve(ok)
    await expect(pending).resolves.toBe('saved')
    destroyAllConfirmModals(scope)
  })

  it('formats progress without rewriting a non-success value', () => {
    const normal = resolveProgressView({ percentage: 40, status: 'normal', widgetName: 'Progress' })
    expect(normal.percentage).toBe(40)
    expect(normal.successMark).toBe(false)
    expect(normal.displayText).toBe(formatProgressPercent(40))
    const success = resolveProgressView({
      percentage: 40,
      status: 'success',
      widgetName: 'Progress'
    })
    expect(success.percentage).toBe(100)
    expect(success.successMark).toBe(true)
    const waiting = resolveProgressView({
      percentage: 10,
      indeterminate: true,
      steps: 4,
      widgetName: 'Progress'
    })
    expect(waiting.indeterminate).toBe(true)
    expect(waiting.steps).toBe(4)
  })

  it('parses aspect presets and splitter memory', () => {
    expect(resolveResizableAspectRatio('16/9', 100, 50)).toBeCloseTo(16 / 9)
    expect(resolveResizableAspectRatio('16:9', 100, 50)).toBeCloseTo(16 / 9)
    expect(resolveResizableAspectRatio(true, 200, 100)).toBe(2)
    const collapsed = collapseSplitterSizes(['30%', '70%'], 0)
    expect(collapsed.sizes[0]).toBe(0)
    expect(restoreSplitterSize(collapsed.sizes, 0, collapsed.previous)[0]).toBe('30%')
  })

  it('keeps a numeric gutter horizontal and a pair vertical', () => {
    expect(resolveResponsiveGutter(16, 400)).toEqual({ x: 16, y: 0 })
    expect(resolveResponsiveGutter([8, 12], 400)).toEqual({ x: 8, y: 12 })
    expect(resolveResponsiveGutter({ sm: 4, lg: [10, 6] }, 1100)).toEqual({ x: 10, y: 6 })
  })

  it('uses a breakpoint variable for the reading width', () => {
    expect(CONTAINER_READING_MAX_WIDTH).toBe('lg')
    expect(getContainerMaxWidthStyle().maxWidth).toContain('--tiger-breakpoint-lg')
    expect(getContainerMaxWidthStyle(false)).toEqual({})
    expect(cardTitleTag()).toBe('h2')
    expect(cardTitleTag(1)).toBe('h1')
  })

  it('skips tooltip delay after a recent open and ignores arrows in inputs', () => {
    const group = createTooltipDelayGroup(300)
    expect(group.shouldSkip(1000)).toBe(false)
    group.noteOpen(1000)
    expect(group.shouldSkip(1100)).toBe(true)
    expect(tourArrowKey('ArrowRight', null)).toBe('next')
    const input = document.createElement('input')
    expect(tourArrowKey('ArrowLeft', input)).toBe(null)
    expect(tourTargetExempt({ type: 'advanceOnTarget' })).toBe(true)
    expect(scrollAreaMotionBehavior(true)).toBe('auto')
    expect(getCarouselSlidesPerView(3, 10)).toBe(3)
    expect(getCarouselAxisTransform(1, 'vertical', 2)).toContain('0,')
    expect(feedbackLayoutLabels.sidebarCollapse.length).toBeGreaterThan(0)
  })
})
