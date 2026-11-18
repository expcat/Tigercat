import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  acquireOverlayZ,
  classNames,
  drawerFollowDistance,
  drawerFollowTransform,
  drawerPushOffset,
  drawerResizeDelta,
  drawerShowsMask,
  getDrawerMaskClasses,
  getDrawerContainerClasses,
  getDrawerPanelClasses,
  getDrawerHeaderClasses,
  getDrawerBodyClasses,
  getDrawerFooterClasses,
  getDrawerCloseButtonClasses,
  getDrawerTitleClasses,
  getResizeKeyboardDelta,
  getGestureTouchPoint,
  resolveDrawerPlacement,
  getDrawerSwipeCloseDirection,
  getDrawerLabels,
  resolveSwipeGesture,
  shouldRenderOverlay,
  isOverlayVisuallyHidden,
  whenOverlayTransitionEnds,
  isDrawerMobileFullscreen,
  canStartOverlaySwipeClose,
  OVERLAY_SWIPE_HANDLE_ATTR,
  shouldCloseOnMaskClick,
  mergeTigerLocale,
  OVERLAY_Z_INDEX,
  prefersReducedMotion,
  registerDrawerLayer,
  resolveSheetReducedMotion,
  resolveSheetRelease,
  type GesturePoint,
  type DrawerProps as CoreDrawerProps
} from '@expcat/tigercat-core'
import {
  closeIconViewBox,
  closeIconPathD,
  closeIconPathStrokeLinecap,
  closeIconPathStrokeLinejoin,
  closeIconPathStrokeWidth
} from '@expcat/tigercat-core/icons/common'
import { OverlayPortal } from '../utils/overlay-outlet'
import {
  useBodyScrollLock,
  useEscapeKey,
  useFocusTrap,
  useOverlayPortalTarget
} from '../utils/overlay'
import { composeRefs } from '../utils/overlay-trigger'
import { useTigerConfig } from './tiger-config'

export interface DrawerProps
  extends
    Omit<CoreDrawerProps, 'panelStyle'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  onAfterEnter?: () => void
  onAfterClose?: () => void
  header?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  panelStyle?: React.CSSProperties
}

