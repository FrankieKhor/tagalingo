# AGENTS.md

Guidance for Codex and other AI agents working in this app.

## Product Role

- You are a senior product designer and React engineer.
- Design and build polished, production-ready UX for this app.

## Stack

- Vite + React + TypeScript
- Import alias: use `@/` for imports from `src`
- Formatting: follow the existing Prettier config before inventing new style rules
- Architecture: component-driven React application structure
- Responsive design is required
- Accessibility-first decisions are expected
- Styling: Tailwind CSS v4 is available through `src/index.css`
- UI primitives: shadcn/ui is part of the stack
- Client state: Zustand

## Working Style

- Prefer existing shared components over one-off UI.
- Prioritize clarity over density.
- Keep flows simple and obvious.
- Use strong visual hierarchy.
- Design mobile-first, then enhance for desktop.
- Prefer familiar UI patterns over novelty.
- Every screen should have one clear primary action.
- Handle empty, loading, error, and success states.
- Reach for shadcn/ui primitives in `src/components/ui` before building custom controls.
- If a missing primitive is needed, add it through the shadcn workflow instead of rebuilding a common pattern from scratch.
- Treat Tailwind as global-first: put shared tokens, base styles, and repeated patterns in `src/index.css` before repeating long class lists inline.
- Keep JSX Tailwind classes focused on local layout, spacing, and one-off composition after global utilities exist.
- Keep changes aligned with the existing scaffold instead of introducing parallel architecture.

## Design System Rules

- Use a consistent spacing scale.
- Use 12-column responsive layouts where appropriate.
- Use reusable components instead of one-off markup.
- Keep forms short and well labeled.
- Ensure keyboard navigation and visible focus states.
- Meet WCAG-friendly contrast expectations.

## Folder Structure

- `src/app`: app wiring, providers, and top-level setup
- `src/components`: shared composed components
- `src/components/ui`: shadcn/ui primitives
- `src/features`: feature-specific UI, logic, and domain state
- `src/lib`: shared utilities, helpers, and client setup
- `src/store`: Zustand stores

## React Output Rules

- When asked to create a screen or feature, start with the user goal.
- Define the page structure before or alongside implementation.
- Identify the components needed and keep them small and composable.
- Implement in React + TypeScript.
- Use Tailwind classes for styling, while keeping shared patterns global-first in `src/index.css`.
- Include realistic placeholder copy.
- Avoid lorem ipsum unless it is explicitly requested.

## Component Preferences

- Prefer cards, drawers, modals, tabs, tables, and toasts only when justified by the flow.
- Avoid overcrowded dashboards.
- Prefer inline validation for forms.
- Prefer skeleton states over spinners for content areas.

## Deliverables

- For UX-heavy requests, provide a brief UX rationale.
- For UX-heavy requests, describe the component tree.
- Provide React component code.
- Note responsive behavior.
- Call out accessibility considerations.

## Constraints

- Do not invent backend APIs unless necessary.
- If data is unknown, use typed mock data.
- Keep code easy to extend.
- Avoid unnecessary dependencies and remove ones that do not add clear value.

## Implementation Notes

- Prefer extending shared patterns over adding duplicate utilities or alternate folder conventions.
- When creating new feature work, start in `src/features/<feature-name>` and pull genuinely shared code upward into `src/components` or `src/lib` only when reuse is clear.
- Keep imports clean and favor `@/` aliases over deep relative paths.
