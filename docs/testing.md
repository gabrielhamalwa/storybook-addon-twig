# Testing

Run the main checks:

```shell
bun run build
bun run check:package
bun run typecheck
bun run coverage
bun run lint
bun run format:check
bun run build-storybook
cd sandbox && bun install --frozen-lockfile && bun run build-storybook
```

Unit tests cover:

- Option normalization.
- Source collection.
- Storybook Twig language registration.
- Preview runtime docs patching for Twig MDX/`Source` blocks.
- Panel rendering and source display options.

Sandbox/browser smoke tests should verify:

- The `Twig` panel appears.
- `parameters.twig.source` renders with highlighting.
- Copy works.
- `copy: false` hides the Copy toolbar action.
- Line numbers render.
- MDX fenced Twig blocks are replaced by the addon docs patcher.
- `<Source language="twig" />` blocks are replaced by the addon docs patcher.
- Non-Twig fences still use Storybook's default docs code rendering.
- Toolbar sync icon refreshes the story render.
- Storybook dev mode loads the sandbox without browser console errors.
- The injected addon options contain only addon configuration keys.

The current CI runs [Bun](https://bun.sh/) install, build, 100% coverage-gated tests, lint, format check, typecheck, root [Storybook](https://storybook.js.org/) build, and standalone sandbox Storybook build.
