# Tigercat Component Examples

This directory contains example applications for Tigercat UI components in both Vue 3 and React.

## Structure

```
example/
├── vue3/          # Vue 3 example application
└── react/         # React example application
```

## Vue 3 Example

### Running the Example

```bash
cd examples/example/vue3
pnpm install
pnpm dev
```

The example will be available at `http://localhost:5173`

### Building for Production

```bash
pnpm build
pnpm preview
```

## React Example

### Running the Example

```bash
cd examples/example/react
pnpm install
pnpm dev
```

The example will be available at `http://localhost:5174`

### Building for Production

```bash
pnpm build
pnpm preview
```

## Features

Both examples include:

-- **Home Page**: Overview and quick entry for component examples
- **Individual Component Pages**: Each component has its own dedicated demo page with:
  - Component description
  - Multiple usage examples
  - Different variants, sizes, and states
  - Interactive demos
  - Back-to-home navigation

## Component Categories

### 基础组件 (Basic Components)
- Button
- Icon
- Link
- Text

### 表单组件 (Form Components)
- Input
- Textarea
- Checkbox
- CheckboxGroup
- Radio
- RadioGroup
- Switch
- Slider
- Select
- Form
- FormItem

### 布局组件 (Layout Components)
- Layout
- Container
- Header
- Sidebar
- Content
- Footer
- Grid
- Row
- Col
- Space
- Divider

## Navigation

- Home page: `/`
- Component pages: `/{component-name}` (e.g., `/button`, `/input`, `/layout`)

## Technology Stack

- **Vue 3 Example**: Vue 3 + Vue Router + Vite + TypeScript + Tailwind CSS
- **React Example**: React + React Router + Vite + TypeScript + Tailwind CSS
