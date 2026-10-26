# @expcat/tigercat-mcp

[![npm version](https://img.shields.io/npm/v/@expcat/tigercat-mcp.svg)](https://www.npmjs.com/package/@expcat/tigercat-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Read-only stdio MCP server that routes LLM clients to Tigercat skill references.

By default, skills come from the snapshot shipped with the installed package and work offline.

Use the preview channel `@next` with the current documentation, or omit it for stable. Match the MCP version to the Tigercat version used by your app; see the [root README](https://github.com/expcat/Tigercat/blob/main/README.md).

```bash
npx -y @expcat/tigercat-mcp@next
# Stable: npx -y @expcat/tigercat-mcp
```

```bash
tigercat-mcp --root /path/to/Tigercat
tigercat-mcp --base-url https://mirror.example.com/mcp/
tigercat-mcp --doctor
```

`--root` reads a local checkout. `--base-url` (or `TIGERCAT_MCP_BASE_URL`) selects an explicit mirror whose version and file SHA-256 digests must match the package.
`--doctor` checks the selected source's inventory and readability, including remote body digests, and exits.

Full client config (`claude mcp add`, `mcpServers` JSON):
[root README MCP section](https://github.com/expcat/Tigercat/blob/main/README.md#mcp-接入ai-agent).

## License

[MIT](https://opensource.org/licenses/MIT)
