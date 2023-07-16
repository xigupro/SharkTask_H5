<template>
  <div class="login-page">
    <form class="form">
      <h2 class="title">
          {{showBind ? '绑定账号' : '登录'}}
      </h2>
      <div class="item">
        <input
          placeholder="请输入用户名/手机号"
          v-model="form.username">
      </div>
      <div class="item">
          <input
            type="password"
            placeholder="请输入密码"
            v-model="form.password">
      </div>
      <div class="item flex" v-if="!showBind">
        <van-checkbox v-model="isRemember" @change="rememberUser">记住我</van-checkbox>
        <router-link style="flex:1" to="/auth/reset" v-if="systemInfo.show_find_password">
          找回密码
        </router-link>
      </div>
      <template v-if="!showBind">
        <div class="item">
            <van-button
              type="primary"
              @click.prevent.stop="login(form)"
              :disabled="!isPassValidate"
              :loading="isLoading">登录</van-button>
        </div>
        <div class="item flex">
          <router-link to="/auth/phone" v-if="systemInfo.show_phone_login">
            短信登录
          </router-link>
          <router-link style="flex:1" to="/auth/register" v-if="systemInfo.show_register_entry">
            还没账号？去注册
          </router-link>
        </div>
        <div class="item" v-if="isAPP && isIOS && systemInfo.show_app_apple_login">
          <van-button
            type="primary"
            :icon="apple"
            @click.prevent.stop="appAppleLogin"
            style="background-color: #000;border:none;color: #fff">通过 Apple 登录</van-button>
        </div>
        <div class="item" v-if="isWechat && appid">
          <van-button
            type="primary"
            @click.prevent.stop="wechatLogin"
            style="background-color: rgb(44,169,63);border:none;">微信登录</van-button>
        </div>
        <div class="item" v-else-if="isAPP && hasWeChatAPP && systemInfo.show_app_wechat_login">
          <van-button
            type="primary"
            @click.prevent.stop="appWechatLogin"
            style="background-color: rgb(44,169,63);border:none;">微信登录</van-button>
        </div>
      </template>
      <div class="actions" v-else>
        <template v-if="bindType === 1">
          <van-button type="primary" @click.prevent.stop="bindWechat">绑定账号并登录</van-button>
          <van-button @click.prevent.stop="postAPPWechatLogin(wechatUserInfo)">跳过</van-button>
        </template>
        <template v-else>
          <van-button type="primary" @click.prevent.stop="bindApple">绑定账号并登录</van-button>
          <van-button @click.prevent.stop="postAPPAppleLogin(appleUserInfo)">跳过</van-button>
        </template>
      </div>
      <div class="tips">登录即代表你同意
        <router-link :to="{name: 'about.agreement'}">《服务协议》</router-link>
      和<router-link :to="{name: 'about.policy'}">《隐私政策》</router-link>
      </div>
    </form>
  </div>
</template>

<script>
/**
 * 登录页
*/
import { Checkbox, Button, Dialog } from 'vant';
import AuthProxy from '@/proxies/auth';
import AppleIcon from '../../assets/images/apple.png';
import { judgeClient } from '@/utils/tools';

