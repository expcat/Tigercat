import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import type { StatisticProps as CoreStatisticProps } from '@expcat/tigercat-core'
import {
  statisticBaseClasses,
  getStatisticTitleClasses,
  getStatisticValueClasses,
  statisticPrefixClasses,
  statisticSuffixClasses,
  formatStatisticValue,
  canAnimateStatisticValue,
  createStatisticNumberAnimation,
  resolveStatisticPrecision,
  statisticPrefersReducedMotion,
  classNames,
  mergeTigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface StatisticProps
  extends
    Omit<CoreStatisticProps, 'title' | 'prefix' | 'suffix'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'prefix'> {
  title?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export const Statistic = forwardRef<HTMLDivElement, StatisticProps>(function Statistic(
  {
    title,
    value,
    precision,
    prefix,
    suffix,
    groupSeparator = false,
    animated = false,
    animationDuration,
    size = 'md',
    className,
    locale,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const localeId = mergedLocale?.locale
  const [displayValue, setDisplayValue] = useState<string | number | undefined>(value)
  const currentNumberRef = useRef(canAnimateStatisticValue(value) ? value : 0)
  const hasPlayedRef = useRef(false)

  useEffect(() => {
    if (!animated || !canAnimateStatisticValue(value) || statisticPrefersReducedMotion()) {
      setDisplayValue(value)
      if (canAnimateStatisticValue(value)) currentNumberRef.current = value
      return undefined
    }

    const from = hasPlayedRef.current ? currentNumberRef.current : 0
    hasPlayedRef.current = true
    const controller = createStatisticNumberAnimation({
      from,
      to: value,
      duration: animationDuration,
      onUpdate: (next) => {
        currentNumberRef.current = next
        setDisplayValue(next)
      },
      onComplete: () => {
        currentNumberRef.current = value
        setDisplayValue(value)
      }
    })

    return controller.stop
  }, [value, animated, animationDuration])

  const formatPrecision = canAnimateStatisticValue(value)
    ? resolveStatisticPrecision(value, precision)
    : precision

  const formatted = useMemo(
    () => formatStatisticValue(displayValue, formatPrecision, groupSeparator, localeId),
    [displayValue, formatPrecision, groupSeparator, localeId]
  )

  return (
    <div ref={ref} className={classNames(statisticBaseClasses, className)} {...rest}>
      {title ? <div className={getStatisticTitleClasses(size)}>{title}</div> : null}
      <div className={getStatisticValueClasses(size)}>
        {prefix ? <span className={statisticPrefixClasses}>{prefix}</span> : null}
        <span>{formatted}</span>
        {suffix ? <span className={statisticSuffixClasses}>{suffix}</span> : null}
      </div>
    </div>
  )
})
