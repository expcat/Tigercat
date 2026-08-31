import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getArrowStyles,
  getFocusableElements,
  getOverlayTriggerAria,
  getPopconfirmIconPath,
  getPopconfirmContainerClasses,
  getPopconfirmTriggerClasses,
  getPopconfirmContentClasses,
  getPopconfirmTitleClasses,
  getPopconfirmDescriptionClasses,
  getPopconfirmIconClasses,
  getPopconfirmArrowClasses,
  getPopconfirmButtonsClasses,
  mergeStyleValues,
  popconfirmIconPathStrokeLinecap,
  popconfirmIconPathStrokeLinejoin,
  popconfirmIconStrokeWidth,
  popconfirmIconViewBox,
  resolveLocaleText,
  type PopconfirmProps as CorePopconfirmProps,
  type PopconfirmIconType,
  type FloatingPlacement
} from '@expcat/tigercat-core'
import { usePopup } from '../utils/use-popup'
import { renderOverlayPortal, useFocusTrap } from '../utils/overlay'
import { composeRefs, renderOverlayTrigger } from '../utils/overlay-trigger'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'

const PopconfirmIcon: React.FC<{ type: PopconfirmIconType }> = ({ type }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox={popconfirmIconViewBox}
    strokeWidth={popconfirmIconStrokeWidth}
    stroke="currentColor">
    <path
      strokeLinecap={popconfirmIconPathStrokeLinecap}
      strokeLinejoin={popconfirmIconPathStrokeLinejoin}
      d={getPopconfirmIconPath(type)}
    />
  </svg>
)

export type PopconfirmProps = Omit<
  CorePopconfirmProps,
  'style' | 'placement' | 'onConfirm' | 'onCancel'
> &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'title'> & {
    children?: React.ReactNode | ((state: { open: boolean }) => React.ReactNode)
    titleContent?: React.ReactNode
    descriptionContent?: React.ReactNode
    onOpenChange?: (open: boolean) => void
    onConfirm?: () => void | Promise<void>
    onCancel?: () => void
    placement?: FloatingPlacement
    offset?: number
    asChild?: boolean
    className?: string
    style?: React.CSSProperties
  }

