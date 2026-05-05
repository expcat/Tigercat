import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  classNames
} from '@expcat/tigercat-core'

export interface StatisticProps extends CoreStatisticProps {}

export const Statistic: React.FC<StatisticProps> = ({
  title,
  value,
  precision,
  prefix,
  suffix,
  groupSeparator = false,
  animated = false,
  animationDuration,
  size = 'md',
  className
}) => {
  const initialValue = animated && canAnimateStatisticValue(value) ? 0 : value
  const [displayValue, setDisplayValue] = useState<string | number | undefined>(initialValue)
  const currentNumberRef = useRef(canAnimateStatisticValue(initialValue) ? initialValue : 0)

  useEffect(() => {
    if (!animated || !canAnimateStatisticValue(value)) {
      setDisplayValue(value)
      if (canAnimateStatisticValue(value)) currentNumberRef.current = value
      return undefined
    }

    const controller = createStatisticNumberAnimation({
      from: currentNumberRef.current,
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

  const formatted = useMemo(
    () => formatStatisticValue(displayValue, precision, groupSeparator),
    [displayValue, precision, groupSeparator]
  )

  return (
    <div className={classNames(statisticBaseClasses, className)}>
      {title && <div className={getStatisticTitleClasses(size)}>{title}</div>}
      <div className={getStatisticValueClasses(size)}>
        {prefix && <span className={statisticPrefixClasses}>{prefix}</span>}
        <span>{formatted}</span>
        {suffix && <span className={statisticSuffixClasses}>{suffix}</span>}
      </div>
    </div>
  )
}
