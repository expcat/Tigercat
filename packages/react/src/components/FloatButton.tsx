import React, {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode
} from 'react'
import {
  classNames,
  floatButtonGroupExpandClasses,
  floatButtonIconSizeClasses,
  floatButtonPlusIconPath,
  getFloatButtonClasses,
  getFloatButtonGroupClasses,
  getFloatButtonLabels,
  getFloatButtonOffsetStyle,
  mergeTigerLocale,
  resolveFloatButtonAriaLabel,
  resolveFloatButtonShape,
  shouldMergeOverlayTriggerChild,
  type FloatButtonShape,
  type FloatButtonSize,
  type FloatButtonProps as CoreFloatButtonProps,
  type FloatButtonGroupProps as CoreFloatButtonGroupProps,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { useControlledState } from '../hooks/useControlledState'
import { composeEventHandlers } from '../utils/overlay-trigger'
import { renderBodyPortal, useClickOutside, useEscapeKey } from '../utils/overlay'

const FloatButtonGroupContext = createContext<{
  shape?: FloatButtonShape
  inGroup: boolean
} | null>(null)

export interface FloatButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>, CoreFloatButtonProps {
  children?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  locale?: Partial<TigerLocale>
}

const DefaultPlusIcon: React.FC<{ size: FloatButtonSize }> = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    className={floatButtonIconSizeClasses[size]}
    aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d={floatButtonPlusIconPath} />
  </svg>
)

function nodeHasVisibleText(node: React.ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return false
  if (typeof node === 'string' || typeof node === 'number') return String(node).trim().length > 0
  if (Array.isArray(node)) return node.some(nodeHasVisibleText)
  if (!isValidElement(node)) return false
  const props = node.props as { children?: React.ReactNode; 'aria-hidden'?: unknown }
  if (node.type === 'svg' || props['aria-hidden'] === true || props['aria-hidden'] === 'true') {
    return false
  }
  return nodeHasVisibleText(props.children)
}

export const FloatButton = forwardRef<HTMLButtonElement, FloatButtonProps>(function FloatButton(
  {
    shape,
    size = 'md',
    type = 'primary',
    tooltip,
    disabled = false,
    ariaLabel,
    className,
    floating = false,
    placement = 'bottom-right',
    offset,
    style,
    children,
    onClick,
    locale,
    ...props
  },
  ref
) {
  const group = useContext(FloatButtonGroupContext)
  const config = useTigerConfig()
  const resolvedShape: FloatButtonShape = resolveFloatButtonShape(shape, group?.shape)
  const labels = getFloatButtonLabels(mergeTigerLocale(config.locale, locale))
  const classes = useMemo(
    () =>
      getFloatButtonClasses({
        shape: resolvedShape,
        size,
        type,
        disabled,
        floating,
        inGroup: Boolean(group?.inGroup),
        placement,
        className
      }),
    [resolvedShape, size, type, disabled, floating, group?.inGroup, placement, className]
  )

  const buttonStyle = useMemo(
    () => ({
      ...getFloatButtonOffsetStyle(placement, offset, floating && !group?.inGroup),
      ...style
    }),
    [floating, group?.inGroup, placement, offset, style]
  )

  const resolvedAriaLabel = resolveFloatButtonAriaLabel({
    ariaLabel,
    tooltip,
    hasVisibleText: nodeHasVisibleText(children),
    localeLabel: labels.ariaLabel
  })

  return (
    <button
      {...props}
      ref={ref}
      className={classes}
      type="button"
      disabled={disabled}
      style={buttonStyle}
      aria-label={resolvedAriaLabel}
      title={tooltip}
      onClick={disabled ? undefined : onClick}>
      {children ?? <DefaultPlusIcon size={size} />}
    </button>
  )
})

