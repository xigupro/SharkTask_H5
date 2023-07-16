<template>
  <div class="bind-phone-page">
    <form class="form">
      <div class="item">
          即将绑定手机号 {{form.phone}} 到以下账号:
      </div>
      <van-field v-model="form.username" placeholder="请输入账号" label="账号" />
      <van-field v-model="form.password" type="password" placeholder="请输入密码" label="密码" />
      <div class="item">
        <van-button type="primary" @click.prevent.stop="bindPhoneAndLogin(form)">绑定并登录</van-button>
      </div>
    </form>
  </div>
</template>

<script>
/**
 * 手机号绑定
*/
import {
  Checkbox,
  Button,
  Dialog,
  Field,
} from 'vant';
import AuthProxy from '@/proxies/auth';
import { judgeClient } from '@/utils/tools';

export default {
  name: 'login-index',
  data() {
    return {
      isLoading: false,
      form: {
        username: null,
        password: null,
        phone: this.$route.query.phone,
        code: this.$route.query.code,
      },
    };
  },
  components: {
    [Checkbox.name]: Checkbox,
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
    [Field.name]: Field,
  },
  computed: {
    systemInfo() {
      return this.$store.state.system.info;
    },
    // 是否通过验证
    isPassValidate() {
      return this.form.username && this.form.password;
    },
  },
  mounted() {
    const username = localStorage.getItem('username') || '';
    if (username && username !== 'null') {
      this.form.username = username;
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
    async bindPhoneAndLogin(form) {
      this.isLoading = true;
      const params = {
        ...form,
        clientType: this.getClientType(),
      };
      const res = await AuthProxy.bindPhoneAndLogin(params);
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
      if (!res.fail) {
        const result = Object.assign({}, this.$store.state.account.info, {
          phone: this.form.phone,
        });
        this.$store.dispatch('account/update', result);
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
.bind-phone-page {
  background-color: #fff;
  .form{
    .item {
      margin: 16px auto;
      padding: 0 20px;
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
    }
  }
}
</style>
