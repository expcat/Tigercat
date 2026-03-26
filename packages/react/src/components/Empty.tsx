import React, { useMemo } from 'react'
import {
  classNames,
  emptyBaseClasses,
  emptyImageClasses,
  emptyDescriptionClasses,
  emptyActionsClasses,
  emptyIllustrationViewBox,
  emptyIllustrationPaths,
  getEmptyDescription,
  type EmptyProps as CoreEmptyProps
} from '@expcat/tigercat-core'

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement>, CoreEmptyProps {
  /** Custom image / illustration node */
  image?: React.ReactNode
  /** Action buttons below description */
  extra?: React.ReactNode
  /** Body content */
  children?: React.ReactNode
}

export const Empty: React.FC<EmptyProps> = ({
  preset = 'default',
  description,
  showImage = true,
  image,
  extra,
  className,
  children,
  ...props
}) => {
  const descText = useMemo(() => description ?? getEmptyDescription(preset), [description, preset])

  const wrapperClasses = useMemo(() => classNames(emptyBaseClasses, className), [className])

  return (
    <div className={wrapperClasses} {...props}>
      {/* Illustration */}
      {showImage && (
        <div className={emptyImageClasses}>
          {image !== undefined ? (
            image
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox={emptyIllustrationViewBox}
              className="mx-auto h-24 w-24">
              {emptyIllustrationPaths.map((p, i) => (
                <path
                  key={i}
                  d={p.d}
                  fill={p.fill ?? 'none'}
                  stroke={p.stroke}
                  strokeWidth={p.strokeWidth}
                  opacity={p.opacity}
                />
              ))}
            </svg>
          )}
        </div>
      )}

      {/* Description */}
      {descText && <div className={emptyDescriptionClasses}>{descText}</div>}

      {/* Actions */}
      {extra && <div className={emptyActionsClasses}>{extra}</div>}

      {/* Children */}
      {children && <div>{children}</div>}
    </div>
  )
}
