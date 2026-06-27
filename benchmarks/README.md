# Benchmark Coverage Map

Tigercat benchmarks are advisory performance probes. They are not a PR release
gate and do not define hard regression thresholds because shared CI runners make
micro-benchmark timings noisy. Use `pnpm bench --run` locally or the scheduled
`.github/workflows/bench.yml` artifact to compare JSON output between runs.

## Suites

| Suite                           | Covered area                                                                    | Primary signal                                        |
| ------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `chart-svg-generation.bench.ts` | Chart SVG path and shape generation                                             | Large line/area paths, pie/donut arcs, radar polygons |
| `core-utils.bench.ts`           | Shared chart, virtual range, tree map, sunburst, gauge, and interaction helpers | Broad core utility throughput                         |
| `descriptions.bench.ts`         | Descriptions row grouping and class generation                                  | Dense description table layout prep                   |
| `form-validation.bench.ts`      | Form validation helpers                                                         | Full-form and changed-field validation cost           |
| `table-large-data.bench.ts`     | Table sort/filter/pagination and class preparation                              | Large row sets and wide table prep                    |
| `tree-virtualization.bench.ts`  | Tree flattening and search expansion                                            | Large visible-tree and filtered-tree transforms       |
| `virtual-scroll-fps.bench.ts`   | Virtual scrolling frame calculations                                            | 60-frame range calculation loops                      |
| `virtual-table.bench.ts`        | VirtualTable range, fixed-column, key, class, and style helpers                 | Large virtual table render prep                       |

## Maintenance Rules

- Add a row here when adding a new `benchmarks/*.bench.ts` suite.
- Keep benchmark cases focused on deterministic pure helpers or stable render
  preparation work.
- Prefer adding regular tests for correctness; benchmarks should only describe
  performance-sensitive paths.
- Keep CI benchmark output advisory unless a future task defines a stable
  hardware-independent threshold.
