import { type ClassValue, classNames } from './class-names'
import { enUS } from './i18n/locales/en-US'
import {
  avatarGroupBaseClasses,
  avatarGroupItemClasses,
  avatarGroupOverflowBaseClasses,
  avatarShapeClasses,
  avatarSizeClasses
} from './avatar-utils'
import {
  buttonGroupBaseClasses,
  buttonGroupHorizontalClasses,
  buttonGroupItemClasses,
  buttonGroupItemVerticalClasses,
  buttonGroupVerticalClasses
} from './button-utils'
import type { AvatarShape, AvatarSize } from '../types/avatar'

export interface VisibleGroupItems<T> {
  visibleItems: T[]
  total: number
  visibleCount: number
  overflowCount: number
}

export interface ImageGroupItem {
  id: string
  src: string
  alt?: string
}

export interface ImageGroupRegistrationResult {
  items: ImageGroupItem[]
  index: number
}

export const imageGroupBaseClasses = 'tiger-image-group'

export function getVisibleGroupItems<T>(items: readonly T[], max?: number): VisibleGroupItems<T> {
  const total = items.length
  const normalizedMax =
    typeof max === 'number' && Number.isFinite(max) ? Math.max(0, Math.floor(max)) : undefined
  const visibleCount = normalizedMax != null && normalizedMax < total ? normalizedMax : total

  return {
    visibleItems: items.slice(0, visibleCount),
    total,
    visibleCount,
    overflowCount: total - visibleCount
  }
}

export function getAvatarGroupClasses(...classes: ClassValue[]): string {
  return classNames(avatarGroupBaseClasses, ...classes)
}

export function getAvatarGroupItemClasses(...classes: ClassValue[]): string {
  return classNames(avatarGroupItemClasses, ...classes)
}

export function getAvatarGroupOverflowClasses(
  size: AvatarSize = 'md',
  shape: AvatarShape = 'circle',
  overlap = true,
  ...classes: ClassValue[]
): string {
  return classNames(
    avatarGroupOverflowBaseClasses,
    overlap && '-ms-2',
    avatarSizeClasses[size],
    avatarShapeClasses[shape],
    ...classes
  )
}

export function getAvatarGroupOverflowLabel(
  overflowCount: number,
  template = enUS.avatarGroup!.overflowAriaLabel!
): string {
  return template.replace('{count}', String(overflowCount))
}

export function getAvatarGroupOverflowText(overflowCount: number): string {
  return `+${overflowCount}`
}

export function getButtonGroupClasses(vertical = false, ...classes: ClassValue[]): string {
  return classNames(
    buttonGroupBaseClasses,
    vertical ? buttonGroupVerticalClasses : buttonGroupHorizontalClasses,
    vertical ? buttonGroupItemVerticalClasses : buttonGroupItemClasses,
    ...classes
  )
}

export function getImageGroupClasses(...classes: ClassValue[]): string {
  return classNames(imageGroupBaseClasses, ...classes)
}

export function registerImageGroupItem(
  items: readonly ImageGroupItem[],
  item: ImageGroupItem
): ImageGroupRegistrationResult {
  const existing = items.findIndex((entry) => entry.id === item.id)
  if (existing >= 0) {
    const next = items.slice()
    next[existing] = { id: item.id, src: item.src, alt: item.alt }
    return { items: next, index: existing }
  }

  return {
    items: [...items, { id: item.id, src: item.src, alt: item.alt }],
    index: items.length
  }
}

export function unregisterImageGroupItem(
  items: readonly ImageGroupItem[],
  id: string
): ImageGroupItem[] {
  return items.filter((entry) => entry.id !== id)
}

export function getImageGroupItemIndex(items: readonly ImageGroupItem[], id: string): number {
  return items.findIndex((entry) => entry.id === id)
}

export function getImageGroupSrcs(items: readonly ImageGroupItem[]): string[] {
  return items.map((entry) => entry.src)
}

export function getImageGroupLightboxItems(
  items: readonly ImageGroupItem[]
): Array<string | { src: string; alt?: string }> {
  return items.map((entry) =>
    entry.alt === undefined ? entry.src : { src: entry.src, alt: entry.alt }
  )
}

export function clampImageGroupPreviewIndex(index: number, length: number): number {
  if (length <= 0) return 0
  if (!Number.isFinite(index)) return 0
  return Math.min(Math.max(0, Math.floor(index)), length - 1)
}

export function resolveImageGroupName(input: {
  ariaLabel?: unknown
  ariaLabelledby?: unknown
  localeLabel: string
}): { role: 'group'; 'aria-label'?: string; 'aria-labelledby'?: string } {
  const labelledby =
    typeof input.ariaLabelledby === 'string' && input.ariaLabelledby.trim()
      ? input.ariaLabelledby.trim()
      : undefined
  if (labelledby) {
    return { role: 'group', 'aria-labelledby': labelledby }
  }

  const label =
    typeof input.ariaLabel === 'string' && input.ariaLabel.trim()
      ? input.ariaLabel.trim()
      : input.localeLabel

  return { role: 'group', 'aria-label': label }
}
