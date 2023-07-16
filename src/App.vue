<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script>
import ImMixin from '@/mixins/im'

export default {
  name: 'task-paradise',
  computed: {
    systemInfo() {
      return this.$store.state.system.info;
    },
    userInfo() {
      return this.$store.state.account.info;
    },
  },
  mixins: [ImMixin],
  watch: {
    systemInfo(val) {
      if (val.need_bind_phone
          && this.userInfo.hasOwnProperty('phone')
          && !this.userInfo.phone) {
        this.needBindPhone();
      }
    },
    userInfo(val) {
      if (val.hasOwnProperty('phone')
          && !val.phone
          && this.systemInfo.need_bind_phone) {
        this.needBindPhone();
      }
      if (val.id) {
        // this.imLogin(`${val.id}`)
      }
    },
    '$route'() {
      if (this.systemInfo
          && this.systemInfo.need_bind_phone
          && this.userInfo.hasOwnProperty('phone')
          && !this.userInfo.phone) {
        this.needBindPhone();
      }
    },
  },
  methods: {
    needBindPhone() {
      const session = this.$storage.getItem('session');
      // 在以下路由不进行跳转
      const whiteList = ['auth.bind', 'auth.phone', 'about.policy', 'about.agreement'];
      const currentRoute = this.$route.name;
      if (session && session !== 'null' && !whiteList.includes(currentRoute)) {
        this.$toast('请绑定手机号');
        this.$router.push({
          name: 'auth.phone',
          query: {
            action: 'bind',
          },
        });
      }
    },
  },
  mounted() {
    this.$store.dispatch('system/find');
    const userId = this.$storage.getItem('id');
    const session = this.$storage.getItem('session');
    if (session && session !== 'null' && userId && userId !== 'null') {
      this.$store.dispatch('account/find', {
        userId,
      });
    }
  },
};
</script>
<style lang="less">
#app {
  a {
    color: #333;
    -webkit-touch-callout: none;
  }
}
</style>
