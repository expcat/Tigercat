import { classNames } from './class-names'
import {
  textSizeClasses,
  textWeightClasses,
  textAlignClasses,
  textColorClasses,
  textDecorationClasses
} from '../theme/colors'
import type { TextProps } from '../types/text'

/**
 * Generate Tailwind class string for the Text component.
 *
 * Shared by both Vue and React implementations so the class
 * computation logic lives in a single place.
 */
export function getTextClasses(props: TextProps): string {
  const {
    size = 'base',
    weight = 'normal',
    align,
    color = 'default',
    truncate,
    italic,
    underline,
    lineThrough
  } = props

  return classNames(
    textSizeClasses[size],
    textWeightClasses[weight],
    align && textAlignClasses[align],
    textColorClasses[color],
    truncate && textDecorationClasses.truncate,
    italic && textDecorationClasses.italic,
    underline && textDecorationClasses.underline,
    lineThrough && textDecorationClasses.lineThrough
  )
}
