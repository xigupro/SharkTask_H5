/* ============
 * 任务详情的actions
 * ============
 */
import * as types from './mutation-types';

export const detail = async ({ commit }, payload) => {
  commit(types.DETAIL, payload);
};

export default {
  detail,
};
