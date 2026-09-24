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
  COLOR_PICKER_INVALID_VALUE_TEXT,
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
  DEFAULT_COLOR_PICKER_HSVA,
  describeColorPickerValue,
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
  parseColorToHsva,
  resolveColorPickerDrag,
  selectDoneActionClasses,
  selectDoneButtonClasses,
  SHAKE_CLASS,
  runShakeAnimation,
  submittedColorPickerValue
} from '@expcat/tigercat-core'
import {
  renderOverlayPortal,
  useAnchoredOverlay,
  useBodyScrollLock,
  useFocusTrap
} from '../utils/overlay'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './tiger-config'
import { FormItemControlProvider, useFormItemControlContext } from './FormItemContext'
import { ColorSwatch } from './ColorSwatch'

export interface ColorPickerProps extends CoreColorPickerProps {
  value?: string | null
  defaultValue?: string | null
  onChange?: (value: string | null) => void
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
      readOnly = false,
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
    const externalValue =
      value !== undefined ? value : (formItemControl?.value as string | null | undefined)
    const valueControlled = value !== undefined || formItemControl?.value !== undefined

    const [uncontrolled, setUncontrolled] = useControlledState<string | null>({
      value: valueControlled ? (externalValue ?? null) : undefined,
      defaultValue: defaultValue ?? null,
      onChange: (next) => {
        onChange?.(next)
        formItemControl?.onChange?.(next)
      }
    })
    const source = valueControlled ? (externalValue ?? null) : uncontrolled
    const [isOpen, setOpen] = useControlledState({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange
    })

    const initialDescribed = describeColorPickerValue(source, format, showAlpha)
    const [baseHsva, setBaseHsva] = useState<HsvaColor | null>(initialDescribed.hsva)
    const [previewHsva, setPreviewHsva] = useState<HsvaColor | null>(null)
    const previewRef = useRef<HsvaColor | null>(null)
    const textDirtyRef = useRef(false)
    const [inputValue, setInputValue] = useState(initialDescribed.text)
    const [inputInvalid, setInputInvalid] = useState(initialDescribed.invalid)
    const editingHsva = previewHsva ?? baseHsva ?? DEFAULT_COLOR_PICKER_HSVA
    const editingRef = useRef(editingHsva)
    editingRef.current = editingHsva

