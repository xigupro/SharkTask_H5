<template>
  <div class="login-wrapper">
    <van-button type="primary" @click="login" style="width:100%;">登录</van-button>
  </div>
</template>

<script>
import { Button } from 'vant';

export default {
  name: 'Login',
  data() {
    return {
      userID: 'user0',
    }
  },
  components: {
    [Button.name]: Button
  },
  computed: {
    userID() {
      return this.$store.state.account.info.id;
    },
  },
  methods: {
    login() {
      this.$store.dispatch('login', this.userID)
    }
  }
}
</script>

<style lang="less" scoped>
.login-wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 24px;
  background: #fff;
  color: #000;
  border-radius: 5px;
  box-shadow: 0 11px 20px 0 rgba(0, 0, 0, .3);
}
</style>
