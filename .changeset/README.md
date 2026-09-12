# Changesets in this repo

Tigercat **does not** cut versions with `changeset version`. Cuts use:

```sh
pnpm changeset          # add a top-level .changeset/*.md log for the cut
node scripts/sync-version.mjs <version>
```

`pnpm version-packages` (`changeset version`) is **not** the release path. Published entries live in [`published/`](./published/) so a later `changeset version` cannot stack old minors (2.7.0 + 2.8.0 → 2.9.0).

After a cut, move the new `.md` into `published/`. Do not delete those files; they are the version log.
