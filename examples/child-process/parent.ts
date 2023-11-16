import { join } from 'path';
import { fork } from 'child_process';
import { UnPort, UnportChannelMessage } from '../../src';
import { ParentPort } from './port';

// 1. Initialize a port
const parentPort: ParentPort = new UnPort();

// 2. Implement a universal port based on underlying IPC capabilities
const childProcess = fork(join(__dirname, './child.js'));
parentPort.implementChannel({
  send(message) {
    childProcess.send(message);
  },
  accept(pipe) {
    childProcess.on('message', (message: UnportChannelMessage) => {
      pipe(message);
    });
  },
});

// 3. Post and listen message
parentPort.postMessage('syn', { pid: 'parent' });
parentPort.onMessage('ack', payload => {
  console.log('[parent] [ack]', payload.pid);
  parentPort.postMessage('body', {
    name: 'index',
    path: ' /',
  });
});
