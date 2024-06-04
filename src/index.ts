/* eslint-disable max-classes-per-file */
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
export type Payload<T extends MessageDefinition, D extends Direction<T>, U extends keyof T[D]> = T[D][U];
/**
 * `Callback` is a type representing a generic function
 */
type Callback<T extends unknown[] = [], U = unknown> = (...args: T) => U;
/**
 * A base interface used to describe a Message Port
 */
interface Port<T extends MessageDefinition, D extends Direction<T>> {
  // eslint-disable-next-line no-use-before-define
  postMessage<U extends keyof T[D]>(t: U, p?: Payload<T, D, U>, extra?: Pick<ChannelMessage, 'd' | 'c' | 'e'>): void;
  onMessage<U extends keyof T[ReverseDirection<T, D>]>(
    t: U,
    handler: Callback<[Payload<T, ReverseDirection<T, D>, U>]>,
  ): void;
}

export type EnsureString<T> = T extends string ? T : never;
export type CallbackSuffix = '__callback';

/**
 * A generic type used to infer the return value type of an Rpc call. For example, when you call
 * "foo" on one end of the port, the return value is of the type defined by "foo__callback" on
 * the other end.
 */
export type CallbackPayload<
  T extends MessageDefinition,
  D extends Direction<T>,
  U extends keyof T[D],
  S extends EnsureString<U> = EnsureString<U>
> =
  `${S}${CallbackSuffix}` extends keyof T[ReverseDirection<T, D>]
    ? Payload<T, ReverseDirection<T, D>, `${S}${CallbackSuffix}`> : unknown;

/**
 * We filtered the messages, only the message without {@type {CallbackSuffix}} is defined rpc method.
 */
export type RpcMethod<T extends MessageDefinition, D extends Direction<T>, U extends keyof T[D]>
  = U extends `${infer A}${CallbackSuffix}` ? never : U;

/**
 * A base interface used to describe a Rpc client instance.
 */
export interface Rpc<T extends MessageDefinition, D extends Direction<T>, > {
  call<U extends keyof T[D]>(t: RpcMethod<T, D, U>, p: Payload<T, D, U>): Promise<CallbackPayload<T, D, U>>;
  implement<R extends keyof T[ReverseDirection<T, D>]>(
    t: RpcMethod<T, ReverseDirection<T, D>, R>,
    handler: Callback<
    [Payload<T, ReverseDirection<T, D>, R>],
    CallbackPayload<T, ReverseDirection<T, D>, R> | Promise<CallbackPayload<T, ReverseDirection<T, D>, R>>
    >,
  ): void;
}

// eslint-disable-next-line no-shadow
export const enum ChannelMessageErrorCode {
  NotImplemented = 'NOT_IMPLEMENTED',
  ExecutionError = 'EXECUTION_ERROR',
}

/**
 * Different messages or methods define different Responses, so it is an any.
 */
export type Result = any;

/**
 * `ChannelMessage` interface defines the structure of a message that can be sent
 * or received through an `Channel`.
 *
 * It contains a `t` field for the name of the message, and a `p` field for the payload
 * of the message, `d` for the message id.
 */
export interface ChannelMessage {
  _$: 'un';
  t: string | number | symbol; /* message key */
  p?: Result; /* message payload */
  d?: number; /* message id */
  e?: string; /* error message */
  c?: ChannelMessageErrorCode; /* error code */
}

/**
 * `Channel` interface specifies the methods that a valid unport channel should have.
 *
 * The `send` method takes a message conforming to @type {ChannelMessage} interface and sends
 * it through the channel. The `accept` method sets a handler function that will be triggered
 * whenever a message arrives at the channel.
 */
export interface Channel {
  send(message: ChannelMessage): void;
  accept?(pipe: (message: ChannelMessage) => unknown): void;
  destroy?(): void;
  pipe?(message: ChannelMessage): unknown;
}

export interface EnhancedChannel extends Channel {
  pipe(message: ChannelMessage): unknown;
}

/**
 * Expose Unport class
 */
export class Unport<
  T extends MessageDefinition,
  U extends InferPorts<T>
