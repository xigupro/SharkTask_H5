/* ============
 * 菜单入口
 * ============
 */

import { getXianWanAD } from '@/utils/xianwan';
import { getYuWanAD } from '@/utils/yuwan';
import { getDuoYouAD } from '@/utils/duoyou';

export default {
  data() {
    return {
      currentOpenWebview: null,
    };
  },
  methods: {
    // 打开鱼玩页面
    async openYuWanPage() {
      if (!this.$isApp) {
        this.$toast('请使用APP操作');
        return;
      }
      const url = await getYuWanAD();
      if (url) {
        const wv = window.plus.webview.create(url, 'yuwan', {
          progress: {
            color: '#2d8cf0',
          },
          titleNView: {
            backgroundColor: '#ffffff',
            titleColor: '#000000',
            titleText: '游戏中心',
            autoBackButton: true,
          },
        });
        wv.show();
        this.currentOpenWebview = wv;
        window.plus.key.addEventListener('backbutton', this.webviewBackCallback);
      }
    },
    // 打开闲玩页面
    async openXianWanPage() {
      if (!this.$isApp) {
        this.$toast('请使用APP操作');
        return;
      }
      const url = await getXianWanAD();
      if (url) {
        const wv = window.plus.webview.create(url, 'xianwan', {
          progress: {
            color: '#2d8cf0',
          },
          titleNView: {
            backgroundColor: '#ffffff',
            titleColor: '#000000',
            titleText: '游戏中心',
            autoBackButton: true,
          },
        });
        wv.addEventListener('loaded', (() => {
          console.log('开始注入js');
          wv.appendJsFile('_www/js/xianwan.js');
          console.log('注入js完成');
        }));
        wv.show();
        this.currentOpenWebview = wv;
        window.plus.key.addEventListener('backbutton', this.webviewBackCallback);
      }
    },
    // 打开多游页面
    async openDuoYouPage() {
      if (!this.$isApp) {
        this.$toast('请使用APP操作');
        return;
      }
      const url = await getDuoYouAD();
      if (url) {
        const wv = window.plus.webview.create(url, 'dy', {
          progress: {
            color: '#2d8cf0',
          },
          titleNView: {
            backgroundColor: '#ffffff',
            titleColor: '#000000',
            titleText: '游戏中心',
            autoBackButton: true,
          },
        });
        wv.addEventListener('loaded', (() => {
          console.log('开始注入js');
          wv.appendJsFile('_www/js/duoliang.js');
          console.log('注入js完成');
        }));
        wv.show();
        this.currentOpenWebview = wv;
        window.plus.key.addEventListener('backbutton', this.webviewBackCallback);
      }
    },
    webviewBackCallback() {
      if (this.currentOpenWebview) {
        this.webviewGoback();
        return true;
      }
      return false;
    },
    webviewGoback() {
      const top = window.plus.webview.getTopWebview();
      if (this.currentOpenWebview && this.currentOpenWebview.id === top.id) {
        this.currentOpenWebview.canBack((events) => {
          if (events.canBack) {
            this.currentOpenWebview.back();
          } else {
            this.currentOpenWebview.close();
            window.plus.key.removeEventListener('backbutton', this.webviewBackCallback);
            this.currentOpenWebview = null;
          }
        });
      }
    },
    handleEntryClick(url) {
      if (!url) {
        return;
      }
      if (url.indexOf('/#/') === 0) {
        // 是路由
        this.$router.push(url.split('/#')[1]);
      } else {
        switch (url) {
          case 'xianwan':
            this.openXianWanPage();
            break;
          case 'yuwan':
            this.openYuWanPage();
            break;
          case 'duoyou':
            this.openDuoYouPage();
            break;
          default:
            if (this.$isApp) {
              window.plus.runtime.openWeb(url);
            } else {
              window.location.href = url;
            }
            break;
        }
      }
    },
  },
};
