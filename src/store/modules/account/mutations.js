/* ============
 * Mutations for the account module
 * ============
 *
 * The mutations that are available on the
 * account module.
 */

import { FIND, UPDATE } from './mutation-types';

export default {
  [FIND](state, data) {
    state.info = data;
  },
  [UPDATE](state, data) {
    state.info = data;
  },
};
