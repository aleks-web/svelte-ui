# Rules for `@aleks-web/ui`

These rules apply to the reusable Svelte component package in this directory.

## Package boundary

- Put every new reusable, domain-agnostic Svelte component in `packages/ui/src/lib`.
- Keep restaurant, tenant, billing, order, customer and other product-specific rules out of this package. Compose package primitives in the consuming application instead.
- Do not create a second primitive for an existing responsibility. Extend the existing component with a backward-compatible prop, snippet or variant when that remains generally useful.
- Keep the package usable by a Svelte 5 application without aliases owned by a consuming project. Imports inside the package must be relative or package dependencies.
- Export every supported public component, constant and type from `src/lib/index.ts`. An unexported file is internal and must not be imported through a deep path.

## Design and implementation

- Use Tailwind Variants for reusable visual variants. Keep the recipe beside the component in `*.variants.ts`.
- Prefer Melt builders for accessible interactive primitives when an appropriate builder exists.
- Preserve keyboard navigation, focus visibility, ARIA names, disabled states, form behavior and Svelte bindability.
- Prefer snippets and callbacks over domain-specific markup or data shapes.
- Treat exported props, types, constants and subpath exports as a public API. Avoid breaking changes unless the task explicitly authorizes them.

## Mandatory documentation

Whenever a component is added, removed or renamed, or a public prop, type, default, variant or behavior changes, update in the same task:

1. `COMPONENTS.md` — complete AI/human API reference and examples;
2. `README.md` — when installation, dependencies, exports or package-level setup changes;
3. the SaaS-admin component laboratory at `/dev/components` — registry metadata and a live state/example;
4. `src/lib/index.ts` — public exports.

Documentation must describe implemented behavior only. Do not leave stale props or examples.

## Verification

- Run `npm run ui:check` from the workspace root after package changes.
- Run `npm --prefix svelte run check` and `npm --prefix svelte run build` after public API, styling or component behavior changes.
- Run `npm pack --workspace @aleks-web/ui --dry-run` when package exports or published files change.
- Search the consuming application for obsolete deep imports after moving or renaming a component.

