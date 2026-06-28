---
name: tigercat-accessibility
description: Tigercat accessibility keyboard, screen reader, and PR validation checklist
---

# Accessibility

Use automated tests for regressions and manual assistive-technology checks for complex interaction changes.

Accessibility behavior is not exposed as a feature flag. Components that use
focus management, keyboard handling, live regions, or ARIA attributes keep those
semantics when imported; unused components and overlay/focus helpers remain
tree-shakeable through normal subpath imports.

## Keyboard Baseline

- `Tab` / `Shift+Tab`: move between focusable controls.
- `Enter`: activate buttons, links, menu items, highlighted options, or confirm actions.
- `Space`: toggle checkbox, radio, switch, button, and selectable items.
- `Esc`: close the current overlay, cancel temporary state, and restore focus to the trigger.
- Arrow keys: move within composite widgets.
- `Home` / `End`: move to the first or last item in a composite widget.
- `PageUp` / `PageDown`: page through date, time, pagination, or virtualized views.

## Component Expectations

- Forms: labels must be associated with controls; required, disabled, readonly, invalid, and error states must be announced.
- Overlays: Modal and Drawer trap focus while open and restore focus to the trigger when closed.
- Navigation: current, selected, expanded, and disabled states must be exposed through ARIA or semantic markup.
- Tables and data views: headers, sorting, filtering, expanded rows, loading, and empty states must be perceivable.
- Charts: provide a concise accessible name and keyboard access for interactive legends, tooltips, data points, export, zoom, or brush controls; color must not be the only information channel.
- Advanced widgets: drag-and-drop, virtual scrolling, editors, and chat surfaces need keyboard paths or documented limitations.

## Screen Reader Sampling

Recommended matrix:

| Platform | Screen reader | Browser       | Priority                            |
| -------- | ------------- | ------------- | ----------------------------------- |
| Windows  | NVDA          | Firefox       | Required                            |
| Windows  | NVDA          | Chrome / Edge | Recommended                         |
| macOS    | VoiceOver     | Safari        | Required                            |
| macOS    | VoiceOver     | Chrome        | Recommended                         |
| iOS      | VoiceOver     | Safari        | Required for touch-heavy components |

Manual flow:

1. Open the relevant example or minimal reproduction.
2. Complete the main flow with keyboard only.
3. Repeat with a screen reader enabled and verify role, name, state, announcement timing, and focus order.
4. Check disabled, loading, error, empty, dark-mode, and 200% zoom states when relevant.
5. Record blockers, acceptable differences, and follow-up automation ideas.

## PR Checklist

- Update tests for key keyboard paths and focus restoration.
- Run axe-based tests for affected components.
- Add a manual screen-reader note when changing overlays, focus management, ARIA, form validation, notifications, virtual scrolling, drag-and-drop, chart interactions, or editor toolbars.
