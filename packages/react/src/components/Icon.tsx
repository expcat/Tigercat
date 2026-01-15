import React from 'react'
import {
  classNames,
  iconSizeClasses,
  iconSvgBaseClasses,
  iconWrapperClasses,
  type IconProps as CoreIconProps
} from '@expcat/tigercat-core'

export interface IconProps extends CoreIconProps, React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
}

export const Icon: React.FC<IconProps> = ({
  size = 'md',
  color = 'currentColor',
  className,
  children,
  ...props
}) => {
  const iconStyle: React.CSSProperties = { ...props.style, color }
  const iconClasses = classNames(iconWrapperClasses, className)

  const ariaLabel = props['aria-label']
  const ariaLabelledBy = props['aria-labelledby']
  const isDecorative = ariaLabel == null && ariaLabelledBy == null && props.role == null

  const processedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement<React.SVGProps<SVGSVGElement>>(child) || child.type !== 'svg') {
      return child
    }

    const svgProps = child.props

    return React.cloneElement(child, {
      ...svgProps,
      className: classNames(iconSvgBaseClasses, iconSizeClasses[size], svgProps.className),
      xmlns: svgProps.xmlns ?? 'http://www.w3.org/2000/svg',
      viewBox: svgProps.viewBox ?? '0 0 24 24',
      fill: svgProps.fill ?? 'none',
      stroke: svgProps.stroke ?? 'currentColor',
      strokeWidth: svgProps.strokeWidth ?? 2,
      strokeLinecap: svgProps.strokeLinecap ?? 'round',
      strokeLinejoin: svgProps.strokeLinejoin ?? 'round'
    })
  })

  return (
    <span
      {...props}
      className={iconClasses}
      style={iconStyle}
      {...(isDecorative ? { 'aria-hidden': true } : { role: props.role ?? 'img' })}>
      {processedChildren}
    </span>
  )
}
