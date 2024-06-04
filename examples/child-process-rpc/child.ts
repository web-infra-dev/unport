import { Unport, Unrpc, ChannelMessage } from '../../lib';
import { ChildPort } from './port';

// 1. Initialize a port
const childPort: ChildPort = new Unport();

// 2. Implement a Channel based on underlying IPC capabilities
childPort.implementChannel({
  send(message) {
    process.send && process.send(message);
  },
  accept(pipe) {
    process.on('message', (message: ChannelMessage) => {
      pipe(message);
    });
  },
});

// 3. Initialize a rpc client
const childRpcClient = new Unrpc(childPort);
childRpcClient.implement('getChildInfo', request => ({
  childId: 'child_123',
}));
childRpcClient.port.onMessage('syn', async payload => {
  console.log('[child] [event] [syn] [result]', payload);
  const response = await childRpcClient.call('getParentInfo', { user: 'child' });
  console.log('[child] [rpc] [getInfo] [response]', response);
  childPort.postMessage('ack', { pid: 'child' });
});
