import { classNames, type ClassValue } from './class-names'
import type { ChoiceGroupDirection } from '../types/checkbox'

export const choiceGroupVerticalClasses = 'flex flex-col gap-2'
export const choiceGroupHorizontalClasses = 'flex flex-row flex-wrap gap-2'
export const radioGroupDefaultClasses = choiceGroupVerticalClasses

export interface GetChoiceGroupClassesOptions {
  direction?: ChoiceGroupDirection
  className?: ClassValue
}

export function getChoiceGroupClasses({
  direction = 'vertical',
  className
}: GetChoiceGroupClassesOptions = {}): string {
  return classNames(
    direction === 'horizontal' ? choiceGroupHorizontalClasses : choiceGroupVerticalClasses,
    className
  )
}

export type GetRadioGroupClassesOptions = GetChoiceGroupClassesOptions

export const getRadioGroupClasses = getChoiceGroupClasses

export function getRadioGroupKeyboardNextIndex(
  key: string,
  currentIndex: number,
  count: number,
  rtl = false
): number | null {
  if (count <= 0 || currentIndex < 0) return null
  switch (key) {
    case 'Home':
      return 0
    case 'End':
      return count - 1
    case 'ArrowDown':
      return (currentIndex + 1) % count
    case 'ArrowUp':
      return (currentIndex - 1 + count) % count
    case 'ArrowRight':
      return rtl ? (currentIndex - 1 + count) % count : (currentIndex + 1) % count
    case 'ArrowLeft':
      return rtl ? (currentIndex + 1) % count : (currentIndex - 1 + count) % count
    default:
      return null
  }
}

export function collectRadioGroupInputs(container: ParentNode): HTMLInputElement[] {
  return Array.from(container.querySelectorAll('input[type="radio"]')).filter((el) => {
    const group = el.closest('[role="radiogroup"]')
    return group === container
  }) as HTMLInputElement[]
}

export function getElementTextDirection(el: Element | null | undefined): 'ltr' | 'rtl' {
  if (!el || typeof getComputedStyle !== 'function') return 'ltr'
  return getComputedStyle(el).direction === 'rtl' ? 'rtl' : 'ltr'
}
