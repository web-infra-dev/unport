import { Unport, UnportChannelMessage } from '../../src';
import { ChildPort } from './port';

// 1. Initialize a port
const childPort: ChildPort = new Unport();

// 2. Implement a UnportChannel based on underlying IPC capabilities
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

// 3. You get a complete typed Port with a unified interface 🤩
childPort.onMessage('syn', payload => {
  console.log('[child] [syn]', payload.pid);
  childPort.postMessage('ack', { pid: 'child' });
});

childPort.onMessage('body', payload => {
  console.log('[child] [body]', JSON.stringify(payload));
});
