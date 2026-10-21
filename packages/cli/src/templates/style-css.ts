export function commonStyleCss(framework: 'vue' | 'react'): string {
  return `@import "tailwindcss";
@plugin "@expcat/tigercat-core/tailwind";
@source "../node_modules/@expcat/tigercat-${framework}/dist/**/*.{js,mjs}";
@source "../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}";
@custom-variant dark (&:where(.dark, .dark *));

/* Tailwind v4 does not auto-scan node_modules; the @source lines above
 * register the installed Tigercat dist files so component utilities exist. */

/*
 * The tigercat tailwind plugin injects the default preset's --tiger-* tokens
 * for :root and .dark. ConfigProvider theme / colorScheme switches presets
 * at runtime. The rules below keep native controls in sync with .dark.
 */

html {
  color-scheme: light;
}

html.dark {
  color-scheme: dark;
}
`
}
