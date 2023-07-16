<template>
  <xg-layout class="account-password-page">
    <van-cell-group>
      <van-cell title="用户名" :value="form.username" />
      <van-field
        v-model="form.password"
        :error="!passwordValidStatus"
        required
        label="密码"
        :error-message="!passwordValidStatus? '密码由6-16位字母和数字组成': ''"
        placeholder="请输入密码" />
    </van-cell-group>
    <div class="submit">
    <van-button
      type="primary"
      round
      block
      @click.prevent.stop="update(form)"
      :disabled="!isPassValidate"
      :loading="isLoading">提交</van-button>
    </div>
  </xg-layout>
</template>

<script>
import {
  Button,
  Field,
  Cell,
  CellGroup,
} from 'vant';
import XgLayout from '@/components/layouts/minimal';
import UserProxy from '@/proxies/users';

export default {

  name: 'setting-index',
  data() {
    return {
      isLoading: false,
      form: {
        username: null,
        password: null,
      },
    };
  },
  components: {
    XgLayout,
    [Button.name]: Button,
    [Field.name]: Field,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
  },
  computed: {
    userInfo() {
      return this.$store.state.account.info;
    },
    // 是否通过验证
    isPassValidate() {
      return this.passwordValidStatus;
    },
    passwordValidStatus() {
      return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/.test(this.form.password);
    },
  },
  watch: {
    '$store.state.account.info.id'() {
      this.form.username = this.$store.state.account.info.username;
      this.form.password = this.$store.state.account.info.password;
    },
  },
  methods: {
    async update(form) {
      this.isLoading = true;
      const params = {
        userId: this.$store.state.account.info.id,
        ...form,
      };
      const res = await UserProxy.updateUser(params);
      this.isLoading = false;
      if (!res.fail) {
        this.$toast('修改成功，请重新登录');
        setTimeout(() => {
          this.$router.push({
            name: 'auth.login',
          });
        }, 1000);
      }
    },
  },
  created() {
    if (this.userInfo.id) {
      this.form.username = this.userInfo.username;
      this.form.password = this.userInfo.password;
    }
  },
};
</script>

<style lang="less" scoped>
.account-password-page {
  background-color: #fff;
  .submit {
    padding: 10px;
  }
}
</style>
