import {
  DETAIL,
} from './mutation-types';


export default {
  /**
   * 任务详情
   * @param {Object} state   当前模块的状态
   * @param {Object} data   任务详情
   */
  [DETAIL](state, data) {
    state.info = data;
  },
};
