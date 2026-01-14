import type { TimePickerLabels } from "../types/timepicker";

const ZH_LABELS: TimePickerLabels = {
  hour: "时",
  minute: "分",
  second: "秒",
  now: "现在",
  ok: "确定",
  start: "开始",
  end: "结束",
  clear: "清除时间",
  toggle: "打开时间选择器",
  dialog: "时间选择器",
  selectTime: "请选择时间",
  selectTimeRange: "请选择时间范围",
};

const EN_LABELS: TimePickerLabels = {
  hour: "Hour",
  minute: "Min",
  second: "Sec",
  now: "Now",
  ok: "OK",
  start: "Start",
  end: "End",
  clear: "Clear time",
  toggle: "Toggle time picker",
  dialog: "Time picker",
  selectTime: "Select time",
  selectTimeRange: "Select time range",
};

function isZhLocale(locale?: string): boolean {
  return (locale ?? "").toLowerCase().startsWith("zh");
}

export function getTimePickerLabels(
  locale?: string,
  overrides?: Partial<TimePickerLabels>
): TimePickerLabels {
  const base = isZhLocale(locale) ? ZH_LABELS : EN_LABELS;
  return { ...base, ...(overrides ?? {}) };
}

export type TimePickerOptionUnit = "hour" | "minute" | "second";

function pluralizeEn(value: number, singular: string): string {
  return value === 1 ? singular : `${singular}s`;
}

export function getTimePickerOptionAriaLabel(
  value: number,
  unit: TimePickerOptionUnit,
  locale?: string,
  labelOverrides?: Partial<TimePickerLabels>
): string {
  const labels = getTimePickerLabels(locale, labelOverrides);

  if (isZhLocale(locale)) {
    const suffix =
      unit === "hour"
        ? labels.hour
        : unit === "minute"
        ? labels.minute
        : labels.second;
    return `${value}${suffix}`;
  }

  const lc = (locale ?? "").toLowerCase();

  const useEnglishPlural =
    lc.length === 0 ? labelOverrides == null : lc.startsWith("en");

  if (useEnglishPlural) {
    if (unit === "hour") return `${value} ${pluralizeEn(value, "hour")}`;
    if (unit === "minute") return `${value} ${pluralizeEn(value, "minute")}`;
    return `${value} ${pluralizeEn(value, "second")}`;
  }

  const unitLabel =
    unit === "hour"
      ? labels.hour
      : unit === "minute"
      ? labels.minute
      : labels.second;
  return `${value} ${unitLabel}`;
}
