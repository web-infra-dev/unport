<p align="center">
  <img alt="Unport Logo" src="./.media/logo.png" width="400">
</p>

<div align="center">

[![NPM version][npm-badge]][npm-url]
[![Build Status][ci-badge]][ci-url]
[![Code Coverage][code-coverage-badge]][code-coverage-url]

</div>

## 🛰️ Unport

Unport is a Universal Port with strict type inference capability for cross-JSContext communication.

Unport is designed to solve the complexity of JSContext environments such as Node.js, Webview, subprocess, Web Worker, worker_threads, WebSocket, iframe, MessageChannel, ServiceWorker, etc. Each JSContext communicates with the outside world in different ways, and the lack of types makes the code for complex cross JSContext communication projects difficult. In complex large projects, it is often difficult to know where the message is going and what fields the recipient needs.

## 💡 Features

<img alt="Unport Logo" src="./.media/type-infer.png">

1. Provides a unified Port paradigm. You only need to define the message types that different JSContexts need to pass, and you will have a complete type of unified Port (Unport).
2. 100% type inference. Users only need to maintain the types of communication between JSContexts, and leave the rest to unport.
3. Lightweight and succinct API.

## ⚡️ Quick Start

To implement a process of sending messages after a parent-child process is connected:

1. Define Message Definition:

```ts
import { UnPort } from 'unport';

export type Definition = {
  parent2child: {
    syn: {
      pid: string;
    };
    body: {
      name: string;
      path: string;
    }
  };
  child2parent: {
    ack: {
      pid: string;
    };
  };
};

export type ChildPort = UnPort<Definition, 'child'>;
export type ParentPort = UnPort<Definition, 'parent'>;
```

2. Parent process implementation:

```ts
// parent.ts
import { join } from 'path';
import { fork } from 'child_process';
import { UnPort, UnportChannelMessage } from '../../src';
import { ParentPort } from './port';

// 1. Initialize a port
const parentPort: ParentPort = new UnPort();

// 2. Implement a universal port based on underlying IPC capabilities
const childProcess = fork(join(__dirname, './child.js'));
parentPort.implementChannel({
  send(message) {
    childProcess.send(message);
  },
  accept(pipe) {
    childProcess.on('message', (message: UnportChannelMessage) => {
      pipe(message);
    });
  },
});

// 3. Post and listen message
parentPort.postMessage('syn', { pid: 'parent' });
parentPort.onMessage('ack', payload => {
  console.log('[parent] [ack]', payload.pid);
  parentPort.postMessage('body', {
    name: 'index',
    path: ' /',
  });
});

```

3. Child process implementation:

```ts
// child.ts
import { UnPort, UnportChannelMessage } from '../../src';
import { ChildPort } from './port';

// 1. Initialize a port
const childPort: ChildPort = new UnPort();

// 2. Implement a unport channel based on underlying IPC capabilities
childPort.implementChannel({
  send(message) {
    process.send && process.send(message);
  },
  accept(pipe) {
    process.on('message', (message: UnportChannelMessage) => {
      pipe(message);
    });
  },
});

childPort.onMessage('syn', () => {
  childPort.postMessage('ack', { pid: 'child' });
});

childPort.onMessage('body', payload => {
  payload.
});

```

[npm-badge]: https://img.shields.io/npm/v/unport.svg?style=flat
[npm-url]: https://www.npmjs.com/package/unport
[ci-badge]: https://github.com/ulivz/unport/actions/workflows/ci.yml/badge.svg?event=push&branch=main
[ci-url]: https://github.com/ulivz/unport/actions/workflows/ci.yml?query=event%3Apush+branch%3Amain
[code-coverage-badge]: https://codecov.io/github/ULIVZ/unport/branch/main/graph/badge.svg
[code-coverage-url]: https://codecov.io/gh/ULIVZ/unport