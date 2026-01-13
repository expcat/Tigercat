import { classNames, type ClassValue } from './class-names';

export const radioGroupDefaultClasses = 'space-y-2';

export interface GetRadioGroupClassesOptions {
  className?: ClassValue;
  hasCustomClass?: boolean;
}

export const getRadioGroupClasses = ({
  className,
  hasCustomClass,
}: GetRadioGroupClassesOptions = {}) => {
  const effectiveHasCustomClass = hasCustomClass ?? !!className;

  return classNames(
    className,
    !effectiveHasCustomClass && radioGroupDefaultClasses
  );
};
