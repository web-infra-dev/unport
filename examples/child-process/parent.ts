import { fork } from 'child_process';
import { defineIntermediatePort, UnPort } from '../../src';
import { ParentPort } from './channel';

// 1. Initialize a port
const port: ParentPort = new UnPort();

// 2. Implement a universal port based on underlying IPC capabilities
port.implement(() => {
  const childProcess: import('child_process').ChildProcess = fork('./child');
  const intermediatePort = defineIntermediatePort({
    postMessage: message => {
      childProcess.send(JSON.stringify(message));
    },
  });

  childProcess.on('message', (message: string) => {
    intermediatePort.onmessage && intermediatePort.onmessage(JSON.parse(message));
  });

  return intermediatePort;
});

// 3. Post message
port.postMessage('syn', { pid: 'parent' });
port.onMessage('ack', p => {
  port.postMessage('body', {
    name: 'index',
    path: ' /',
  });
});
