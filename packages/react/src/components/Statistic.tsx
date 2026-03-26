import React, { useMemo } from 'react'
import type { StatisticProps as CoreStatisticProps } from '@expcat/tigercat-core'
import {
  statisticBaseClasses,
  getStatisticTitleClasses,
  getStatisticValueClasses,
  statisticPrefixClasses,
  statisticSuffixClasses,
  formatStatisticValue,
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
  size = 'md',
  className
}) => {
  const formatted = useMemo(
    () => formatStatisticValue(value, precision, groupSeparator),
    [value, precision, groupSeparator]
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
