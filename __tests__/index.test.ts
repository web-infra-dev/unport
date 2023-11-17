import { describe, test, beforeEach, vi, expect } from 'vitest';
import { Unport, UnportChannel } from '../src';

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

describe('Unport', () => {
  let mockChannel: UnportChannel;
  let unPort: ParentPort;

  beforeEach(() => {
    mockChannel = {
      send: vi.fn(),
      // we add an extra "mockReceiveMessage" method here so that we can test the "onMessage" handler
      accept: vi.fn().mockImplementation(function (pipe) { this.mockReceiveMessage = pipe; }),
    };

    unPort = new Unport<Definition, 'parent'>().implementChannel(mockChannel);
  });

  test('should correctly call channel send method', () => {
    unPort.postMessage('syn', { pid: '1' });
    expect(mockChannel.send).toHaveBeenCalledWith({
      t: 'syn',
      p: { pid: '1' },
      _$: 'un',
    });
  });

  test('should correctly call registered message handler', () => {
    const messageHandler = vi.fn();

    unPort.onMessage('ack', messageHandler);
    // @ts-expect-error we mocked callback here
    mockChannel.mockReceiveMessage({ t: 'ack', p: { pid: 'child' }, _$: 'un' });

    expect(messageHandler).toHaveBeenCalledWith({ pid: 'child' });
  });

  test('should not call message handler when _$ is not "un"', () => {
    const messageHandler = vi.fn();

    unPort.onMessage('ack', messageHandler);
    // @ts-expect-error we mock error here
    mockChannel.mockReceiveMessage({ t: 'ack', p: { pid: 'child' }, _$: 'other' });

    expect(messageHandler).not.toHaveBeenCalledWith();
  });

  test('should ignore unknown messages', () => {
    const messageHandler = vi.fn();

    unPort.onMessage('ack', messageHandler);
    // @ts-expect-error we mocked callback here
    mockChannel.mockReceiveMessage({ t: 'ack', p: { pid: 'child' }, _$: 'other' });

    expect(messageHandler).not.toHaveBeenCalledWith();
  });

  test('should correctly handle multiple message handlers', () => {
    const messageHandler1 = vi.fn();
    const messageHandler2 = vi.fn();
    const messageHandler3 = vi.fn();

    unPort.onMessage('ack', messageHandler1);
    unPort.onMessage('ack', messageHandler2);
    unPort.onMessage('ack', messageHandler3);
    // @ts-expect-error we mocked callback here
    mockChannel.mockReceiveMessage({ t: 'ack', p: { pid: 'child' }, _$: 'un' });

    expect(messageHandler1).toHaveBeenCalledWith({ pid: 'child' });
    expect(messageHandler2).toHaveBeenCalledWith({ pid: 'child' });
    expect(messageHandler3).toHaveBeenCalledWith({ pid: 'child' });
  });

  test('should handle port destruction correctly - postMessage', () => {
    unPort.postMessage('syn', { pid: '1' });
    expect(mockChannel.send).toHaveBeenCalledTimes(1);

    unPort.destroy();

    // When the port has been destroyed, it should no longer accept messages
    expect(() => unPort.postMessage('syn', { pid: '1' })).toThrow();
    expect(mockChannel.send).toHaveBeenCalledTimes(1);
  });

  test('should handle port destruction correctly - onMessage', () => {
    const messageHandler = vi.fn();

    // Handlers registered after destroy should not get called
    unPort.onMessage('ack', messageHandler);
    // @ts-expect-error we mocked callback here
    mockChannel.mockReceiveMessage({ t: 'ack', p: { pid: 'child' }, _$: 'un' });
    expect(messageHandler).toBeCalledTimes(1);

    unPort.destroy();

    // @ts-expect-error we mocked callback here
    mockChannel.mockReceiveMessage({ t: 'ack', p: { pid: 'child' }, _$: 'un' });
    expect(messageHandler).toBeCalledTimes(1);
  });
});
