import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  classNames,
  getSelectTriggerClasses,
  getSelectOptionClasses,
  selectBaseClasses,
  selectDropdownBaseClasses,
  selectGroupLabelClasses,
  selectSearchInputClasses,
  selectEmptyStateClasses,
  isOptionGroup,
  filterOptions,
  type SelectOption,
  type SelectOptions,
  type SelectProps as CoreSelectProps,
  type SelectValue,
  type SelectValues,
} from "@tigercat/core";

const flattenSelectOptions = (options: SelectOptions): SelectOption[] => {
  const all: SelectOption[] = [];
  for (const item of options) {
    if (isOptionGroup(item)) {
      all.push(...item.options);
    } else {
      all.push(item);
    }
  }
  return all;
};

type SelectDivProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "value" | "onChange"
>;

export interface SelectBaseProps
  extends Omit<CoreSelectProps, "multiple" | "options">,
    SelectDivProps {
  options?: SelectOptions;

  onSearch?: (query: string) => void;

  className?: string;
}

export interface SelectSingleProps extends SelectBaseProps {
  multiple?: false;
  value?: SelectValue;
  onChange?: (value: SelectValue | undefined) => void;
}

export interface SelectMultipleProps extends SelectBaseProps {
  multiple: true;
  value?: SelectValues;
  onChange?: (value: SelectValues) => void;
}

export type SelectProps = SelectSingleProps | SelectMultipleProps;

const isMultipleSelect = (props: SelectProps): props is SelectMultipleProps =>
  props.multiple === true;

