# CalVer Release Action

## CalVer

> CalVer is a versioning convention based on your project's release calendar, instead of arbitrary numbers. 
 
[Source](https://calver.org/)

## Usage

### Inputs

- api_token (*REQUIRED*): GitHub token to be used for this action
- dry_run (*OPTIONAL*): Whether to publish a release or just print supposed version (default: `false`)
- generate_release_notes (*OPTIONAL*): Whether to generate release notes (default: `true`)
- timezone (*OPTIONAL*): Timezone to be used for version generations (default: `utc`; example: `Asia/Tokyo`)
- target_commitish (*OPTIONAL*): Target commitish to be used for release. The default value is SHA of current workflow context. (example: `78cb8a7`/`main`)
- release_title (*OPTIONAL*): Title format for the release. ${version} can be used and replaced as the generated version string. (default: `Release ver. ${version}`; example: `New Release: ${version}`)

### Outputs

- version: Generated string of new version (currently only `YYYY.0M.MINOR` is supported)
- url: GitHub url for the published release
- title: Generated string of the release title

### Example

```yaml
name: Publish

on:
  workflow_dispatch:
concurrency:
  publish_version
jobs:
  publish:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v3
      - uses: cho0o0/calver-release-action@2022.12.1
        with:
          generate_release_notes: true
          dry_run: false
          # Do not use GITHUB_TOKEN if you want to trigger other workflows
          timezone: 'utc'
          api_token: ${{secrets.GITHUB_TOKEN}}
          release_title: '${version}'
```

## Development

> This action now targets the Node 20 runtime on GitHub Actions. Use Node 20 (or at least ≥18) locally to match the production environment.

Install the dependencies
```bash
$ npm install
```

Build the TypeScript, then bundle (via ncc) for distribution (Node 20 runtime expects `dist/index.js`)
```bash
$ npm run build && npm run package
```

### Code Quality (Biome)

Biome replaces prior ESLint/Prettier setup.

Format (write changes):
```bash
$ npm run format
```

Format check (no changes, CI-friendly):
```bash
$ npm run format-check
```

Lint (analysis + formatting suggestions):
```bash
$ npm run lint
```

Apply autofixable lint issues:
```bash
$ npm run lint-fix
```

Run the tests :heavy_check_mark:  
```bash
$ npm test
```

### Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  dry_run: true
  api_token: ${{secrets.GITHUB_TOKEN}}
```
