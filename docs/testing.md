# Testing

Run the main checks:

```shell
bun run build
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
- Copy helper behavior.
- Shiki rendering.
- DOM patch cleanup.

Sandbox/browser smoke tests should verify:

- The `Twig` panel appears.
- `parameters.twig.source` renders with highlighting.
- Copy works.
- Line numbers render.
- MDX fenced Twig blocks are patched.
- `<Source language="twig" />` blocks are patched.
- Story navigation keeps one patched block per original code block.

The current CI runs [Bun](https://bun.sh/) install, build, 100% coverage-gated tests, lint, format check, typecheck, root [Storybook](https://storybook.js.org/) build, and standalone sandbox Storybook build.
