/* eslint-disable camelcase */
import { Unport } from '../../lib';

export type Definition = {
  parent2child: {
    syn: {
      pid: string;
    };
    getInfo__callback: {
      user: string;
    };
    getChildInfo: {
      name: string;
    }
  };
  child2parent: {
    getInfo: {
      id: string;
    };
    getChildInfo__callback: {
      clientKey: string;
    };
    ack: {
      pid: string;
    };
  };
};

export type ChildPort = Unport<Definition, 'child'>;
export type ParentPort = Unport<Definition, 'parent'>;
