import React, { forwardRef, useContext, useEffect, useMemo, useState } from 'react'
import {
  avatarBaseClasses,
  avatarDefaultBgColor,
  avatarDefaultTextColor,
  avatarGeneratedTextColor,
  avatarImageClasses,
  avatarShapeClasses,
  avatarSizeClasses,
  classNames,
  generateAvatarColor,
  getInitials,
  pickAvatarImageAttrs,
  resolveAvatarName,
  resolveAvatarPaint,
  type AvatarImageProps,
  type AvatarProps as CoreAvatarProps,
  type AvatarShape
} from '@expcat/tigercat-core'
import { AvatarGroupContext } from './AvatarGroup'

export interface AvatarProps
  extends
    Omit<CoreAvatarProps, 'icon'>,
    AvatarImageProps,
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'onLoad' | 'onError' | 'crossOrigin'> {
  children?: React.ReactNode
  onLoad?: React.ReactEventHandler<HTMLImageElement>
  onError?: React.ReactEventHandler<HTMLImageElement>
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    size,
    shape,
    src,
    alt = '',
    text,
    bgColor,
    textColor,
    srcSet,
    sizes,
    crossOrigin,
    referrerPolicy,
    decoding,
    fetchPriority,
    className,
    children,
    onLoad,
    onError,
    ...props
  },
  ref
) {
  const [imageError, setImageError] = useState(false)
  const group = useContext(AvatarGroupContext)

  useEffect(() => {
    setImageError(false)
  }, [src])

  const hasImage = Boolean(src) && !imageError
  const displayText = text ? getInitials(text) : ''
  const resolvedSize = size ?? group?.size ?? 'md'
  const resolvedShape: AvatarShape = shape ?? group?.shape ?? 'circle'

  const { rest: spanRest } = pickAvatarImageAttrs(props as Record<string, unknown>)
  const { computedLabel, isDecorative } = resolveAvatarName({
    alt,
    text,
    ariaLabel: spanRest['aria-label'],
    ariaLabelledby: spanRest['aria-labelledby'],
    ariaHidden: spanRest['aria-hidden']
  })

  const autoBg = !bgColor && text ? generateAvatarColor(text) : undefined
  const bgPaint = resolveAvatarPaint(bgColor, 'bg', autoBg ?? avatarDefaultBgColor)
  const textPaint = resolveAvatarPaint(
    textColor,
    'text',
    autoBg ? avatarGeneratedTextColor : avatarDefaultTextColor
  )

  const avatarClasses = useMemo(
    () =>
      classNames(
        avatarBaseClasses,
        avatarSizeClasses[resolvedSize],
        avatarShapeClasses[resolvedShape],
        group?.itemClass,
        !hasImage && bgPaint.className,
        !hasImage && textPaint.className,
        className
      ),
    [
      resolvedSize,
      resolvedShape,
      group?.itemClass,
      hasImage,
      bgPaint.className,
      textPaint.className,
      className
    ]
  )

  const paintStyle =
    !hasImage && (bgPaint.style || textPaint.style)
      ? { ...bgPaint.style, ...textPaint.style }
      : undefined

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    onError?.(event)
    if (!event.defaultPrevented) setImageError(true)
  }

  if (hasImage) {
    return (
      <span
        ref={ref}
        {...spanRest}
        className={avatarClasses}
        aria-hidden={isDecorative ? true : (spanRest['aria-hidden'] as boolean | undefined)}>
        <img
          src={src}
          alt={computedLabel ?? ''}
          srcSet={srcSet}
          sizes={sizes}
          crossOrigin={crossOrigin}
          referrerPolicy={referrerPolicy}
          decoding={decoding}
          fetchPriority={fetchPriority}
          className={avatarImageClasses}
          onLoad={onLoad}
          onError={handleError}
        />
      </span>
    )
  }

  return (
    <span
      ref={ref}
      {...spanRest}
      className={avatarClasses}
      style={
        paintStyle || spanRest.style
          ? { ...(spanRest.style as React.CSSProperties), ...paintStyle }
          : undefined
      }
      {...(isDecorative
        ? { 'aria-hidden': true }
        : {
            role: 'img',
            'aria-label': computedLabel,
            'aria-labelledby': spanRest['aria-labelledby'] as string | undefined
          })}>
      {displayText || children}
    </span>
  )
})

Avatar.displayName = 'Avatar'
