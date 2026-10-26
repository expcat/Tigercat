# @expcat/tigercat-core

[![npm version](https://img.shields.io/npm/v/@expcat/tigercat-core.svg)](https://www.npmjs.com/package/@expcat/tigercat-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Core utilities and shared types for [Tigercat](https://github.com/expcat/Tigercat) UI library.

The Vue and React packages depend on the matching core version. Install core directly when an app imports its Tailwind plugin, tokens, locales, or shared helpers.

## Installation

```bash
# Preview channel; omit @next for stable
pnpm add @expcat/tigercat-core@next
# or
npm install @expcat/tigercat-core@next
```

## Exports

| Module              | Description                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Utils**           | `classNames`, `coerceClassValue`, `copyTextToClipboard`, animation helpers, a11y utilities                                                                     |
| **Types**           | Shared TypeScript types for all components (Button, Input, Modal, Table, etc.)                                                                                 |
| **Workflow**        | `reduceWorkflowAction`, `applyWorkflowFieldPermissions`, Designer / Timeline helpers; tree-shake `@expcat/tigercat-core/workflow-designer` and `./schema-form` |
| **Theme**           | CSS variables (`THEME_CSS_VARS`), color utilities, component theme configs                                                                                     |
| **Tailwind Plugin** | `tigercatPlugin` - Tailwind CSS plugin for theme integration                                                                                                   |

Runtime theme and design tokens are documented in
[theme.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/references/theme.md)
and
[tokens.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/references/tokens.md).

## Tailwind Plugin

```css
@import 'tailwindcss';
@plugin '@expcat/tigercat-core/tailwind';
```

The plugin writes the default preset on `:root` and `.dark`. Choose another preset with
`createTigercatPlugin({ preset })` or `ConfigProvider theme`. There is no `tailwind/modern`
entry and no `data-tiger-style` layer.

The plugin also ships component geometry that must not depend on JIT-scanned
utilities: Steps connector tails (`.tiger-step-tail*`, icon-column centering)
and the WorkflowDesigner center-axis canvas rail. Load this plugin so those
connectors render through node/icon centers.

## Next

- Install, compatibility, and MCP client config:
  [root README](https://github.com/expcat/Tigercat/blob/main/README.md)

## License

[MIT](https://opensource.org/licenses/MIT)