export const Select: React.FC<SelectProps> = (props) => {
  const {
    options = [],
    size = "md",
    disabled = false,
    placeholder = "Select an option",
    searchable = false,
    clearable = true,
    noOptionsText = "No options found",
    noDataText = "No options available",
    onSearch,
    className,
  } = props;

  const divProps = (({
    value: _value,
    onChange: _onChange,
    multiple: _multiple,
    ...rest
  }) => rest)(props);

  const instanceId = useId();
  const listboxId = `tiger-select-listbox-${instanceId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(
    () =>
      searchable && searchQuery ? filterOptions(options, searchQuery) : options,
    [options, searchable, searchQuery]
  );

  const flatFilteredOptions = useMemo(
    () => flattenSelectOptions(filteredOptions),
    [filteredOptions]
  );

  const allOptions = useMemo(() => flattenSelectOptions(options), [options]);

  const displayText = (() => {
    if (isMultipleSelect(props)) {
      const value = props.value ?? [];
      if (value.length === 0) {
        return placeholder;
      }
      const selectedOptions = allOptions.filter((opt) =>
        value.includes(opt.value)
      );
      return selectedOptions.map((opt) => opt.label).join(", ");
    }

    const value = props.value;
    if (value === undefined || value === null || value === "") {
      return placeholder;
    }

    return allOptions.find((opt) => opt.value === value)?.label ?? placeholder;
  })();

  const showClearButton =
    clearable &&
    !disabled &&
    props.value !== undefined &&
    props.value !== null &&
    props.value !== "" &&
    (!Array.isArray(props.value) || props.value.length > 0);

  const isSelected = (option: SelectOption): boolean => {
    if (isMultipleSelect(props)) {
      return (props.value ?? []).includes(option.value);
    }
    return props.value === option.value;
  };

  const getOptionId = (index: number) =>
    `tiger-select-option-${instanceId}-${index}`;

  const findFirstEnabledIndex = (): number =>
    flatFilteredOptions.findIndex((opt) => !opt.disabled);

  const findLastEnabledIndex = (): number => {
    for (let i = flatFilteredOptions.length - 1; i >= 0; i--) {
      if (!flatFilteredOptions[i]?.disabled) {
        return i;
      }
    }
    return -1;
  };

  const findNextEnabledIndex = (current: number, direction: 1 | -1): number => {
    if (flatFilteredOptions.length === 0) {
      return -1;
    }

    const start =
      current < 0
        ? direction === 1
          ? 0
          : flatFilteredOptions.length - 1
        : current + direction;
    for (
      let i = start;
      i >= 0 && i < flatFilteredOptions.length;
      i += direction
    ) {
      if (!flatFilteredOptions[i]?.disabled) {
        return i;
      }
    }
    return current;
  };

  const focusOptionAt = (index: number) => {
    if (index < 0) {
      return;
    }

    requestAnimationFrame(() => {
      const el = dropdownRef.current?.querySelector<HTMLElement>(
        `[data-option-index="${index}"]`
      );
      el?.focus();
      el?.scrollIntoView({ block: "nearest" });
    });
  };

  const setActiveAndFocus = (index: number) => {
    setActiveIndex(index);
    focusOptionAt(index);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery("");
    setActiveIndex(-1);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const getActiveOption = (): SelectOption | undefined => {
    if (activeIndex < 0) {
      return undefined;
    }
    return flatFilteredOptions[activeIndex];
  };

  const selectActiveOption = () => {
    const option = getActiveOption();
    if (!option || option.disabled) {
      return;
    }
    selectOption(option);
  };

  const selectOption = (option: SelectOption) => {
    if (option.disabled) {
      return;
    }

    if (isMultipleSelect(props)) {
      const currentValue = props.value ?? [];
      const nextValue = currentValue.includes(option.value)
        ? currentValue.filter((v) => v !== option.value)
        : [...currentValue, option.value];

      props.onChange?.(nextValue);
      return;
    }

    props.onChange?.(option.value);
    closeDropdown();
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  const clearSelection = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (isMultipleSelect(props)) {
      props.onChange?.([]);
      return;
    }

    props.onChange?.(undefined);
  };

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (disabled) {
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        const next = findNextEnabledIndex(activeIndex, 1);
        setActiveAndFocus(next);
        return;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        const next = findNextEnabledIndex(activeIndex, -1);
        setActiveAndFocus(next);
        return;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        selectActiveOption();
        return;
      }
      case "Escape": {
        if (isOpen) {
          event.preventDefault();
          closeDropdown();
        }
        return;
      }
      default:
        return;
    }
  };

  const handleDropdownKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = findNextEnabledIndex(activeIndex, 1);
        setActiveAndFocus(next);
        return;
      }
      case "ArrowUp": {
        event.preventDefault();
        const next = findNextEnabledIndex(activeIndex, -1);
        setActiveAndFocus(next);
        return;
      }
      case "Home": {
        event.preventDefault();
        const next = findFirstEnabledIndex();
        setActiveAndFocus(next);
        return;
      }
      case "End": {
        event.preventDefault();
        const next = findLastEnabledIndex();
        setActiveAndFocus(next);
        return;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        selectActiveOption();
        return;
      }
      case "Escape": {
        event.preventDefault();
        closeDropdown();
        triggerRef.current?.focus();
        return;
      }
      case "Tab": {
        closeDropdown();
        return;
      }
      default:
        return;
    }
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    switch (event.key) {
      case " ": {
        event.stopPropagation();
        return;
      }
      case "ArrowDown": {
        event.preventDefault();
        event.stopPropagation();
        const next = activeIndex >= 0 ? activeIndex : findFirstEnabledIndex();
        setActiveAndFocus(next);
        return;
      }
      case "ArrowUp": {
        event.preventDefault();
        event.stopPropagation();
        const next = activeIndex >= 0 ? activeIndex : findLastEnabledIndex();
        setActiveAndFocus(next);
        return;
      }
      case "Enter": {
        if (activeIndex >= 0) {
          event.preventDefault();
          event.stopPropagation();
          selectActiveOption();
        }
        return;
      }
      case "Escape": {
        event.preventDefault();
        event.stopPropagation();
        closeDropdown();
        triggerRef.current?.focus();
        return;
      }
      default:
        return;
    }
  };

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (flatFilteredOptions.length === 0) {
      setActiveIndex(-1);
      return;
    }

    const selectedIndex = (() => {
      if (isMultipleSelect(props)) {
        const value = props.value ?? [];
        if (value.length === 0) {
          return -1;
        }
        return flatFilteredOptions.findIndex(
          (opt) => value.includes(opt.value) && !opt.disabled
        );
      }

      const value = props.value;
      if (value === undefined || value === null || value === "") {
        return -1;
      }
      return flatFilteredOptions.findIndex(
        (opt) => opt.value === value && !opt.disabled
      );
    })();

    const nextActive =
      selectedIndex >= 0 ? selectedIndex : findFirstEnabledIndex();
    setActiveIndex(nextActive);

    if (!searchable) {
      focusOptionAt(nextActive);
    }
  }, [isOpen, searchable, flatFilteredOptions, props.multiple, props.value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  const triggerClasses = getSelectTriggerClasses(size, disabled, isOpen);

  const renderOption = (option: SelectOption, index: number) => {
    const optionSelected = isSelected(option);
    const optionActive = index === activeIndex;

    return (
      <div
        key={option.value}
        id={getOptionId(index)}
        data-option-index={index}
        role="option"
        aria-selected={optionSelected}
        aria-disabled={option.disabled ? true : undefined}
        tabIndex={optionActive ? 0 : -1}
        className={getSelectOptionClasses(
          optionSelected,
          !!option.disabled,
          size
        )}
        onMouseEnter={() => {
          if (!option.disabled) {
            setActiveIndex(index);
          }
        }}
        onClick={() => selectOption(option)}
      >
        <span className="flex items-center justify-between w-full">
          <span>{option.label}</span>
          {optionSelected && (
            <svg
              className="w-5 h-5 text-[var(--tiger-primary,#2563eb)]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </div>
    );
  };

  const hasOptions = filteredOptions.length > 0;

  const renderOptions = () => {
    if (!hasOptions) {
      return (
        <div className={selectEmptyStateClasses}>
          {options.length === 0 ? noDataText : noOptionsText}
        </div>
      );
    }

    let optionIndex = -1;

    return filteredOptions.map((item) => {
      if (isOptionGroup(item)) {
        return (
          <div key={item.label}>
            <div className={selectGroupLabelClasses}>{item.label}</div>
            {item.options.map((option) => {
              optionIndex += 1;
              return renderOption(option, optionIndex);
            })}
          </div>
        );
      }

      optionIndex += 1;
      return renderOption(item, optionIndex);
    });
  };

  const containerClasses = classNames(selectBaseClasses, className);

  return (
    <div className={containerClasses} {...divProps}>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClasses}
        disabled={disabled}
        onClick={toggleDropdown}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
      >
        <span
          className={classNames(
            "flex-1 text-left truncate",
            displayText === placeholder && "text-gray-400"
          )}
        >
          {displayText}
        </span>
        <span className="flex items-center gap-1">
          {showClearButton && (
            <span className="inline-flex" onClick={clearSelection}>
              <svg
                className="w-4 h-4 text-gray-400 hover:text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
          <span className={classNames("inline-flex", isOpen && "rotate-180")}>
            <svg
              className="w-5 h-5 text-gray-400 transition-transform"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={selectDropdownBaseClasses}
          role="listbox"
          id={listboxId}
          aria-multiselectable={isMultipleSelect(props) ? true : undefined}
          onKeyDown={handleDropdownKeyDown}
        >
          {searchable && (
            <input
              ref={searchInputRef}
              type="text"
              className={selectSearchInputClasses}
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchInput}
              onKeyDown={handleSearchKeyDown}
            />
          )}
          {renderOptions()}
        </div>
      )}
    </div>
  );
};
