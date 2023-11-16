import { UnPort } from '../../src';

export type ChildProcessChannel = {
  parent2child: {
    syn: {
      pid: string;
    };
    body: {
      name: string;
      path: string;
    }
  };
  child2parent: {
    ack: {
      pid: string;
    };
  };
};

export type ChildPort = UnPort<ChildProcessChannel, 'child'>;
export type ParentPort = UnPort<ChildProcessChannel, 'parent'>;
