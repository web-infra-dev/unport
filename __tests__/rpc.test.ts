import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChannelMessage, Unport, Unrpc, UnrpcExecutionErrorError, UnrpcNotImplementationError } from '../src';

export type Definition = {
  parent2child: {
    syn: {
      pid: string;
    };
    getInfo__callback: {
      user: string;
    };
    getChildInfo: {
      name: string;
    }
  };
  child2parent: {
    getInfo: {
      id: string;
    };
    getChildInfo__callback: {
      clientKey: string;
    };
    ack: {
      pid: string;
    };
  };
};

describe('Unrpc', () => {
  let childPort: Unport<Definition, 'child'>;
  let parentPort: Unport<Definition, 'parent'>;
  let child: Unrpc<Definition, 'child'>;
  let parent: Unrpc<Definition, 'parent'>;

  beforeEach(() => {
    const messageChannel = new MessageChannel();
    if (childPort) childPort.destroy();
    childPort = new Unport();
    childPort.implementChannel({
      send(message) {
        messageChannel.port1.postMessage(message);
      },
      accept(pipe) {
        messageChannel.port1.onmessage = (message: MessageEvent<ChannelMessage>) => pipe(message.data);
      },
      destroy() {
        messageChannel.port1.close();
      },
    });
    child = new Unrpc(childPort);

    parentPort = new Unport();
    parentPort.implementChannel({
      send(message) {
        console.log(message);
        messageChannel.port2.postMessage(message);
      },
      accept(pipe) {
        messageChannel.port2.onmessage = (message: MessageEvent<ChannelMessage>) => pipe(message.data);
      },
      destroy() {
        messageChannel.port2.close();
      },
    });

    parent = new Unrpc(parentPort);
  });

  it('implemented method - asynchronous implementation', async () => {
    parent.implement('getInfo', async ({ id }) => ({ user: id }));
    const response = child.call('getInfo', { id: 'name' });
    expect(response).resolves.toMatchObject({ user: 'name' });
  });

  it('implemented method - synchronous implementation', async () => {
    parent.implement('getInfo', ({ id }) => ({ user: id }));
    const response = child.call('getInfo', { id: 'name' });
    expect(response).resolves.toMatchObject({ user: 'name' });
  });

  it('Error: UnrpcNotImplementationError', async () => {
    expect(child.call('getInfo', { id: 'name' })).rejects.toMatchObject(
      new UnrpcNotImplementationError('Method getInfo is not implemented'),
    );
  });

  it('Error: UnrpcExecutionErrorError - script error - asynchronous implementation', async () => {
    parent.implement('getInfo', async () => {
      // @ts-expect-error mock execution error here.
      const result = foo;
      return result;
    });
    expect(child.call('getInfo', { id: 'name' })).rejects.toMatchObject(
      new UnrpcExecutionErrorError('foo is not defined'),
    );
  });

  it('Error: UnrpcExecutionErrorError - script error - synchronous implementation', async () => {
    parent.implement('getInfo', () => {
      // @ts-expect-error mock execution error here.
      const result = foo;
      return result;
    });
    expect(child.call('getInfo', { id: 'name' })).rejects.toMatchObject(
      new UnrpcExecutionErrorError('foo is not defined'),
    );
  });

  it('Error: UnrpcExecutionErrorError - user throws error', async () => {
    parent.implement('getInfo', () => {
      throw new Error('mock error');
    });
    expect(child.call('getInfo', { id: 'name' })).rejects.toMatchObject(
      new UnrpcExecutionErrorError('mock error'),
    );
  });

  it('complicated case', async () => {
    parent.implement('getInfo', async ({ id }) => ({ user: id }));
    child.implement('getChildInfo', async ({ name }) => ({ clientKey: name }));

    let finishHandshake: (value?: unknown) => void;
    const handshakePromise = new Promise(resolve => {
      finishHandshake = resolve;
    });

    /**
     * Simulates a handshake
     */
    parent.port.postMessage('syn', { pid: 'parent' });
    parent.port.onMessage('ack', async payload => {
      expect(payload.pid).toBe('child');
      finishHandshake();
    });
    child.port.onMessage('syn', async payload => {
      expect(payload.pid).toBe('parent');
      child.port.postMessage('ack', { pid: 'child' });
    });

    /**
     * Wait handshake finished
     */
    await handshakePromise;

    const [response1, response2] = await Promise.all([
      child.call('getInfo', { id: 'child' }),
      parent.call('getChildInfo', { name: 'parent' }),
    ]);
    expect(response1).toMatchObject({ user: 'child' });
    expect(response2).toMatchObject({ clientKey: 'parent' });
  });
});
