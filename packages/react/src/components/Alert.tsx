import React, { forwardRef, useMemo, useCallback, useEffect, useRef, useState } from 'react'
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
  createAlertCountdown,
  focusAfterElement,
  isAlertInsertedAfterPaint,
  resolveAlertLive,
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
   * Close request. Omit `open` and the alert hides itself.
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
    open,
    onOpenChange,
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
  const onOpenChangeRef = useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange
  const openRef = useRef(open)
  openRef.current = open
  const [dismissed, setDismissed] = useState(false)
  const [ratio, setRatio] = useState(1)
  const alertRef = useRef<HTMLDivElement>(null)
  const inserted = useRef(isAlertInsertedAfterPaint()).current
  const countdown = useRef(
    createAlertCountdown({
      enabled: typeof document !== 'undefined',
      onElapsed: () => requestCloseRef.current(false)
    })
  ).current
  const requestCloseRef = useRef<(fromCloseButton: boolean) => void>(() => undefined)

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

  const shown = open === false ? false : open === true ? true : !dismissed

  const requestClose = useCallback((fromCloseButton: boolean) => {
    onCloseRef.current?.(new Event('close', { cancelable: true }))
    onOpenChangeRef.current?.(false)
    if (openRef.current === undefined) setDismissed(true)
    if (fromCloseButton) focusAfterElement(alertRef.current)
  }, [])
  requestCloseRef.current = requestClose

  const handleClose = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      requestClose(true)
    },
    [requestClose]
  )

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const sync = () => countdown.sync(shown ? duration : undefined, Boolean(media?.matches))
    sync()
    media?.addEventListener?.('change', sync)
    return () => media?.removeEventListener?.('change', sync)
  }, [countdown, duration, shown])

  useEffect(() => {
    return countdown.subscribe(() => setRatio(countdown.getRatio()))
  }, [countdown])

  useEffect(() => () => countdown.dispose(), [countdown])

  if (!shown) {
    return null
  }

  const iconPath = getAlertIconPath(type)

  const hasTitle = !!(title || titleSlot)
  const hasDescription = !!(description || descriptionSlot)
  const hasChildren = children != null && children !== false
  const hasContent = hasTitle || hasDescription || hasChildren
  const live = resolveAlertLive(type, hasContent, inserted)
  const role = roleProp ?? live.role

  return (
    <div
      {...props}
      ref={(node) => {
        alertRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={alertClasses}
      role={role}
      aria-live={live.ariaLive}>
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

      {showCountdown && duration && duration > 0 && shown && (
        <div className={alertCountdownContainerClasses}>
          <div
            className={classNames(alertCountdownBarClasses, alertCountdownColorClasses[type])}
            style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
})

Alert.displayName = 'Alert'
