# Contributing

Contributions should keep the addon focused on reliable [Storybook](https://storybook.js.org/) source display for [Twig](https://twig.symfony.com/) projects.

## Development environment

Install [Bun](https://bun.sh/), then install dependencies:

```shell
bun install
```

Run the main checks:

```shell
bun run build
bun run test
bun run lint
bun run format:check
```

Run the development Storybook:

```shell
bun run storybook
```

Run the sandbox directly:

```shell
cd sandbox
bun install
bun run storybook
```

## Project layout

| Path              | Purpose                                                   |
| ----------------- | --------------------------------------------------------- |
| `src/manager.tsx` | Registers the Twig addon panel in the Storybook manager   |
| `src/preview.ts`  | Installs optional docs/source code-block patching         |
| `src/preset.ts`   | Wires manager and preview entries into Storybook          |
| `src/panel`       | React UI for the Twig panel                               |
| `src/highlight`   | [Shiki](https://shiki.style/) rendering utilities         |
| `src/runtime`     | DOM patching, source collection, and copy utilities       |
| `sandbox`         | Storybook 10 app used for manual and browser smoke checks |

## Pull requests

Pull requests should include tests when they change source collection, highlighting, DOM patching, or public options. UI changes should include a sandbox story that demonstrates the behavior.
