<template>
  <div class="phone-login-page">
    <form class="form">
      <h2 class="title">
          {{action === 'bind' ? '绑定手机号' : '手机号登录'}}
      </h2>
      <van-field
        v-model="phone"
        center
        type="tel"
        label="手机号"
        placeholder="请输入手机号">
        <template slot="button">
          <van-button disabled size="small" v-show="!isTimeout">
            <van-count-down
              ref="countDown"
              :time="time"
              @finish="timeout">
              <template v-slot="timeData">
                <span>{{ timeData.seconds }}S</span>
              </template>
            </van-count-down>
          </van-button>
          <van-button
            v-show="isTimeout"
            size="small"
            type="primary"
            @click.prevent="sendSms">发送验证码</van-button>
        </template>
      </van-field>
      <van-field maxlength="6" v-model="code" type="digit" placeholder="请输入验证码" label="验证码" />
      <div class="item">
        <van-button type="primary" block @click="checkPhoneIsNew" :disabled="isLoading" >
          <template v-if="action === 'bind'">
            {{isLoading ? '绑定中...' : '绑定'}}
          </template>
          <template v-else>
            {{isLoading ? '登录中...' : '登录'}}
          </template>
        </van-button>
      </div>
    </form>
  </div>
</template>

<script>
/**
 * 手机号登录
*/
import {
  Field,
  Button,
  Dialog,
  CountDown,
} from 'vant';
import AuthProxy from '@/proxies/auth';
import { judgeClient } from '@/utils/tools';

export default {
  name: 'login-index',
  data() {
    return {
      showBind: false,
      isLoading: false,
      phone: '',
      code: '',
      // 是否可从新获取验证码
      isTimeout: true,
      // 倒计时
      time: 60000,
      // bind绑定手机号，默认为手机号登录
      action: this.$route.query.action,
    };
  },
  components: {
    [Field.name]: Field,
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
    [CountDown.name]: CountDown,
  },
  computed: {
    systemInfo() {
      return this.$store.state.system.info;
    },
    // 手机号是否通过验证
    isPhoneValidate() {
      return /^(1[3,4,5,7,8,9])\d{9}$/.test(this.phone);
    },
    isCodeValidate() {
      return /^\d{6}$/.test(this.code);
    },
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
    // 倒计时结束
    timeout() {
      this.isTimeout = true;
    },
    // 获取短信验证码
    async sendSms() {
      if (!this.isPhoneValidate) {
        this.$toast('请输入正确的手机号');
        return;
      }
      this.isTimeout = false;
      this.$refs.countDown.reset();
      const params = {
        phone: this.phone,
      };
      const res = await AuthProxy.sendSms(params);
      if (res.success) {
        this.$toast('发送成功');
      }
    },
    // 判断该手机号是否是新用户
    async checkPhoneIsNew() {
      if (!this.isPhoneValidate) {
        this.$toast('手机号不正确');
        return;
      }
      if (!this.isCodeValidate) {
        this.$toast('验证码不正确');
        return;
      }
      this.isLoading = true;
      const params = {
        phone: this.phone,
        code: this.code,
      };
      const res = await AuthProxy.checkPhoneIsNew(params);
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
      if (res.success) {
        if (res.data) {
          if (this.action === 'bind') {
            this.$toast('此手机号已被使用');
          } else {
            // 老用户，直接登录
            this.postPhoneLogin(params);
          }
        } else {
          if (this.action === 'bind') {
            // 如果是绑定，则直接根据当前登录token绑定手机号码
            this.bindPhoneByToken();
          } else {
            // 新用户，显示弹窗
            Dialog.confirm({
              title: '',
              message: '该手机号未注册过本平台，是否绑定账号？',
              cancelButtonText: '直接登录',
              confirmButtonText: '去绑定',
            }).then(() => {
              // 去绑定
              this.gotoBind();
            }).catch(() => {
              // 直接登录
              this.postPhoneLogin(params);
            });
          }
        }
      }
    },
    gotoBind() {
      this.$router.push({
        path: '/auth/bind',
        query: {
          code: this.code,
          phone: this.phone,
        },
      });
    },
    // 已登录的情况，根据token绑定手机号
    async bindPhoneByToken() {
      const params = {
        phone: this.phone,
        code: this.code,
      };
      const res = await AuthProxy.bindPhoneByToken(params);
      if (res.success) {
        this.$store.dispatch('account/find', {
          userId: this.$storage.getItem('id'),
        });
        this.$toast('绑定成功');
        setTimeout(() => {
          this.$router.push({
            name: 'ucenter.index',
          });
        }, 2000);
      }
    },
    // 手机号登录
    async postPhoneLogin(data) {
      const params = {
        ...data,
        clientType: this.getClientType(),
      };
      const res = await AuthProxy.phoneLogin(params);
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
  },
};
</script>

<style lang="less" scoped>
.phone-login-page {
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
