import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  COUNTDOWN_DEFAULT_FORMAT,
  COUNTDOWN_DEFAULT_INTERVAL_MS,
  createCountdownPayload,
  formatCountdown,
  getCountdownParts,
  getCountdownRemaining,
  getCountdownTitleClasses,
  getCountdownValueClasses,
  padCountdownNumber,
  parseCountdownTimestamp
} from '@expcat/tigercat-core'

afterEach(() => {
  vi.useRealTimers()
})

describe('countdown-utils', () => {
  describe('constants', () => {
    it('provides stable defaults', () => {
      expect(COUNTDOWN_DEFAULT_FORMAT).toBe('HH:mm:ss')
      expect(COUNTDOWN_DEFAULT_INTERVAL_MS).toBe(1000)
    })
  })

  describe('parseCountdownTimestamp', () => {
    it('parses numeric timestamps', () => {
      expect(parseCountdownTimestamp(1700000000000)).toBe(1700000000000)
    })

    it('parses Date values', () => {
      expect(parseCountdownTimestamp(new Date('2024-01-01T00:00:00.000Z'))).toBe(1704067200000)
    })

    it('parses ISO strings', () => {
      expect(parseCountdownTimestamp('2024-01-01T00:00:00.000Z')).toBe(1704067200000)
    })

    it.each([undefined, '', Number.NaN, Number.POSITIVE_INFINITY, 'not-a-date'])(
      'returns undefined for invalid value %#',
      (value) => {
        expect(parseCountdownTimestamp(value as never)).toBeUndefined()
      }
    )
  })

  describe('getCountdownRemaining', () => {
    it('calculates remaining time from explicit now', () => {
      expect(getCountdownRemaining(5000, 1000)).toBe(4000)
    })

    it('clamps elapsed targets to zero', () => {
      expect(getCountdownRemaining(1000, 5000)).toBe(0)
    })

    it('uses Date.now when now is not provided', () => {
      vi.useFakeTimers()
      vi.setSystemTime(1000)

      expect(getCountdownRemaining(2500)).toBe(1500)
    })

    it('returns zero when target is missing', () => {
      expect(getCountdownRemaining(undefined, 1000)).toBe(0)
    })
  })

  describe('getCountdownParts', () => {
    it('splits a duration into parts', () => {
      expect(getCountdownParts(90061007)).toEqual({
        total: 90061007,
        days: 1,
        hours: 1,
        minutes: 1,
        seconds: 1,
        milliseconds: 7
      })
    })

    it('floors fractions and clamps negative values', () => {
      expect(getCountdownParts(-10).total).toBe(0)
      expect(getCountdownParts(1999.9).seconds).toBe(1)
    })
  })

  describe('formatCountdown', () => {
    it('formats the default HH:mm:ss with total hours', () => {
      expect(formatCountdown(90061000)).toBe('25:01:01')
    })

    it('formats day-aware patterns with remainder hours', () => {
      expect(formatCountdown(90061000, 'D days HH:mm:ss')).toBe('1 days 01:01:01')
    })

    it('formats unpadded tokens', () => {
      expect(formatCountdown(3723000, 'H:m:s')).toBe('1:2:3')
    })

    it('formats milliseconds', () => {
      expect(formatCountdown(1007, 'ss.SSS')).toBe('01.007')
    })

    it('keeps unknown text unchanged', () => {
      expect(formatCountdown(61000, 'remaining mm minutes')).toBe('remaining 01 minutes')
    })

    it('formats zero duration', () => {
      expect(formatCountdown(0)).toBe('00:00:00')
    })
  })

  describe('payload', () => {
    it('creates a change payload', () => {
      expect(createCountdownPayload(1000, 'ss')).toMatchObject({
        remaining: 1000,
        formatted: '01',
        finished: false
      })
    })

    it('marks zero as finished', () => {
      expect(createCountdownPayload(0).finished).toBe(true)
    })
  })

  describe('style helpers', () => {
    it.each(['sm', 'md', 'lg'] as const)('returns title classes for %s', (size) => {
      expect(getCountdownTitleClasses(size)).toContain('text-')
    })

    it.each(['sm', 'md', 'lg'] as const)('returns value classes for %s', (size) => {
      expect(getCountdownValueClasses(size)).toContain('tabular-nums')
    })
  })

  describe('padCountdownNumber', () => {
    it('pads with two digits by default', () => {
      expect(padCountdownNumber(4)).toBe('04')
    })

    it('supports custom width', () => {
      expect(padCountdownNumber(7, 3)).toBe('007')
    })
  })
})
