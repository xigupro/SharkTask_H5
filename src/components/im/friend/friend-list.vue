<template>
  <div class="friend-list-container" :class="{'default': !hasFriend}">
    <div class="header">
      <van-button size="mini" @click="showAddFriendModal = true">
        添加好友
      </van-button>
    </div>
    <div v-if="hasFriend">
      <friend-item v-for="friend in friendList" :key="friend.userID" :friend="friend" />
    </div>
    <div style="color:gray;" v-else>暂无好友</div>
    <van-dialog
      :showCancelButton="true"
      title="添加好友"
      v-model="showAddFriendModal"
      @confirm="addToFriendList">
      <van-field placeholder="请输入用户ID" v-model="userID"/>
    </van-dialog>
  </div>
</template>

<script>
import { Field, Dialog, Button } from 'vant';
import { mapState } from 'vuex'
import FriendItem from './friend-item.vue'
export default {
  components: {
    FriendItem,
    [Field.name]: Field,
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
  },
  data() {
    return {
      userID: null,
      showAddFriendModal: false
    }
  },
  computed: {
    ...mapState({
      friendList: state => state.friend.friendList
    }),
    hasFriend() {
      return this.friendList.length > 0
    }
  },
  methods: {
    getFriendList() {
      this.tim
        .getFriendList()
        .then(({ data: friendList }) => {
          this.$store.commit('upadteFriendList', friendList)
        })
    },
    // 添加好友
    addToFriendList() {
      if (!this.userID) {
        this.$toast('请输入用户ID')
        return
      }
      this.tim
        .addFriend({
            to: this.userID,
            source: 'AddSource_Type_APP'
        }).then((res) => {
          this.$toast('添加成功')
          this.showAddFriendModal = false
          this.getFriendList()
        }).catch((err) => {
          this.$toast(err)
        })
    },
  }
}
</script>

<style lang="less" scpoed>
.default {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  overflow-y: scroll;
}
.header {
  padding: 10px;
  text-align: right;
}
</style>
