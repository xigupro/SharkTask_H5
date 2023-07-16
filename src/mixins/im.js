export default {
  methods: {
    // 即时通讯登录
    imLogin(userID) {
      const userSig = window.genTestUserSig(userID)
      const params = {
        userID,
        userSig: userSig.userSig,
      };
      const sdkAppID = userSig.SDKAppID;
      this.tim
        .login(params)
        .then(() => {
          this.$store.commit('toggleIsLogin', true)
          this.$store.commit('startComputeCurrent')
          this.$store.commit({
            type: 'GET_USER_INFO',
            userID,
            userSig: params.userSig,
            sdkAppID,
          })
        })
        .catch((error) => {
          this.$toast({
            message: `登录失败：${error.message}`,
            type: 'error',
          })
        })
    },
  },
}
