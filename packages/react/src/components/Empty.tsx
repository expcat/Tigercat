import React, { forwardRef, useMemo } from 'react'
import {
  classNames,
  emptyBaseClasses,
  emptyImageClasses,
  emptyDescriptionClasses,
  emptyActionsClasses,
  getEmptyDescription,
  getEmptyIllustration,
  resolveEmptyImageMode,
  mergeTigerLocale,
  devWarn,
  type EmptyProps as CoreEmptyProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement>, CoreEmptyProps {
  /** Custom image / illustration node */
  image?: React.ReactNode
  /** Action buttons below description */
  extra?: React.ReactNode
  /** Body content */
  children?: React.ReactNode
}

export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  {
    preset = 'default',
    description,
    showImage = true,
    image,
    extra,
    className,
    children,
    locale,
    ...props
  },
  ref
) {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const descText = useMemo(
    () => description ?? getEmptyDescription(preset, mergedLocale),
    [description, preset, mergedLocale]
  )
  const hasCustomImage = image !== undefined && image !== null
  const imageMode = resolveEmptyImageMode({ showImage, hasCustomImage, preset })
  const illustration = imageMode === 'builtin' ? getEmptyIllustration(preset) : null

  if (showImage === false && hasCustomImage) {
    devWarn(
      'Empty.showImage.custom',
      'Empty: `image` still renders when `showImage` is false. Pass no `image` to hide the illustration.'
    )
  }

  const wrapperClasses = classNames(emptyBaseClasses, className)

  return (
    <div ref={ref} className={wrapperClasses} {...props}>
      {imageMode === 'custom' ? (
        <div className={emptyImageClasses || undefined}>{image}</div>
      ) : illustration ? (
        <div className={emptyImageClasses || undefined}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={illustration.viewBox}
            className="mx-auto h-24 w-24"
            aria-hidden="true"
            focusable="false">
            {illustration.paths.map((p, i) => (
              <path
                key={i}
                d={p.d}
                fill={p.fill ?? 'none'}
                stroke={p.stroke}
                strokeWidth={p.strokeWidth}
                opacity={p.opacity}
              />
            ))}
          </svg>
        </div>
      ) : null}

      {descText ? <div className={emptyDescriptionClasses}>{descText}</div> : null}

      {extra ? <div className={emptyActionsClasses}>{extra}</div> : null}

      {children ? <div>{children}</div> : null}
    </div>
  )
})
