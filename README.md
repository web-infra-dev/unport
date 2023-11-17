<p align="center">
  <img alt="Unport Logo" src="https://github.com/ulivz/unport/blob/main/.media/type-infer.png?raw=true"><br>
  <img alt="Unport Logo" src="https://github.com/ulivz/unport/blob/main/.media/logo.png?raw=true" width="200">
</p>

<div align="center">

[![NPM version][npm-badge]][npm-url]

</div>

## 🛰️ What's Unport?

**Unport is a fully type-inferred IPC (Inter-Process Communication) library**. It ensures robust and reliable cross-context communication with strict type checking, enhancing the predictability and stability of your application.

```math
Port = f(types, channel)
```

Unport is  designed to simplify the complexity revolving around various JSContext environments. These environments encompass a wide range of technologies, including [Node.js](https://nodejs.org/), [ChildProcess](https://nodejs.org/api/child_process.html), [Webview](https://en.wikipedia.org/wiki/WebView), [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), [worker_threads](https://nodejs.org/api/worker_threads.html), [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API), [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe), [MessageChannel](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel), [ServiceWorker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), and much more.

Each of these JSContexts exhibits distinct methods of communicating with the external world. Still, the lack of defined types can make handling the code for complex projects an arduous task. In the context of intricate and large-scale projects, it's often challenging to track the message's trajectory and comprehend the fields that the recipient necessitates.

- [🛰️ What's Unport?](#️-whats-unport)
- [💡 Features](#-features)
- [🛠️ Install](#️-install)
- [⚡️ Quick Start](#️-quick-start)
- [📖 Basic Concepts](#-basic-concepts)
  - [MessageDefinition](#messagedefinition)
  - [Channel](#channel)
- [📚 API Reference](#-api-reference)
  - [Unport](#unport)
    - [.implementChannel()](#implementchannel)
    - [.postMessage()](#postmessage)
    - [.onMessage()](#onmessage)
  - [Channel](#channel-1)
    - [.pipe()](#pipe)
  - [ChannelMessage](#channelmessage)
- [🤝 Contributing](#-contributing)
- [🤝 Credits](#-credits)
- [LICENSE](#license)


## 💡 Features

1. Provides a unified Port paradigm. You only need to define the message types ([MessageDefinition](#messagedefinition)) and Intermediate communication channel ([Channel](#channel)) that different JSContexts need to pass, and you will get a unified type of Port:
2. 100% type inference. Users only need to maintain the message types between JSContexts, and leave the rest to unport.
3. Lightweight size and succinct API.

![IPC](https://github.com/ulivz/unport/blob/main/.media/ipc.png?raw=true)


## 🛠️ Install

```bash
npm i unport -S
```

## ⚡️ Quick Start

Let's take ChildProcess as an example to implement a process of sending messages after a parent-child process is connected:

1. Define Message Definition:

```ts
import { Unport } from 'unport';

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

export type ChildPort = Unport<Definition, 'child'>;
export type ParentPort = Unport<Definition, 'parent'>;
```

2. Parent process implementation:

```ts
// parent.ts
import { join } from 'path';
import { fork } from 'child_process';
import { Unport, ChannelMessage } from 'unport';
import { ParentPort } from './port';

// 1. Initialize a port
const parentPort: ParentPort = new Unport();

// 2. Implement a Channel based on underlying IPC capabilities
const childProcess = fork(join(__dirname, './child.js'));
parentPort.implementChannel({
  send(message) {
    childProcess.send(message);
  },
  accept(pipe) {
    childProcess.on('message', (message: ChannelMessage) => {
      pipe(message);
    });
  },
});

// 3. You get a complete typed Port with a unified interface 🤩
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
import { Unport, ChannelMessage } from 'unport';
import { ChildPort } from './port';

// 1. Initialize a port
const childPort: ChildPort = new Unport();

// 2. Implement a Channel based on underlying IPC capabilities
childPort.implementChannel({
  send(message) {
    process.send && process.send(message);
  },
  accept(pipe) {
    process.on('message', (message: ChannelMessage) => {
      pipe(message);
    });
  },
});

// 3. You get a complete typed Port with a unified interface 🤩
childPort.onMessage('syn', payload => {
  console.log('[child] [syn]', payload.pid);
  childPort.postMessage('ack', { pid: 'child' });
});

childPort.onMessage('body', payload => {
  console.log('[child] [body]', JSON.stringify(payload));
});
```

## 📖 Basic Concepts

### MessageDefinition

In Unport, a `MessageDefinition` is a crucial concept that defines the structure of the messages that can be sent and received through a `Channel`. It provides a clear and consistent way to specify the data that can be communicated between different JSContexts

A `MessageDefinition` is an object where each key represents a type of message that can be sent or received, and the value is an object that defines the structure of the message.

Here is an example of a `MessageDefinition`:

```ts
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
```

In this example, the `MessageDefinition` defines two types of messages that can be sent from the parent to the child (`syn` and `body`), and one type of message that can be sent from the child to the parent (`ack`). Each message type has its own structure, defined by an object with keys representing message types and values representing their message types.

By using a `MessageDefinition`, you can ensure that the messages sent and received through a `Channel` are consistent and predictable, making your code easier to understand and maintain.

### Channel

In Unport, a `Channel` is a fundamental concept that represents a Intermediate communication pathway between different JavaScript contexts. It provides a unified interface for sending and receiving messages across different environments.

A `Channel` is implemented using two primary methods:

- `send(message)`: This method is used to send a message through the channel. The `message` parameter is the data you want to send.

- `accept(pipe)`: This method is used to accept incoming messages from the channel. The `pipe` parameter is a function that takes a message as its argument.

Here is an example of how to implement a `Channel`:

```ts
parentPort.implementChannel({
  send(message) {
    childProcess.send(message);
  },
  accept(pipe) {
    childProcess.on('message', (message: ChannelMessage) => {
      pipe(message);
    });
  },
});
```

In this example, the `send` method is implemented using the `send` method of a child process, and the `accept` method is implemented using the `on` method of the child process to listen for 'message' events.

By abstracting the details of the underlying communication mechanism, Unport allows you to focus on the logic of your application, rather than the specifics of inter-context communication.

## 📚 API Reference

### Unport

The `Unport` class is used to create a new port.

```ts
import { Unport } from 'unport';
```

#### .implementChannel()

This method is used to implement a universal port based on underlying IPC capabilities.

```ts
parentPort.implementChannel({
  send(message) {
    childProcess.send(message);
  },
  accept(pipe) {
    childProcess.on('message', (message: ChannelMessage) => {
      pipe(message);
    });
  },
});
```

#### .postMessage()

This method is used to post a message.

```ts
parentPort.postMessage('syn', { pid: 'parent' });
```

#### .onMessage()

This method is used to listen for a message.

```ts
parentPort.onMessage('ack', payload => {
  console.log('[parent] [ack]', payload.pid);
  parentPort.postMessage('body', {
    name: 'index',
    path: ' /',
  });
});
```

### Channel

When you invoke the [.implementChannel()](#implementchannel) to implement an intermediary pipeline, you will receive a `Channel` instance. This instance comes with several useful methods that enhance the functionality and usability of the pipeline.

#### .pipe()

- Type: `(message: ChannelMessage) => void`

The `pipe` method is used to manually handle incoming messages. It's often used in Server with `one-to-many` connections, e.g. Web Socket.

Example:

```ts
const channel = port.implementChannel({
  send: (message) => {
    // send message to the other end of the channel
  },
});

// when a message is received
channel.pipe(message);
```

See our [Web Socket](./examples/web-socket/) example to check more details.

### ChannelMessage

The `ChannelMessage` type is used for the message in the `onMessage` method.

```ts
import { ChannelMessage } from 'unport';
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Here are some ways you can contribute:

1. 🐛 Submit a [Bug Report](https://github.com/ulivz/unport/issues) if you found something isn't working correctly.
2. 🆕 Suggest a new [Feature Request](https://github.com/ulivz/unport/issues) if you'd like to see new functionality added.
3. 📖 Improve documentation or write tutorials to help other users.
4. 🌐 Translate the documentation to other languages.
5. 💻 Contribute code changes by [Forking the Repository](https://github.com/ulivz/unport/fork), making changes, and submitting a Pull Request.

## 🤝 Credits

The birth of this project is inseparable from the complex IPC problems we encountered when working in large companies. The previous name of this project was `Multidirectional Typed Port`, and we would like to thank [ahaoboy](https://github.com/ahaoboy) for his previous ideas on this matter.


## LICENSE

MIT License © [ULIVZ](https://github.com/ulivz)

[npm-badge]: https://img.shields.io/npm/v/unport.svg?style=flat
[npm-url]: https://www.npmjs.com/package/unport
[ci-badge]: https://github.com/ulivz/unport/actions/workflows/ci.yml/badge.svg?event=push&branch=main
[ci-url]: https://github.com/ulivz/unport/actions/workflows/ci.yml?query=event%3Apush+branch%3Amain
[code-coverage-badge]: https://codecov.io/github/ulivz/unport/branch/main/graph/badge.svg
[code-coverage-url]: https://codecov.io/gh/ulivz/unport