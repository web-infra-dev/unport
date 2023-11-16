import { fork } from 'child_process';
import { defineUnportChannel, UnPort } from '../../src';
import { ParentPort } from './channel';

// 1. Initialize a port
const port: ParentPort = new UnPort();

// 2. Implement a universal port based on underlying IPC capabilities
port.implement(() => {
  const childProcess: import('child_process').ChildProcess = fork('./child');
  const channel = defineUnportChannel({
    postMessage: message => {
      childProcess.send(JSON.stringify(message));
    },
  });

  childProcess.on('message', (message: string) => {
    channel.onmessage && channel.onmessage(JSON.parse(message));
  });

  return channel;
});

// 3. Post message
port.postMessage('syn', { pid: 'parent' });
port.onMessage('ack', p => {
  port.postMessage('body', {
    name: 'index',
    path: ' /',
  });
});
