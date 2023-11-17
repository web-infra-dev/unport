import { Unport } from '../../src';

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

export type ChildPort = Unport<Definition, 'child'>;
export type ParentPort = Unport<Definition, 'parent'>;
