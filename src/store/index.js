/* ============
 * Vuex Store
 * ============
 *
 * The store of the application.
 *
 * http://vuex.vuejs.org/en/index.html
 */

import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';
import { Toast } from 'vant';

// Modules
import account from './modules/account';
import auth from './modules/auth';
import system from './modules/system';
import task from './modules/task';
import conversation from './modules/im/conversation';
import group from './modules/im/group';
import user from './modules/im/user';
import video from './modules/im/video';
import friend from './modules/im/friend';
import blacklist from './modules/im/blacklist';
import groupLive from './modules/im/groupLive';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state: {
    current: Date.now(), // 当前时间
    intervalID: 0,
    message: undefined,
  },
  getters: {
    hidden(state) {
      // eslint-disable-next-line no-unused-vars
      const temp = state.current;
      if (typeof document.hasFocus !== 'function') {
        return document.hidden
      }
      return !document.hasFocus()
    },
  },
  mutations: {
    startComputeCurrent(state) {
      state.intervalID = setInterval(() => {
        // state.current = Date.now()
      }, 500)
    },
    stopComputeCurrent(state) {
      clearInterval(state.intervalID)
      state.intervalID = 0
    },
    showMessage(state, options) {
      if (state.message) {
        // state.message.close()
      }
      state.message = Toast({
        message: options.message,
        type: options.type || 'success',
        duration: options.duration || 2000,
      })
    },
  },
  modules: {
    account,
    auth,
    system,
    task,
    // 即时通讯
    conversation,
    group,
    friend,
    blacklist,
    user,
    video,
    groupLive,
  },

  /**
   * If strict mode should be enabled.
   */
  strict: debug,

  /**
   * Plugins used in the store.
   */
  plugins: debug ? [createLogger()] : [],
});