const CloseIcon: React.FC = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox={closeIconViewBox}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false">
    <path
      strokeLinecap={closeIconPathStrokeLinecap}
      strokeLinejoin={closeIconPathStrokeLinejoin}
      strokeWidth={closeIconPathStrokeWidth}
      d={closeIconPathD}
    />
  </svg>
)

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    open = false,
    placement = 'right',
    size = 'md',
    width,
    title,
    header,
    closable = true,
    mask = true,
    maskClosable = true,
    keyboard = true,
    zIndex,
    resizable = false,
    className,
    bodyClassName,
    bodyPadding,
    destroyOnClose = false,
    fullscreenOnMobile = true,
    initialFocus,
    panelStyle,
    onClose,
    onOpenChange,
    onAfterEnter,
    onAfterClose,
    closeAriaLabel,
    locale,
    labels,
    children,
    footer,
    style,
    ...rest
  },
  forwardedRef
) {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const [hasOpened, setHasOpened] = React.useState(open)
  const [leaving, setLeaving] = React.useState(false)
  const wasOpenRef = useRef(open)
  const afterEnterRef = useRef(onAfterEnter)
  const afterCloseRef = useRef(onAfterClose)
  afterEnterRef.current = onAfterEnter
  afterCloseRef.current = onAfterClose

  useEffect(() => {
    if (open) {
      setHasOpened(true)
      setLeaving(false)
      wasOpenRef.current = true
      return whenOverlayTransitionEnds(dialogRef.current, () => afterEnterRef.current?.())
    }
    if (!wasOpenRef.current) return
    wasOpenRef.current = false
    setLeaving(true)
    return whenOverlayTransitionEnds(dialogRef.current, () => {
      setLeaving(false)
      afterCloseRef.current?.()
    })
  }, [open])

  const shouldRender = shouldRenderOverlay({
    open,
    hasOpened,
    leaving,
    destroyOnClose
  })

  const handleClose = useCallback(() => {
    onOpenChange?.(false)
    onClose?.()
  }, [onOpenChange, onClose])

  const handleMaskClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (shouldCloseOnMaskClick(event, maskClosable)) {
        handleClose()
      }
    },
    [maskClosable, handleClose]
  )

  useBodyScrollLock({ enabled: open })

  const reactId = useId()
  const drawerId = useMemo(() => `tiger-drawer-${reactId}`, [reactId])
  const titleId = `${drawerId}-title`
  const bodyId = `${drawerId}-body`
  const overlayHostId = `${drawerId}-overlay-host`

  const {
    ['aria-labelledby']: _ariaLabelledby,
    ['aria-label']: ariaLabelFromRest,
    ['aria-describedby']: ariaDescribedbyFromRest,
    role: _role,
    tabIndex: _tabIndex,
    ...dialogDivProps
  } = rest as React.HTMLAttributes<HTMLDivElement> & React.AriaAttributes

  const drawerLabels = getDrawerLabels(mergedLocale, {
    ...labels,
    ...(closeAriaLabel ? { closeAriaLabel } : {})
  })
  const hasHeader = header != null && header !== false && header !== ''
  const hasTitle = hasHeader || (title != null && title !== '')
  const ariaLabelledby =
    (rest as React.AriaAttributes)['aria-labelledby'] ?? (hasTitle ? titleId : undefined)
  const ariaLabel = ariaLabelFromRest ?? (hasTitle ? undefined : drawerLabels.dialogAriaLabel)
  const ariaDescribedby = ariaDescribedbyFromRest ?? (children != null ? bodyId : undefined)

  const { anchorRef, target: portalTarget } = useOverlayPortalTarget('viewport')
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const touchStartRef = useRef<GesturePoint | null>(null)
  const touchCurrentRef = useRef<GesturePoint | null>(null)
  const swipeAllowedRef = useRef(false)
  const [sheetOffset, setSheetOffset] = useState(0)
  const [resizedLength, setResizedLength] = useState<number | null>(null)
  const [measuredLength, setMeasuredLength] = useState(80)
  const [maxResizeLength, setMaxResizeLength] = useState(80)
  const [resizing, setResizing] = useState(false)
  const [layerId, setLayerId] = useState<number | null>(null)
  const [stackedZ, setStackedZ] = useState<number | undefined>(undefined)

  const writingDirection: 'ltr' | 'rtl' = mergedLocale?.direction === 'rtl' ? 'rtl' : 'ltr'
  const resolvedPlacement = resolveDrawerPlacement(placement, writingDirection)
  const isHorizontal = resolvedPlacement === 'left' || resolvedPlacement === 'right'
  const readResizeLength = useCallback(
    () =>
      resizedLength ??
      (isHorizontal
        ? (dialogRef.current?.offsetWidth ?? 320)
        : (dialogRef.current?.offsetHeight ?? 240)),
    [isHorizontal, resizedLength]
  )
  const readMaxResizeLength = useCallback(() => {
    const root = rootRef.current
    const viewport = root?.ownerDocument.defaultView
    return Math.max(
      80,
      isHorizontal
        ? root?.clientWidth || viewport?.innerWidth || 0
        : root?.clientHeight || viewport?.innerHeight || 0
    )
  }, [isHorizontal])
  const measureResizeRange = useCallback(() => {
    const maximum = readMaxResizeLength()
    const current = Math.min(maximum, Math.max(80, readResizeLength()))
    setMaxResizeLength(maximum)
    setMeasuredLength(current)
    if (resizedLength != null) setResizedLength(current)
  }, [readMaxResizeLength, readResizeLength, resizedLength])
  useLayoutEffect(() => {
    if (!open || !resizable) return
    measureResizeRange()
    const viewport = rootRef.current?.ownerDocument.defaultView
    viewport?.addEventListener('resize', measureResizeRange)
    return () => viewport?.removeEventListener('resize', measureResizeRange)
  }, [open, resizable, measureResizeRange, width, size, panelStyle, style, portalTarget])
  const swipeFollowOptions = useCallback(
    () => ({
      direction: writingDirection,
      fullscreen: isDrawerMobileFullscreen({
        fullscreenOnMobile,
        viewportWidth: window.innerWidth
      })
    }),
    [fullscreenOnMobile, writingDirection]
  )

  useLayoutEffect(() => {
    if (!open) {
      setLayerId(null)
      setStackedZ(undefined)
      return
    }
    let releaseZ: (() => void) | undefined
    if (zIndex === undefined) {
      const layer = acquireOverlayZ()
      setStackedZ(layer.zIndex)
      releaseZ = layer.release
    } else {
      setStackedZ(zIndex)
    }
    const registered = registerDrawerLayer(resolvedPlacement)
    setLayerId(registered.id)
    return () => {
      releaseZ?.()
      registered.release()
    }
  }, [open, resolvedPlacement, zIndex])

  useEscapeKey({ enabled: open && keyboard, onEscape: handleClose, layerRef: rootRef })

  const resolvedCloseAriaLabel = drawerLabels.closeAriaLabel

  const focusTargetRef = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    const root = dialogRef.current
    const found = initialFocus && root ? root.querySelector(initialFocus) : null
    focusTargetRef.current = found instanceof HTMLElement ? found : root
  }, [open, initialFocus])
  useFocusTrap({
    enabled: open,
    containerRef: rootRef,
    inert: true,
    autoFocus: true,
    initialFocusRef: focusTargetRef
  })

  const resetTouchGesture = useCallback(() => {
    touchStartRef.current = null
    touchCurrentRef.current = null
    swipeAllowedRef.current = false
    setSheetOffset(0)
  }, [])

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      dialogDivProps.onTouchStart?.(event)
      if (!open) return

      swipeAllowedRef.current = canStartOverlaySwipeClose({
        target: event.target,
        scrollContainer: bodyRef.current,
        closeDirection: getDrawerSwipeCloseDirection({
          placement: resolvedPlacement,
          direction: writingDirection,
          fullscreen: isDrawerMobileFullscreen({
            fullscreenOnMobile,
            viewportWidth: window.innerWidth
          })
        })
      })
      const point = getGestureTouchPoint(event.touches)
      touchStartRef.current = point
      touchCurrentRef.current = point
    },
    [dialogDivProps, fullscreenOnMobile, open, resolvedPlacement, writingDirection]
  )

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      dialogDivProps.onTouchMove?.(event)
      if (!touchStartRef.current) return

      const point = getGestureTouchPoint(event.touches)
      if (point && touchStartRef.current && swipeAllowedRef.current) {
        touchCurrentRef.current = point
        setSheetOffset(
          drawerFollowDistance(
            resolvedPlacement,
            point.x - touchStartRef.current.x,
            point.y - touchStartRef.current.y,
            swipeFollowOptions()
          )
        )
      } else if (point) {
        touchCurrentRef.current = point
      }
    },
    [dialogDivProps, resolvedPlacement, swipeFollowOptions]
  )

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      dialogDivProps.onTouchEnd?.(event)
      const gesture = resolveSwipeGesture(
        touchStartRef.current,
        getGestureTouchPoint(event.changedTouches) ?? touchCurrentRef.current,
        { minDistance: 48, minVelocity: 0.15 }
      )

      const allowed = swipeAllowedRef.current
      const follow = swipeFollowOptions()
      const distance =
        sheetOffset ||
        (gesture
          ? drawerFollowDistance(resolvedPlacement, gesture.deltaX, gesture.deltaY, follow)
          : 0)
      const closeDirection = getDrawerSwipeCloseDirection({
        placement: resolvedPlacement,
        direction: follow.direction,
        fullscreen: follow.fullscreen
      })
      const size =
        closeDirection === 'up' || closeDirection === 'down'
          ? (dialogRef.current?.offsetHeight ?? 0)
          : (dialogRef.current?.offsetWidth ?? 0)
      resetTouchGesture()
      if (!allowed) return
      const release = resolveSheetRelease(distance, size)
      const motion = resolveSheetReducedMotion(release, prefersReducedMotion())
      if (motion === 'close') handleClose()
    },
    [
      dialogDivProps,
      handleClose,
      resetTouchGesture,
      resolvedPlacement,
      sheetOffset,
      swipeFollowOptions
    ]
  )

  const handleTouchCancel = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      dialogDivProps.onTouchCancel?.(event)
      resetTouchGesture()
    },
    [dialogDivProps, resetTouchGesture]
  )

  const containerClasses = getDrawerContainerClasses()

  const maskClasses = getDrawerMaskClasses(open)
  const panelClasses = classNames(
    getDrawerPanelClasses(resolvedPlacement, open, size, fullscreenOnMobile),
    'flex flex-col',
    className
  )

  const headerClasses = getDrawerHeaderClasses()
  const bodyClasses = getDrawerBodyClasses(bodyClassName, bodyPadding)
  const footerClasses = getDrawerFooterClasses()
  const closeButtonClasses = getDrawerCloseButtonClasses()
  const titleClasses = getDrawerTitleClasses()

  const anchor = <span ref={anchorRef} hidden />

  if (!shouldRender) {
    return anchor
  }

  const drawerContent = (
    <div
      ref={rootRef}
      className={containerClasses}
      style={{ zIndex: stackedZ ?? OVERLAY_Z_INDEX.modal }}
      hidden={isOverlayVisuallyHidden(open, leaving)}
      aria-hidden={!open ? 'true' : undefined}
      data-tiger-overlay-layer=""
      data-tiger-drawer-root="">
      {mask && layerId != null && drawerShowsMask(layerId, true) && (
        <div
          className={maskClasses}
          onClick={handleMaskClick}
          aria-hidden="true"
          data-tiger-drawer-mask=""
        />
      )}

      <div
        className={panelClasses}
        style={{
          ...panelStyle,
          ...style,
          ...(width
            ? {
                [resolvedPlacement === 'left' || resolvedPlacement === 'right'
                  ? 'width'
                  : 'height']: typeof width === 'number' ? `${width}px` : width
              }
            : undefined),
          ...(resizedLength != null
            ? {
                [resolvedPlacement === 'left' || resolvedPlacement === 'right'
                  ? 'width'
                  : 'height']: `${resizedLength}px`
              }
            : undefined),
          transform:
            [
              layerId != null
                ? `translate(${drawerPushOffset(layerId, resolvedPlacement).x}px, ${drawerPushOffset(layerId, resolvedPlacement).y}px)`
                : '',
              sheetOffset > 0
                ? drawerFollowTransform(resolvedPlacement, sheetOffset, swipeFollowOptions())
                : ''
            ]
              .filter((part) => part && part !== 'translate(0px, 0px)')
              .join(' ') || undefined,
          transitionDuration: sheetOffset > 0 || resizing ? '0ms' : undefined
        }}
        {...dialogDivProps}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledby}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-owns={overlayHostId}
        tabIndex={-1}
        ref={composeRefs(forwardedRef, dialogRef)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        data-tiger-drawer="">
        {(hasTitle || closable) && (
          <div className={headerClasses} {...{ [OVERLAY_SWIPE_HANDLE_ATTR]: '' }}>
            {hasHeader ? (
              <div className={titleClasses} id={titleId}>
                {header}
              </div>
            ) : hasTitle ? (
              <h3 className={titleClasses} id={titleId}>
                {title}
              </h3>
            ) : null}
            {closable && (
              <button
                type="button"
                className={closeButtonClasses}
                onClick={handleClose}
                aria-label={resolvedCloseAriaLabel}
                ref={closeButtonRef}>
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {children != null && (
          <div className={bodyClasses} ref={bodyRef} id={bodyId} data-tiger-drawer-body="">
            {children}
          </div>
        )}
        {footer != null && <div className={footerClasses}>{footer}</div>}
        {resizable ? (
          <div
            data-tiger-drawer-resize=""
            role="separator"
            tabIndex={0}
            aria-valuemin={80}
            aria-valuenow={Math.round(resizedLength ?? measuredLength)}
            aria-valuemax={Math.round(maxResizeLength)}
            aria-orientation={
              resolvedPlacement === 'left' || resolvedPlacement === 'right'
                ? 'vertical'
                : 'horizontal'
            }
            aria-label={drawerLabels.resizeAriaLabel}
            onFocus={measureResizeRange}
            onKeyDown={(event) => {
              const step = getResizeKeyboardDelta(event.key)
              if (!step) return
              const delta = drawerResizeDelta(resolvedPlacement, step.deltaX, step.deltaY)
              if (!delta) return
              event.preventDefault()
              setResizedLength(Math.min(maxResizeLength, Math.max(80, readResizeLength() + delta)))
            }}
            style={{
              position: 'absolute',
              touchAction: 'none',
              ...(resolvedPlacement === 'right'
                ? { left: 0, top: 0, bottom: 0, width: 8, cursor: 'ew-resize' }
                : resolvedPlacement === 'left'
                  ? { right: 0, top: 0, bottom: 0, width: 8, cursor: 'ew-resize' }
                  : resolvedPlacement === 'bottom'
                    ? { top: 0, left: 0, right: 0, height: 8, cursor: 'ns-resize' }
                    : { bottom: 0, left: 0, right: 0, height: 8, cursor: 'ns-resize' })
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) return
              event.preventDefault()
              setResizing(true)
              const startX = event.clientX
              const startY = event.clientY
              const start = readResizeLength()
              const move = (pointer: PointerEvent) => {
                const delta = drawerResizeDelta(
                  resolvedPlacement,
                  pointer.clientX - startX,
                  pointer.clientY - startY
                )
                const maximum = readMaxResizeLength()
                setMaxResizeLength(maximum)
                setResizedLength(Math.min(maximum, Math.max(80, start + delta)))
              }
              const end = () => {
                setResizing(false)
                window.removeEventListener('pointermove', move)
                window.removeEventListener('pointerup', end)
              }
              window.addEventListener('pointermove', move)
              window.addEventListener('pointerup', end)
            }}
          />
        ) : null}
      </div>
      <div id={overlayHostId} className="contents" data-tiger-overlay-host="" />
    </div>
  )

  return (
    <>
      {anchor}
      <OverlayPortal target={portalTarget}>{drawerContent}</OverlayPortal>
    </>
  )
})
