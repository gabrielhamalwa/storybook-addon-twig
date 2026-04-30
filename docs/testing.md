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
- Storybook Twig language registration.
- Panel rendering through Storybook's native code viewer.

Sandbox/browser smoke tests should verify:

- The `Twig` panel appears.
- `parameters.twig.source` renders with highlighting.
- Copy works.
- Line numbers render.
- MDX fenced Twig blocks render through Storybook's native code block UI.
- `<Source language="twig" />` blocks use the registered Twig grammar.
- Story navigation does not create duplicate code blocks.

The current CI runs [Bun](https://bun.sh/) install, build, 100% coverage-gated tests, lint, format check, typecheck, root [Storybook](https://storybook.js.org/) build, and standalone sandbox Storybook build.
