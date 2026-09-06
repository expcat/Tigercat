import React, { forwardRef } from 'react'
import {
  classNames,
  fullscreenButtonClasses,
  getFullscreenLabels,
  getIconDefinition,
  mergeTigerLocale,
  type FullscreenProps as CoreFullscreenProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { useFullscreen } from '../hooks/useFullscreen'

export interface FullscreenButtonProps
  extends
    CoreFullscreenProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'onError'> {}

function Glyph({ name }: { name: 'fullscreen' | 'fullscreen-exit' }) {
  const definition = getIconDefinition(name)
  if (!definition) return null
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={definition.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true">
      {definition.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

export const FullscreenButton = forwardRef<HTMLButtonElement, FullscreenButtonProps>(
  function FullscreenButton(
    { target, locale, labels, className, onChange, onError, ...props },
    ref
  ) {
    const config = useTigerConfig()
    const labelSet = getFullscreenLabels(mergeTigerLocale(config.locale, locale), labels)
    const fullscreen = useFullscreen({ target, onChange, onError })
    const label = fullscreen.isFullscreen ? labelSet.exitAriaLabel : labelSet.enterAriaLabel

    return (
      <button
        {...props}
        ref={ref}
        type="button"
        className={classNames(fullscreenButtonClasses, className)}
        aria-label={label}
        aria-pressed={fullscreen.isFullscreen}
        disabled={!fullscreen.supported}
        onClick={() => {
          void fullscreen.toggle()
        }}>
        <Glyph name={fullscreen.isFullscreen ? 'fullscreen-exit' : 'fullscreen'} />
      </button>
    )
  }
)

FullscreenButton.displayName = 'FullscreenButton'

export default FullscreenButton
