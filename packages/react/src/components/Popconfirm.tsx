import React, { useMemo, useRef } from 'react'
import {
  classNames,
  createFloatingIdFactory,
  getPopconfirmIconPath,
  getPopconfirmContainerClasses,
  getPopconfirmTriggerClasses,
  getPopconfirmContentClasses,
  getPopconfirmTitleClasses,
  getPopconfirmDescriptionClasses,
  getPopconfirmIconClasses,
  getPopconfirmArrowClasses,
  getPopconfirmButtonsClasses,
  getPopconfirmCancelButtonClasses,
  getPopconfirmOkButtonClasses,
  mergeStyleValues,
  popconfirmIconPathStrokeLinecap,
  popconfirmIconPathStrokeLinejoin,
  popconfirmIconStrokeWidth,
  popconfirmIconViewBox,
  type PopconfirmProps as CorePopconfirmProps,
  type PopconfirmIconType,
  type FloatingPlacement
} from '@expcat/tigercat-core'
import { usePopup } from '../utils/use-popup'

const createPopconfirmId = createFloatingIdFactory('popconfirm')

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

export type PopconfirmProps = Omit<CorePopconfirmProps, 'style' | 'placement'> &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style'> & {
    children?: React.ReactNode
    titleContent?: React.ReactNode
    descriptionContent?: React.ReactNode
    onVisibleChange?: (visible: boolean) => void
    onConfirm?: () => void
    onCancel?: () => void
    placement?: FloatingPlacement
    offset?: number
    className?: string
    style?: React.CSSProperties
  }

export const Popconfirm: React.FC<PopconfirmProps> = ({
  visible,
  defaultVisible = false,
  title = '确定要执行此操作吗？',
  description,
  icon = 'warning',
  showIcon = true,
  okText = '确定',
  cancelText = '取消',
  okType = 'primary',
  placement: initialPlacement = 'top',
  offset = 8,
  disabled = false,
  className,
  style,
  children,
  titleContent,
  descriptionContent,
  onVisibleChange,
  onConfirm,
  onCancel,
  ...divProps
}) => {
  const popconfirmIdRef = useRef<string | null>(null)
  if (!popconfirmIdRef.current) popconfirmIdRef.current = createPopconfirmId()
  const popconfirmId = popconfirmIdRef.current
  const titleId = `${popconfirmId}-title`
  const descriptionId = `${popconfirmId}-description`
  const describedBy = description || descriptionContent ? descriptionId : undefined

  // Shared popup logic (click-only, multiTrigger=false)
  const {
    currentVisible,
    setVisible,
    containerRef,
    triggerRef,
    floatingRef,
    actualPlacement,
    floatingStyles: baseFloatingStyles
  } = usePopup({
    visible,
    defaultVisible,
    disabled,
    placement: initialPlacement,
    offset,
    multiTrigger: false,
    onVisibleChange
  })

  const handleConfirm = () => {
    onConfirm?.()
    setVisible(false)
  }
  const handleCancel = () => {
    onCancel?.()
    setVisible(false)
  }
  const handleTriggerClick = () => {
    if (disabled) return
    setVisible(!currentVisible)
  }

  // Compute styles (strip zIndex since Popconfirm uses its own z-50 class)
  const contentWrapperStyles = useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      left: baseFloatingStyles.left,
      top: baseFloatingStyles.top,
      transformOrigin: baseFloatingStyles.transformOrigin
    }),
    [baseFloatingStyles]
  )

  // Classes
  const containerClasses = useMemo(
    () => classNames(getPopconfirmContainerClasses(), className),
    [className]
  )
  const triggerClasses = useMemo(() => getPopconfirmTriggerClasses(disabled), [disabled])
  const contentWrapperClasses = 'absolute z-50'
  const arrowClasses = useMemo(() => getPopconfirmArrowClasses(actualPlacement), [actualPlacement])
  const contentClasses = getPopconfirmContentClasses()
  const titleClasses = getPopconfirmTitleClasses()
  const descriptionClasses = getPopconfirmDescriptionClasses()
  const iconClasses = useMemo(() => getPopconfirmIconClasses(icon), [icon])
  const buttonsClasses = getPopconfirmButtonsClasses()
  const cancelButtonClasses = getPopconfirmCancelButtonClasses()
  const okButtonClasses = useMemo(() => getPopconfirmOkButtonClasses(okType), [okType])

  if (!children) return null

  const mergedStyle = mergeStyleValues(style) as React.CSSProperties | undefined

  const triggerProps = {
    className: triggerClasses,
    onClick: (event: React.MouseEvent) => {
      const target = children
      if (React.isValidElement<{ onClick?: unknown }>(target)) {
        const onChildClick = target.props.onClick
        if (typeof onChildClick === 'function') {
          ;(onChildClick as (e: React.MouseEvent) => void)(event)
        }
      }
      if (event.defaultPrevented) return
      handleTriggerClick()
    },
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': Boolean(currentVisible),
    'aria-controls': currentVisible ? popconfirmId : undefined
  }

  type TriggerChildProps = { className?: string; onClick?: unknown }

  const triggerNode = (() => {
    if (React.isValidElement<TriggerChildProps>(children)) {
      return React.cloneElement(children, {
        ...triggerProps,
        className: classNames(children.props.className, triggerProps.className)
      })
    }
    return (
      <div
        {...triggerProps}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onKeyDown={(event) => {
          if (disabled) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleTriggerClick()
          }
        }}>
        {children}
      </div>
    )
  })()

  return (
    <div ref={containerRef} className={containerClasses} style={mergedStyle} {...divProps}>
      <div ref={triggerRef}>{triggerNode}</div>

      <div
        ref={floatingRef}
        className={contentWrapperClasses}
        style={contentWrapperStyles}
        hidden={!currentVisible}
        aria-hidden={!currentVisible}>
        <div className="relative">
          <div className={arrowClasses} aria-hidden="true" />
          <div
            id={popconfirmId}
            role="dialog"
            aria-modal="false"
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
                  {titleContent || title}
                </div>
                {(description || descriptionContent) && (
                  <div id={descriptionId} className={descriptionClasses}>
                    {descriptionContent || description}
                  </div>
                )}
              </div>
            </div>
            <div className={buttonsClasses}>
              <button type="button" className={cancelButtonClasses} onClick={handleCancel}>
                {cancelText}
              </button>
              <button type="button" className={okButtonClasses} onClick={handleConfirm}>
                {okText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
