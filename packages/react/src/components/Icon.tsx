import React from 'react'
import {
  classNames,
  iconSizeClasses,
  iconSvgBaseClasses,
  iconSvgDefaultStrokeLinecap,
  iconSvgDefaultStrokeLinejoin,
  iconSvgDefaultStrokeWidth,
  iconWrapperClasses,
  getIconDefinition,
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
  name,
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

  // Built-in icon: render the registered glyph when a `name` is provided and no
  // custom children override it.
  const hasChildren = React.Children.count(children) > 0
  const definition = !hasChildren && name ? getIconDefinition(name) : undefined

  const builtInSvg = definition ? (
    <svg
      className={classNames(iconSvgBaseClasses, iconSizeClasses[size])}
      xmlns={SVG_DEFAULT_XMLNS}
      viewBox={definition.viewBox}
      fill={definition.mode === 'fill' ? 'currentColor' : SVG_DEFAULT_FILL}
      stroke={definition.mode === 'stroke' ? 'currentColor' : SVG_DEFAULT_STROKE}
      strokeWidth={definition.mode === 'stroke' ? 1.5 : undefined}
      strokeLinecap={definition.mode === 'stroke' ? iconSvgDefaultStrokeLinecap : undefined}
      strokeLinejoin={definition.mode === 'stroke' ? iconSvgDefaultStrokeLinejoin : undefined}>
      {definition.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  ) : null

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
      {builtInSvg ?? processedChildren}
    </span>
  )
}