export interface FloatButtonGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>, CoreFloatButtonGroupProps {
  triggerNode?: React.ReactNode
  children?: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

export const FloatButtonGroup = forwardRef<HTMLDivElement, FloatButtonGroupProps>(
  function FloatButtonGroup(
    {
      shape: groupShape,
      trigger = 'click',
      open: controlledOpen,
      defaultOpen = false,
      closeOnAction = true,
      triggerNode,
      children,
      className,
      onOpenChange,
      placement = 'bottom-right',
      offset,
      portal = true,
      style,
      ...props
    },
    ref
  ) {
    const groupContextValue = useMemo(() => ({ shape: groupShape, inGroup: true }), [groupShape])
    const [isOpen, setOpen] = useControlledState<boolean>({
      value: controlledOpen,
      defaultValue: defaultOpen,
      onChange: onOpenChange
    })
    const instanceId = useId()
    const panelId = `tiger-float-group-${instanceId}`
    const groupRef = useRef<HTMLDivElement | null>(null)

    const setGroupRef = useCallback(
      (node: HTMLDivElement | null) => {
        groupRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref]
    )

    const toggle = useCallback(() => {
      setOpen((current) => !current)
    }, [setOpen])

    const close = useCallback(() => {
      setOpen(false)
    }, [setOpen])

    const handleMouseEnter = useCallback(() => {
      setOpen(true)
    }, [setOpen])

    const handleMouseLeave = useCallback(() => {
      setOpen(false)
    }, [setOpen])

    useClickOutside({
      enabled: isOpen,
      refs: [groupRef],
      onOutsideClick: close,
      defer: true
    })
    useEscapeKey({ enabled: isOpen, onEscape: close, layerRef: groupRef })

    const groupClasses = useMemo(
      () => classNames(getFloatButtonGroupClasses({ placement, portal }), className),
      [placement, portal, className]
    )

    const groupStyle = useMemo(
      () => ({ ...getFloatButtonOffsetStyle(placement, offset, true), ...style }),
      [placement, offset, style]
    )

    const triggerAria = {
      'aria-expanded': isOpen,
      'aria-controls': isOpen ? panelId : undefined,
      'data-state': (isOpen ? 'open' : 'closed') as 'open' | 'closed'
    }

    const handleTriggerClick = (event: React.MouseEvent) => {
      event.stopPropagation()
      if (trigger === 'hover') {
        setOpen(true)
        return
      }
      toggle()
    }

    let triggerEl: ReactNode
    if (isValidElement(triggerNode) && shouldMergeOverlayTriggerChild(true, triggerNode.type)) {
      const child = triggerNode as ReactElement<{
        onClick?: React.MouseEventHandler
        'aria-expanded'?: boolean
        'aria-controls'?: string
        'data-state'?: string
      }>
      triggerEl = cloneElement(child, {
        ...triggerAria,
        onClick: composeEventHandlers(child.props.onClick, handleTriggerClick)
      })
    } else if (triggerNode) {
      triggerEl = (
        <button type="button" {...triggerAria} onClick={handleTriggerClick}>
          {triggerNode}
        </button>
      )
    } else {
      triggerEl = <FloatButton {...triggerAria} onClick={handleTriggerClick} />
    }

    const handleActionClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!closeOnAction) return
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('button, a, [role="button"]')) close()
    }

    const content = (
      <FloatButtonGroupContext.Provider value={groupContextValue}>
        <div
          {...props}
          ref={setGroupRef}
          className={groupClasses}
          style={groupStyle}
          onMouseEnter={
            trigger === 'hover'
              ? composeEventHandlers(props.onMouseEnter, handleMouseEnter)
              : props.onMouseEnter
          }
          onMouseLeave={
            trigger === 'hover'
              ? composeEventHandlers(props.onMouseLeave, handleMouseLeave)
              : props.onMouseLeave
          }>
          {triggerEl}
          {isOpen ? (
            <div
              id={panelId}
              role="group"
              className={floatButtonGroupExpandClasses}
              onClick={handleActionClick}>
              {children}
            </div>
          ) : null}
        </div>
      </FloatButtonGroupContext.Provider>
    )

    return portal ? renderBodyPortal(content) : content
  }
)

export default FloatButton
