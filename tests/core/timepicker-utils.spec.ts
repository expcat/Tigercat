import { afterEach, describe, expect, it } from 'vitest'
import { focusTimePickerOption } from '@expcat/tigercat-core'

interface PanelOptions {
  selectedIndex?: number
  disabledIndexes?: number[]
}

function buildPanel({ selectedIndex, disabledIndexes = [] }: PanelOptions = {}): {
  panel: HTMLElement
  hours: HTMLButtonElement[]
} {
  const panel = document.createElement('div')
  const hours: HTMLButtonElement[] = []

  for (let i = 0; i < 4; i++) {
    const button = document.createElement('button')
    button.setAttribute('data-tiger-timepicker-unit', 'hour')
    button.textContent = String(i)
    if (selectedIndex === i) button.setAttribute('aria-selected', 'true')
    if (disabledIndexes.includes(i)) button.disabled = true
    panel.appendChild(button)
    hours.push(button)
  }

  // A button in a different column must never be targeted.
  const minute = document.createElement('button')
  minute.setAttribute('data-tiger-timepicker-unit', 'minute')
  panel.appendChild(minute)

  document.body.appendChild(panel)
  return { panel, hours }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('focusTimePickerOption', () => {
  it('moves to the next and previous option from the focused one', () => {
    const { panel, hours } = buildPanel()
    hours[1].focus()

    focusTimePickerOption(panel, 'hour', 'next')
    expect(document.activeElement).toBe(hours[2])

    focusTimePickerOption(panel, 'hour', 'prev')
    expect(document.activeElement).toBe(hours[1])
  })

  it('clamps at the column ends', () => {
    const { panel, hours } = buildPanel()

    hours[0].focus()
    focusTimePickerOption(panel, 'hour', 'prev')
    expect(document.activeElement).toBe(hours[0])

    hours[3].focus()
    focusTimePickerOption(panel, 'hour', 'next')
    expect(document.activeElement).toBe(hours[3])
  })

  it('jumps to the first and last enabled option', () => {
    const { panel, hours } = buildPanel({ disabledIndexes: [3] })
    hours[1].focus()

    focusTimePickerOption(panel, 'hour', 'last')
    expect(document.activeElement).toBe(hours[2]) // index 3 is disabled

    focusTimePickerOption(panel, 'hour', 'first')
    expect(document.activeElement).toBe(hours[0])
  })

  it('starts from the selected option when nothing is focused', () => {
    const { panel, hours } = buildPanel({ selectedIndex: 2 })

    focusTimePickerOption(panel, 'hour', 'next')
    expect(document.activeElement).toBe(hours[3])
  })

  it('only targets buttons in the requested column', () => {
    const { panel } = buildPanel()
    const minute = panel.querySelector<HTMLButtonElement>(
      'button[data-tiger-timepicker-unit="minute"]'
    )!

    focusTimePickerOption(panel, 'minute', 'first')
    expect(document.activeElement).toBe(minute)
  })

  it('is a no-op for a null panel or an empty column', () => {
    const { panel, hours } = buildPanel()
    hours[0].focus()

    expect(() => focusTimePickerOption(null, 'hour', 'next')).not.toThrow()
    expect(() => focusTimePickerOption(panel, 'second', 'next')).not.toThrow()
    expect(document.activeElement).toBe(hours[0])
  })
})
