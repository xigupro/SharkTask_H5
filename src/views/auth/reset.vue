<template>
  <div class="phone-login-page">
    <form class="form">
      <h2 class="title">
          重置密码
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
      <van-field maxlength="16" v-model="password" type="digit" placeholder="请输入新密码" label="密码" />
      <div class="item">
        <van-button type="primary" block @click="checkPhoneIsNew" :disabled="isLoading" >
          {{isLoading ? '提交中...' : '提交'}}
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
import UserProxy from '@/proxies/users';

export default {
  name: 'login-index',
  data() {
    return {
      isLoading: false,
      phone: '',
      code: '',
      password: '',
      // 是否可从新获取验证码
      isTimeout: true,
      // 倒计时
      time: 60000,
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
          this.updateUserPassword();
        } else {
          this.$toast('该手机号不存在');
        }
      }
    },
    // 根据手机号修改密码
    async updateUserPassword() {
      this.isLoading = true;
      const params = {
        phone: this.phone,
        password: this.password,
      };
      const res = await UserProxy.updateUserPassword(params);
      this.isLoading = false;
      if (!res.fail) {
        this.$toast('重置成功，请重新登录');
        setTimeout(() => {
          this.$router.push({
            name: 'auth.login',
          });
        }, 1000);
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
