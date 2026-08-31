import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type {
  ColorFormat,
  ColorPickerProps as CoreColorPickerProps,
  ColorPickerRef,
  FloatingPlacement,
  HsvaColor,
  InputStatus
} from '@expcat/tigercat-core'
import {
  applyColorPickerAlpha,
  applyColorPickerHue,
  classNames,
  colorPickerBaseClasses,
  colorPickerCheckerboardStyle,
  colorPickerChromeLabelClasses,
  colorPickerClearButtonClasses,
  colorPickerHueTrackStyle,
  colorPickerInputClasses,
  colorPickerPanelClasses,
  colorPickerPreviewClasses,
  colorPickerSliderTrackClasses,
  colorPickerSvPlaneClasses,
  colorPickerSvThumbClasses,
  colorPickerTriggerSwatchClasses,
  commitPresetColor,
  createDocumentDragSession,
  cssColorFromHsva,
  formatHsva,
  getColorPickerAlphaTrackStyle,
  getColorPickerFormatLabel,
  getColorPickerLabels,
  getColorPickerSvPlaneStyle,
  getColorPickerTriggerClasses,
  hsvaFromSvPointer,
  isColorPickerEmpty,
  mergeAriaDescribedBy,
  mergeHsvaHue,
  mergeTigerLocale,
  nudgeColorPickerSv,
  parseColorInput,
  parseColorToHsva,
  seedColorPickerHsva,
  selectDoneActionClasses,
  selectDoneButtonClasses,
  SHAKE_CLASS,
  runShakeAnimation
} from '@expcat/tigercat-core'
import {
  renderOverlayPortal,
  useAnchoredOverlay,
  useBodyScrollLock,
  useFocusTrap
} from '../utils/overlay'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'
import { FormItemControlProvider, useFormItemControlContext } from './FormItemContext'
import { ColorSwatch } from './ColorSwatch'

export interface ColorPickerProps extends CoreColorPickerProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  onBlur?: React.FocusEventHandler<HTMLElement>
  style?: React.CSSProperties
  'aria-describedby'?: string
  'aria-labelledby'?: string
}

export type { ColorPickerRef, ColorFormat }

