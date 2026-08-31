import type React from 'react'
import type { TreeSelectProps as CoreTreeSelectProps, TreeSelectValue } from '@expcat/tigercat-core'

type TreeSelectDomProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'value' | 'onChange' | 'onBlur'
>

export interface TreeSelectProps
  extends Omit<CoreTreeSelectProps, 'className' | 'value' | 'defaultValue'>, TreeSelectDomProps {
  value?: TreeSelectValue
  defaultValue?: TreeSelectValue
  onChange?: (value: TreeSelectValue) => void
  onSearchChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  onExpand?: (keys: (string | number)[]) => void
  onBlur?: React.FocusEventHandler<HTMLElement>
  className?: string
}

export interface TreeSelectRef {
  focus: () => void
  open: () => void
  close: () => void
}

export type { TreeSelectValue }
