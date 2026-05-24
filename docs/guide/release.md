# Release

Tigercat uses Changesets for version planning and package publishing.

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

All package versions are fixed together so `@expcat/tigercat-core`, `@expcat/tigercat-vue`, `@expcat/tigercat-react`, and `@expcat/tigercat-cli` stay aligned.

Use prerelease channels for preview builds.

```bash
pnpm release:next
pnpm release:canary
```
