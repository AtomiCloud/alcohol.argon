## [Unreleased]

### ✨ Features ✨

* **observability:** integrate Grafana Faro Web SDK with distributed tracing for full-stack observability
  - Add `@grafana/faro-web-sdk` and `@grafana/faro-web-tracing` dependencies
  - Extend 4-tier configuration system with minimal faro settings (enabled, collectorurl, envkey, debug)
  - Implement FaroProvider with TracingInstrumentation for automatic trace context propagation
  - Add manual Next.js router instrumentation for page view tracking and navigation spans
  - Wrap all faro operations in Result monads per project conventions
  - Enable automatic distributed tracing via traceparent headers for backend integration
  - Ensure SSR/hydration safety for Cloudflare Workers deployment
  - Add comprehensive documentation in `docs/developer/Faro.md` with usage examples
  - Compatible with React 19, Next.js 15, OpenNext adapter, and all deployment targets

## [1.3.1](https://github.com/AtomiCloud/alcohol.argon/compare/v1.3.0...v1.3.1) (2025-07-17)


### 🐛 Bug Fixes 🐛

* **default:** incorrect configurations ([#7](https://github.com/AtomiCloud/alcohol.argon/issues/7)) ([9b9fadb](https://github.com/AtomiCloud/alcohol.argon/commit/9b9fadb87f207db3b64ff02949fd5a0966439f73))
* **default:** incorrect configurations ([c4a528b](https://github.com/AtomiCloud/alcohol.argon/commit/c4a528ba86cef04ec29d003e1fd3f24fef6911b5))
* **default:** remove console and revert to node 20 ([#8](https://github.com/AtomiCloud/alcohol.argon/issues/8)) ([c7a9f4b](https://github.com/AtomiCloud/alcohol.argon/commit/c7a9f4b7bcdec2d455d2ce4c108987842870251f))
* **default:** remove console and revert to node 20 ([117193f](https://github.com/AtomiCloud/alcohol.argon/commit/117193fbeea070799ae1167f74c716945c677777))

## [1.3.0](https://github.com/AtomiCloud/alcohol.argon/compare/v1.2.0...v1.3.0) (2025-07-16)


### ✨ Features ✨

* **config:** allow array env var for configurations ([7bed79c](https://github.com/AtomiCloud/alcohol.argon/commit/7bed79ccdecb7ce01dca8528f9de3c293081e436))
* **configuration:** implement hierarchical configuration system ([7712069](https://github.com/AtomiCloud/alcohol.argon/commit/7712069ed02ffaf22a666fbee7483416da60d922))
* **config:** integrate problem with config system ([5dea745](https://github.com/AtomiCloud/alcohol.argon/commit/5dea7458900e36a58975c41ddba08a0936a7f811))


### 🐛 Bug Fixes 🐛

* avoid exposing detailed error messages in production ([1a614b7](https://github.com/AtomiCloud/alcohol.argon/commit/1a614b71ec8ad7c3db20ef0f9b8d8889f642deaf))
* **default:** missing error validation for common hook ([9c9ee80](https://github.com/AtomiCloud/alcohol.argon/commit/9c9ee801c955ff0005ecc8a34cbc9359be95ff39))
* **config:** use OOP for library code as config manager ([c60e027](https://github.com/AtomiCloud/alcohol.argon/commit/c60e027c3780337a3971b9fda70de8b70fea317b))

## [1.2.0](https://github.com/AtomiCloud/alcohol.argon/compare/v1.1.0...v1.2.0) (2025-07-16)


### 📜 Documentation 📜

* **claude.md:** add CLAUDE.md file ([44dd7e4](https://github.com/AtomiCloud/alcohol.argon/commit/44dd7e48a6b1482d163cb00471a6defdadde5a78))
* fix import path in src/lib/problem/README.md ([9c401e7](https://github.com/AtomiCloud/alcohol.argon/commit/9c401e752443e7c9ffa614c76e238a4b12e185f7))
* LLM.MD update on functional monads ([5c943b7](https://github.com/AtomiCloud/alcohol.argon/commit/5c943b7ccdabd2cb2d55a6bcbc00f1cd2f1cb764))
* **default:** monad import path changed ([d4ebfc0](https://github.com/AtomiCloud/alcohol.argon/commit/d4ebfc0db5616c3b03f78a71944e000e0be31f4f))


### ✨ Features ✨

* **problems:** add types to problem registry export ([5f531f5](https://github.com/AtomiCloud/alcohol.argon/commit/5f531f58db014b1f17dbc8d5bb67c80edb19192c))
* added result lib ([aeed8b9](https://github.com/AtomiCloud/alcohol.argon/commit/aeed8b960a2dedd75a0c5d5784a74d44d5c147ee))
* implement RFC 7807 Problem Details error handling system ([7b75758](https://github.com/AtomiCloud/alcohol.argon/commit/7b7575855c1e113d2e7f98bf2d5b1d1529bdbe95))


### 🐛 Bug Fixes 🐛

* **default:** incorrect gitignore ([78c2b2e](https://github.com/AtomiCloud/alcohol.argon/commit/78c2b2ec4215d1ef9af8cff4da8299ac49be5226))
* incorrect return type in documentation ([7e1476c](https://github.com/AtomiCloud/alcohol.argon/commit/7e1476ca117c40954d0563dfe6370ce526072e1c))
* move result type into monad folder ([0b73f69](https://github.com/AtomiCloud/alcohol.argon/commit/0b73f69a343dc60fcb154a40a2880a9e1d6f07cd))
* **default:** review errors ([95ef93d](https://github.com/AtomiCloud/alcohol.argon/commit/95ef93d574f0e4b5d81928e69197c10dbe4c99ea))

## [1.1.0](https://github.com/AtomiCloud/alcohol.argon/compare/v1.0.0...v1.1.0) (2025-07-02)


### ✨ Features ✨

* **layout:** add layout and navbar components ([5054ac5](https://github.com/AtomiCloud/alcohol.argon/commit/5054ac51e8f4ecd8cb55ee8cc36efd25c4f20732))
* **default:** add lottie animations support ([d5a8873](https://github.com/AtomiCloud/alcohol.argon/commit/d5a8873f5d20e80d52991d3399e6edd628840905))
* example using this template ([dab9ffc](https://github.com/AtomiCloud/alcohol.argon/commit/dab9ffc66f08b3ad9f2b7029089bcc34ca97b346))
* **migration:** migrate to biome and deprecate eslint ([6663357](https://github.com/AtomiCloud/alcohol.argon/commit/6663357484f3eda90dabcc886cae3d9eb2a111e0))
* **default:** searching and url sync ([e002230](https://github.com/AtomiCloud/alcohol.argon/commit/e002230a446cef50c4e6caa93ad00ef3c7af0d4e))


### 🐛 Bug Fixes 🐛

* docs and LLM.MD ([bfec2b0](https://github.com/AtomiCloud/alcohol.argon/commit/bfec2b0de30e9ba87a24d5666e497c6796b393c7))

## 1.0.0 (2025-06-30)


### ✨ Features ✨

* **nix:** include semver and wrangler ([39ffd80](https://github.com/AtomiCloud/alcohol.argon/commit/39ffd80f5c2f18d3c0d787a3a8869f942612b275))
* initial commit ([4ef810d](https://github.com/AtomiCloud/alcohol.argon/commit/4ef810d0c6bb66396285328f3c84e1d09ffbfa4c))
* nextjs working ([d0c5f15](https://github.com/AtomiCloud/alcohol.argon/commit/d0c5f15afcfb0a92a4ac3e2db45c69ddd2f0b257))
* **cloudflare:** woker deployment setup ([64a4ed9](https://github.com/AtomiCloud/alcohol.argon/commit/64a4ed9d6d833bd0ff7b78a029818a04a31a438d))
