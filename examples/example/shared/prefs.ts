import type { DemoLang } from "./app-config";

export const DEMO_LANG_STORAGE_KEY = "tigercat-example-lang";
export const DEMO_THEME_STORAGE_KEY = "tigercat-example-theme";

export function getStoredLang(): DemoLang {
  if (typeof window === "undefined") return "zh-CN";

  const raw = window.localStorage.getItem(DEMO_LANG_STORAGE_KEY);
  if (raw === "zh-CN" || raw === "en-US") return raw;

  const nav = (navigator.language || "").toLowerCase();
  return nav.startsWith("zh") ? "zh-CN" : "en-US";
}

export function setStoredLang(lang: DemoLang) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_LANG_STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

export function getStoredTheme(): string {
  if (typeof window === "undefined") return "default";
  return window.localStorage.getItem(DEMO_THEME_STORAGE_KEY) || "default";
}

export function setStoredTheme(themeValue: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_THEME_STORAGE_KEY, themeValue);
}
