import { defineIntermediatePort, UnPort } from '../../src';
import { ChildPort } from './channel';

// 1. Initialize a port
const port: ChildPort = new UnPort();

// 2. Implement a intermediate port based on underlying IPC capabilities
port.implement(() => {
  const intermediatePort = defineIntermediatePort({
    postMessage: message => {
      process.send && process.send(JSON.stringify(message));
    },
  });

  process.on('message', (message: string) => {
    intermediatePort.onmessage && intermediatePort.onmessage(JSON.parse(message));
  });
  return intermediatePort;
});

// 3. Post message
port.onMessage('syn', payload => {
  console.log('[child] [syn]', payload.pid);
  port.postMessage('ack', { pid: 'child' });
});
port.onMessage('body', payload => {
  console.log('[child] [body]', JSON.stringify(payload.name));
});
