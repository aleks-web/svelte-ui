# @aleks-web/ui

Private Svelte 5 component library shared by Aleks Web applications. Components are domain-agnostic, use the SaaS visual language, Tailwind CSS 4, Tailwind Variants and Melt where an accessible builder is useful.

The complete component API and examples are in [COMPONENTS.md](./COMPONENTS.md). Rules for AI agents and contributors are in [AGENTS.md](./AGENTS.md).

## Installation from GitHub Packages

Configure the private registry and a token with `read:packages` in the consuming project's `.npmrc`:

```ini
@aleks-web:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then install the package:

```bash
npm install @aleks-web/ui
```

Do not commit a real registry token.

## Local workspace use

The monorepo root declares `packages/ui` as an npm workspace. A sibling application installs it as a normal dependency:

```json
{
  "dependencies": {
    "@aleks-web/ui": "0.1.0"
  }
}
```

```svelte
<script lang="ts">
  import { Button, Select, type SelectOption } from '@aleks-web/ui';
</script>
```

Build and validate from the MyService workspace root:

```bash
npm run ui:build
npm run ui:check
```

## Tailwind CSS 4

The consuming application must let Tailwind scan the package source. In its main CSS file add a source relative to that file:

```css
@import 'tailwindcss';
@source '../../../packages/ui/src/lib';
```

For an installed package outside this monorepo, point `@source` at its compiled Svelte files. Adjust the relative path from the application's CSS entry point:

```css
@source '../node_modules/@aleks-web/ui/dist';
```

## Peer and runtime dependencies

- `svelte` and `tailwindcss` are peer dependencies: the application owns their versions and global CSS setup.
- Melt, Tailwind Variants, `tailwind-merge`, `flowbite-svelte-icons` and `imask` are runtime dependencies of this package and are installed transitively.
- Consumers import public APIs only from `@aleks-web/ui` or the documented `@aleks-web/ui/stats-grid/persistence` subpath.

## Private publishing

The package is configured for GitHub Packages at `https://npm.pkg.github.com` with restricted access. Repository: [aleks-web/svelte-ui](https://github.com/aleks-web/svelte-ui).

For a standalone clone of this repository:

```bash
npm ci
npm run check
npm publish
```

From the MyService workspace root:

```bash
npm publish --workspace @aleks-web/ui
```

Publish only after checks and a version bump. Publishing requires a token with `write:packages`.
