# CLI

The CLI covers project creation, component boilerplate, playgrounds, documentation templates, and compatibility checks.

```bash
tigercat create my-app --template vue3
tigercat add Button Form Input --install --snippet src/tigercat-components.ts
tigercat playground --template react --port 3457
tigercat generate test Button --framework both
tigercat generate doc-template Button
tigercat doctor --json
```

`add` supports interactive component selection when no component names are provided. It detects missing Tigercat peer dependencies and can install them with `--install`.
