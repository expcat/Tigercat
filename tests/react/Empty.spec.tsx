/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React, { createRef } from 'react'
import { getEmptyDescription, getEmptyIllustration } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { Empty } from '@expcat/tigercat-react/Empty'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const galleryPresets = ['default', 'simple', 'no-data', 'no-results', 'error'] as const

describe('Empty (React)', () => {
  describe('Rendering', () => {
    it('renders with default description', () => {
      render(<Empty />)
      expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('renders custom description', () => {
      render(<Empty description="Nothing here" />)
      expect(screen.getByText('Nothing here')).toBeInTheDocument()
    })

    it('renders default SVG illustration', () => {
      const { container } = render(<Empty />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('hides the built-in illustration when showImage=false', () => {
      const { container } = render(<Empty showImage={false} />)
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })

    it('forwards ref to the root', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Empty ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Custom content', () => {
    it('renders custom image node', () => {
      render(<Empty image={<img src="custom.png" alt="custom" />} />)
      expect(screen.getByAltText('custom')).toBeInTheDocument()
    })

    it('keeps a custom image when showImage is false', () => {
      render(<Empty showImage={false} image={<img src="custom.png" alt="kept" />} />)
      expect(screen.getByAltText('kept')).toBeInTheDocument()
    })

    it('does not leave an empty image wrapper for image={null}', () => {
      const { container } = render(<Empty image={null} />)
      expect(container.querySelector('img')).not.toBeInTheDocument()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders extra actions and children together', () => {
      render(
        <Empty extra={<button>Create</button>}>
          <p>Body text</p>
        </Empty>
      )
      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByText('Body text')).toBeInTheDocument()
    })
  })

  describe('className', () => {
    it('merges className prop', () => {
      const { container } = render(<Empty className="my-empty" />)
      expect(container.firstElementChild).toHaveClass('my-empty')
    })
  })

  describe('Presets', () => {
    it('hides the built-in illustration for simple', () => {
      const { container } = render(<Empty preset="simple" />)
      expect(container.querySelector('svg')).not.toBeInTheDocument()
      expect(screen.getByText(getEmptyDescription('simple'))).toBeInTheDocument()
    })

    it('draws a different illustration for error than default', () => {
      const defaultPaths = getEmptyIllustration('default')!
        .paths.map((p) => p.d)
        .join('|')
      const { container } = render(<Empty preset="error" />)
      const d = [...container.querySelectorAll('path')].map((p) => p.getAttribute('d')).join('|')
      expect(d).toBeTruthy()
      expect(d).not.toBe(defaultPaths)
    })

    it.each(galleryPresets)('renders empty/02 gallery preset "%s"', (preset) => {
      render(<Empty preset={preset} />)
      expect(screen.getByText(getEmptyDescription(preset))).toBeInTheDocument()
    })
  })

  describe('Locale', () => {
    it('uses official locale objects for default copy', () => {
      const { rerender } = render(
        <ConfigProvider locale={zhCN}>
          <Empty />
        </ConfigProvider>
      )
      expect(screen.getByText('暂无数据')).toBeInTheDocument()

      rerender(
        <ConfigProvider locale={zhTW}>
          <Empty />
        </ConfigProvider>
      )
      expect(screen.getByText('暫無資料')).toBeInTheDocument()

      rerender(
        <ConfigProvider locale={jaJP}>
          <Empty />
        </ConfigProvider>
      )
      expect(screen.getByText('データなし')).toBeInTheDocument()
      expect(screen.queryByText('No data')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('hides the built-in illustration from assistive tech', () => {
      const { container } = render(<Empty />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('does not hide a custom image', () => {
      render(<Empty image={<img src="custom.png" alt="custom empty" />} />)
      expect(screen.getByAltText('custom empty')).not.toHaveAttribute('aria-hidden')
    })

    it('should have no accessibility violations for default, no-image, and custom image', async () => {
      const { container, rerender } = render(<Empty />)
      await expectNoA11yViolationsIsolated(container)

      rerender(<Empty showImage={false} />)
      await expectNoA11yViolationsIsolated(container)

      rerender(<Empty image={<img src="custom.png" alt="custom empty" />} />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
