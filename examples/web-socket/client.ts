import io from 'socket.io-client';
import { Unport } from '../../src';
import { ClientPort } from './port';

// 1. Initialize a port
const clientPort: ClientPort = new Unport();

// 2. Implement a UnportChannel based on underlying IPC capabilities
const socket = io('http://localhost:10101/');
socket.on('connect', () => {
  clientPort.implementChannel(() => ({
    send(message) {
      socket.emit('message', message);
    },
    accept(pipe) {
      socket.on('message', pipe);
    },
  }));
});

// 3. You get a complete typed Port with a unified interface 🤩
clientPort.postMessage('syn', { pid: 'parent' });
clientPort.onMessage('ack', payload => {
  console.log('[parent] [ack]', payload.pid);
  clientPort.postMessage('body', {
    name: 'index',
    path: ' /',
  });
});