export const Popconfirm = forwardRef<HTMLElement, PopconfirmProps>(function Popconfirm(
  {
    open,
    defaultOpen = false,
    title,
    description,
    icon = 'warning',
    showIcon = true,
    okText,
    cancelText,
    okType = 'primary',
    placement: initialPlacement = 'top',
    offset = 8,
    disabled = false,
    asChild = false,
    className,
    style,
    children,
    titleContent,
    descriptionContent,
    onOpenChange,
    onConfirm,
    onCancel,
    ...divProps
  },
  forwardedRef
) {
  const { locale } = useTigerConfig()
  const resolvedTitle = resolveLocaleText(
    'Are you sure you want to continue?',
    title,
    locale?.common?.confirmTitle
  )
  const resolvedOkText = resolveLocaleText('OK', okText, locale?.common?.okText)
  const resolvedCancelText = resolveLocaleText('Cancel', cancelText, locale?.common?.cancelText)

  const popconfirmId = `tiger-popconfirm-${useId()}`
  const titleId = `${popconfirmId}-title`
  const descriptionId = `${popconfirmId}-description`
  const describedBy = description || descriptionContent ? descriptionId : undefined
  const arrowRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [confirming, setConfirming] = useState(false)

  const {
    currentVisible,
    setVisible,
    containerRef,
    triggerRef,
    floatingRef,
    floatingClasses,
    positioned,
    overlayTarget,
    closeAndRestoreFocus,
    actualPlacement,
    floatingStyles: baseFloatingStyles,
    arrowX,
    arrowY
  } = usePopup({
    open,
    defaultOpen,
    disabled,
    placement: initialPlacement,
    offset,
    multiTrigger: false,
    arrowRef,
    onOpenChange
  })

  useFocusTrap({ enabled: Boolean(currentVisible), containerRef: floatingRef })

  useEffect(() => {
    if (!currentVisible) {
      setConfirming(false)
      return
    }
    const frame = requestAnimationFrame(() => {
      if (cancelRef.current) {
        cancelRef.current.focus()
        return
      }
      const root = floatingRef.current
      if (!root) return
      const first = getFocusableElements(root)[0]
      first?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [currentVisible, floatingRef])

  const handleConfirm = async () => {
    const result = onConfirm?.()
    if (result && typeof (result as Promise<void>).then === 'function') {
      setConfirming(true)
      try {
        await result
        closeAndRestoreFocus()
      } catch {
        setConfirming(false)
      }
      return
    }
    closeAndRestoreFocus()
  }

  const handleCancel = () => {
    if (confirming) return
    onCancel?.()
    closeAndRestoreFocus()
  }

  const containerClasses = useMemo(
    () => classNames(getPopconfirmContainerClasses(), className),
    [className]
  )
  const triggerClasses = useMemo(() => getPopconfirmTriggerClasses(disabled), [disabled])
  const contentClasses = getPopconfirmContentClasses()
  const titleClasses = getPopconfirmTitleClasses()
  const descriptionClasses = getPopconfirmDescriptionClasses()
  const iconClasses = useMemo(() => getPopconfirmIconClasses(icon), [icon])
  const buttonsClasses = getPopconfirmButtonsClasses()
  const arrowClasses = getPopconfirmArrowClasses()
  const arrowStyle = useMemo(
    () => getArrowStyles(actualPlacement, { x: arrowX, y: arrowY }) as React.CSSProperties,
    [actualPlacement, arrowX, arrowY]
  )

  if (!children) return null

  const resolvedChildren =
    typeof children === 'function' ? children({ open: Boolean(currentVisible) }) : children

  const triggerAria = getOverlayTriggerAria({
    kind: 'dialog',
    open: Boolean(currentVisible),
    controlsId: popconfirmId,
    disabled
  })

  const mergedStyle = mergeStyleValues(style) as React.CSSProperties | undefined

  return (
    <div ref={containerRef} className={containerClasses} style={mergedStyle} {...divProps}>
      {renderOverlayTrigger({
        asChild,
        child: resolvedChildren,
        triggerRef: composeRefs(forwardedRef, triggerRef),
        className: asChild ? undefined : triggerClasses,
        disabled,
        preventDefaultOnClick: true,
        aria: triggerAria,
        handlers: {
          onClick: () => {
            if (disabled) return
            setVisible(!currentVisible)
          }
        }
      })}

      {renderOverlayPortal(
        <div
          ref={floatingRef}
          className={floatingClasses}
          style={baseFloatingStyles}
          data-positioned={positioned}
          hidden={!currentVisible}
          aria-hidden={!currentVisible}>
          <div className="relative">
            <div ref={arrowRef} className={arrowClasses} style={arrowStyle} aria-hidden="true" />
            <div
              id={popconfirmId}
              role="dialog"
              aria-modal="false"
              tabIndex={-1}
              aria-labelledby={titleId}
              aria-describedby={describedBy}
              className={contentClasses}>
              <div className="flex items-start">
                {showIcon && (
                  <div className={iconClasses} aria-hidden="true">
                    <PopconfirmIcon type={icon} />
                  </div>
                )}
                <div className="flex-1">
                  <div id={titleId} className={titleClasses}>
                    {titleContent || resolvedTitle}
                  </div>
                  {(description || descriptionContent) && (
                    <div id={descriptionId} className={descriptionClasses}>
                      {descriptionContent || description}
                    </div>
                  )}
                </div>
              </div>
              <div className={buttonsClasses}>
                <Button ref={cancelRef} size="sm" variant="outline" onClick={handleCancel}>
                  {resolvedCancelText}
                </Button>
                <Button
                  size="sm"
                  variant={okType === 'danger' ? 'primary' : 'primary'}
                  danger={okType === 'danger'}
                  loading={confirming}
                  onClick={() => void handleConfirm()}>
                  {resolvedOkText}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        overlayTarget
      )}
    </div>
  )
})

Popconfirm.displayName = 'Popconfirm'
