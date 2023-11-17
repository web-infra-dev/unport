import { join } from 'path';
import { fork } from 'child_process';
import { Unport, ChannelMessage } from '../../src';
import { ParentPort } from './port';

// 1. Initialize a port
const parentPort: ParentPort = new Unport();

// 2. Implement a Channel based on underlying IPC capabilities
const childProcess = fork(join(__dirname, './child.js'));
parentPort.implementChannel({
  send(message) {
    childProcess.send(message);
  },
  accept(pipe) {
    childProcess.on('message', (message: ChannelMessage) => {
      pipe(message);
    });
  },
});

// 3. You get a complete typed Port with a unified interface 🤩
parentPort.postMessage('syn', { pid: 'parent' });
parentPort.onMessage('ack', payload => {
  console.log('[parent] [ack]', payload.pid);
  parentPort.postMessage('body', {
    name: 'index',
    path: ' /',
  });
});
