# Release

Releases are [npm](https://www.npmjs.com/)-only for now.

1. Update `package.json` version.
2. Run checks:

   ```shell
   bun run build
   bun run typecheck
   bun run coverage
   bun run lint
   bun run format:check
   bun run build-storybook
   cd sandbox && bun install --frozen-lockfile && bun run build-storybook
   ```

3. Create and push a tag:

   ```shell
   git tag v0.1.0
   git push origin v0.1.0
   ```

4. The release workflow publishes to [npm](https://www.npmjs.com/) with [provenance](https://docs.npmjs.com/generating-provenance-statements).

The workflow skips publishing if the tagged version already exists on [npm](https://www.npmjs.com/).
