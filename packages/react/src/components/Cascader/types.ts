import type React from 'react'
import type {
  CascaderModelValue,
  CascaderOption,
  CascaderProps as CoreCascaderProps
} from '@expcat/tigercat-core'

type CascaderDomProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'value' | 'onChange' | 'onBlur'
>

export interface CascaderProps
  extends Omit<CoreCascaderProps, 'className' | 'value' | 'defaultValue'>, CascaderDomProps {
  value?: CascaderModelValue
  defaultValue?: CascaderModelValue
  onChange?: (value: CascaderModelValue) => void
  onSearchChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  onBlur?: React.FocusEventHandler<HTMLElement>
  className?: string
}

export type { CascaderOption, CascaderModelValue }

export interface CascaderRef {
  focus: () => void
  open: () => void
  close: () => void
}
