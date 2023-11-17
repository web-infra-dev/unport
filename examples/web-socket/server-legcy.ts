/**
 * This file using a old implementation for `one-to-many` scenario,
 * which could be refactored by `.pipe()`,
 *
 * @see https://github.com/web-infra-dev/unport/pull/2
 */
import { createServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { ServerPort } from './port';
import { Unport } from '../../src';

// 1. Initialize a port map
const socketPorts: Map<string, ServerPort> = new Map();

// 2. Implement a UnportChannel based on underlying IPC capabilities
const server = createServer();
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket: Socket) => {
  // One connection, one port instance
  const socketPort: ServerPort = new Unport();
  socketPort.implementChannel({
    send: message => {
      socket.emit('message', message);
    },
    accept(pipe) {
      socket.on('message', message => {
        pipe(message);
      });
    },
  });

  socketPorts.set(socket.id, socketPort);

  socket.on('disconnect', () => {
    socketPorts.delete(socket.id);
  });
});

server.listen(10101);

// You'll get many ports so that you need to retrieve it before using it.
const serverPort = socketPorts.get('<id>' /* id */);
if (serverPort) {
  serverPort.onMessage('syn', payload => {
    console.log('[child] [syn]', payload.pid);
    serverPort.postMessage('ack', { pid: 'child' });
  });
  serverPort.onMessage('body', payload => {
    console.log('[child] [body]', JSON.stringify(payload));
  });
}
