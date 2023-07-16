<template>
  <div class="side-bar-wrapper">
    <div class="bar-left">
      <!-- <my-profile /> -->
      <van-sidebar v-model="active" @change="handleClick">
        <van-sidebar-item title="会话" />
        <van-sidebar-item title="群组" />
        <van-sidebar-item title="好友" />
        <van-sidebar-item title="黑名单" />
        <!-- <van-sidebar-item title="群直播" /> -->
      </van-sidebar>
      <!-- <div class="bottom">
        <div class="iconfont icon-tuichu" @click="$store.dispatch('logout')">退出</div>
      </div> -->
    </div>
    <div class="bar-right">
      <conversation-list v-show="active === 0" />
      <group-list v-show="active === 1" />
      <friend-list v-show="active === 2" />
      <black-list v-show="active === 3" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { Sidebar, SidebarItem } from 'vant'
import MyProfile from '../my-profile'
import ConversationList from '../conversation/conversation-list'
import GroupList from '../group/group-list'
import FriendList from '../friend/friend-list'
import BlackList from '../blacklist/blacklist'

export default {
  name: 'SideBar',
  components: {
    MyProfile,
    ConversationList,
    GroupList,
    FriendList,
    BlackList,
    [Sidebar.name]: Sidebar,
    [SidebarItem.name]: SidebarItem,
  },
  data() {
    return {
      active: 0,
    }
  },
  computed: {
    ...mapGetters(['totalUnreadCount']),
    ...mapState({
      userID: state => state.user.userID,
    }),
    showAddButton() {
      return [0, 1].includes(
        this.active
      )
    }
  },
  methods: {
    handleClick(index) {
      switch (index) {
        case 0:
          this.active = 0
          break
        case 1:
          this.active = 1
          break
        case 2:
          this.active = 2
          this.getFriendList()
          break
        case 3:
          this.active = 3
          break
        case 4:
          this.groupLive()
          break
      }
    },
    handleRefresh() {
      switch (this.active) {
        case 0:
          this.tim.getConversationList().catch(error => {
            this.$toast({
              type: 'error',
              message: error.message
            })
          })
          break
        case 1:
          this.getGroupList()
          break
        case 2:
          this.getFriendList()
          break
        case 3:
          this.$store.dispatch('getBlacklist')
          break
      }
    },
    getGroupList() {
      this.tim
        .getGroupList()
        .then(({ data: groupList }) => {
          this.$store.dispatch('updateGroupList', groupList)
        })
        .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
    },
    getFriendList() {
      this.tim
        .getFriendList()
        .then(({ data: friendList }) => {
          this.$store.commit('upadteFriendList', friendList)
        })
        .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
        .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
    },
    groupLive() {
      this.$store.commit('updateGroupLiveInfo', {
        groupID: 0,
        anchorID: this.userID,
      })
      this.$bus.$emit('open-group-live', { channel: 2 })
    },
  }
}
</script>

<style lang="less" scoped>
.side-bar-wrapper {
  height: 100%;
  color: #000;
  display: flex;
  width: 100%;
  overflow: hidden;

  .bar-left {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    width: 80px;

    .tab-items {
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      .iconfont {
        position: relative;
        margin: 0;
        height: 70px;
        line-height: 70px;
        text-align: center;
        cursor: pointer;
        user-select: none;
        -moz-user-select: none;
      }

      .active {
        color: #fff;
        background-color: #000;

        &::after {
          content: ' ';
          display: block;
          position: absolute;
          top: 0;
          z-index: 0;
          height: 70px;
          // border-left 4px solid $border-highlight
          border-left: 4px solid #eee;
        }
      }

      .unread {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 999;
        display: inline-block;
        height: 18px;
        padding: 0 6px;
        font-size: 12px;
        color: #FFF;
        line-height: 18px;
        text-align: center;
        white-space: nowrap;
        border-radius: 10px;
        background-color: red;
      }
    }

    .bottom {
      height: 70px;

      &>span {
        display: block;
      }

      .btn-more {
        width: 100%;
        height: 70px;
        line-height: 70px;
        color: #eee;
        text-align: center;
        cursor: pointer;
      }

      .iconfont {
        height: 70px;
        line-height: 70px;
        text-align: center;
        cursor: pointer;
        color: #eee;
        user-select: none;
        -moz-user-select: none;
      }

      .iconfont:hover {
        color: white;
      }
    }

    .btn-more:hover {
      color: #fff;
    }
  }

  .bar-right {
    // flex 1
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    position: relative;
  }
  .group-live {
    text-align: center;
  }
}
</style>
