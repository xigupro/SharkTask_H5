import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';
import VueI18n from 'vue-i18n';
import AmapVue from '@amap/amap-vue';
import {
  Lazyload,
  Toast,
  Dialog,
  // Locale,
} from 'vant';
// 引入英文语言包
// import enUS from 'vant/es/locale/lang/en-US';
import tim from 'tim';
import TIM from 'tim-js-sdk';
import TWebLive from 'tweblive';
import TRTCCalling from 'trtc-calling-js';
import trtcCalling from './trtc-calling';

import App from './App';
import { router } from '@/routes';
import store from '@/store';
import '@/utils/request';
import '@/assets/styles/common.less';
// pwa
import './registerServiceWorker';
import locales from '@/locales';

import * as filters from './filters';
import * as tools from './utils/tools';
import * as storage from './utils/storage';

window.tim = tim;
window.TIM = TIM;
window.TRTCCalling = TRTCCalling;
window.trtcCalling = trtcCalling;
window.store = store
Vue.prototype.$bus = new Vue() // event Bus 用于无关系组件间的通信。
Vue.prototype.tim = tim
Vue.prototype.TIM = TIM
Vue.prototype.TWebLive = TWebLive
Vue.prototype.$store = store
Vue.prototype.$confirm = Dialog.confirm
Vue.prototype.trtcCalling = trtcCalling
Vue.prototype.TRTCCalling = TRTCCalling

Vue.use(Lazyload);
Vue.use(VueClipboard);
Vue.use(VueI18n);

// 注册全局通过过滤器
Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
});

Vue.config.productionTip = false;

Vue.prototype.$tools = tools; // 全局工具
Vue.prototype.$storage = storage; // 存储
Vue.prototype.$toast = Toast; // 轻提示
Vue.prototype.$isApp = window.navigator.userAgent.indexOf('Html5Plus') > -1;
store.dispatch('auth/check');
// Locale.use('en-US', enUS);

AmapVue.config.version = '2.0'; // 默认2.0，这里可以不修改
AmapVue.config.key = window.API_CONFIG['amap_key'];
AmapVue.config.plugins = [
  'AMap.ToolBar',
  'AMap.MoveAnimation',
  'AMap.Geolocation',
  // 在此配置你需要预加载的插件，如果不配置，在使用到的时候会自动异步加载
];
Vue.use(AmapVue);

const i18n = new VueI18n({
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: locales,
})
Vue.prototype.$t = args => i18n.tc.call(i18n, args);
window.$t = Vue.prototype.$t

const vue = new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');

export default vue
