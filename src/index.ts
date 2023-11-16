/* eslint-disable @typescript-eslint/no-namespace */

export interface IntermediatePortMessage {
  t: string | number | symbol;
  p: any;
}

export interface IntermediatePort {
  postMessage(message: IntermediatePortMessage): void;
  onmessage?: (message: IntermediatePortMessage) => void;
}

export namespace GenericType {
  export type ChannelDescriptor = `${string}2${string}`;
  export type ChannelMessageMap = Record<string, any>;
  export type Channel = Record<ChannelDescriptor, ChannelMessageMap>;

  export type EnsureString<T> = T extends string ? T : never;
  export type Direction<T extends Channel> = keyof T;
  export type GetPorts<T extends Channel> = {
    [k in keyof T]: k extends `${infer A}2${infer B}` ? A | B : k;
  }[keyof T];

  export type Ports = GetPorts<Channel>;
  export type ReverseDirection<
    U extends Channel,
    T extends Direction<U>,
    Sep extends string = '2'
  > = T extends `${infer A}${Sep}${infer B}` ? `${B}${Sep}${A}` : T;

  type Payload<T extends Channel, D extends Direction<T>, U extends keyof T[D]> = T[D][U];

  export type Callback<
    T extends unknown[] = [],
    U = unknown,
  > = (...args: T) => U;

  export interface Port<T extends Channel, D extends Direction<T>> {
    implement?(implementation: () => IntermediatePort): void;
    postMessage<U extends keyof T[D]>(t: U, p: Payload<T, D, U>): void;
    onMessage<U extends keyof T[ReverseDirection<T, D>]>(
      t: U,
      handler: Callback<[Payload<T, ReverseDirection<T, D>, U>]>
    ): void;
  }
}

/**
 * Port Adapter.
 */

export function defineIntermediatePort(genericPort: IntermediatePort) {
  return genericPort;
}

export function buildPort<
  T extends GenericType.Channel,
  U extends GenericType.Direction<T>>(
  adaptor: IntermediatePort,
): GenericType.Port<T, U> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const handlers: Record<string | number | symbol, Function> = {};
  adaptor.onmessage = function (msg: IntermediatePortMessage) {
    const { t, p } = msg;
    const handler = handlers[t];
    if (handler) {
      handler(p);
    }
  };
  const port: GenericType.Port<T, U> = {
    postMessage(t, p) {
      adaptor.postMessage({ t, p });
    },
    onMessage(t, handler) {
      handlers[t] = handler;
    },
  };
  return port;
}

export class Port<
  T extends GenericType.Channel,
  U extends GenericType.Direction<T>> implements GenericType.Port<T, U> {
  implement(implementation: () => IntermediatePort) {
    const adaptor = implementation();
    // eslint-disable-next-line @typescript-eslint/ban-types
    const handlers: Record<string | number | symbol, Function> = {};
    adaptor.onmessage = (msg: IntermediatePortMessage) => {
      const { t, p } = msg;
      const handler = handlers[t];
      if (handler) {
        handler(p);
      }
    };
    const port: GenericType.Port<T, U> = {
      postMessage(t, p) {
        adaptor.postMessage({ t, p });
      },
      onMessage(t, handler) {
        handlers[t] = handler;
      },
    };
    Object.assign(this, port);
  }

  postMessage: GenericType.Port<T, U>['postMessage'] = () => {
    throw new Error('missing implementation');
  }

  onMessage: GenericType.Port<T, U>['onMessage'] = () => {
    throw new Error('missing implementation');
  }
}
