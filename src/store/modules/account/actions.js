/* ============
 * Actions for the account module
 * ============
 *
 * The actions that are available on the
 * account module.
 */
import Vue from 'vue';
import UserProxy from '@/proxies/users';
import { setItem } from '@/utils/storage';
import * as types from './mutation-types';

export const find = async ({ commit }, payload) => {
  const res = await UserProxy.getUserInfo(payload);
  if (!res.fail) {
    setItem('id', res.data.id);
    setItem('username', res.data.username);
    commit(types.FIND, res.data);
  } else {
    if (res.code === '10006' || res.code === '10009') {
      Vue.router.push({
        name: 'auth.login',
      });
    }
  }
};
export const update = async ({ commit }, payload) => {
  commit(types.UPDATE, payload);
};
export default {
  find,
  update,
};
