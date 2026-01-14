# Tigercat Development Scripts

This directory contains helpful scripts for common development tasks.

## Available Scripts

### 📋 check-env (cross-platform)

Checks if your development environment meets all requirements.

**Usage**:

```bash
node ./scripts/check-env.mjs
# Or via pnpm script
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

### 🚀 run-examples (cross-platform)

Runs both Vue3 and React example apps simultaneously.

**Usage**:

```bash
node ./scripts/run-examples.mjs
# Or via pnpm script
pnpm example:all

# Smoke test (starts then stops automatically)
pnpm example:all -- --smoke
pnpm example:all -- --smoke --smoke-ms=2000
```

**What it does**:

- Starts Vue3 example on http://localhost:5173
- Starts React example on http://localhost:5174
- Manages both processes
- Provides cleanup on exit (Ctrl+C)
- If example app dependencies are missing, runs `pnpm install` automatically

**Example output**:

```
🐯 Starting Tigercat Examples
==========================

Starting Vue3 example on http://localhost:5173
Starting React example on http://localhost:5174

✓ Both examples are starting...

  Vue3:  http://localhost:5173
  React: http://localhost:5174

Press Ctrl+C to stop both servers
```

**Tips**:

- Press Ctrl+C to stop both servers
- Check the terminal output if examples fail to start
- Ensure ports 5173 and 5174 are available

---

### 🔧 setup (cross-platform)

One-command setup for new developers.

**Usage**:

```bash
node ./scripts/setup.mjs
# Or via pnpm script
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
  3. Run 'pnpm example:vue' or 'pnpm example:react' to see the examples
  4. Run 'pnpm dev' for watch mode during development
```

---

## Usage from npm Scripts

All scripts are also available as npm scripts in `package.json`:

| npm script         | Script file        | Description       |
| ------------------ | ------------------ | ----------------- |
| `pnpm dev:check`   | `check-env.mjs`    | Check environment |
| `pnpm example:all` | `run-examples.mjs` | Run both examples |
| `pnpm setup`       | `setup.mjs`        | Initial setup     |

Additionally, convenience scripts in `package.json`:

| npm script           | Description            |
| -------------------- | ---------------------- |
| `pnpm example:vue`   | Run Vue3 example only  |
| `pnpm example:react` | Run React example only |
| `pnpm test:vue`      | Run Vue tests only     |
| `pnpm test:react`    | Run React tests only   |

## Requirements

- **Node.js**: Scripts run via Node (recommended on Windows)
- **Environment**: Scripts assume they're run from project root

## Troubleshooting

### Scripts Not Found

Ensure you're running from project root:

```bash
# Check current directory
pwd
# Should output: /path/to/tigercat

# Run from root
node ./scripts/check-env.mjs
```

### Windows Users

These scripts are now cross-platform. Use the pnpm scripts from PowerShell/CMD:

```powershell
pnpm dev:check
pnpm example:all
pnpm setup
```

## Contributing

When adding new scripts:

1. Create the script in this directory
2. Add usage documentation to this README
3. Add corresponding pnpm script to `package.json` if appropriate
4. Include error handling and helpful output messages

## See Also

- [DEVELOPMENT.md](../DEVELOPMENT.md) - Development guide
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contributing guide
- [README.md](../README.md) - Project overview

---

### ✅ validate-tests (cross-platform)

Validates test files against quality standards defined in `tests/TEST_QUALITY_GUIDELINES.md`.

**Usage**:

```bash
node ./scripts/validate-tests.mjs
# Or via pnpm script
pnpm test:validate
```

**What it checks**:

- Test file structure (required describe blocks)
- Test naming conventions ("should" statements)
- Edge case coverage
- Accessibility testing
- Type safety (no 'any' usage)
- Test count per file

**Quality Checks**:

1. **Test Categories**: Rendering, Props, Events, States, Accessibility, Snapshots
2. **Test Naming**: "should" statement format
3. **Edge Cases**: Edge Cases or Boundary describe blocks
4. **Accessibility**: `expectNoA11yViolations` usage
5. **Type Safety**: Avoidance of 'any' type
6. **Test Count**: Minimum based on component complexity

**Example output**:

```
🐯 Tigercat Test Quality Validation
====================================

Checking: Button.spec.tsx
  📊 Test count: 48
  ✓ All checks passed

Checking: Upload.spec.tsx
  📊 Test count: 38
  ⚠ Test count below recommended minimum (50)
  ⚠ No Edge Cases or Boundary tests found
  ✗ 1 issue(s) found

====================================
📈 Validation Summary
====================================
Total files checked: 8
Passed: 1
Failed: 7
Warnings: 18

❌ Validation failed! Please address the issues above.
See tests/TEST_QUALITY_GUIDELINES.md for detailed standards.
```

**Exit Codes**:

- `0`: All tests pass quality standards
- `1`: One or more tests failed

**CI Integration**: Can be added to CI/CD pipeline to enforce quality before merge.
