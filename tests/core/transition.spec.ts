/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import {
  transitionPresets,
  getTransitionClasses,
  getComponentTransition,
  prefersReducedMotion,
  getAccessibleTransitionClasses,
  componentTransitionMap
} from '@expcat/tigercat-core'
import type { TransitionType, TransitionClasses, TransitionConfig } from '@expcat/tigercat-core'

describe('Transition System', () => {
  describe('transitionPresets', () => {
    it('should have all standard transition types', () => {
      const types: TransitionType[] = [
        'fade',
        'slide-up',
        'slide-down',
        'slide-left',
        'slide-right',
        'scale',
        'collapse'
      ]
      for (const type of types) {
        expect(transitionPresets[type]).toBeDefined()
        const preset = transitionPresets[type]
        expect(preset.enterFrom).toBeTruthy()
        expect(preset.enterActive).toBeTruthy()
        expect(preset.enterTo).toBeTruthy()
        expect(preset.leaveFrom).toBeTruthy()
        expect(preset.leaveActive).toBeTruthy()
        expect(preset.leaveTo).toBeTruthy()
      }
    })

    it('fade should use opacity classes', () => {
      expect(transitionPresets.fade.enterFrom).toContain('opacity-0')
      expect(transitionPresets.fade.enterTo).toContain('opacity-100')
    })

    it('scale should use scale classes', () => {
      expect(transitionPresets.scale.enterFrom).toContain('scale-95')
      expect(transitionPresets.scale.enterTo).toContain('scale-100')
    })

    it('slide-up should use translate-y classes', () => {
      expect(transitionPresets['slide-up'].enterFrom).toContain('translate-y-4')
      expect(transitionPresets['slide-up'].enterTo).toContain('translate-y-0')
    })
  })

  describe('getTransitionClasses', () => {
    it('should return preset for string type', () => {
      const result = getTransitionClasses('fade')
      expect(result).toEqual(transitionPresets.fade)
    })

    it('should return preset for config without overrides', () => {
      const result = getTransitionClasses({ type: 'scale' })
      expect(result).toEqual(transitionPresets.scale)
    })

    it('should override duration when config specifies it', () => {
      const result = getTransitionClasses({ type: 'fade', duration: 500 })
      expect(result.enterActive).toContain('duration-[500ms]')
      expect(result.leaveActive).toContain('duration-[500ms]')
      expect(result.enterFrom).toBe(transitionPresets.fade.enterFrom)
    })
  })

  describe('componentTransitionMap', () => {
    it('should map Modal to fade', () => {
      expect(componentTransitionMap.Modal).toBe('fade')
    })

    it('should map Dropdown to scale', () => {
      expect(componentTransitionMap.Dropdown).toBe('scale')
    })

    it('should map Collapse to collapse', () => {
      expect(componentTransitionMap.Collapse).toBe('collapse')
    })
  })

  describe('getComponentTransition', () => {
    it('should return fade for Modal', () => {
      expect(getComponentTransition('Modal')).toEqual(transitionPresets.fade)
    })

    it('should return fade as fallback for unknown component', () => {
      expect(getComponentTransition('Unknown')).toEqual(transitionPresets.fade)
    })
  })

  describe('prefersReducedMotion', () => {
    it('should return a boolean', () => {
      expect(typeof prefersReducedMotion()).toBe('boolean')
    })
  })
})
