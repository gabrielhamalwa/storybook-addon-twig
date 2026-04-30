# Sandbox

The sandbox is a [Storybook](https://storybook.js.org/) 10 app under `sandbox/`. Its Storybook config resolves the parent addon package directly, so it exercises the same preset and package entry points without committing machine-specific paths.

Run it with [Bun](https://bun.sh/):

```shell
cd sandbox
bun install
bun run storybook
```

The root [Storybook](https://storybook.js.org/) also points at the sandbox stories:

```shell
bun run storybook
```

Sandbox coverage should include:

- A story with `parameters.twig.source`.
- Empty Twig source.
- Malformed Twig source.
- Long `.html.twig` templates.
- MDX fenced `twig` and `html.twig` blocks.
- Storybook `<Source />` blocks.
- Multiple docs previews on one page.
- Embedded HTML, CSS, and JavaScript inside Twig templates.

## External consumer smoke path

For local integration with an external consumer project, build this package and link it into that project's Storybook sandbox.

```shell
# In this addon repository
bun run build

# In the consumer project
bun add -d file:<path-to-this-repository>
```

Do not commit local filesystem paths from consumer machines into this repository.
