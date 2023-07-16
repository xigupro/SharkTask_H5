<template>
  <div class="friend-item-container" @click="toChat">
    <van-image width="50" height="50" :src="friend.profile.avatar" />
    <div class="friend-name">{{friend.profile.nick||friend.userID}}</div>
  </div>
</template>

<script>
import { Image } from 'vant';
export default {
  props: {
    friend: {
      type: Object,
      required: true
    }
  },
  components: {
    [Image.name]: Image,
  },
  methods:{
    // 去聊天
    toChat() {
      this.$store
        .dispatch('checkoutConversation', `C2C${this.friend.userID}`)
        .then(() => {
          this.$router.push({ name: 'im.chat' })
        }).catch(() => {
          this.$toast({
            message: '没有找到该用户',
            type: 'warning',
          })
        })
    },
    handleFriendClick() {
      this.tim.getConversationProfile(`C2C${this.friend.userID}`).then(({data})=>{
        this.$store.commit('updateCurrentConversation', data)
      })
      .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
.friend-item-container {
  display: flex;
  align-items: center;
  padding: 10px;
  .friend-name {
    margin-left: 10px;
  }
}
</style>
