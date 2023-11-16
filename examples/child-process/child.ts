import { UnPort } from '../../src';
import { ChildPort } from './port';

// 1. Initialize a port
const port: ChildPort = new UnPort();

// 2. Implement a unport channel based on underlying IPC capabilities
port.implementChannel({
  send(message) {
    process.send && process.send(JSON.stringify(message));
  },
  accept(pipe) {
    process.on('message', (message: string) => {
      pipe(JSON.parse(message));
    });
  },
});

// 3. Post message
port.onMessage('syn', payload => {
  console.log('[child] [syn]', payload.pid);
  port.postMessage('ack', { pid: 'child' });
});
port.onMessage('body', payload => {
  console.log('[child] [body]', JSON.stringify(payload));
});
