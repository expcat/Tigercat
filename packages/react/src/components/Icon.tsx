import React from 'react'
import {
  classNames,
  iconSizeClasses,
  iconSvgBaseClasses,
  iconSvgDefaultStrokeLinecap,
  iconSvgDefaultStrokeLinejoin,
  iconSvgDefaultStrokeWidth,
  iconWrapperClasses,
  SVG_DEFAULT_FILL,
  SVG_DEFAULT_STROKE,
  SVG_DEFAULT_VIEWBOX_24,
  SVG_DEFAULT_XMLNS,
  type IconProps as CoreIconProps
} from '@expcat/tigercat-core'

export interface IconProps extends CoreIconProps, React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
}

export const Icon: React.FC<IconProps> = ({
  size = 'md',
  color = 'currentColor',
  className,
  style,
  children,
  ...props
}) => {
  const iconClasses = classNames(iconWrapperClasses, className)
  const iconStyle: React.CSSProperties = { ...style, color }
  const isDecorative =
    props['aria-label'] == null && props['aria-labelledby'] == null && props.role == null

  const processedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement<React.SVGProps<SVGSVGElement>>(child) || child.type !== 'svg') {
      return child
    }

    const svgProps = child.props

    return React.cloneElement(child, {
      ...svgProps,
      className: classNames(iconSvgBaseClasses, iconSizeClasses[size], svgProps.className),
      xmlns: svgProps.xmlns ?? SVG_DEFAULT_XMLNS,
      viewBox: svgProps.viewBox ?? SVG_DEFAULT_VIEWBOX_24,
      fill: svgProps.fill ?? SVG_DEFAULT_FILL,
      stroke: svgProps.stroke ?? SVG_DEFAULT_STROKE,
      strokeWidth: svgProps.strokeWidth ?? iconSvgDefaultStrokeWidth,
      strokeLinecap: svgProps.strokeLinecap ?? iconSvgDefaultStrokeLinecap,
      strokeLinejoin: svgProps.strokeLinejoin ?? iconSvgDefaultStrokeLinejoin
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
