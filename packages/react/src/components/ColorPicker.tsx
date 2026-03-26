import React, { useState, useMemo, useRef, useEffect } from 'react'
import type { ColorPickerProps as CoreColorPickerProps, ColorFormat } from '@expcat/tigercat-core'
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
  classNames
} from '@expcat/tigercat-core'

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
  const [inputValue, setInputValue] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  const hsv = useMemo(() => {
    const rgb = hexToRgb(value)
    return rgbToHsv(rgb.r, rgb.g, rgb.b)
  }, [value])

  useEffect(() => {
    setInputValue(value)
  }, [value])

  function togglePanel() {
    if (disabled) return
    setIsOpen((v) => !v)
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
    if (isValidHex(val)) {
      const hex = val.startsWith('#') ? val : `#${val}`
      onChange?.(hex)
    }
  }

  function handlePresetClick(color: string) {
    onChange?.(color)
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
        style={{ backgroundColor: value }}
        role="button"
        aria-label="Pick color"
        tabIndex={0}
        onClick={togglePanel}
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

          {/* Hex input */}
          <div className="mb-2">
            <label className="block text-xs text-[var(--tiger-text-muted,#6b7280)] mb-1">Hex</label>
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
              style={{ backgroundColor: value }}
              aria-label="Color preview"
            />
            <span className="text-xs font-mono text-[var(--tiger-text,#111827)]">{value}</span>
          </div>

          {/* Presets */}
          {presets && presets.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {presets.map((color) => (
                <div
                  key={color}
                  className={colorPickerPresetClasses}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color}`}
                  onClick={() => handlePresetClick(color)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
