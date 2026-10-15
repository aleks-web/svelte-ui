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

For development before publishing, a consuming application can pin a GitHub commit:

```json
{
  "dependencies": {
    "@aleks-web/ui": "github:aleks-web/svelte-ui#<commit-sha>"
  }
}
```

```svelte
<script lang="ts">
  import { Button, Select, TagInput, TreeView, type SelectOption } from '@aleks-web/ui';
</script>
```

Build and validate in this repository:

```bash
npm ci
npm run check
npm pack --dry-run
```

## Tailwind CSS 4

The consuming application must let Tailwind scan the compiled package files. In its main CSS file add a source relative to that file:

```css
@import 'tailwindcss';
@source '../node_modules/@aleks-web/ui/dist';
```

Adjust the relative path from the application's CSS entry point when needed.

## Peer and runtime dependencies

- `svelte` and `tailwindcss` are peer dependencies: the application owns their versions and global CSS setup.
- Melt, Tailwind Variants, `tailwind-merge`, `flowbite-svelte-icons`, `imask` and Splide are runtime dependencies of this package and are installed transitively.
- Consumers import public APIs only from `@aleks-web/ui` or the documented `@aleks-web/ui/stats-grid/persistence` subpath.

## Private publishing

The package is configured for GitHub Packages at `https://npm.pkg.github.com` with restricted access. Repository: [aleks-web/svelte-ui](https://github.com/aleks-web/svelte-ui).

For a standalone clone of this repository:

```bash
npm ci
npm run check
npm publish
```

Publish only after checks and a version bump. Publishing requires a token with `write:packages`.
