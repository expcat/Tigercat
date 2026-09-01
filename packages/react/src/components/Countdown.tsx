import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  COUNTDOWN_DEFAULT_FORMAT,
  COUNTDOWN_DEFAULT_INTERVAL_MS,
  classNames,
  countdownBaseClasses,
  countdownPrefixClasses,
  countdownSuffixClasses,
  countdownValueWrapperClasses,
  createCountdownPayload,
  formatCountdown,
  getCountdownRemaining,
  getCountdownTitleClasses,
  getCountdownValueClasses,
  type CountdownChangePayload,
  type CountdownProps as CoreCountdownProps,
  type CountdownValue
} from '@expcat/tigercat-core'

export interface CountdownProps
  extends
    Omit<CoreCountdownProps, 'className' | 'title' | 'prefix' | 'suffix'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'title' | 'prefix'> {
  className?: string
  title?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onChange?: (payload: CountdownChangePayload) => void
  /**
   * Fires once when remaining crosses 0. Already-elapsed mounts do not fire.
   */
  onFinish?: (payload: CountdownChangePayload) => void
}

function initialRemaining(
  value: CountdownValue | undefined,
  now: CountdownValue | undefined
): number {
  if (now === undefined) return 0
  return getCountdownRemaining(value, now)
}

export const Countdown: React.FC<CountdownProps> = ({
  value,
  now,
  format = COUNTDOWN_DEFAULT_FORMAT,
  interval = COUNTDOWN_DEFAULT_INTERVAL_MS,
  title,
  prefix,
  suffix,
  size = 'md',
  ariaLabel,
  className,
  onChange,
  onFinish,
  ...rest
}) => {
  const [remaining, setRemaining] = useState(() => initialRemaining(value, now))
  const finishedRef = useRef(remaining <= 0)
  const onChangeRef = useRef(onChange)
  const onFinishRef = useRef(onFinish)
  onChangeRef.current = onChange
  onFinishRef.current = onFinish

  const formatted = useMemo(() => formatCountdown(remaining, format), [format, remaining])

  useEffect(() => {
    const nextRemaining =
      now === undefined ? getCountdownRemaining(value) : getCountdownRemaining(value, now)
    setRemaining(nextRemaining)
    finishedRef.current = nextRemaining <= 0
  }, [value, now])

  useEffect(() => {
    if (interval <= 0 || value === undefined) return undefined

    const current = getCountdownRemaining(value)
    if (current <= 0) return undefined

    let timerId: number

    const tick = () => {
      const nextRemaining = getCountdownRemaining(value)
      const payload = createCountdownPayload(nextRemaining, format)

      setRemaining(nextRemaining)
      onChangeRef.current?.(payload)

      if (nextRemaining <= 0) {
        if (!finishedRef.current) {
          finishedRef.current = true
          onFinishRef.current?.(payload)
        }
        window.clearInterval(timerId)
      }
    }

    timerId = window.setInterval(tick, interval)
    return () => window.clearInterval(timerId)
  }, [format, interval, value])

  return (
    <div
      {...rest}
      className={classNames(countdownBaseClasses, className)}
      role={ariaLabel ? 'group' : rest.role}
      aria-label={ariaLabel}>
      {title ? <div className={getCountdownTitleClasses(size)}>{title}</div> : null}
      <div className={countdownValueWrapperClasses}>
        {prefix ? <span className={countdownPrefixClasses}>{prefix}</span> : null}
        <span className={getCountdownValueClasses(size)} role="timer">
          {formatted}
        </span>
        {suffix ? <span className={countdownSuffixClasses}>{suffix}</span> : null}
      </div>
    </div>
  )
}

export type { CountdownChangePayload, CountdownValue }

export default Countdown
