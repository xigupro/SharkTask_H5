<template>
  <div class="blacklist-item-wrapper">
    <img
      class="avatar"
      :src="profile.avatar ? profile.avatar : 'http://imgcache.qq.com/open/qcloud/video/act/webim-avatar/avatar-2.png'"
    />
    <div class="item">{{profile.nick||profile.userID}}</div>
    <van-button size="mini" @click="removeFromBlacklist">取消拉黑</van-button>
  </div>
</template>

<script>
import { Button } from 'vant'
export default {
  name: 'BlacklistItem',
  components: {
    [Button.name]: Button
  },
  props: {
    profile: {
      type: Object,
      required: true
    }
  },
  methods: {
    removeFromBlacklist() {
      this.tim
        .removeFromBlacklist({ userIDList: [this.profile.userID] })
        .then(() => {
          this.$store.commit('removeFromBlacklist', this.profile.userID)
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
.item {
  padding-left: 10px;
  width: 100%;
  color: #111;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
}

.blacklist-item-wrapper {
  padding-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .van-button {
    white-space: nowrap;
  }
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
</style>
