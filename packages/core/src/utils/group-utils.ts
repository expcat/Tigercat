import { type ClassValue, classNames } from './class-names'
import {
  avatarGroupBaseClasses,
  avatarGroupItemClasses,
  avatarGroupOverflowClasses,
  avatarSizeClasses
} from './avatar-utils'
import {
  buttonGroupBaseClasses,
  buttonGroupHorizontalClasses,
  buttonGroupItemClasses,
  buttonGroupItemVerticalClasses,
  buttonGroupVerticalClasses
} from './button-utils'
import type { AvatarSize } from '../types/avatar'

export interface VisibleGroupItems<T> {
  visibleItems: T[]
  total: number
  visibleCount: number
  overflowCount: number
}

export interface ImageGroupRegistrationResult {
  items: string[]
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
  ...classes: ClassValue[]
): string {
  return classNames(avatarGroupOverflowClasses, avatarSizeClasses[size], ...classes)
}

export function getAvatarGroupOverflowLabel(overflowCount: number): string {
  return `${overflowCount} more`
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

export function getImageGroupClasses(className?: string): string {
  return className || imageGroupBaseClasses
}

export function registerImageGroupItem(
  items: readonly string[],
  src: string
): ImageGroupRegistrationResult {
  return {
    items: [...items, src],
    index: items.length
  }
}

export function unregisterImageGroupItem(items: readonly string[], src: string): string[] {
  const index = items.indexOf(src)
  if (index < 0) return [...items]

  return [...items.slice(0, index), ...items.slice(index + 1)]
}
