import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
  useId,
  useImperativeHandle
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
  getFirstTourStepIndex,
  getTourPopoverStyle,
  getTourShadeStyle,
  getTourMaskHoleStyle,
  syncModalInert,
  resolveTourNav,
  getTourStepContext,
  shouldLockTourOverlay,
  tourNextEvents,
  tourPrevEvents,
  tourCloseEvents,
  tourArrowKey,
  tourStepAdvancesOnTarget,
  tourTargetExempt,
  getFloatingArrowStyle,
  getPopconfirmArrowClasses,
  shouldCloseOnMaskClick,
  getTourLabels,
  type TourProps as CoreTourProps,
  type TourPlacement,
  type TourRect,
  type TourSize,
  type TourStepContext,
  type TourNavEvent
} from '@expcat/tigercat-core'
import { closeIconPathD } from '@expcat/tigercat-core/icons/common'
import { StatusIcon } from './shared/icons'
import { OverlayPortal } from '../utils/overlay-outlet'
import {
  useBodyScrollLock,
  useEscapeKey,
  useFocusTrap,
  useOverlayPortalTarget
} from '../utils/overlay'

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

export interface TourHandle {
  close: () => void
}

export const Tour = React.forwardRef<TourHandle, TourProps>(function Tour(
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
    initialFocus,
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
  const [resolvedSteps, setResolvedSteps] = useState<typeof steps>([])
  const [loadPhase, setLoadPhase] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const loadStepsRef = useRef(loadSteps)
  loadStepsRef.current = loadSteps
  const hasLoader = typeof loadSteps === 'function'
  const stepsRef = useRef(steps)
  stepsRef.current = steps
  const resolvedStepsRef = useRef(resolvedSteps)
  resolvedStepsRef.current = resolvedSteps
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const currentStep = controlledCurrent ?? internalStep
  const displayedSteps = loadSteps ? resolvedSteps : steps
  const nav = resolveTourNav(displayedSteps, currentStep)
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
  const didOpenRef = useRef(false)

  if (open && !wasOpenRef.current) {
    previousActiveElementRef.current = captureActiveElement()
  }
  wasOpenRef.current = open
  const reactId = useId()
  const titleId = `tiger-tour-${reactId}-title`
  const descriptionId = `tiger-tour-${reactId}-description`
  const { anchorRef } = useOverlayPortalTarget()
  const targetExemptRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setLoadPhase('idle')
      return
    }
    const loader = loadStepsRef.current
    if (!loader) {
      setLoadPhase('ready')
      return
    }
    let cancelled = false
    setLoadPhase('loading')
    setResolvedSteps([])
    Promise.resolve(loader())
      .then((nextSteps) => {
        if (cancelled) return
        setResolvedSteps(nextSteps)
        setLoadPhase('ready')
      })
      .catch(() => {
        if (!cancelled) setLoadPhase('error')
      })
    return () => {
      cancelled = true
    }
  }, [open, hasLoader])

  useLayoutEffect(() => {
    if (open) {
      didOpenRef.current = true
      return
    }
    if (!didOpenRef.current) return
    didOpenRef.current = false
    restoreFocus(previousActiveElementRef.current)
    previousActiveElementRef.current = null
    const first = getFirstTourStepIndex(
      loadStepsRef.current ? resolvedStepsRef.current : stepsRef.current
    )
    setInternalStep(first)
    if (controlledCurrent !== undefined) onChangeRef.current?.(first)
  }, [open, controlledCurrent])

  useLayoutEffect(() => {
    return () => {
      const previous = previousActiveElementRef.current
      previousActiveElementRef.current = null
      queueMicrotask(() => restoreFocus(previous))
    }
  }, [])

  const measure = useCallback((shouldScroll: boolean) => {
    if (!open || !step) {
      setTargetRect(undefined)
      targetExemptRef.current = null
      return
    }
    const targetEl = resolveTourTarget(step.target)
    targetExemptRef.current = tourTargetExempt(step) ? (targetEl ?? null) : null
    if (targetEl) {
      if (shouldScroll) scrollTourTargetIntoView(targetEl)
      setTargetRect(getTourRectFromElement(targetEl))
    } else {
      setTargetRect(undefined)
    }
    const size = getTourSizeFromElement(popoverRef.current)
    if (size) setPopoverSize(size)
    syncModalInert()
  }, [open, step])

  const scrolledKeyRef = useRef('')
  useLayoutEffect(() => {
    if (!visible) {
      scrolledKeyRef.current = ''
      return
    }
    const key = `${currentStep}`
    const shouldScroll = scrolledKeyRef.current !== key
    scrolledKeyRef.current = key
    measure(shouldScroll)
  }, [visible, currentStep, measure])

  useEffect(() => {
    if (!visible) return
    const handler = () => measure(false)
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

  const focusKeyRef = useRef('')
  useLayoutEffect(() => {
    if (!visible) {
      focusKeyRef.current = ''
      return
    }
    const root = popoverRef.current
    if (!root) return
    const opened = focusKeyRef.current === ''
    focusKeyRef.current = `${currentStep}`
    if (opened && initialFocus) {
      const specified = root.querySelector(initialFocus)
      if (specified instanceof HTMLElement) {
        specified.focus()
        return
      }
    }
    root.focus()
  }, [visible, currentStep, initialFocus])

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

  useEffect(() => {
    if (!open || !step || !tourStepAdvancesOnTarget(step)) return
    const targetEl = resolveTourTarget(step.target)
    if (!targetEl) return
    const onClick = () => next()
    targetEl.addEventListener('click', onClick)
    return () => targetEl.removeEventListener('click', onClick)
  }, [open, step, next])
  const close = useCallback(() => applyNavEvents(tourCloseEvents()), [applyNavEvents])
  useImperativeHandle(forwardedRef, () => ({ close }), [close])

  const handleMaskClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (shouldCloseOnMaskClick(event, maskClosable)) close()
    },
    [close, maskClosable]
  )

  const showError = open && loadPhase === 'error'
  const overlayActive = visible || showError
  useEscapeKey({ enabled: overlayActive && keyboard, onEscape: close, layerRef: rootRef })
  useBodyScrollLock({ enabled: overlayActive })
  useFocusTrap({
    enabled: overlayActive,
    containerRef: rootRef,
    inert: true,
    autoFocus: true,
    initialFocusRef: popoverRef,
    exemptRef: step?.interact ? targetExemptRef : undefined
  })

  const {
    ['aria-labelledby']: ariaLabelledbyFromRest,
    ['aria-label']: ariaLabelFromRest,
    ['aria-describedby']: ariaDescribedbyFromRest,
    role: _role,
    tabIndex: _tabIndex,
    ...dialogRest
  } = rest

  const anchor = <span ref={anchorRef} hidden />
  if (showError) {
    return (
      <>
        {anchor}
        <OverlayPortal>
          <div ref={rootRef} className="contents" data-tiger-overlay-layer="" data-tiger-tour-root="">
            <div
              ref={popoverRef}
              role="dialog"
              aria-modal="true"
              aria-label={labels.loadErrorText}
              className={tourPopoverClasses}
              tabIndex={-1}
              data-tiger-tour="">
              <p>{labels.loadErrorText}</p>
              <Button type="button" size="sm" onClick={close}>
                {labels.closeAriaLabel}
              </Button>
            </div>
            <div className="contents" data-tiger-overlay-host="" />
          </div>
        </OverlayPortal>
      </>
    )
  }
  if (!visible || !step || !ctx) return anchor

  const placement: TourPlacement = step.placement ?? 'bottom'
  const showMask = step.mask !== false
  const popoverStyle = {
    ...getTourPopoverStyle(
      targetRect,
      popoverSize,
      placement,
      mergedLocale?.direction === 'rtl' ? 'rtl' : 'ltr'
    ),
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
        <span className={tourIndicatorClasses}>
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
        <>
          <div
            className={classNames(tourMaskClasses, 'bg-transparent')}
            data-tiger-tour-mask=""
            aria-hidden="true"
            style={
              {
                ...(tourTargetExempt(step) && targetRect ? getTourMaskHoleStyle(targetRect) : null),
                ...(targetRect && !tourTargetExempt(step) ? { backgroundColor: 'transparent' } : null)
              } as React.CSSProperties
            }
            onClick={handleMaskClick}
          />
          <div
            className="pointer-events-none"
            data-tiger-tour-shade=""
            style={
              targetRect
                ? (getTourShadeStyle(targetRect) as React.CSSProperties)
                : { pointerEvents: 'none' }
            }
          />
        </>
      )}

      <div
        {...dialogRest}
        ref={popoverRef}
        className={classNames(tourPopoverClasses, className)}
        style={popoverStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledbyFromRest ?? (hasTitle ? titleId : undefined)}
        aria-label={ariaLabelFromRest ?? (hasTitle ? undefined : labels.dialogAriaLabel)}
        aria-describedby={ariaDescribedbyFromRest ?? (hasDescription ? descriptionId : undefined)}
        tabIndex={-1}
        data-tiger-tour=""
        onKeyDown={(event) => {
          const dir = tourArrowKey(event.key, event.target)
          if (dir === 'next') {
            event.preventDefault()
            next()
          } else if (dir === 'prev') {
            event.preventDefault()
            prev()
          }
        }}>
        {step.cover ? (
          <img src={step.cover} alt={step.coverAlt ?? ''} data-tiger-tour-cover="" />
        ) : null}
        {step.arrow !== false ? (
          <span
            data-tiger-tour-arrow=""
            className={getPopconfirmArrowClasses()}
            style={getFloatingArrowStyle(step.placement === 'center' ? 'bottom' : (step.placement ?? 'bottom'))}
          />
        ) : null}
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
      <OverlayPortal>{overlay}</OverlayPortal>
    </>
  )
})
