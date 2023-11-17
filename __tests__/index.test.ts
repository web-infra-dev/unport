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
    };
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
      accept: vi.fn(),
    };

    unPort = new Unport<Definition, 'parent'>();
  });

  test('should implement channel correctly when provided channel as object', () => {
    unPort.implementChannel(mockChannel);
    expect(mockChannel.accept).toHaveBeenCalledOnce();
    expect(unPort.channel).toBe(mockChannel);
  });

  test('should implement channel correctly when provided channel as function returning object', () => {
    const mockChannelFn = () => mockChannel;
    unPort.implementChannel(mockChannelFn);
    expect(unPort.channel).toBe(mockChannel);
  });

  test('should throw error when provided invalid channel object', () => {
    const invalidChannel = {}; // Does not contain required 'send' method
    // @ts-expect-error we mocked error here
    expect(() => unPort.implementChannel(invalidChannel)).toThrowError(
      '[1] invalid channel implementation',
    );
  });

  test('should throw error when provided invalid channel function', () => {
    const invalidChannelFn = () => ({} as UnportChannel); // Does not contain required 'send' method
    expect(() => unPort.implementChannel(invalidChannelFn)).toThrowError(
      '[1] invalid channel implementation',
    );
  });

  test('should correctly call channel send method', () => {
    unPort.implementChannel(mockChannel);
    unPort.postMessage('syn', { pid: '1' });
    expect(mockChannel.send).toHaveBeenCalledWith({
      t: 'syn',
      p: { pid: '1' },
      _$: 'un',
    });
  });

  test('should correctly call registered message handler', () => {
    const channel = unPort.implementChannel(mockChannel);
    const messageHandler = vi.fn();

    unPort.onMessage('ack', messageHandler);
    channel.pipe({ t: 'ack', p: { pid: 'child' }, _$: 'un' });

    expect(messageHandler).toHaveBeenCalledWith({ pid: 'child' });
  });

  test('should not call message handler when _$ is not "un"', () => {
    const channel = unPort.implementChannel(mockChannel);
    const messageHandler = vi.fn();

    unPort.onMessage('ack', messageHandler);
    // @ts-expect-error we mocked error here
    channel.pipe({ t: 'ack', p: { pid: 'child' }, _$: 'other' });

    expect(messageHandler).not.toHaveBeenCalledWith();
  });

  test('should ignore unknown messages', () => {
    const channel = unPort.implementChannel(mockChannel);
    const messageHandler = vi.fn();

    unPort.onMessage('ack', messageHandler);
    // @ts-expect-error we mocked error here
    channel.pipe('unknown');

    expect(messageHandler).not.toHaveBeenCalledWith();
  });

  test('should correctly handle multiple message handlers', () => {
    const channel = unPort.implementChannel(mockChannel);
    const messageHandler1 = vi.fn();
    const messageHandler2 = vi.fn();
    const messageHandler3 = vi.fn();

    unPort.onMessage('ack', messageHandler1);
    unPort.onMessage('ack', messageHandler2);
    unPort.onMessage('ack', messageHandler3);
    channel.pipe({ t: 'ack', p: { pid: 'child' }, _$: 'un' });

    expect(messageHandler1).toHaveBeenCalledWith({ pid: 'child' });
    expect(messageHandler2).toHaveBeenCalledWith({ pid: 'child' });
    expect(messageHandler3).toHaveBeenCalledWith({ pid: 'child' });
  });

  test('should handle port destruction correctly - postMessage', () => {
    const channel = unPort.implementChannel(mockChannel);
    unPort.postMessage('syn', { pid: '1' });
    expect(mockChannel.send).toHaveBeenCalledTimes(1);

    unPort.destroy();

    // When the port has been destroyed, it should no longer accept messages
    expect(() => unPort.postMessage('syn', { pid: '1' })).toThrowError(
      '[2] Port is not implemented or has been destroyed',
    );
    expect(mockChannel.send).toHaveBeenCalledTimes(1);
  });

  test('should handle port destruction correctly - onMessage', () => {
    const channel = unPort.implementChannel(mockChannel);
    const messageHandler = vi.fn();

    // Handlers registered after destroy should not get called
    unPort.onMessage('ack', messageHandler);
    channel.pipe({ t: 'ack', p: { pid: 'child' }, _$: 'un' });
    expect(messageHandler).toBeCalledTimes(1);

    unPort.destroy();

    channel.send({ t: 'ack', p: { pid: 'child' }, _$: 'un' });
    expect(messageHandler).toBeCalledTimes(1);
  });
});
