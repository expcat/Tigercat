# @expcat/tigercat-mcp

[![npm version](https://img.shields.io/npm/v/@expcat/tigercat-mcp.svg)](https://www.npmjs.com/package/@expcat/tigercat-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Read-only stdio MCP server that routes LLM clients to Tigercat skill references.

Default skill source is GitHub Pages: <https://expcat.github.io/Tigercat/mcp/>.

```bash
npx -y @expcat/tigercat-mcp
```

```bash
tigercat-mcp --root /path/to/Tigercat
tigercat-mcp --base-url https://mirror.example.com/mcp/
tigercat-mcp --doctor
```

`--root` reads a local checkout. `--base-url` (or `TIGERCAT_MCP_BASE_URL`) fetches a mirror.
`--doctor` checks inventory reachability and exits.

Full client config (`claude mcp add`, `mcpServers` JSON):
[root README MCP section](https://github.com/expcat/Tigercat/blob/main/README.md#mcp-接入ai-agent).

## License

[MIT](https://opensource.org/licenses/MIT)
