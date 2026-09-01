import React, { forwardRef, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  classNames,
  getAlertTypeClasses,
  defaultAlertThemeColors,
  alertBaseClasses,
  alertSizeClasses,
  alertIconSizeClasses,
  alertTitleSizeClasses,
  alertDescriptionSizeClasses,
  alertCloseButtonBaseClasses,
  alertIconContainerClasses,
  getAlertContentClasses,
  getAlertIconPath,
  alertCloseIconPath,
  alertBannerClasses,
  alertCountdownContainerClasses,
  alertCountdownBarClasses,
  alertCountdownColorClasses,
  resolveAlertRole,
  getAlertLabels,
  mergeTigerLocale,
  type AlertProps as CoreAlertProps
} from '@expcat/tigercat-core'
import { StatusIcon } from './shared/icons'
import { useTigerConfig } from './ConfigProvider'

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>, CoreAlertProps {
  /**
   * Alert content (React children). Rendered even when `title` is set.
   */
  children?: React.ReactNode

  /**
   * Custom title content (overrides title prop)
   */
  titleSlot?: React.ReactNode

  /**
   * Custom description content (overrides description prop)
   */
  descriptionSlot?: React.ReactNode

  /**
   * Close request. Click and auto-close both pass an event.
   * Closing never hides internally — unmount or set `visible={false}`.
   */
  onClose?: (event: Event) => void
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    locale,
    type = 'info',
    size = 'md',
    title,
    description,
    showIcon = true,
    closable = false,
    closeAriaLabel,
    duration,
    visible,
    banner = false,
    showCountdown = false,
    className,
    children,
    titleSlot,
    descriptionSlot,
    onClose,
    role: roleProp,
    ...props
  },
  ref
) {
  const config = useTigerConfig()
  const labels = useMemo(
    () => getAlertLabels(mergeTigerLocale(config.locale, locale)),
    [config.locale, locale]
  )
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const colorScheme = useMemo(() => getAlertTypeClasses(type, defaultAlertThemeColors), [type])

  const alertClasses = useMemo(
    () =>
      classNames(
        alertBaseClasses,
        alertSizeClasses[size],
        colorScheme.bg,
        colorScheme.border,
        banner && alertBannerClasses,
        className
      ),
    [size, colorScheme, banner, className]
  )

  const iconClasses = useMemo(
    () => classNames(alertIconSizeClasses[size], colorScheme.icon),
    [size, colorScheme]
  )
  const titleClasses = useMemo(
    () => classNames(alertTitleSizeClasses[size], colorScheme.title),
    [size, colorScheme]
  )
  const descriptionClasses = useMemo(
    () => classNames(alertDescriptionSizeClasses[size], colorScheme.description),
    [size, colorScheme]
  )
  const closeButtonClasses = useMemo(
    () =>
      classNames(
        alertCloseButtonBaseClasses,
        colorScheme.closeButton,
        colorScheme.closeButtonHover,
        colorScheme.focus
      ),
    [colorScheme]
  )

  const clearTimerRef = useRef<(() => void) | undefined>(undefined)

  const requestClose = useCallback((event: Event) => {
    onCloseRef.current?.(event)
    clearTimerRef.current?.()
  }, [])

  const handleClose = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      requestClose(event.nativeEvent)
    },
    [requestClose]
  )

  useEffect(() => {
    if (visible === false || !(duration && duration > 0)) {
      return
    }
    const timer = window.setTimeout(() => {
      requestClose(new Event('close', { cancelable: true }))
    }, duration)
    const clear = () => window.clearTimeout(timer)
    clearTimerRef.current = clear
    return () => {
      clear()
      if (clearTimerRef.current === clear) {
        clearTimerRef.current = undefined
      }
    }
  }, [duration, visible, requestClose])

  if (visible === false) {
    return null
  }

  const iconPath = getAlertIconPath(type)

  const hasTitle = !!(title || titleSlot)
  const hasDescription = !!(description || descriptionSlot)
  const hasChildren = children != null && children !== false
  const hasContent = hasTitle || hasDescription || hasChildren
  const role = roleProp ?? resolveAlertRole(type, hasContent)

  return (
    <div {...props} ref={ref} className={alertClasses} role={role}>
      {showIcon && (
        <div className={alertIconContainerClasses}>
          <StatusIcon
            path={iconPath}
            className={iconClasses}
            aria-hidden="true"
            focusable="false"
          />
        </div>
      )}

      {hasContent && (
        <div className={getAlertContentClasses(showIcon)}>
          {hasTitle && <div className={titleClasses}>{titleSlot || title}</div>}
          {hasDescription && (
            <div className={descriptionClasses}>{descriptionSlot || description}</div>
          )}
          {hasChildren && (
            <div className={hasTitle || hasDescription ? descriptionClasses : titleClasses}>
              {children}
            </div>
          )}
        </div>
      )}

      {closable && (
        <button
          className={closeButtonClasses}
          onClick={handleClose}
          aria-label={closeAriaLabel ?? labels.closeAriaLabel}
          type="button">
          <StatusIcon
            path={alertCloseIconPath}
            className="h-4 w-4"
            aria-hidden="true"
            focusable="false"
          />
        </button>
      )}

      {showCountdown && duration && duration > 0 && (
        <div className={alertCountdownContainerClasses}>
          <div
            className={classNames(alertCountdownBarClasses, alertCountdownColorClasses[type])}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  )
})

Alert.displayName = 'Alert'
