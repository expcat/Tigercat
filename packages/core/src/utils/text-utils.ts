import { classNames } from './class-names'
import { devWarn } from './dev-warn'
import {
  textSizeClasses,
  textWeightClasses,
  textAlignClasses,
  textColorClasses,
  textDecorationClasses
} from './theme-colors'
import {
  TEXT_TAGS,
  type TextAlign,
  type TextColor,
  type TextProps,
  type TextSize,
  type TextTag,
  type TextWeight
} from '../types/text'

const TEXT_TAG_SET: ReadonlySet<string> = new Set(TEXT_TAGS)

export function resolveTextTag(tag?: string | null): TextTag {
  if (tag && TEXT_TAG_SET.has(tag)) return tag as TextTag
  if (tag) {
    devWarn('Text.tag', `[Tigercat] Text tag "${tag}" is not allowed; falling back to p.`)
  }
  return 'p'
}

export function resolveTextSize(size?: string | null): TextSize {
  if (size && size in textSizeClasses) return size as TextSize
  return 'base'
}

export function resolveTextWeight(weight?: string | null): TextWeight {
  if (weight && weight in textWeightClasses) return weight as TextWeight
  return 'normal'
}

export function resolveTextColor(color?: string | null): TextColor {
  if (color && color in textColorClasses) return color as TextColor
  return 'default'
}

/**
 * Logical alignment. Physical `left`/`right` map to `start`/`end`.
 */
export function resolveTextAlign(align?: string | null): TextAlign | undefined {
  if (!align) return undefined
  if (align === 'left') {
    devWarn('Text.align.left', '[Tigercat] Text align "left" is a physical alias; use "start".')
    return 'start'
  }
  if (align === 'right') {
    devWarn('Text.align.right', '[Tigercat] Text align "right" is a physical alias; use "end".')
    return 'end'
  }
  if (align === 'start' || align === 'center' || align === 'end' || align === 'justify') {
    return align
  }
  return undefined
}

/**
 * Generate Tailwind class string for the Text component.
 *
 * Shared by both Vue and React implementations so the class
 * computation logic lives in a single place.
 */
export function getTextClasses(props: TextProps): string {
  const size = resolveTextSize(props.size)
  const weight = resolveTextWeight(props.weight)
  const align = resolveTextAlign(props.align)
  const color = resolveTextColor(props.color)

  return classNames(
    textSizeClasses[size],
    textWeightClasses[weight],
    align && textAlignClasses[align],
    textColorClasses[color],
    props.truncate && textDecorationClasses.truncate,
    props.italic && textDecorationClasses.italic,
    props.underline && textDecorationClasses.underline,
    props.lineThrough && textDecorationClasses.lineThrough
  )
}
