---
name: tigercat-cli
description: Tigercat CLI commands, source files, and validation notes
---

# CLI

Package: `@expcat/tigercat-cli`. Source lives in `packages/cli/src` and tests in `tests/core/cli.spec.ts`.

| Command                          | Purpose                         | Key options                             |
| -------------------------------- | ------------------------------- | --------------------------------------- |
| `tigercat create <name>`         | Create a Vue 3 or React app     | `--template vue3 / react`               |
| `tigercat add [components...]`   | Add component demos/imports     | `--framework`, `--install`, `--snippet` |
| `tigercat playground`            | Start a temporary preview app   | `--template`, `--port`, `--no-open`     |
| `tigercat generate docs`         | Generate props Markdown from TS | `--input`, `--output`                   |
| `tigercat generate test`         | Generate component test stubs   | `--framework vue3 / react / both`       |
| `tigercat generate doc-template` | Generate component doc stubs    | `--output`, `--dry-run`                 |
| `tigercat doctor`                | Validate app environment        | `--json`                                |

## Tailwind v4 Baseline

CLI templates and `doctor` are Tailwind CSS v4-only. New app CSS must use:

```css
@import 'tailwindcss';
@plugin "@expcat/tigercat-core/tailwind/modern";
```

`doctor` should fail missing, old, or unverifiable Tailwind setup; it should also require `@tailwindcss/vite` v4.

## Files

| Area      | Files                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Entry     | `packages/cli/src/index.ts`, `packages/cli/src/constants.ts`           |
| Commands  | `packages/cli/src/commands/{create,add,playground,generate,doctor}.ts` |
| Templates | `packages/cli/src/templates/{vue3,react}.ts`                           |
| Utilities | `packages/cli/src/utils/{fs,logger}.ts`                                |
| Tests     | `tests/core/cli.spec.ts`                                               |

## Validate

Use focused validation for CLI changes: `pnpm --filter @expcat/tigercat-cli build`, `pnpm test -- tests/core/cli.spec.ts`, and `pnpm lint` when command source changes.