export default {
  name: 'login-index',
  data() {
    return {
      isRemember: false,
      isLoading: false,
      form: {
        username: null,
        password: null,
      },
      ruleForm: {
        username: '',
        password: '',
      },
      rules: {
      },
      showBind: false,
      wechatUserInfo: {},
      appleUserInfo: {},
      apple: AppleIcon,
      bindType: 1, // 绑定类型。1微信；2苹果
    };
  },
  components: {
    [Checkbox.name]: Checkbox,
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
  },
  computed: {
    isWechat() {
      return this.$tools.isWechat();
    },
    isAPP() {
      return navigator.userAgent.indexOf('Html5Plus') > -1;
    },
    isIOS() {
      return this.$tools.judgeClient() === 'ios';
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
    // 是否通过验证
    isPassValidate() {
      return this.form.username && this.form.password;
    },
    appid() {
      return window.API_CONFIG['wechat_appid'];
    },
    // 检测是否有微信客户端
    hasWeChatAPP() {
      const result = window.plus.runtime.isApplicationExist({
        pname: 'com.tencent.mm',
        action: 'weixin://',
      });
      return result;
    },
  },
  mounted() {
    const username = localStorage.getItem('username') || '';
    if (username && username !== 'null') {
      this.form.username = decodeURIComponent(username);
      this.isRemember = true;
    }
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
    appAppleLogin() {
      window.plus.oauth.getServices((services) => {
        // 获取苹果授权登录对象，苹果授权登录id 为 'apple' iOS13以下系统，不会返回苹果登录对应的 service
        const appleOauth = services.find(item => item.id === 'apple');
        appleOauth.login((oauth) => {
          console.info(oauth);
          // 授权成功，苹果授权返回的信息在 oauth.target.appleInfo 中
          this.appleUserInfo = oauth.target.appleInfo;
          this.checkAppleIsNew(oauth.target.appleInfo);
        }, (err) => {
          console.info(err);
          // 授权失败 error
        }, {
          // 默认只会请求用户名字信息，如需请求用户邮箱信息，需要设置 scope: 'email'
          scope: 'email',
        });
      }, (err) => {
        // 获取 services 失败
        Dialog({ message: JSON.stringify(err) });
      });
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
          // 老用户，直接登录
          this.postAPPWechatLogin(data);
        } else {
          // 新用户，显示弹窗
          this.showBind = true;
          this.bindType = 1;
        }
      }
    },
    // 判断该Apple是否是新用户
    async checkAppleIsNew(data) {
      if (!data.user) {
        this.$toast('Apple登录失败');
        return;
      }
      const params = {
        apple: data.user,
      };
      const res = await AuthProxy.checkAppleIsNew(params);
      if (res.success) {
        if (res.data) {
          // 老用户，直接登录
          this.postAPPAppleLogin(data);
        } else {
          // 新用户，显示弹窗
          this.showBind = true;
          this.bindType = 2;
        }
      }
    },
    // APP微信登录
    async postAPPWechatLogin(data) {
      const params = {
        ...data,
        clientType: this.getClientType(),
      };
      const res = await AuthProxy.appWechatLogin(params);
      if (res.success) {
        this.$store.dispatch('auth/login', res.data);
        this.$store.dispatch('account/find', {
          userId: res.data.id,
        });
      }
    },
    // APP Apple登录
    async postAPPAppleLogin(data) {
      const params = {
        apple: data.user,
        nickname: data.fullName.nickName,
      };
      const res = await AuthProxy.appAppleLogin(params);
      if (res.success) {
        this.$store.dispatch('auth/login', res.data);
        this.$store.dispatch('account/find', {
          userId: res.data.id,
        });
      }
    },
    // 根据已有的账号密码绑定微信，并登录
    async bindWechat() {
      const params = {
        ...this.wechatUserInfo,
        ...this.form,
        clientType: this.getClientType(),
      };
      const res = await AuthProxy.bindWechat(params);
      if (res.success) {
        this.$store.dispatch('auth/login', res.data);
        this.$store.dispatch('account/find', {
          userId: res.data.id,
        });
      }
    },
    // 根据已有的账号密码绑定苹果，并登录
    async bindApple() {
      const params = {
        apple: this.appleUserInfo.user,
        nickname: this.appleUserInfo.fullName.nickName,
        ...this.form,
      };
      const res = await AuthProxy.bindApple(params);
      if (res.success) {
        this.$store.dispatch('auth/login', res.data);
        this.$store.dispatch('account/find', {
          userId: res.data.id,
        });
      }
    },
    // 微信跳转授权
    wechatLogin() {
      this.$storage.setItem('wechatAuthFrom', 1);
      window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.appid}&redirect_uri=${window.location.origin}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
    },
    // 记住账号
    rememberUser() {
      if (this.isRemember) {
        localStorage.setItem('username', this.form.username);
      } else {
        localStorage.removeItem('username');
      }
    },
    /**
     * 登录
     *
     * @param {Object} form 用户登录信息
     */
    async login(form) {
      this.isLoading = true;
      const params = {
        ...form,
        clientType: this.getClientType(),
      };
      const res = await AuthProxy.login(params);
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
      if (!res.fail) {
        this.$store.dispatch('auth/login', res.data);
        this.$store.dispatch('account/find', {
          userId: res.data.id,
        });
      } else {
        this.$toast('账号或密码错误');
      }
    },
  },
};
</script>

<style lang="less" scoped>
.login-page {
  background-color: #fff;
  padding-bottom: 20px;
  .tips {
    position: absolute;
    bottom: 10px;
    font-size: 12px;
    color: #666;
    text-align: center;
    width: 100%;
    a {
      color: #619FFF!important;
    }
  }
  .actions {
    display: flex;
    justify-content: space-around;
    .van-button {
      flex: 1;
      margin: 0 20px;
    }
  }
  .form{
    .title {
      height:23px;
      font-size:24px;
      font-weight: normal;
      color:#333;
      line-height:22px;
      text-align: center;
      padding: 30px 0;
      margin: 0;
      img {
        height: 35px;
        margin-left: 90px;
      }
    }
    .item {
      margin: 16px auto;
      padding: 0 20px;
      text-align: right;
      .right {
        float: right;
      }
      &:after {
        content: '';
        display: table;
        clear: both;
      }
      button {
        box-sizing: border-box;
        width: 100%;
        height: 40px;
        border-radius:3px;
        outline: none;
        cursor: pointer;
      }
      input {
        width: 100%;
        box-sizing: border-box;
        padding: 0 15px;
        height: 40px;
        box-shadow: none;
        border: 1px solid #ccc;
      }
    }
  }
}
</style>
