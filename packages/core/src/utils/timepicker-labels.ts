export interface TimePickerLabels {
  hour: string;
  minute: string;
  second: string;
  now: string;
  ok: string;
  start: string;
  end: string;
  clear: string;
  toggle: string;
  dialog: string;
  selectTime: string;
}

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
};

function isZhLocale(locale?: string): boolean {
  return (locale ?? "").toLowerCase().startsWith("zh");
}

export function getTimePickerLabels(locale?: string): TimePickerLabels {
  return isZhLocale(locale) ? ZH_LABELS : EN_LABELS;
}

export type TimePickerOptionUnit = "hour" | "minute" | "second";

export function getTimePickerOptionAriaLabel(
  value: number,
  unit: TimePickerOptionUnit,
  locale?: string
): string {
  if (isZhLocale(locale)) {
    const labels = getTimePickerLabels(locale);
    const suffix =
      unit === "hour"
        ? labels.hour
        : unit === "minute"
        ? labels.minute
        : labels.second;
    return `${value}${suffix}`;
  }

  if (unit === "hour") return `${value} hours`;
  if (unit === "minute") return `${value} minutes`;
  return `${value} seconds`;
}
