import { UnPort, UnportChannelMessage } from '../../src';
import { ChildPort } from './port';

// 1. Initialize a port
const childPort: ChildPort = new UnPort();

// 2. Implement a unport channel based on underlying IPC capabilities
childPort.implementChannel({
  send(message) {
    process.send && process.send(message);
  },
  accept(pipe) {
    process.on('message', (message: UnportChannelMessage) => {
      pipe(message);
    });
  },
});

childPort.onMessage('syn', () => {
  childPort.postMessage('ack', { pid: 'child' });
});

childPort.onMessage('body', payload => {
  payload.
});
