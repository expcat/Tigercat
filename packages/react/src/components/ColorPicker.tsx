import React, { useState, useMemo, useRef, useEffect } from 'react'
import type { ColorPickerProps as CoreColorPickerProps } from '@expcat/tigercat-core'
import {
  colorPickerBaseClasses,
  getColorPickerTriggerClasses,
  colorPickerPanelClasses,
  colorPickerInputClasses,
  colorPickerPresetClasses,
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  isValidHex,
  formatColorString,
  classNames
} from '@expcat/tigercat-core'

/** Parse a hex or rgb()/rgba() string back to a hex value, or null if unrecognized. */
function parseColorInput(raw: string): string | null {
  const val = raw.trim()
  if (isValidHex(val)) {
    return val.startsWith('#') ? val : `#${val}`
  }
  const rgbMatch = val.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgbMatch) {
    return rgbToHex(Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3]))
  }
  return null
}

export interface ColorPickerProps extends CoreColorPickerProps {
  /** Controlled color value (hex) */
  value?: string
  /** Called when color changes */
  onChange?: (value: string) => void
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#2563eb',
  disabled = false,
  size = 'md',
  showAlpha = false,
  format = 'hex',
  presets,
  className,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [alpha, setAlpha] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const rgb = useMemo(() => hexToRgb(value), [value])
  const hsv = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb])

  // Value rendered in the panel input / preview, honoring `format` (and `showAlpha`).
  const displayValue = useMemo(
    () => formatColorString(rgb.r, rgb.g, rgb.b, format, showAlpha ? alpha : undefined),
    [rgb, format, showAlpha, alpha]
  )
  // CSS color usable as a swatch background (includes alpha when enabled).
  const swatchColor = showAlpha ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : value

  const [inputValue, setInputValue] = useState(displayValue)

  useEffect(() => {
    setInputValue(displayValue)
  }, [displayValue])

  function togglePanel() {
    if (disabled) return
    setIsOpen((v) => !v)
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
      setIsOpen((v) => !v)
    } else if (e.key === 'Escape' && isOpen) {
      setIsOpen(false)
    }
  }

  function handleHueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const hue = Number(e.target.value)
    const { r, g, b } = hsvToRgb(hue, hsv.s, hsv.v)
    const hex = rgbToHex(r, g, b)
    onChange?.(hex)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputValue(val)
    const hex = parseColorInput(val)
    if (hex) {
      onChange?.(hex)
    }
  }

  function handleAlphaChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAlpha(Number(e.target.value) / 100)
  }

  function handlePresetClick(color: string) {
    onChange?.(color)
  }

  function handlePresetKeyDown(e: React.KeyboardEvent, color: string) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
      handlePresetClick(color)
    }
  }

  // Click outside
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} className={classNames(colorPickerBaseClasses, className)}>
      {/* Trigger swatch */}
      <div
        className={getColorPickerTriggerClasses(size, disabled)}
        style={{ backgroundColor: swatchColor }}
        role="button"
        aria-label="Pick color"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={togglePanel}
        onKeyDown={handleTriggerKeyDown}
      />

      {/* Panel */}
      {isOpen && (
        <div className={colorPickerPanelClasses}>
          {/* Hue slider */}
          <div className="mb-2">
            <label className="block text-xs text-[var(--tiger-text-muted,#6b7280)] mb-1">Hue</label>
            <input
              type="range"
              min={0}
              max={360}
              value={hsv.h}
              className="w-full h-2 rounded-full cursor-pointer accent-[var(--tiger-primary,#2563eb)]"
              aria-label="Hue"
              onChange={handleHueChange}
            />
          </div>

          {/* Alpha slider */}
          {showAlpha && (
            <div className="mb-2">
              <label className="block text-xs text-[var(--tiger-text-muted,#6b7280)] mb-1">
                Alpha
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(alpha * 100)}
                className="w-full h-2 rounded-full cursor-pointer accent-[var(--tiger-primary,#2563eb)]"
                aria-label="Alpha"
                onChange={handleAlphaChange}
              />
            </div>
          )}

          {/* Color value input (rendered in the selected format) */}
          <div className="mb-2">
            <label className="block text-xs text-[var(--tiger-text-muted,#6b7280)] mb-1 uppercase">
              {format}
            </label>
            <input
              type="text"
              className={colorPickerInputClasses}
              value={inputValue}
              aria-label="Color value"
              onChange={handleInputChange}
            />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded border border-[var(--tiger-border,#d1d5db)]"
              style={{ backgroundColor: swatchColor }}
              aria-label="Color preview"
            />
            <span className="text-xs font-mono text-[var(--tiger-text,#111827)]">
              {displayValue}
            </span>
          </div>

          {/* Presets */}
          {presets && presets.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {presets.map((color) => (
                <div
                  key={color}
                  className={colorPickerPresetClasses}
                  style={{ backgroundColor: color }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${color}`}
                  onClick={() => handlePresetClick(color)}
                  onKeyDown={(e) => handlePresetKeyDown(e, color)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
