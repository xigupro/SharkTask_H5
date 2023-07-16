/* ============
 * Mutations for the system module
 * ============
 */
import {
  FIND,
} from './mutation-types';


export default {
  /**
   * 系统信息
   * @param {Object} state   当前模块的状态
   * @param {Object} data   系统信息
   */
  [FIND](state, data) {
    state.info = data;
  },
};