    const rootRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const svRef = useRef<HTMLDivElement>(null)
    const dragSessionRef = useRef<{ dispose: () => void } | null>(null)
    const instanceId = useId()
    const panelId = `${instanceId}-panel`
    const inputErrorId = `${instanceId}-error`

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
      if (previewRef.current) return
      if (textDirtyRef.current && isColorPickerEmpty(source)) return
      const next = describeColorPickerValue(source, format, showAlpha)
      if (next.hsva) {
        setBaseHsva((prev) => mergeHsvaHue(prev, next.hsva!))
        setInputValue(next.text)
        setInputInvalid(false)
        textDirtyRef.current = false
        return
      }
      setBaseHsva(null)
      if (source == null || String(source).trim() === '') {
        if (!textDirtyRef.current) {
          setInputValue('')
          setInputInvalid(false)
        }
        return
      }
      setInputValue(next.text)
      setInputInvalid(true)
      textDirtyRef.current = false
    }, [source, format, showAlpha])

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

    const writeCommitted = useCallback(
      (next: string | null) => {
        if (effectiveDisabled || readOnly) return
        const current = source ?? null
        if (current === next) return
        if (isColorPickerEmpty(current) && (next == null || next === '')) return
        setUncontrolled(next)
      },
      [effectiveDisabled, readOnly, setUncontrolled, source]
    )

    const previewHsvaValue = useCallback(
      (next: HsvaColor) => {
        if (effectiveDisabled || readOnly) return
        const resolved = resolveColorPickerDrag('preview', next, format, showAlpha)
        previewRef.current = resolved.hsva
        setPreviewHsva(resolved.hsva)
      },
      [effectiveDisabled, format, readOnly, showAlpha]
    )

    const commitHsva = useCallback(
      (next: HsvaColor) => {
        if (effectiveDisabled || readOnly) return
        const resolved = resolveColorPickerDrag('commit', next, format, showAlpha)
        previewRef.current = null
        setPreviewHsva(null)
        setBaseHsva(resolved.hsva)
        setInputValue(resolved.value ?? '')
        setInputInvalid(false)
        textDirtyRef.current = false
        writeCommitted(resolved.value)
      },
      [effectiveDisabled, format, readOnly, showAlpha, writeCommitted]
    )

    const commitTextDraft = useCallback(() => {
      if (effectiveDisabled || readOnly) return
      const raw = inputValue
      if (raw.trim() === '') {
        textDirtyRef.current = false
        setInputInvalid(false)
        setBaseHsva(null)
        previewRef.current = null
        setPreviewHsva(null)
        writeCommitted(null)
        return
      }
      const parsed = parseColorToHsva(raw)
      if (!parsed) {
        textDirtyRef.current = true
        setInputInvalid(true)
        previewRef.current = null
        setPreviewHsva(null)
        setBaseHsva(null)
        writeCommitted(null)
        return
      }
      commitHsva(mergeHsvaHue(baseHsva, parsed))
    }, [baseHsva, commitHsva, effectiveDisabled, inputValue, readOnly, writeCommitted])

    const paintableHsva = isColorPickerEmpty(source) ? null : baseHsva
    const displayColor = paintableHsva ? cssColorFromHsva(paintableHsva, showAlpha) : ''
    const previewColor = previewHsva ? cssColorFromHsva(previewHsva, showAlpha) : displayColor
    const hasValue = paintableHsva != null
    const showClear = Boolean(clearable && hasValue && !effectiveDisabled && !readOnly)

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
        textDirtyRef.current = false
        setInputInvalid(false)
        setInputValue('')
        setBaseHsva(null)
        previewRef.current = null
        setPreviewHsva(null)
        writeCommitted(null)
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
      if (effectiveDisabled || readOnly) return
      event.preventDefault()
      const plane = svRef.current
      if (!plane) return
      const apply = (clientX: number, clientY: number) => {
        previewHsvaValue(
          hsvaFromSvPointer(
            clientX,
            clientY,
            plane.getBoundingClientRect(),
            editingRef.current.h,
            editingRef.current.a
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
          const pending = previewRef.current
          dragSessionRef.current = null
          if (pending) commitHsva(pending)
        }
      })
    }

    function handleSvKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      if (readOnly) return
      const step = event.shiftKey ? 10 : 2
      const current = editingRef.current
      let next: HsvaColor | null = null
      if (event.key === 'ArrowRight') next = nudgeColorPickerSv(current, step, 0)
      else if (event.key === 'ArrowLeft') next = nudgeColorPickerSv(current, -step, 0)
      else if (event.key === 'ArrowUp') next = nudgeColorPickerSv(current, 0, step)
      else if (event.key === 'ArrowDown') next = nudgeColorPickerSv(current, 0, -step)
      if (!next) return
      event.preventDefault()
      commitHsva(next)
    }

    function handleHuePreview(event: React.ChangeEvent<HTMLInputElement>) {
      previewHsvaValue(applyColorPickerHue(editingRef.current, Number(event.target.value)))
    }

    function handleAlphaPreview(event: React.ChangeEvent<HTMLInputElement>) {
      previewHsvaValue(applyColorPickerAlpha(editingRef.current, Number(event.target.value) / 100))
    }

    function commitSlider(kind: 'hue' | 'alpha', raw: string) {
      const current = previewRef.current ?? editingRef.current
      commitHsva(
        kind === 'hue'
          ? applyColorPickerHue(current, Number(raw))
          : applyColorPickerAlpha(current, Number(raw) / 100)
      )
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
      if (readOnly) return
      const raw = event.target.value
      textDirtyRef.current = true
      setInputValue(raw)
      setInputInvalid(raw.trim() !== '' && parseColorToHsva(raw) == null)
    }

    function handleTextKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.key !== 'Enter') return
      event.preventDefault()
      commitTextDraft()
    }

    function handlePreset(color: string) {
      if (readOnly) return
      const formatted = commitPresetColor(color, editingRef.current, format, showAlpha)
      if (!formatted) return
      const next = parseColorToHsva(formatted)
      if (!next) return
      commitHsva(next)
      if (closeOnSelect) setOpenSafe(false)
    }

    function handleClear() {
      textDirtyRef.current = false
      setInputInvalid(false)
      setInputValue('')
      setBaseHsva(null)
      previewRef.current = null
      setPreviewHsva(null)
      writeCommitted(null)
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
      ...getColorPickerSvPlaneStyle(editingHsva.h)
    }
    const alphaStyle = getColorPickerAlphaTrackStyle(editingHsva)

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
          <span className="text-xs font-medium text-[var(--tiger-text)]">{labels.panelTitle}</span>
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
          aria-valuenow={Math.round(editingHsva.s)}
          aria-valuetext={`${labels.saturation} ${Math.round(editingHsva.s)}, ${labels.brightness} ${Math.round(editingHsva.v)}`}
          aria-readonly={readOnly || undefined}
          data-tiger-colorpicker-sv=""
          onPointerDown={startSvDrag}
          onKeyDown={handleSvKeyDown}>
          <span
            className={colorPickerSvThumbClasses}
            style={{ left: `${editingHsva.s}%`, top: `${100 - editingHsva.v}%` }}
            aria-hidden="true"
          />
        </div>

        <div>
          <label className={colorPickerChromeLabelClasses}>{labels.hue}</label>
          <input
            type="range"
            min={0}
            max={360}
            value={Math.round(editingHsva.h)}
            className={colorPickerSliderTrackClasses}
            style={colorPickerHueTrackStyle}
            aria-label={labels.hue}
            aria-readonly={readOnly || undefined}
            disabled={effectiveDisabled}
            onChange={handleHuePreview}
            onPointerUp={(event) => commitSlider('hue', event.currentTarget.value)}
            onKeyUp={(event) => {
              if (!event.key.startsWith('Arrow') && event.key !== 'Home' && event.key !== 'End') {
                return
              }
              commitSlider('hue', event.currentTarget.value)
            }}
          />
        </div>

        {showAlpha ? (
          <div>
            <label className={colorPickerChromeLabelClasses}>{labels.alpha}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(editingHsva.a * 100)}
              className={colorPickerSliderTrackClasses}
              style={alphaStyle}
              aria-label={labels.alpha}
              aria-readonly={readOnly || undefined}
              disabled={effectiveDisabled}
              onChange={handleAlphaPreview}
              onPointerUp={(event) => commitSlider('alpha', event.currentTarget.value)}
              onKeyUp={(event) => {
                if (!event.key.startsWith('Arrow') && event.key !== 'Home' && event.key !== 'End') {
                  return
                }
                commitSlider('alpha', event.currentTarget.value)
              }}
            />
          </div>
        ) : null}

        <div>
          <label className={classNames(colorPickerChromeLabelClasses, 'uppercase')}>
            {getColorPickerFormatLabel(format, labels)}
          </label>
          <input
            type="text"
            className={classNames(
              colorPickerInputClasses,
              inputInvalid && 'border-[var(--tiger-error)]'
            )}
            value={inputValue}
            aria-label={labels.value}
            aria-invalid={inputInvalid || undefined}
            aria-describedby={inputInvalid ? inputErrorId : undefined}
            disabled={effectiveDisabled}
            readOnly={readOnly}
            onChange={handleInputChange}
            onBlur={commitTextDraft}
            onKeyDown={handleTextKeyDown}
          />
          {inputInvalid ? (
            <p id={inputErrorId} className="text-xs text-[var(--tiger-error)]" aria-live="polite">
              {COLOR_PICKER_INVALID_VALUE_TEXT}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <div
            className={colorPickerPreviewClasses}
            style={{
              ...colorPickerCheckerboardStyle,
              ...(previewColor ? { boxShadow: `inset 0 0 0 999px ${previewColor}` } : null)
            }}
            role="img"
            aria-hidden="true"
          />
          <span className="text-xs font-mono text-[var(--tiger-text)]">
            {previewHsva
              ? formatHsva(previewHsva, format, showAlpha)
              : hasValue
                ? formatHsva(paintableHsva!, format, showAlpha)
                : ''}
          </span>
        </div>

        {presets && presets.length > 0 ? (
          <FormItemControlProvider value={null}>
            <ColorSwatch
              colors={presets}
              value={hasValue ? formatHsva(paintableHsva!, format, showAlpha) : undefined}
              columns={Math.min(8, presets.length)}
              size="sm"
              readOnly={readOnly}
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
          <input
            type="hidden"
            name={effectiveName}
            value={submittedColorPickerValue(source)}
            disabled={effectiveDisabled || undefined}
          />
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
          aria-controls={panelId}
          aria-readonly={readOnly || undefined}
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
