export interface CopyButtonProps {
  /** Text passed to the shared clipboard helper. */
  text: string
  /** Button text when no children are provided. Defaults to the locale's copy label. */
  label?: string
  /** When true the button does not write to the clipboard. @default false */
  disabled?: boolean
}
