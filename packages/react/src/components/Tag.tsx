import React, { forwardRef, useMemo } from 'react'
import {
  classNames,
  getTagVariantClasses,
  defaultTagThemeColors,
  icon24PathStrokeLinecap,
  icon24PathStrokeLinejoin,
  icon24StrokeWidth,
  icon24ViewBox,
  tagBaseClasses,
  tagSizeClasses,
  tagPillClasses,
  tagCloseButtonBaseClasses,
  tagCloseIconPath,
  omitUnsupportedColorProp,
  getStatusLabels,
  mergeTigerLocale,
  type TagProps as CoreTagProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type TagProps = CoreTagProps &
  Omit<React.HTMLAttributes<HTMLSpanElement>, keyof CoreTagProps | 'onClose'> & {
    /**
     * Close event handler. The tag stays mounted unless the parent unmounts
     * it or sets `open={false}`.
     */
    onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void

    /**
     * Tag content
     */
    children?: React.ReactNode
  }

const CloseIcon: React.FC = () => (
  <svg
    className="h-3 w-3"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox={icon24ViewBox}
    stroke="currentColor"
    strokeWidth={icon24StrokeWidth}
    aria-hidden="true"
    focusable="false">
    <path
      strokeLinecap={icon24PathStrokeLinecap}
      strokeLinejoin={icon24PathStrokeLinejoin}
      d={tagCloseIconPath}
    />
  </svg>
)

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    locale,
    variant = 'default',
    size = 'md',
    closable = false,
    closeAriaLabel,
    closeTabIndex,
    open,
    onOpenChange,
    pill = false,
    onClose,
    children,
    className,
    ...props
  },
  ref
) {
  const config = useTigerConfig()
  const labels = useMemo(
    () => getStatusLabels(mergeTigerLocale(config.locale, locale)),
    [config.locale, locale]
  )
  const rest = omitUnsupportedColorProp('Tag', props as Record<string, unknown>)

  const tagClasses = useMemo(
    () =>
      classNames(
        tagBaseClasses,
        getTagVariantClasses(variant),
        tagSizeClasses[size],
        pill && tagPillClasses,
        className
      ),
    [variant, size, pill, className]
  )

  const closeButtonClasses = useMemo(() => {
    const scheme = defaultTagThemeColors[variant]
    return classNames(tagCloseButtonBaseClasses, scheme.closeBgHover, scheme.text)
  }, [variant])

  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onClose?.(event)
    onOpenChange?.(false)
  }

  if (open === false) {
    return null
  }

  return (
    <span ref={ref} className={tagClasses} {...rest}>
      {children != null && <span>{children}</span>}
      {closable && (
        <button
          className={closeButtonClasses}
          onClick={handleClose}
          aria-label={closeAriaLabel ?? labels.tagCloseAriaLabel}
          tabIndex={closeTabIndex}
          type="button">
          <CloseIcon />
        </button>
      )}
    </span>
  )
})

Tag.displayName = 'Tag'
