---
name: tigercat-cli
description: Tigercat CLI commands and validation notes
---

# CLI

Package: `@expcat/tigercat-cli`. CSS / `doctor`: [getting-started.md](getting-started.md).

| Command                          | Purpose                         | Key options                             |
| -------------------------------- | ------------------------------- | --------------------------------------- |
| `tigercat create <name>`         | Create a Vue 3 or React app     | `--template vue3 \| react`              |
| `tigercat add [components...]`   | Add component demos/imports     | `--framework`, `--install`, `--snippet` |
| `tigercat playground`            | Start a temporary preview app   | `--template`, `--port`, `--no-open`     |
| `tigercat generate docs`         | Generate props Markdown from TS | `--input`, `--output`                   |
| `tigercat generate test`         | Generate component test stubs   | `--framework vue3 \| react \| both`     |
| `tigercat generate doc-template` | Generate component doc stubs    | `--output`, `--dry-run`                 |
| `tigercat doctor`                | Validate app environment        | `--json`                                |

CLI templates and `doctor` are Tailwind CSS v4-only. `doctor` fails missing, old, or unverifiable Tailwind and requires `@tailwindcss/vite` v4.

Focused checks: `pnpm --filter @expcat/tigercat-cli build`, `pnpm test -- tests/core/cli.spec.ts`, `pnpm lint`.

Next: [getting-started.md](getting-started.md)
