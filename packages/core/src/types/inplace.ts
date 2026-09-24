export interface InplaceProps {
  /** Controlled editing state. Omit to let the component own it. */
  editing?: boolean
  /** Uncontrolled initial editing state. @default false */
  defaultEditing?: boolean
  /** When true the display control cannot enter editing. @default false */
  disabled?: boolean
}
