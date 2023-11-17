/**
 * @license
 * Copyright (c) ULIVZ. All Rights Reserved.
 */

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
 * - Keys: These keys are represented by the @type {MessageDirectionDescriptor}, which describes
 *         the direction of a message.
 * - Values: The values are of @type {MessageDefinition4SingleJSContext}
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
/**
 * `Direction` type is a utility type to extract the direction field in a @type {MessageDefinition}.
 * It narrows down the index signature of MessageDefinition to exclusively the direction field.
 */
export type Direction<T extends MessageDefinition> = keyof T;
/**
 * `InferPorts` type is a utility to infer the list of port names, given a @type {MessageDefinition}.
 *
 * It inspects the direction fields in the definition and extracts the unique port names
 * present in them.
 *
 * For example, with following @type {MessageDefinition}: { "server2client": { ... } }
 * The inferred ports will be 'server' | 'client'
 */
export type InferPorts<T extends MessageDefinition> = {
  [k in Direction<T>]: k extends `${infer A}2${infer B}` ? A | B : k;
}[keyof T];
/**
 * `InferDirectionByPort` type is a utility to determine the direction of message transmission
 * based on the port name.
 *
 * For example, with following @type {MessageDefinition}: { "server2client": { ... } }
 * and port "client", the inferred direction will be 'client2server'
 */
type InferDirectionByPort<T extends MessageDefinition, U extends InferPorts<T>> = {
  [k in Direction<T>]: k extends `${infer A}2${infer B}`
    ? A extends U
      ? `${A}2${B}`
      : B extends U
        ? `${B}2${A}`
        : k
    : k;
}[keyof T];
/**
 * Reverse direction
 */
type ReverseDirection<
  U extends MessageDefinition,
  T extends Direction<U>,
  Sep extends string = '2',
> = T extends `${infer A}${Sep}${infer B}` ? `${B}${Sep}${A}` : T;
/**
 * `Payload` type is a utility to extract the payload type of a specific message, given its
 * direction and the name.
 */
type Payload<T extends MessageDefinition, D extends Direction<T>, U extends keyof T[D]> = T[D][U];
/**
 * `Callback` is a type representing a generic function
 */
type Callback<T extends unknown[] = [], U = unknown> = (...args: T) => U;

interface Port<T extends MessageDefinition, D extends Direction<T>> {
  postMessage<U extends keyof T[D]>(t: U, p: Payload<T, D, U>): void;
  onMessage<U extends keyof T[ReverseDirection<T, D>]>(
    t: U,
    handler: Callback<[Payload<T, ReverseDirection<T, D>, U>]>,
  ): void;
}
/**
 * `UnportChannelMessage` interface defines the structure of a message that can be sent
 * or received through an `UnportChannel`.
 *
 * It contains a `t` field for the name of the message, and a `p` field for the payload
 * of the message.
 */
export interface UnportChannelMessage {
  t: string | number | symbol;
  p: any;
  _$: 'un';
}

/**
 * `UnportChannel` interface specifies the methods that a valid unport channel should have.
 *
 * The `send` method takes a message conforming to @type {UnportChannelMessage} interface and sends
 * it through the channel. The `accept` method sets a handler function that will be triggered
 * whenever a message arrives at the channel.
 */
export interface UnportChannel {
  send(message: UnportChannelMessage): void;
  accept?(pipe: (message: UnportChannelMessage) => unknown): void;
  destroy?(): void;
  pipe?(message: UnportChannelMessage): unknown;
}

export interface EnhancedChannel extends UnportChannel {
  pipe(message: UnportChannelMessage): unknown;
}

/**
 * Expose Unport class
 */
export class Unport<T extends MessageDefinition, U extends InferPorts<T>>
implements Port<T, InferDirectionByPort<T, U>> {
  private handlers: Record<string | number | symbol, Callback<[any]>[]> = {};

  public channel?: EnhancedChannel;

  implementChannel(channel: UnportChannel | (() => UnportChannel)): EnhancedChannel {
    // @ts-expect-error We will assign it immediately
    this.channel = typeof channel === 'function' ? channel() : channel;
    if (typeof this.channel === 'object' && typeof this.channel.send === 'function') {
      this.channel.pipe = (message: UnportChannelMessage) => {
        if (typeof message === 'object' && message._$ === 'un') {
          const { t, p } = message;
          const handler = this.handlers[t];
          if (handler) {
            handler.forEach(fn => fn(p));
          }
        }
      };
      if (typeof this.channel.accept === 'function') {
        this.channel.accept(message => this.channel && this.channel.pipe?.(message));
      }
    } else {
      throw new Error('[1] invalid channel implementation');
    }
    return this.channel;
  }

  postMessage: Port<T, InferDirectionByPort<T, U>>['postMessage'] = (t, p) => {
    if (!this.channel) {
      throw new Error('[2] Port is not implemented or has been destroyed');
    }
    this.channel.send({ t, p, _$: 'un' });
  };

  onMessage: Port<T, InferDirectionByPort<T, U>>['onMessage'] = (t, handler) => {
    if (!this.handlers[t]) {
      this.handlers[t] = [];
    }
    this.handlers[t].push(handler);
  };

  destroy() {
    this.handlers = {};
    this.channel?.destroy && this.channel.destroy();
    delete this.channel;
  }
}
