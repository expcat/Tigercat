import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
  useId
} from 'react'
import {
  classNames,
  mergeTigerLocale,
  captureActiveElement,
  focusFirst,
  restoreFocus,
  tourPopoverClasses,
  tourTitleClasses,
  tourDescriptionClasses,
  tourFooterClasses,
  tourIndicatorClasses,
  tourCloseButtonClasses,
  tourMaskClasses,
  tourPrevButtonGapClass,
  resolveTourTarget,
  scrollTourTargetIntoView,
  getTourRectFromElement,
  getTourSizeFromElement,
  getTourPopoverStyle,
  getTourMaskHoleStyle,
  resolveTourNav,
  getTourStepContext,
  shouldLockTourOverlay,
  tourNextEvents,
  tourPrevEvents,
  tourCloseEvents,
  shouldCloseOnMaskClick,
  getTourLabels,
  closeIconPathD,
  type TourProps as CoreTourProps,
  type TourPlacement,
  type TourRect,
  type TourSize,
  type TourStepContext,
  type TourNavEvent
} from '@expcat/tigercat-core'
import { StatusIcon } from './shared/icons'
import {
  renderOverlayPortal,
  useBodyScrollLock,
  useEscapeKey,
  useFocusTrap,
  useOverlayPortalTarget
} from '../utils/overlay'
import { composeRefs } from '../utils/overlay-trigger'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'

export interface TourProps
  extends
    CoreTourProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'content' | 'children' | 'onChange'> {
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Callback when close button is clicked or tour finishes */
  onClose?: () => void
  /** Callback when tour finishes (last step "Next") */
  onFinish?: () => void
  /** Callback when current step changes (original index) */
  onChange?: (current: number) => void
  content?: React.ReactNode | ((ctx: TourStepContext) => React.ReactNode)
  renderTitle?: (ctx: TourStepContext) => React.ReactNode
  renderDescription?: (ctx: TourStepContext) => React.ReactNode
  renderFooter?: (ctx: TourStepContext) => React.ReactNode
}

