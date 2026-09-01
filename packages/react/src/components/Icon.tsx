import React, { forwardRef } from 'react'
import {
  classNames,
  getIconDefinition,
  iconSizeClasses,
  iconSvgBaseClasses,
  iconWrapperClasses,
  mergeChildSvgAttrs,
  resolveIconSize,
  resolveIconSvgAttrs,
  resolveIconWrapperStyle,
  warnUnknownIconName,
  type IconProps as CoreIconProps
} from '@expcat/tigercat-core'

export interface IconProps extends CoreIconProps, React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
}

type SvgLineCap = NonNullable<React.SVGProps<SVGSVGElement>['strokeLinecap']>
type SvgLineJoin = NonNullable<React.SVGProps<SVGSVGElement>['strokeLinejoin']>

function asSvgLineCap(value: string | undefined): SvgLineCap | undefined {
  if (value === 'inherit' || value === 'round' || value === 'butt' || value === 'square') {
    return value
  }
  return undefined
}

function asSvgLineJoin(value: string | undefined): SvgLineJoin | undefined {
  if (value === 'inherit' || value === 'round' || value === 'bevel' || value === 'miter') {
    return value
  }
  return undefined
}

function toReactSvgAttrs(
  attrs: ReturnType<typeof resolveIconSvgAttrs>
): React.SVGProps<SVGSVGElement> {
  return {
    xmlns: attrs.xmlns,
    viewBox: attrs.viewBox,
    fill: attrs.fill,
    stroke: attrs.stroke,
    strokeWidth: attrs.strokeWidth,
    strokeLinecap: asSvgLineCap(attrs.strokeLinecap),
    strokeLinejoin: asSvgLineJoin(attrs.strokeLinejoin),
    'aria-hidden': attrs['aria-hidden'],
    focusable: attrs.focusable
  }
}

export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { name, icon, size = 'md', color, className, style, children, ...props },
  ref
) {
  const resolvedSize = resolveIconSize(size)
  const iconClasses = classNames(iconWrapperClasses, className)
  const iconStyle = resolveIconWrapperStyle(color, style as Record<string, unknown> | undefined) as
    React.CSSProperties | undefined
  const isDecorative =
    props['aria-label'] == null && props['aria-labelledby'] == null && props.role == null

  const hasChildren = React.Children.count(children) > 0
  const definition = !hasChildren
    ? (icon ?? (name ? getIconDefinition(name) : undefined))
    : undefined

  if (!hasChildren && !definition && name) {
    warnUnknownIconName(name)
  }

  const svgClassName = classNames(iconSvgBaseClasses, iconSizeClasses[resolvedSize])
  const builtInSvg = definition ? (
    <svg
      className={svgClassName}
      {...toReactSvgAttrs(
        resolveIconSvgAttrs({ mode: definition.mode, viewBox: definition.viewBox })
      )}>
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
    const merged = mergeChildSvgAttrs(svgProps as Record<string, unknown>)

    return React.cloneElement(child, {
      ...svgProps,
      ...toReactSvgAttrs(merged),
      className: classNames(svgClassName, svgProps.className)
    })
  })

  return (
    <span
      {...props}
      ref={ref}
      className={iconClasses}
      style={iconStyle}
      {...(isDecorative ? { 'aria-hidden': true } : { role: props.role ?? 'img' })}>
      {builtInSvg ?? processedChildren}
    </span>
  )
})
Icon.displayName = 'Icon'
