import { classNames, type ClassValue } from './class-names'

export const radioGroupDefaultClasses = 'space-y-2'

export interface GetRadioGroupClassesOptions {
  className?: ClassValue
}

export const getRadioGroupClasses = ({ className }: GetRadioGroupClassesOptions = {}) =>
  classNames(className, !className && radioGroupDefaultClasses)
