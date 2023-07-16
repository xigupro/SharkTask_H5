<template>
  <div class="register-page">
    <form class="form">
      <h2 class="title">
          注册
      </h2>
      <div class="item">
          <input
            placeholder="用户名"
            v-model="form.username">
          <span style="color:red" v-show="!usernameValidStatus">请输入6~18位字母/数字</span>
      </div>
      <div class="item">
          <input
            type="text"
            placeholder="请输入密码"
            v-model="form.password">
          <span style="color:red" v-show="!passwordValidStatus">请输入6~16位密码，区分大小写</span>
      </div>
      <div class="item">
          <input
            type="text"
            placeholder="确认密码"
            v-model="form.confirmPassword">
          <span style="color:red" v-show="!confirmPasswordValidStatus">两次输入的密码不一致</span>
      </div>
      <div class="item">
          <van-button
            type="primary"
            @click.prevent.stop="register(form)"
            :disabled="!isPassValidate"
            :loading="isLoading">注册</van-button>
      </div>
      <div class="item">
          <router-link to="/auth/login">
            已有账号？去登录
          </router-link>
      </div>
    </form>
  </div>
</template>

<script>
/**
 * 登录页
*/
import {
  Button,
} from 'vant';
import AuthProxy from '@/proxies/auth';

export default {

  name: 'register-index',
  data() {
    return {
      isLoading: false,
      form: {
        username: null,
        password: null,
        confirmPassword: null,
      },
    };
  },
  components: {
    [Button.name]: Button,
  },
  computed: {
    // 是否通过验证
    isPassValidate() {
      return this.usernameValidStatus
             && this.passwordValidStatus
             && this.confirmPasswordValidStatus;
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
    usernameValidStatus() {
      return /^[A-Za-z0-9]{6,18}$/.test(this.form.username);
    },
    passwordValidStatus() {
      return /^.{6,16}$/.test(this.form.password);
    },
    confirmPasswordValidStatus() {
      return this.form.password === this.form.confirmPassword;
    },
  },
  methods: {
    /**
     * 登录
     *
     * @param {Object} form 用户登录信息
     */
    async register(form) {
      if (!this.systemInfo.show_register_entry) {
        this.$toast('注册入口已关闭');
        return;
      }
      this.isLoading = true;
      const params = {
        ...form,
      };
      const res = await AuthProxy.register(params);
      this.isLoading = false;
      if (!res.fail) {
        this.$toast('注册成功');
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
.register-page{
  background-color: #fff;
  padding-bottom: 20px;
  .form {
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
