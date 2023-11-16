import { join } from 'path';
import { fork } from 'child_process';
import { UnPort } from '../../src';
import { ParentPort } from './port';

// 1. Initialize a port
const port: ParentPort = new UnPort();

// 2. Implement a universal port based on underlying IPC capabilities
const childProcess = fork(join(__dirname, './child.js'));
port.implementChannel({
  send(message) {
    childProcess.send(JSON.stringify(message));
  },
  accept(pipe) {
    childProcess.on('message', (message: string) => {
      pipe(JSON.parse(message));
    });
  },
});

// 3. Post message
port.postMessage('syn', { pid: 'parent' });
port.onMessage('ack', payload => {
  console.log('[parent] [ack]', payload.pid);
  port.postMessage('body', {
    name: 'index',
    path: ' /',
  });
});
