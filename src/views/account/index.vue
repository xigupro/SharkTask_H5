<template>
  <div class="account-page">
    <van-cell-group>
      <van-cell title="用户名" :value="userInfo.username" />
      <van-cell title="密码" value="去修改" to="/account/password" is-link />
      <van-cell
        title="手机号"
        v-if="systemInfo.show_bind_phone"
        @click="handlePhoneClick"
        :value="userInfo.phone || '未绑定'"
        is-link />
      <van-cell
        v-if="showWechat"
        @click="handleWechatClick"
        title="微信"
        :value="userInfo.openid ? userInfo.nick_name : '未绑定'" is-link />
    </van-cell-group>
    <van-cell-group>
      <van-cell
        :value="currentVersionName"
        @click="updateApp">
        <template #title>
          <span>应用版本</span>
          <van-tag type="danger" v-if="isAPP && appShouldUpdate">有更新</van-tag>
        </template>
      </van-cell>
      <van-cell title="服务协议" to="/about/agreement" is-link />
      <van-cell title="隐私政策" to="/about/policy" is-link />
      <van-cell v-if="systemInfo.show_about" title="关于" to="/about" is-link />
    </van-cell-group>
    <van-cell-group class="logout">
      <van-button @click="logout" size="large" type="default">退出登录</van-button>
    </van-cell-group>
  </div>
</template>
<script>
import {
  Cell,
  CellGroup,
  Dialog,
  Button,
  Tag,
} from 'vant';
import AuthProxy from '@/proxies/auth';
import { judgeClient } from '@/utils/tools';

export default {
  data() {
    return {
      currentVersionName: '',
      appShouldUpdate: false,
      version: null,
      versionName: null,
      updateDescription: null,
      updateRule: null,
      wechatUserInfo: {},
    };
  },
  watch: {
    '$store.state.system.info.app_version'(val) {
      if (val) {
        this.shouldAppUpdate();
      }
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.account.info;
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
    isAPP() {
      return window.navigator.userAgent.indexOf('Html5Plus') > -1;
    },
    appid() {
      return window.API_CONFIG['wechat_appid'];
    },
    showWechat() {
      // return true;
      return (this.isAPP && this.systemInfo.show_app_wechat_login)
        || (this.$tools.isWechat() && window.API_CONFIG['wechat_appid']);
    },
  },
  components: {
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Tag.name]: Tag,
  },
  created() {
    this.shouldAppUpdate();
  },
  methods: {
    getClientType() {
      const platform = judgeClient();
      let type = 3;
      if (this.isAPP) {
        switch (platform) {
          case 'ios':
            type = 5;
            break;
          case 'android':
            type = 4;
            break;
          default:
            console.info(platform);
            break;
        }
      }
      return type;
    },
    appWechatLogin() {
      window.plus.oauth.getServices((services) => {
        const oauth = services.find(item => item.id === 'weixin');
        this.authLogin(oauth);
      }, (e) => {
        Dialog({ message: `获取分享服务列表失败: ${e.message} - ${e.code}` });
      });
    },
    authLogin(s) {
      if (!s.authResult) {
        s.login(() => {
          // 获取登录操作结果
          // const result = e.target.authResult;
          this.authUserInfo(s);
        }, (e) => {
          Dialog({ message: `登录认证失败: ${e.message} - ${e.code}` });
        }, {});
      } else {
        this.authUserInfo(s);
      }
    },
    authUserInfo(s) {
      if (!s.authResult) {
        this.$toast('未登录授权！');
      } else {
        s.getUserInfo(() => {
          // 拿到用户信息，判断是否是新用户
          this.wechatUserInfo = s.userInfo;
          this.checkWechatIsNew(s.userInfo);
        }, (e) => {
          Dialog({ message: `获取用户信息失败: ${e.message} - ${e.code}` });
        });
      }
    },
    // 判断该微信是否是新用户
    async checkWechatIsNew(data) {
      if (!data.unionid) {
        this.$toast('微信登录失败');
        return;
      }
      const params = {
        unionid: data.unionid,
      };
      const res = await AuthProxy.checkWechatIsNew(params);
      if (res.success) {
        if (res.data) {
          // 老用户，弹出已被绑定
          this.$toast('此微信已被其他账号绑定');
        } else {
          // 新用户，可以绑定
          this.bindWechat();
        }
      }
    },
    // 公众号微信跳转授权
    officialWechatLogin() {
      this.$storage.setItem('wechatAuthFrom', 4);
      window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.appid}&redirect_uri=${window.location.origin}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
    },
    // 根据已有的账号密码绑定微信，并登录
    async bindWechat() {
      const params = {
        ...this.wechatUserInfo,
        clientType: this.getClientType(),
        userId: this.userInfo.id,
      };
      const res = await AuthProxy.bindWechat(params);
      if (res.success) {
        this.$store.dispatch('auth/login', res.data);
        this.$store.dispatch('account/find', {
          userId: res.data.id,
        });
      }
    },
    // 判断APP是否有更新
    shouldAppUpdate() {
      const {
        app_version: appVersion,
        app_version_name: appVersionName,
        app_update_description: appUpdateDescription,
        app_update_rule: appUpdateRule,
      } = this.$store.state.system.info;
      this.version = appVersion;
      this.versionName = appVersionName;
      this.updateDescription = appUpdateDescription;
      this.updateRule = appUpdateRule;
      this.currentVersionName = appVersionName;
      if (this.isAPP) {
        const version = window.plus.storage.getItem('version');
        if (version && Number(version) !== appVersion) {
          // 有新版
          this.appShouldUpdate = true;
        }
      }
    },
    // 更新APP
    updateApp() {
      if (!this.appShouldUpdate) {
        // 如果没更新，则显示当前版本信息
        Dialog.alert({
          title: this.versionName,
          message: this.updateDescription,
        });
        return;
      }
      if (!this.isAPP) {
        // 如果不是APP打开，则不往下执行
        return;
      }
      Dialog.confirm({
        title: `${this.$t('newVersion')}${this.versionName}`,
        message: this.updateDescription,
        confirmButtonText: '更新',
      }).then(() => {
        window.plus.storage.setItem('version', `${this.version}`);
        window.plus.cache.clear(() => {
          this.$toast(this.$t('updateSuccess'));
          setTimeout(() => {
            window.plus.runtime.restart();
          }, 800);
        });
      });
    },
    logout() {
      this.$store.dispatch('auth/logout');
      this.$store.dispatch('account/update', {});
    },
    handleWechatClick() {
      if (!this.userInfo.openid) {
        if (this.isAPP) {
          // APP微信
          this.appWechatLogin();
        } else {
          // 公众号微信
          this.officialWechatLogin();
        }
      }
    },
    handlePhoneClick() {
      if (this.userInfo.phone) {
        Dialog.confirm({
          title: '解绑',
          message: '你已绑定手机号，是否解绑？',
        }).then(() => {
          this.unbindPhone();
        });
      } else {
        this.$router.push({
          name: 'auth.phone',
          query: {
            action: 'bind',
          },
        });
      }
    },
    async unbindPhone() {
      const params = {
        userId: this.userInfo.id,
        phone: this.userInfo.phone,
      };
      const res = await AuthProxy.unbindPhone(params);
      if (res.success) {
        this.$store.dispatch('account/find', {
          userId: this.userInfo.id,
        });
        this.$toast('解绑成功');
      }
    },
  },
};
</script>
<style lang="less">
.account-page {
  .van-cell-group {
    margin-bottom: 10px;
  }
  .logout {
    margin-top: 20px;
  }
}
</style>
