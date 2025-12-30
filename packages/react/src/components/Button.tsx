import React, { useCallback, useMemo } from 'react'
import { classNames, getButtonVariantClasses, type ButtonProps as CoreButtonProps } from '@tigercat/core'

export interface ButtonProps extends CoreButtonProps {
  /**
   * Click event handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  
  /**
   * Button content
   */
  children?: React.ReactNode
  
  /**
   * HTML button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset'
  
  /**
   * Additional CSS classes
   */
  className?: string
}

const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  type = 'button',
  className,
  ...props
}) => {
  const buttonClasses = useMemo(() => classNames(
    baseClasses,
    getButtonVariantClasses(variant),
    sizeClasses[size],
    (disabled || loading) && 'cursor-not-allowed opacity-60',
    className,
  ), [variant, size, disabled, loading, className])

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(event)
    }
  }, [disabled, loading, onClick])

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      type={type}
      {...props}
    >
      {loading && (
        <span className="mr-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      {children}
    </button>
  )
}
