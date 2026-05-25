---
name: tigercat-release
description: Tigercat release commands, validation set, and published package smoke test
---

# Release

Tigercat uses Changesets for version planning and package publishing. All package versions are fixed together so `@expcat/tigercat-core`, `@expcat/tigercat-vue`, `@expcat/tigercat-react`, and `@expcat/tigercat-cli` stay aligned.

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

Use prerelease channels for preview builds.

```bash
pnpm release:next
pnpm release:canary
```

Before publishing, run the validation set appropriate to the release scope. For package releases, prefer at least `pnpm lint`, `pnpm build`, `pnpm test`, `pnpm test:validate`, `pnpm api:validate`, and `pnpm size`.

After publishing, run the published package smoke test when validating npm artifacts.

```bash
pnpm smoke:published
```
