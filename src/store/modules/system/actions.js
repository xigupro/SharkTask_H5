/* ============
 * 系统信息的actions
 * ============
 */
import SystemProxy from '@/proxies/system';
import * as types from './mutation-types';

/**
 * 获取系统信息
 * @param {Function} commit mutation的commit方法
 */
export const find = async ({ commit }) => {
  const res = await SystemProxy.get();
  commit(types.FIND, res.data);
};

export default {
  find,
};
