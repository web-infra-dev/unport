import { defineUnportChannel, UnPort } from '../../src';
import { ChildPort } from './channel';

// 1. Initialize a port
const port: ChildPort = new UnPort();

// 2. Implement a unport channel based on underlying IPC capabilities
port.implement(() => {
  const channel = defineUnportChannel({
    postMessage: message => {
      process.send && process.send(JSON.stringify(message));
    },
  });

  process.on('message', (message: string) => {
    channel.onmessage && channel.onmessage(JSON.parse(message));
  });
  return channel;
});

// 3. Post message
port.onMessage('syn', payload => {
  console.log('[child] [syn]', payload.pid);
  port.postMessage('ack', { pid: 'child' });
});
port.onMessage('body', payload => {
  console.log('[child] [body]', JSON.stringify(payload.name));
});