export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(
  function ColorPicker(props, ref) {
    const {
      value,
      defaultValue,
      disabled = false,
      size = 'md',
      showAlpha = false,
      format = 'hex',
      presets,
      className,
      locale,
      labels: labelsOverride,
      open,
      defaultOpen = false,
      clearable = true,
      closeOnSelect = true,
      name,
      id,
      status: statusProp,
      placement = 'bottom-start' as FloatingPlacement,
      offset = 4,
      dropdownClassName,
      getPopupContainer,
      onChange,
      onOpenChange,
      onBlur,
      style
    } = props

    const config = useTigerConfig()
    const formItemControl = useFormItemControlContext()
    const mergedLocale = useMemo(
      () => mergeTigerLocale(config.locale, locale),
      [config.locale, locale]
    )
    const labels = useMemo(
      () => getColorPickerLabels(mergedLocale, labelsOverride),
      [mergedLocale, labelsOverride]
    )
    const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
    const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
    const effectiveId = id ?? formItemControl?.id
    const effectiveName = name ?? formItemControl?.name
    const describedBy = mergeAriaDescribedBy(
      typeof props['aria-describedby'] === 'string' ? props['aria-describedby'] : undefined,
      formItemControl?.describedBy
    )
    const labelledby =
      typeof props['aria-labelledby'] === 'string' && props['aria-labelledby'].trim()
        ? props['aria-labelledby']
        : formItemControl?.labelId
    const parsedValue = value !== undefined ? value : (formItemControl?.value as string | undefined)

    const [committed, setCommitted] = useControlledState<string | undefined>({
      value: value !== undefined || formItemControl?.value !== undefined ? parsedValue : undefined,
      defaultValue,
      onChange: (next) => {
        onChange?.(next ?? '')
        formItemControl?.onChange?.(next ?? '')
      }
    })
    const [isOpen, setOpen] = useControlledState({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange
    })

    const draggingRef = useRef(false)
    const [hsva, setHsva] = useState<HsvaColor>(() => seedColorPickerHsva(committed))
    const hsvaRef = useRef(hsva)
    hsvaRef.current = hsva
    const [inputValue, setInputValue] = useState(() =>
      isColorPickerEmpty(committed)
        ? ''
        : formatHsva(seedColorPickerHsva(committed), format, showAlpha)
    )

    const rootRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const svRef = useRef<HTMLDivElement>(null)
    const dragSessionRef = useRef<{ dispose: () => void } | null>(null)
    const instanceId = useId()
    const panelId = `${instanceId}-panel`

    const overlay = useAnchoredOverlay({
      enabled: isOpen,
      referenceRef: triggerRef,
      floatingRef: panelRef,
      containerRef: rootRef,
      placement,
      offset,
      layout: 'fullscreen-sm',
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      getContainer: getPopupContainer,
      onDismiss: () => {
        setOpen(false)
        window.setTimeout(() => triggerRef.current?.focus(), 0)
      }
    })

    useFocusTrap({ enabled: isOpen, containerRef: panelRef, inert: true })
    useBodyScrollLock({ enabled: isOpen })

    const setTriggerRef = (node: HTMLButtonElement | null) => {
      triggerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    useEffect(() => {
      if (draggingRef.current) return
      const parsed = parseColorToHsva(committed)
      if (parsed) {
        setHsva((prev) => mergeHsvaHue(prev, parsed))
        setInputValue(formatHsva(parsed, format, showAlpha))
        return
      }
      if (isColorPickerEmpty(committed)) {
        setInputValue('')
      }
    }, [committed, format, showAlpha])

    useEffect(() => {
      if (status === 'error') runShakeAnimation(rootRef.current)
    }, [status, formItemControl?.shakeTrigger])

    useEffect(() => {
      if (!isOpen) return
      const plane = svRef.current
      plane?.focus()
    }, [isOpen])

    useEffect(() => {
      return () => dragSessionRef.current?.dispose()
    }, [])

    const setOpenSafe = useCallback(
      (next: boolean) => {
        if (effectiveDisabled) return
        setOpen(next)
      },
      [effectiveDisabled, setOpen]
    )

    const commitHsva = useCallback(
      (next: HsvaColor) => {
        setHsva(next)
        const formatted = formatHsva(next, format, showAlpha)
        setInputValue(formatted)
        setCommitted(formatted)
      },
      [format, setCommitted, showAlpha]
    )

    const displayColor = cssColorFromHsva(hsva, showAlpha)
    const hasValue = !isColorPickerEmpty(committed)
    const showClear = Boolean(clearable && hasValue && !effectiveDisabled)

    function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
      if (effectiveDisabled) return
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        setOpenSafe(!isOpen)
      } else if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        setOpenSafe(false)
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && showClear) {
        event.preventDefault()
        setCommitted('')
        setInputValue('')
      }
    }

    function handleFocusOut(event: React.FocusEvent<HTMLElement>) {
      const next = event.relatedTarget as Node | null
      if (
        (rootRef.current && next && rootRef.current.contains(next)) ||
        (panelRef.current && next && panelRef.current.contains(next))
      ) {
        return
      }
      formItemControl?.onBlur?.()
      onBlur?.(event)
    }

    function startSvDrag(event: React.PointerEvent<HTMLDivElement>) {
      if (effectiveDisabled) return
      event.preventDefault()
      const plane = svRef.current
      if (!plane) return
      draggingRef.current = true
      const apply = (clientX: number, clientY: number) => {
        commitHsva(
          hsvaFromSvPointer(
            clientX,
            clientY,
            plane.getBoundingClientRect(),
            hsvaRef.current.h,
            hsvaRef.current.a
          )
        )
      }
      apply(event.clientX, event.clientY)
      dragSessionRef.current?.dispose()
      dragSessionRef.current = createDocumentDragSession({
        startX: event.clientX,
        startY: event.clientY,
        pointerId: event.pointerId,
        pointerTarget: plane,
        dragThreshold: 0,
        onMove: (payload) => apply(payload.currentX, payload.currentY),
        onEnd: () => {
          draggingRef.current = false
          dragSessionRef.current = null
        }
      })
    }

    function handleSvKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      const step = event.shiftKey ? 10 : 2
      let next: HsvaColor | null = null
      if (event.key === 'ArrowRight') next = nudgeColorPickerSv(hsva, step, 0)
      else if (event.key === 'ArrowLeft') next = nudgeColorPickerSv(hsva, -step, 0)
      else if (event.key === 'ArrowUp') next = nudgeColorPickerSv(hsva, 0, step)
      else if (event.key === 'ArrowDown') next = nudgeColorPickerSv(hsva, 0, -step)
      if (!next) return
      event.preventDefault()
      commitHsva(next)
    }

    function handleHueChange(event: React.ChangeEvent<HTMLInputElement>) {
      draggingRef.current = true
      commitHsva(applyColorPickerHue(hsva, Number(event.target.value)))
      draggingRef.current = false
    }

    function handleAlphaChange(event: React.ChangeEvent<HTMLInputElement>) {
      draggingRef.current = true
      commitHsva(applyColorPickerAlpha(hsva, Number(event.target.value) / 100))
      draggingRef.current = false
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
      const raw = event.target.value
      setInputValue(raw)
      const parsed = parseColorInput(raw, format, showAlpha)
      if (!parsed) return
      const next = parseColorToHsva(parsed)
      if (!next) return
      setHsva(next)
      setCommitted(parsed)
    }

    function handlePreset(color: string) {
      const formatted = commitPresetColor(color, hsva, format, showAlpha)
      if (!formatted) return
      const next = parseColorToHsva(formatted)
      if (next) setHsva(next)
      setInputValue(formatted)
      setCommitted(formatted)
      if (closeOnSelect) setOpenSafe(false)
    }

    function handleClear() {
      setCommitted('')
      setInputValue('')
    }

    const triggerSwatchStyle: React.CSSProperties = {
      ...colorPickerCheckerboardStyle,
      backgroundColor: hasValue ? displayColor : undefined
    }
    if (hasValue) {
      triggerSwatchStyle.backgroundImage = `${colorPickerCheckerboardStyle.backgroundImage}`
      triggerSwatchStyle.boxShadow = `inset 0 0 0 999px ${displayColor}`
    }

    const svStyle = {
      ...getColorPickerSvPlaneStyle(hsva.h)
    }
    const alphaStyle = getColorPickerAlphaTrackStyle(hsva)

    const panel = isOpen ? (
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label={labels.panelTitle}
        className={classNames(colorPickerPanelClasses, overlay.floatingClasses, dropdownClassName)}
        style={overlay.floatingStyles}
        data-positioned={overlay.positioned}
        data-tiger-colorpicker-panel=""
        onBlur={handleFocusOut}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[var(--tiger-text,#111827)]">
            {labels.panelTitle}
          </span>
          {showClear ? (
            <button
              type="button"
              className={colorPickerClearButtonClasses}
              data-tiger-colorpicker-clear=""
              onClick={handleClear}>
              {labels.clear}
            </button>
          ) : null}
        </div>

        <div
          ref={svRef}
          className={colorPickerSvPlaneClasses}
          style={svStyle}
          role="slider"
          tabIndex={effectiveDisabled ? -1 : 0}
          aria-label={`${labels.saturation}, ${labels.brightness}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(hsva.s)}
          aria-valuetext={`${labels.saturation} ${Math.round(hsva.s)}, ${labels.brightness} ${Math.round(hsva.v)}`}
          data-tiger-colorpicker-sv=""
          onPointerDown={startSvDrag}
          onKeyDown={handleSvKeyDown}>
          <span
            className={colorPickerSvThumbClasses}
            style={{ left: `${hsva.s}%`, top: `${100 - hsva.v}%` }}
            aria-hidden="true"
          />
        </div>

        <div>
          <label className={colorPickerChromeLabelClasses}>{labels.hue}</label>
          <input
            type="range"
            min={0}
            max={360}
            value={Math.round(hsva.h)}
            className={colorPickerSliderTrackClasses}
            style={colorPickerHueTrackStyle}
            aria-label={labels.hue}
            disabled={effectiveDisabled}
            onChange={handleHueChange}
          />
        </div>

        {showAlpha ? (
          <div>
            <label className={colorPickerChromeLabelClasses}>{labels.alpha}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(hsva.a * 100)}
              className={colorPickerSliderTrackClasses}
              style={alphaStyle}
              aria-label={labels.alpha}
              disabled={effectiveDisabled}
              onChange={handleAlphaChange}
            />
          </div>
        ) : null}

        <div>
          <label className={classNames(colorPickerChromeLabelClasses, 'uppercase')}>
            {getColorPickerFormatLabel(format, labels)}
          </label>
          <input
            type="text"
            className={colorPickerInputClasses}
            value={inputValue}
            aria-label={labels.value}
            disabled={effectiveDisabled}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <div
            className={colorPickerPreviewClasses}
            style={{
              ...colorPickerCheckerboardStyle,
              boxShadow: `inset 0 0 0 999px ${displayColor}`
            }}
            role="img"
            aria-hidden="true"
          />
          <span className="text-xs font-mono text-[var(--tiger-text,#111827)]">
            {hasValue ? formatHsva(hsva, format, showAlpha) : ''}
          </span>
        </div>

        {presets && presets.length > 0 ? (
          <FormItemControlProvider value={null}>
            <ColorSwatch
              colors={presets}
              value={hasValue ? formatHsva(hsva, 'hex', false) : undefined}
              columns={Math.min(8, presets.length)}
              size="sm"
              ariaLabel={labels.swatches}
              onChange={(color) => handlePreset(color)}
            />
          </FormItemControlProvider>
        ) : null}

        <div className={selectDoneActionClasses}>
          <button
            type="button"
            className={selectDoneButtonClasses}
            onClick={() => setOpenSafe(false)}>
            {labels.done}
          </button>
        </div>
      </div>
    ) : null

    return (
      <div
        ref={rootRef}
        className={classNames(colorPickerBaseClasses, className, status === 'error' && SHAKE_CLASS)}
        style={style}
        onBlur={handleFocusOut}>
        {effectiveName ? (
          <input type="hidden" name={effectiveName} value={hasValue ? (committed ?? '') : ''} />
        ) : null}
        <button
          ref={setTriggerRef}
          type="button"
          id={effectiveId}
          className={getColorPickerTriggerClasses(size, effectiveDisabled, status)}
          data-tiger-colorpicker-trigger=""
          aria-label={labelledby ? undefined : labels.trigger}
          aria-labelledby={labelledby}
          aria-describedby={describedBy}
          title={labels.trigger}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          aria-invalid={status === 'error' ? true : undefined}
          aria-required={formItemControl?.required || undefined}
          disabled={effectiveDisabled}
          onClick={() => setOpenSafe(!isOpen)}
          onKeyDown={handleTriggerKeyDown}>
          <span className={colorPickerTriggerSwatchClasses} style={triggerSwatchStyle} />
        </button>
        {renderOverlayPortal(panel, overlay.target)}
      </div>
    )
  }
)

export default ColorPicker
