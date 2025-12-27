# Tigercat Component Demos

This directory contains demo applications for Tigercat UI components in both Vue 3 and React.

## Structure

```
demo/
├── vue3/          # Vue 3 demo application
└── react/         # React demo application
```

## Vue 3 Demo

### Running the Demo

```bash
cd examples/demo/vue3
pnpm install
pnpm dev
```

The demo will be available at `http://localhost:5173`

### Building for Production

```bash
pnpm build
pnpm preview
```

## React Demo

### Running the Demo

```bash
cd examples/demo/react
pnpm install
pnpm dev
```

The demo will be available at `http://localhost:5173`

### Building for Production

```bash
pnpm build
pnpm preview
```

## Features

Both demos include:

- **Home Page**: Overview of all 26 available components organized by category
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

- **Vue 3 Demo**: Vue 3 + Vue Router + Vite + TypeScript + Tailwind CSS
- **React Demo**: React + React Router + Vite + TypeScript + Tailwind CSS
