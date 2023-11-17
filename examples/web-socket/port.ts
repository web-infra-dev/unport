import { Unport } from '../../src';

export type Definition = {
  server2client: {
    ack: {
      pid: string;
    };
  };
  client2server: {
    syn: {
      pid: string;
    };
    body: {
      name: string;
      path: string;
    }
  };
};

export type ClientPort = Unport<Definition, 'client'>;
export type ServerPort = Unport<Definition, 'server'>;
