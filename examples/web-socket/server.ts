import { createServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { ServerPort } from './port';
import { Unport } from '../../src';

// 1. Initialize a port
const serverPort: ServerPort = new Unport();

// 2. Implement a UnportChannel based on underlying IPC capabilities
const server = createServer();
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const sockets: Record<string, Socket> = {};
const channel = serverPort.implementChannel({
  send: message => {
    Object.values(sockets).forEach(socket => {
      socket.emit('message', message);
    });
  },
});
io.on('connection', (socket: Socket) => {
  sockets[socket.id] = socket;
  socket.on('disconnect', () => {
    delete sockets[socket.id];
  });
  socket.on('message', message => channel.pipe(message));
});

server.listen(10101);

// 3. You get a complete typed Port with a unified interface 🤩
serverPort.onMessage('syn', payload => {
  console.log('[child] [syn]', payload.pid);
  serverPort.postMessage('ack', { pid: 'child' });
});
serverPort.onMessage('body', payload => {
  console.log('[child] [body]', JSON.stringify(payload));
});

