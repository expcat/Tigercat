import React, { forwardRef } from 'react'
import {
  classNames,
  getParagraphRowWidth,
  getSkeletonClasses,
  getSkeletonInlineStyle,
  isSkeletonNamed,
  resolveSkeletonAriaHidden,
  resolveSkeletonRows,
  resolveSkeletonVariant,
  type SkeletonProps as CoreSkeletonProps
} from '@expcat/tigercat-core'

export type SkeletonProps = CoreSkeletonProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
    loading?: boolean
    children?: React.ReactNode
  }

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  {
    variant,
    preset,
    animation = 'pulse',
    width,
    height,
    shape = 'circle',
    rows,
    paragraph = false,
    loading = true,
    children,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-hidden': ariaHidden,
    ...divProps
  },
  ref
) {
  const resolvedVariant = resolveSkeletonVariant(variant, preset)
  const rowCount = resolveSkeletonRows(rows)
  const named = isSkeletonNamed(ariaLabel, ariaLabelledBy)
  const computedAriaHidden = resolveSkeletonAriaHidden(ariaHidden, named)
  const namedStatus = named && computedAriaHidden !== true
  const inlineStyle = getSkeletonInlineStyle(width, height)
  const a11y = {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-hidden': computedAriaHidden,
    role: namedStatus ? ('status' as const) : undefined,
    'aria-busy': namedStatus ? true : undefined
  }

  if (!loading) {
    return (
      <div
        {...divProps}
        ref={ref}
        className={className}
        style={style}
        data-tiger-skeleton=""
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-hidden={ariaHidden}
        aria-busy={false}>
        {children}
      </div>
    )
  }

  if (resolvedVariant === 'text' && rowCount > 1) {
    const rowElements: React.ReactNode[] = []
    for (let i = 0; i < rowCount; i++) {
      const rowStyle: React.CSSProperties = {}
      if (paragraph) {
        rowStyle.width = getParagraphRowWidth(i, rowCount)
      }
      if (height) rowStyle.height = height
      rowElements.push(
        <div
          key={i}
          className={classNames(
            getSkeletonClasses(resolvedVariant, animation, shape, {
              height,
              omitWidth: true
            }),
            !paragraph && 'w-full',
            i < rowCount - 1 && 'mb-2'
          )}
          style={Object.keys(rowStyle).length > 0 ? rowStyle : undefined}
        />
      )
    }

    return (
      <div
        {...divProps}
        ref={ref}
        data-tiger-skeleton=""
        className={classNames('flex flex-col', !width && 'w-full', className)}
        style={{ ...inlineStyle, ...style }}
        {...a11y}>
        <div aria-hidden="true">{rowElements}</div>
      </div>
    )
  }

  return (
    <div
      {...divProps}
      ref={ref}
      data-tiger-skeleton=""
      className={classNames(
        getSkeletonClasses(resolvedVariant, animation, shape, { width, height }),
        className
      )}
      style={{ ...inlineStyle, ...style }}
      {...a11y}
    />
  )
})
Skeleton.displayName = 'Skeleton'
