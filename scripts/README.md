# Tigercat Development Scripts

This directory contains helpful scripts for common development tasks.

## Available Scripts

### 📋 check-env.sh

Checks if your development environment meets all requirements.

**Usage**:
```bash
./scripts/check-env.sh
# Or via npm script
pnpm dev:check
```

**What it checks**:
- Node.js version (>= 18.0.0)
- pnpm version (>= 8.0.0)
- Dependencies installation
- Package build status

**Example output**:
```
🐯 Tigercat Development Environment Check
==========================================

Checking Node.js...
✓ Node.js: 20.19.6 (required: >= 18.0.0)

Checking pnpm...
✓ pnpm: 10.26.2 (required: >= 8.0.0)

Checking dependencies...
✓ Dependencies are installed

Checking build artifacts...
✓ All packages are built

==========================================
✓ Environment check passed! You're ready to develop.
```

---

### 🚀 run-demos.sh

Runs both Vue3 and React demos simultaneously.

**Usage**:
```bash
./scripts/run-demos.sh
# Or via npm script
pnpm demo:all
```

**What it does**:
- Starts Vue3 demo on http://localhost:5173
- Starts React demo on http://localhost:5174
- Manages both processes
- Provides cleanup on exit (Ctrl+C)
- Writes logs to `/tmp/vue3-demo.log` and `/tmp/react-demo.log`

**Example output**:
```
🐯 Starting Tigercat Demos
==========================

Starting Vue3 demo on http://localhost:5173
Starting React demo on http://localhost:5174

✓ Both demos are starting...

  Vue3:  http://localhost:5173
  React: http://localhost:5174

Logs:
  Vue3:  /tmp/vue3-demo.log
  React: /tmp/react-demo.log

Press Ctrl+C to stop both servers
```

**Tips**:
- Press Ctrl+C to stop both servers
- Check log files if demos fail to start
- Ensure ports 5173 and 5174 are available

---

### 🔧 setup.sh

One-command setup for new developers.

**Usage**:
```bash
./scripts/setup.sh
# Or via npm script
pnpm setup
```

**What it does**:
1. Checks Node.js installation
2. Installs pnpm (if not installed)
3. Installs project dependencies
4. Builds all packages
5. Runs environment check
6. Provides next steps

**Example output**:
```
🐯 Tigercat Development Setup
==============================

✓ Node.js 20.19.6 detected
Installing pnpm...
✓ pnpm installed

Installing dependencies...
[pnpm install output]

Building packages...
[build output]

[environment check output]

==============================
✓ Setup complete!

Next steps:
  1. Read DEVELOPMENT.md for development guidelines
  2. Run 'pnpm test' to run all tests
  3. Run 'pnpm demo:vue' or 'pnpm demo:react' to see the demos
  4. Run 'pnpm dev' for watch mode during development
```

---

## Usage from npm Scripts

All scripts are also available as npm scripts in `package.json`:

| npm script | Script file | Description |
|------------|-------------|-------------|
| `pnpm dev:check` | `check-env.sh` | Check environment |
| `pnpm demo:all` | `run-demos.sh` | Run both demos |
| `pnpm setup` | `setup.sh` | Initial setup |

Additionally, convenience scripts in `package.json`:

| npm script | Description |
|------------|-------------|
| `pnpm demo:vue` | Run Vue3 demo only |
| `pnpm demo:react` | Run React demo only |
| `pnpm test:vue` | Run Vue tests only |
| `pnpm test:react` | Run React tests only |

## Requirements

- **Bash**: All scripts require bash shell
- **Permissions**: Scripts are executable (`chmod +x`)
- **Environment**: Scripts assume they're run from project root

## Troubleshooting

### Script Permission Denied

If you get a permission error:

```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### Scripts Not Found

Ensure you're running from project root:

```bash
# Check current directory
pwd
# Should output: /path/to/tigercat

# Run from root
./scripts/check-env.sh
```

### Windows Users

These scripts are designed for Unix-like systems (Linux, macOS). Windows users should use:

1. **WSL (Windows Subsystem for Linux)** - Recommended
2. **Git Bash** - Should work with most scripts
3. **PowerShell/CMD** - Use npm scripts instead:
   ```powershell
   pnpm dev:check
   pnpm demo:all
   pnpm setup
   ```

## Contributing

When adding new scripts:

1. Create the script in this directory
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Add usage documentation to this README
4. Add corresponding npm script to `package.json` if appropriate
5. Include error handling and helpful output messages
6. Use `set -e` to exit on errors
7. Provide cleanup on exit (use `trap` for signal handling)

## See Also

- [DEVELOPMENT.md](../DEVELOPMENT.md) - Development guide
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contributing guide
- [README.md](../README.md) - Project overview
