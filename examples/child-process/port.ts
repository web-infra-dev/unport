import { UnPort } from '../../src';

export type Definition = {
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

export type ChildPort = UnPort<Definition, 'child'>;
export type ParentPort = UnPort<Definition, 'parent'>;
