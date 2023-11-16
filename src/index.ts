/**
 * @license
 * Copyright (c) ULIVZ. All Rights Reserved.
 */

/* eslint-disable @typescript-eslint/no-namespace */

export interface UnportChannelMessage {
  t: string | number | symbol;
  p: any;
}

export interface UnportChannel {
  postMessage(message: UnportChannelMessage): void;
  onmessage?: (message: UnportChannelMessage) => void;
}

/**
 * A template literal type that is used to describe the direction of message transmission.
 *
 * It uses the form `${foo}2${bar}`, where "foo" and "bar" can be any string, indicating
 * where the message comes from (foo), and where it is going to (bar).
 *
 * For example, possible values could be "server2client" or "client2server", which indicate
 * that the message is transmitted from the server to the client, or from the client to the
 * server, respectively.
 */
export type MessageDirectionDescriptor = `${string}2${string}`;
/**
 * This type is designed for handling messages within a singular JavaScript context.
 *
 * In this `Record` type, we have:
 * - Keys: These are of type `string` used to define the unique message names.
 * - Values: These are of `any` type and they represent the payload or body of the messages.
 *
 * For example, a message can be defined as:
 * ```ts
 * {
 *   "messageName": {
 *     property1: "value1",
 *     property2: "value2"
 *   }
 * }
 * ```
 */
export type MessageDefinition4SingleJSContext = Record<string, any>;
/**
 * The exported type `MessageDefinition` represents a TypeScript `Record` type which aims
 *  to describe all message definitions between different JSContexts
 *
 * In this `Record` type, the composition is as follows:
 *
 * - Keys: These keys are represented by the {@type {MessageDirectionDescriptor}}, which describes
 *         the direction of a message.
 * - Values: The values are of {@type {MessageDefinition4SingleJSContext}}
 *
 * For example, a message definition could look like this:
 *
 * ```ts
 * {
 *   "server2client": {
 *     "messageName": {
 *       property1: "value1",
 *       property2: "value2"
 *     }
 *   }
 * }
 */
export type MessageDefinition = Record<MessageDirectionDescriptor, MessageDefinition4SingleJSContext>;

export type Direction<T extends MessageDefinition> = keyof T;

type InferPorts<T extends MessageDefinition> = {
  [k in Direction<T>]: k extends `${infer A}2${infer B}` ? A | B : k;
}[keyof T];

type InferDirectionByPort<T extends MessageDefinition, U extends InferPorts<T>> =
  {
    [k in Direction<T>]: k extends `${infer A}2${infer B}`
      ? A extends U
        ? `${A}2${B}` :
        B extends U ? `${B}2${A}` : k : k;
  }[keyof T];

type ReverseDirection<
  U extends MessageDefinition,
  T extends Direction<U>,
  Sep extends string = '2'
> = T extends `${infer A}${Sep}${infer B}` ? `${B}${Sep}${A}` : T;

type Payload<T extends MessageDefinition, D extends Direction<T>, U extends keyof T[D]> = T[D][U];

type Callback<
  T extends unknown[] = [],
  U = unknown,
> = (...args: T) => U;

interface Port<T extends MessageDefinition, D extends Direction<T>> {
  implement?(implementation: () => UnportChannel): void;
  postMessage<U extends keyof T[D]>(t: U, p: Payload<T, D, U>): void;
  onMessage<U extends keyof T[ReverseDirection<T, D>]>(
    t: U,
    handler: Callback<[Payload<T, ReverseDirection<T, D>, U>]>
  ): void;
}

/**
 * Port Adapter.
 */

export function defineUnportChannel(genericPort: UnportChannel) {
  return genericPort;
}

export function buildPort<
  T extends MessageDefinition,
  U extends Direction<T>>(
  adaptor: UnportChannel,
): Port<T, U> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const handlers: Record<string | number | symbol, Function> = {};
  adaptor.onmessage = function (msg: UnportChannelMessage) {
    const { t, p } = msg;
    const handler = handlers[t];
    if (handler) {
      handler(p);
    }
  };
  const port: Port<T, U> = {
    postMessage(t, p) {
      adaptor.postMessage({ t, p });
    },
    onMessage(t, handler) {
      handlers[t] = handler;
    },
  };
  return port;
}

export class UnPort<
  T extends MessageDefinition,
  U extends InferPorts<T>> implements Port<T, InferDirectionByPort<T, U>> {
  implement(implementation: () => UnportChannel) {
    const adaptor = implementation();
    // eslint-disable-next-line @typescript-eslint/ban-types
    const handlers: Record<string | number | symbol, Function> = {};
    adaptor.onmessage = (msg: UnportChannelMessage) => {
      const { t, p } = msg;
      const handler = handlers[t];
      if (handler) {
        handler(p);
      }
    };
    const port: Port<T, InferDirectionByPort<T, U>> = {
      postMessage(t, p) {
        adaptor.postMessage({ t, p });
      },
      onMessage(t, handler) {
        handlers[t] = handler;
      },
    };
    Object.assign(this, port);
  }

  postMessage: Port<T, InferDirectionByPort<T, U>>['postMessage'] = () => {
    throw new Error('missing implementation');
  }

  onMessage: Port<T, InferDirectionByPort<T, U>>['onMessage'] = () => {
    throw new Error('missing implementation');
  }
}
