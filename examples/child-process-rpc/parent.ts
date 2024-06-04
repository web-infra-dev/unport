import { join } from 'path';
import { fork } from 'child_process';
import { Unport, Unrpc, ChannelMessage } from '../../lib';
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
  destroy() {
    childProcess.removeAllListeners('message');
    childProcess.kill();
  },
});

// 3. Initialize a rpc client from port.
const parentRpcClient = new Unrpc(parentPort);

parentRpcClient.implement('getInfo', request => ({
  user: `parent (${request.id})`,
}));
parentRpcClient.port.postMessage('syn', { pid: 'parent' });
parentRpcClient.port.onMessage('ack', async payload => {
  console.log('[parent] [event] [ack] [result]', payload);
  const response = await parentRpcClient.call('getChildInfo', {
    name: 'parent',
  });
  console.log('[parent] [rpc] [getChildInfo] [response]', response);
  setTimeout(() => {
    console.log('destroy');
    parentPort.destroy();
  }, 1000);
});
