<p align="center">
  <img alt="Unport Logo" src="./logo.png" width="400">
</p>

<div align="center">

[![NPM version][npm-badge]][npm-url]
[![Build Status][ci-badge]][ci-url]
[![Code Coverage][code-coverage-badge]][code-coverage-url]

</div>

## ⚓ Unport

Unport is a Universal Port with strict type inference capability for cross-JSContext communication.

Unport is designed to solve the complexity of JSContext environments such as Node.js, Webview, subprocess, Web Worker, worker_threads, WebSocket, iframe, MessageChannel, ServiceWorker, etc. Each JSContext communicates with the outside world in different ways, and the lack of types makes the code for complex cross JSContext communication projects difficult. In complex large projects, it is often difficult to know where the message is going and what fields the recipient needs.

## 💡 Features

1. Provides a unified Port paradigm. You only need to define the message types that different JSContexts need to pass, and you will have a complete type of unified Port (Unport).
2. 100% type inference. Users only need to maintain the types of communication between JSContexts, and leave the rest to unport.
3. Lightweight.

## ⚡️ Quick Start

To implement a process of sending messages after a parent-child process is connected:

1. Define Message Definition:

```ts
// channel.js
import { UnPort } from 'unport';

export type MessageDefinition = {
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

export type ChildPort = UnPort<MessageDefinition, 'child2parent'>;
export type ParentPort = UnPort<MessageDefinition, 'parent2child'>;
```

2. Parent process implementation:

```ts
// parent.js
import { defineIntermediatePort, UnPort } from 'unport';
import { ChildPort } from './channel';

// 1. Initialize a port
const port: ChildPort = new UnPort();

// 2. Implement a intermediate port based on underlying IPC capabilities
port.implement(() => {
  const intermediatePort = defineIntermediatePort({
    postMessage: message => {
      process.send && process.send(JSON.stringify(message));
    },
  });

  process.on('message', (message: string) => {
    intermediatePort.onmessage && intermediatePort.onmessage(JSON.parse(message));
  });
  return intermediatePort;
});

// 3. Post message
port.onMessage('syn', payload => {
  console.log('[child] [syn]', payload.pid);
  port.postMessage('ack', { pid: 'child' });
});
port.onMessage('body', payload => {
  console.log('[child] [body]', JSON.stringify(payload.name));
});
```

3. Child process implementation:

```ts
// child.js
import { defineIntermediatePort, UnPort } from 'unport';
import { ChildPort } from './channel';

// 1. Initialize a port
const port: ChildPort = new UnPort();

// 2. Implement a intermediate port based on underlying IPC capabilities
port.implement(() => {
  const intermediatePort = defineIntermediatePort({
    postMessage: message => {
      process.send && process.send(JSON.stringify(message));
    },
  });

  process.on('message', (message: string) => {
    intermediatePort.onmessage && intermediatePort.onmessage(JSON.parse(message));
  });
  return intermediatePort;
});

// 3. Post message
port.onMessage('syn', payload => {
  console.log('[child] [syn]', payload.pid);
  port.postMessage('ack', { pid: 'child' });
});
port.onMessage('body', payload => {
  console.log('[child] [body]', JSON.stringify(payload.name));
});

```

[npm-badge]: https://img.shields.io/npm/v/unport.svg?style=flat
[npm-url]: https://www.npmjs.com/package/unport
[ci-badge]: https://github.com/ULIVZ/unport/actions/workflows/ci.yml/badge.svg?event=push&branch=main
[ci-url]: https://github.com/ULIVZ/unport/actions/workflows/ci.yml?query=event%3Apush+branch%3Amain
[code-coverage-badge]: https://codecov.io/github/ULIVZ/unport/branch/main/graph/badge.svg
[code-coverage-url]: https://codecov.io/gh/ULIVZ/unport