> implements Port<T, InferDirectionByPort<T, U>> {
  private handlers: Record<string | number | symbol, Callback<[any]>[]> = {};

  public channel?: EnhancedChannel;

  public channelReceiveMessageListener?: (message: ChannelMessage) => unknown;

  public setChannelReceiveMessageListener(listener: (message: ChannelMessage) => unknown) {
    if (typeof listener === 'function') {
      this.channelReceiveMessageListener = listener;
    }
  }

  public implementChannel(channel: Channel | (() => Channel)): EnhancedChannel {
    // @ts-expect-error We will assign it immediately
    this.channel = typeof channel === 'function' ? channel() : channel;
    if (typeof this.channel === 'object' && typeof this.channel.send === 'function') {
      this.channel.pipe = (message: ChannelMessage) => {
        if (typeof this.channelReceiveMessageListener === 'function') {
          this.channelReceiveMessageListener(message);
        }
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

  public postMessage: Port<T, InferDirectionByPort<T, U>>['postMessage'] = (t, p, extra) => {
    if (!this.channel) {
      throw new Error('[2] Port is not implemented or has been destroyed');
    }
    this.channel.send({ ...(extra || {}), t, p, _$: 'un' });
  };

  public onMessage: Port<T, InferDirectionByPort<T, U>>['onMessage'] = (t, handler) => {
    if (!this.handlers[t]) {
      this.handlers[t] = [];
    }
    this.handlers[t].push(handler);
  };

  public destroy() {
    this.handlers = {};
    this.channel?.destroy && this.channel.destroy();
    delete this.channel;
  }
}

const CALLBACK_SUFFIX: CallbackSuffix = '__callback';

export class UnrpcNotImplementationError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = ChannelMessageErrorCode.NotImplemented;
  }
}

export class UnrpcExecutionErrorError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = ChannelMessageErrorCode.ExecutionError;
  }
}

/**
 * Check if the given object is a Promise or PromiseLike.
 *
 * @param value - The object to check.
 * @returns True if the object is a Promise or PromiseLike, otherwise false.
 */
function isPromise(value: any): value is Promise<any> {
  // Check if the value is an object and not null, then check if it has a 'then' function
  return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
}

/**
 * Expose Unrpc class
 */
export class Unrpc<T extends MessageDefinition, U extends InferPorts<T>> implements Rpc<T, InferDirectionByPort<T, U>> {
  private callbackMap = new Map<number, [Callback<[any]>, Callback<[any]>]>();

  private currentCallbackId = 0;

  private implementations = new Map<string | number | symbol, Callback<[any]>>();

  constructor(public readonly port: Unport<T, U>) {
    /**
     * The implementation of Rpc is based on the message protocol layer {@type {ChannelMessage}} at {@type {Unport}}.
     */
    this.port.setChannelReceiveMessageListener(message => {
      if (typeof message === 'object' && message._$ === 'un') {
        const { t, p, d } = message;
        const messageKey = String(t);
        /**
        * If a message contains "d" field, it is considered a message sent by Rpc.
        * Therefore, messages sent directly by {@type {Unport#postMessage}} will not be affected in any way.
        */
        if (typeof d === 'number') {
          /**
           * If a message ends with {@type {CALLBACK_SUFFIX}}, it is considered a Response message of Rpc
           */
          if (messageKey.endsWith(CALLBACK_SUFFIX)) {
            const callbackTuple = this.callbackMap.get(d);
            if (callbackTuple) {
              const [resolve, reject] = callbackTuple;
              if (message.c) {
                switch (message.c) {
                  case ChannelMessageErrorCode.NotImplemented:
                    reject(new UnrpcNotImplementationError(message.e)); break;
                  case ChannelMessageErrorCode.ExecutionError:
                    reject(new UnrpcExecutionErrorError(message.e)); break;
                  default:
                    /* c8 ignore next */
                    reject(new Error(message.e));
                }
              } else {
                resolve(p);
              }
            }
          } else {
            /**
             * If a message is not a callback, it is considered a rpc request.
             */
            const handler = this.implementations.get(t);
            const callbackMessageKey = `${messageKey}${CALLBACK_SUFFIX}` as keyof T[InferDirectionByPort<T, U>];
            if (handler) {
              const handleCallback = (result: Result) => {
                this.port.postMessage(callbackMessageKey, result, {
                  d,
                });
              };
              const handleExecutionError = (e: Result) => {
                this.port.postMessage(callbackMessageKey, undefined, {
                  d,
                  c: ChannelMessageErrorCode.ExecutionError,
                  e: e instanceof Error ? e.message : String(e),
                });
              };
              let result: Result;
              try {
                result = handler(p);
              } catch (e) {
                handleExecutionError(e);
              }
              if (isPromise(result)) {
                result.then(handleCallback).catch(handleExecutionError);
              } else {
                handleCallback(result);
              }
            } else {
              this.port.postMessage(callbackMessageKey, undefined, {
                d,
                c: ChannelMessageErrorCode.NotImplemented,
                e: `Method ${messageKey} is not implemented`,
              });
            }
          }
        }
      }
    });
  }

  public call: Rpc<T, InferDirectionByPort<T, U>>['call'] = async (t, p) => {
    const callbackId = this.currentCallbackId++;
    const response = new Promise<CallbackPayload<T, InferDirectionByPort<T, U>, typeof t>>((resolve, reject) => {
      this.callbackMap.set(callbackId, [resolve, reject]);
    });
    this.port.postMessage(t, p, { d: callbackId });
    return response;
  };

  public implement: Rpc<T, InferDirectionByPort<T, U>>['implement'] = (t, p) => {
    this.implementations.set(t, p);
  };
}
