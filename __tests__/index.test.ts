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
});