export const Tour = React.forwardRef<HTMLDivElement, TourProps>(function Tour(
  {
    steps,
    loadSteps,
    open = false,
    current: controlledCurrent,
    nextText,
    prevText,
    finishText,
    closable = true,
    maskClosable = true,
    keyboard = true,
    showIndicators = true,
    locale,
    className,
    style,
    onOpenChange,
    onClose,
    onFinish,
    onChange,
    content,
    renderTitle,
    renderDescription,
    renderFooter,
    ...rest
  },
  forwardedRef
) {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getTourLabels(mergedLocale, { nextText, prevText, finishText }),
    [finishText, mergedLocale, nextText, prevText]
  )
  const [internalStep, setInternalStep] = useState(0)
  const [resolvedSteps, setResolvedSteps] = useState(steps)
  const currentStep = controlledCurrent ?? internalStep
  const nav = resolveTourNav(resolvedSteps, currentStep)
  const ctx = getTourStepContext(nav)
  const step = ctx?.step
  const visible = shouldLockTourOverlay(open, Boolean(step))
  const [targetRect, setTargetRect] = useState<TourRect | undefined>()
  const [popoverSize, setPopoverSize] = useState<TourSize | undefined>()
  const rootRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)

  if (open && !wasOpenRef.current) {
    previousActiveElementRef.current = captureActiveElement()
  }
  wasOpenRef.current = open
  const reactId = useId()
  const titleId = `tiger-tour-${reactId}-title`
  const descriptionId = `tiger-tour-${reactId}-description`
  const { anchorRef, target: portalTarget } = useOverlayPortalTarget()

  useEffect(() => {
    if (!loadSteps) {
      setResolvedSteps(steps)
      return
    }
    if (!open) return

    let cancelled = false
    Promise.resolve(loadSteps())
      .then((nextSteps) => {
        if (!cancelled) setResolvedSteps(nextSteps)
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [loadSteps, open, steps])

  useLayoutEffect(() => {
    if (open) return
    restoreFocus(previousActiveElementRef.current)
    previousActiveElementRef.current = null
    setInternalStep(0)
  }, [open])

  useLayoutEffect(() => {
    return () => {
      const previous = previousActiveElementRef.current
      previousActiveElementRef.current = null
      queueMicrotask(() => restoreFocus(previous))
    }
  }, [])

  const measure = useCallback(() => {
    if (!open || !step) {
      setTargetRect(undefined)
      return
    }
    const targetEl = resolveTourTarget(step.target)
    if (targetEl) {
      scrollTourTargetIntoView(targetEl)
      setTargetRect(getTourRectFromElement(targetEl))
    } else {
      setTargetRect(undefined)
    }
    const size = getTourSizeFromElement(popoverRef.current)
    if (size) setPopoverSize(size)
  }, [open, step])

  useLayoutEffect(() => {
    if (visible) measure()
  }, [visible, measure])

  useEffect(() => {
    if (!visible) return
    const handler = () => measure()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(handler) : undefined
    if (popoverRef.current) observer?.observe(popoverRef.current)
    const targetEl = resolveTourTarget(step?.target)
    if (targetEl) observer?.observe(targetEl)
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [visible, measure, step?.target])

  useLayoutEffect(() => {
    if (!visible) return
    focusFirst([closeButtonRef.current, popoverRef.current])
  }, [visible])

  const applyNavEvents = useCallback(
    (events: TourNavEvent[]) => {
      for (const event of events) {
        if (event.type === 'change') {
          setInternalStep(event.index)
          onChange?.(event.index)
        } else if (event.type === 'finish') {
          onFinish?.()
        } else if (event.type === 'close') {
          onClose?.()
        } else {
          onOpenChange?.(event.open)
        }
      }
    },
    [onChange, onFinish, onClose, onOpenChange]
  )

  const next = useCallback(() => applyNavEvents(tourNextEvents(nav)), [applyNavEvents, nav])
  const prev = useCallback(() => applyNavEvents(tourPrevEvents(nav)), [applyNavEvents, nav])
  const close = useCallback(() => applyNavEvents(tourCloseEvents()), [applyNavEvents])

  const handleMaskClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (shouldCloseOnMaskClick(event, maskClosable)) close()
    },
    [close, maskClosable]
  )

  useEscapeKey({ enabled: visible && keyboard, onEscape: close, layerRef: rootRef })
  useBodyScrollLock({ enabled: visible })
  useFocusTrap({ enabled: visible, containerRef: rootRef, inert: true })

  const {
    ['aria-labelledby']: ariaLabelledbyFromRest,
    ['aria-label']: ariaLabelFromRest,
    ['aria-describedby']: ariaDescribedbyFromRest,
    role: _role,
    tabIndex: _tabIndex,
    ...dialogRest
  } = rest

  const anchor = <span ref={anchorRef} hidden />
  if (!visible || !step || !ctx) return anchor

  const placement: TourPlacement = step.placement ?? 'bottom'
  const showMask = step.mask !== false
  const popoverStyle = {
    ...getTourPopoverStyle(targetRect, popoverSize, placement),
    ...style
  } as React.CSSProperties
  const hasTitle = Boolean(renderTitle || step.title)
  const hasDescription = Boolean(renderDescription || step.description)
  const titleNode = renderTitle ? renderTitle(ctx) : step.title
  const descriptionNode = renderDescription ? renderDescription(ctx) : step.description
  const contentNode = typeof content === 'function' ? content(ctx) : content
  const footerNode = renderFooter ? (
    renderFooter(ctx)
  ) : (
    <div className={tourFooterClasses}>
      {showIndicators && (
        <span className={tourIndicatorClasses} aria-live="polite">
          {ctx.position + 1} / {ctx.total}
        </span>
      )}
      <div className="flex items-center">
        {!nav.isFirst && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className={tourPrevButtonGapClass}
            onClick={prev}>
            {labels.prevText}
          </Button>
        )}
        <Button type="button" size="sm" onClick={next}>
          {nav.isLast ? labels.finishText : labels.nextText}
        </Button>
      </div>
    </div>
  )

  const overlay = (
    <div ref={rootRef} className="contents" data-tiger-overlay-layer="" data-tiger-tour-root="">
      {showMask && (
        <div
          className={tourMaskClasses}
          data-tiger-tour-mask=""
          aria-hidden="true"
          style={targetRect ? (getTourMaskHoleStyle(targetRect) as React.CSSProperties) : undefined}
          onClick={handleMaskClick}
        />
      )}

      <div
        {...dialogRest}
        ref={composeRefs(forwardedRef, popoverRef)}
        className={classNames(tourPopoverClasses, className)}
        style={popoverStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledbyFromRest ?? (hasTitle ? titleId : undefined)}
        aria-label={ariaLabelFromRest ?? (hasTitle ? undefined : labels.dialogAriaLabel)}
        aria-describedby={ariaDescribedbyFromRest ?? (hasDescription ? descriptionId : undefined)}
        tabIndex={-1}
        data-tiger-tour="">
        {closable && (
          <button
            ref={closeButtonRef}
            className={tourCloseButtonClasses}
            type="button"
            aria-label={labels.closeAriaLabel}
            onClick={close}>
            <StatusIcon
              path={closeIconPathD}
              className="h-4 w-4"
              aria-hidden="true"
              focusable="false"
            />
          </button>
        )}

        {titleNode != null && titleNode !== false && (
          <div id={titleId} className={tourTitleClasses}>
            {titleNode}
          </div>
        )}
        {descriptionNode != null && descriptionNode !== false && (
          <div id={descriptionId} className={tourDescriptionClasses}>
            {descriptionNode}
          </div>
        )}
        {contentNode}
        {footerNode}
      </div>
      <div className="contents" data-tiger-overlay-host="" />
    </div>
  )

  return (
    <>
      {anchor}
      {renderOverlayPortal(overlay, portalTarget)}
    </>
  )
})
