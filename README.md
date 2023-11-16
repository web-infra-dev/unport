<p align="center">
  <img alt="Unport Logo" src="./logo.png" width="400">
</p>

<div align="center">

[![MIT licensed][license-badge]][license-url]
[![Build Status][ci-badge]][ci-url]
[![npm version][npm-badge]][npm-url]
[![Code Coverage][code-coverage-badge]][code-coverage-url]

</div>

# 🌍 Unport

`Unport` is a Universal Port for cross JSContext communication with 100% type inference capabilities. Built to make communication between different JSContexts not only possible but easy and with robust typing. This is designed by [ULIVZ](https://github.com/ULIVZ) to bridge the gap between complex JSContext environments such as Node.js, Node.js Child Process, Webviews, Webworker, and iframes.

## 🚀 The Problem and Our Solution
In many development scenarios, we have multiple JSContexts that need to communicate with each other. These can be Node.js processes, Webviews, Web Workers, iframes, etc. Each of these JSContexts has its own way of communication, and lack of typing can make code maintenance quite difficult for complex cross JSContext communication scenarios.

`Unport` strives to address these issues and provide a streamlined way to handle cross JSContext communication in three ways:

1. ### Unified Port Paradigm:
Unport uses a unified port paradigm for communication. We abstract the complexity behind a simple-to-use Port, making it easier for you to manage cross-JSContext communication.

2. ### Robust Typing:
With the power of TypeScript, Unport provides 100% type inference capability. You only need to focus on managing the communication types between different JSContexts. The rest of the complex work of ensuring typed communication is handled by Unport.

## 🌈 Quick Start
To install Unport, use the following command:

```bash
npm install unport
```

## 🍕 Examples
 
You can find usage examples under the `/examples` folder of this repository.

## 📚 API Documentation

Check out our comprehensive API documentation [here](url-to-your-documentation).

## 👏 Contributing

Contributions of any kind are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to get started.

## 👥 Maintainers

[@ULIVZ](https://github.com/ULIVZ)

## 📜 License

Unport is free and open-source software licensed under the [MIT License](./LICENSE).

[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: ./LICENSE
[ci-badge]: https://github.com/ULIVZ/unport/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/ULIVZ/unport/actions/workflows/ci.yml
[npm-badge]: https://img.shields.io/npm/v/unport/latest?color=brightgreen
[npm-url]: https://www.npmjs.com/package/unport
[code-coverage-badge]: https://codecov.io/github/ULIVZ/unport/branch/main/graph/badge.svg
[code-coverage-url]: https://codecov.io/gh/ULIVZ/unport