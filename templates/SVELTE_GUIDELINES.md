# Svelte UI Guidelines (Global Baseline)

Purpose
- Provide global, sensible defaults for Svelte/SvelteKit implementation quality and style.
- Projects may override any rule via a local file or project config.

Override Order (highest precedence first)
- ./.opencode/svelte-guidelines.(md|yaml|yml)
- ./.opencode/project.yaml → web.conventions.svelte (or web.conventions.*)
- Global baseline (this file)

Conventions
- State & reactivity (Svelte 5): Use runes — `$state` for local mutable state, `$derived` for computed values, and `$effect` for side effects (return a cleanup when needed). Do not use legacy `$:` reactive statements.
- Props (Svelte 5): Use `$props()` to receive props; destructure from `$props()` as needed. Use `$bindable()` to explicitly opt in to two‑way binding for a prop; avoid implicit two‑way binding.
- Stores: Use stores only for cross‑component or app‑level state. Do not use stores for purely local component state; prefer runes. Derive values from stores with `$derived` rather than `$:` chains.
- Events: Use DOM-style `on*` attributes (e.g., `onclick`, `oninput`) in templates instead of `on:` directives. For component-to-parent communication, prefer callback props (e.g., `export let onIncrement;` then `onclick={onIncrement}` in the child). Do not use `createEventDispatcher`.
- Bindings & actions: Prefer `bind:value`, `bind:group`, and `bind:this`; use `use:` actions for DOM behavior.
- File structure: Idiomatic SvelteKit routing (`+page`, `+layout`, server/client files). Colocate state and styles with the component; keep modules ESM-only.
- Forms: Prefer SvelteKit form actions with progressive enhancement via `enhance`. Call `invalidate` after mutations to refresh affected data dependencies.
- Data loading: Use `load` functions; keep server/client boundaries explicit; avoid leaking secrets to the client.
- Transitions/animations: Prefer built‑ins (e.g., `fade`, `fly`) where they meet UX needs; respect reduced-motion preferences.
- Accessibility: Provide labels for inputs and interactive elements; manage keyboard focus for overlays/dialogs.
- Dependencies: Keep minimal; avoid heavy UI libs unless justified.

Legacy syntax to avoid in new code
- `export let` for props — favor `$props()` in new components.
- Broad `$:` reactive blocks — prefer `$derived` and `$effect`.
- Two‑way binding to arbitrary props — opt in with `$bindable()` instead.
- `on:` event directives — use DOM `on*` attributes like `onclick` instead.

Testing
- Prefer lightweight component tests (@testing-library/svelte). Use Playwright only for flows that require end-to-end behavior.

Notes
- These are defaults. If a project specifies different conventions, follow the project.
