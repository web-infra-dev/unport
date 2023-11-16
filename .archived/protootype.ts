/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable quotes */

/**
 * Multidirectional Typed Port
 */
export namespace MultidirectionalTypedPort {
  /**
   * Format: <source>2<target>
   */
  export type Channel = {
    server2client: {
      foo: string;
      bar: {
        a: string;
        b: string;
      };
    };
    client2server: {
      baz: string;
      qux: {
        c: string;
        d: string;
      };
    };
  };

  export type EnsureString<T> = T extends string ? T : never;
  export type Direction = keyof Channel;

  /**
   * Infer the port
   */
  type GetPorts<T> = {
    [k in keyof T]: k extends `${infer A}2${infer B}` ? A | B : k;
  }[keyof T];

  /**
   * Current port: "server" | "client"
   */
  export type Ports = GetPorts<Channel>;

  export type ReverseDirection<
    T extends Direction,
    Sep extends string = "2"
  > = T extends `${infer A}${Sep}${infer B}` ? `${B}${Sep}${A}` : T;

  type Payload<D extends Direction, U extends keyof Channel[D]> = Channel[D][U];

  export type Callback<
    T extends unknown[] = [],
    U = unknown
  > = (...args: T) => U;

  export interface Port<D extends Direction> {
    postMessage<T extends keyof Channel[D]>(t: T, p: Payload<D, T>): void;
    onMessage<T extends keyof Channel[ReverseDirection<D>]>(
      t: T,
      handler: Callback<[Payload<ReverseDirection<D>, T>]>
    ): void;
  }
}

declare const client2serverPort: MultidirectionalTypedPort.Port<"client2server">;
client2serverPort.postMessage("qux", { c: "a", d: "d" });
client2serverPort.postMessage("baz", "x");
client2serverPort.onMessage("foo", message => {
  // => string
});
client2serverPort.onMessage("bar", message => {
  // => { a: string; b: string; }
});

/**
 * Port Adapter.
 */
export interface Message {
  t: string | number | symbol;
  p: any;
}

export interface PortAdaptor {
  postMessage(message: Message): void;
  onmessage?: (message: Message) => void;
}

export function buildPort<D extends MultidirectionalTypedPort.Direction>(
  adaptor: PortAdaptor,
): MultidirectionalTypedPort.Port<D> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const handlers: Record<string | number | symbol, Function> = {};

  adaptor.onmessage = function (msg: Message) {
    const { t, p } = msg;
    const handler = handlers[t];
    if (handler) {
      handler(p);
    }
  };

  const port: MultidirectionalTypedPort.Port<D> = {
    postMessage(t, p) {
      adaptor.postMessage({ t, p });
    },
    onMessage(t, handler) {
      handlers[t] = handler;
    },
  };

  return port;
}

/**
 * Examples
 */

/**
 * ChildProcess (Parent)
 */
declare const childProcess: import("child_process").ChildProcess;
const parentPortAdaptor: PortAdaptor = {
  postMessage: message => {
    childProcess.send(message);
  },
};

childProcess.on("message", (message: Message) => {
  parentPortAdaptor.onmessage && parentPortAdaptor.onmessage(message);
});

declare function getPort<T extends MultidirectionalTypedPort.Direction>(
  d: PortAdaptor
): MultidirectionalTypedPort.Port<T>;

const parentPort = getPort<"server2client">(parentPortAdaptor);
parentPort.postMessage("bar", { a: "a", b: "b" });

/**
 * ChildProcess (Child)
 */
const childPortAdaptor: PortAdaptor = {
  postMessage: message => {
    process.send && process.send(message);
  },
};

process.on("message", (message: Message) => {
  childPortAdaptor.onmessage && childPortAdaptor.onmessage(message);
});

const childPort = getPort<"client2server">(childPortAdaptor);
childPort.postMessage("qux", { c: "c", d: "d" });
childPort.onMessage("bar", p => {
  console.log(p.a);
});
