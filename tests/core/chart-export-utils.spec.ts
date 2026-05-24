/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { downloadChartBlob, getChartSvgDataUrl, serializeChartSvg } from '@expcat/tigercat-core'

function createSvg(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '120')
  svg.setAttribute('height', '80')
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('width', '120')
  rect.setAttribute('height', '80')
  svg.appendChild(rect)
  return svg
}

describe('chart export utilities', () => {
  it('serializes svg with namespace attributes', () => {
    const serialized = serializeChartSvg(createSvg())

    expect(serialized).toContain('<svg')
    expect(serialized).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(serialized).toContain('<rect')
  })

  it('creates an encoded svg data url', () => {
    const dataUrl = getChartSvgDataUrl(createSvg())

    expect(dataUrl).toMatch(/^data:image\/svg\+xml;charset=utf-8,/)
    expect(decodeURIComponent(dataUrl.split(',')[1])).toContain('<svg')
  })

  it('downloads a chart blob with the requested filename', () => {
    const clickSpy = vi.fn()
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      style: { display: '' },
      click: clickSpy
    } as any)
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    downloadChartBlob(new Blob(['x'], { type: 'text/plain' }), 'chart.svg')

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect((createElementSpy.mock.results[0].value as HTMLAnchorElement).download).toBe('chart.svg')
    expect(clickSpy).toHaveBeenCalled()

    createElementSpy.mockRestore()
    appendSpy.mockRestore()
    removeSpy.mockRestore()
    revokeSpy.mockRestore()
  })
})
