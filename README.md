<h1 align="center">ts-lib-template</h1>

<p align="center">
    A hassle-free TS library template.
</p>

<p align="center">
    <a href="https://npmjs.com/package/ts-lib-template"><img src="https://img.shields.io/npm/v/ts-lib-template.svg?style=flat" alt="NPM version"></a> 
    <a href="https://npmjs.com/package/ts-lib-template"><img src="https://img.shields.io/npm/dm/ts-lib-template.svg?style=flat" alt="NPM downloads"></a> 
    <a href="https://circleci.com/gh/saojs/ts-lib-template"><img src="https://img.shields.io/circleci/project/saojs/ts-lib-template/master.svg?style=flat" alt="Build Status"></a> 
</p>

## Quick Start

1. Click "Use this template" at this repository.
2. Rename all `ts-lib-template` to your package name.
3. Commands:

```bash
npm run bootstrap   # install dependencies
npm run clean       # clean dependencies
npm run dev         # development both cjs and esm output
npm run build       # build both cjs and esm
npm run lint        # lint code
npm run lint:fix    # fix all code lint errors
npm run test        # run all tests
npm run cov         # run all tests and generate coverage report
npm run release     # release this package
```

## Features

- TypeScript by default.
- Output both `cjs` and `esm`.
- Unit test with [jest](https://facebook.github.io/jest/).
- Format code with [eslint](https://eslint.org/docs).
- Fix and format code on each commit.
- Leverage [quick-publish](https://github.com/ulivz/quick-publish) for release flow.

## License

MIT &copy; [ULIVZ](https://github.com/ulivz)
