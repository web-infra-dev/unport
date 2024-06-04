/* eslint-disable camelcase */
import { Unport } from '../../lib';

export type Definition = {
  parent2child: {
    syn: {
      pid: string;
    };
    getParentInfo__callback: {
      parentId: string;
      from: string;
    };
    getChildInfo: {
      name: string;
    }
  };
  child2parent: {
    getParentInfo: {
      user: string;
    };
    getChildInfo__callback: {
      childId: string;
    };
    ack: {
      pid: string;
    };
  };
};

export type ChildPort = Unport<Definition, 'child'>;
export type ParentPort = Unport<Definition, 'parent'>;
