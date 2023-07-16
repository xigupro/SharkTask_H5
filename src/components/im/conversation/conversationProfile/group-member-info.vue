<template>
  <div class="group-member-info">
    <div>
      <span class="label">用户ID:</span>
      {{ member.userID }}
      <van-button v-if="showCancelBan" size="mini" @click="cancelMute">取消禁言</van-button>
      <van-popover trigger="click" title="禁言" v-model="popoverVisible" v-show="showBan">
        <van-field
          v-model="muteTime"
          placeholder="请输入禁言时间，单位秒"
          @keydown.enter.native="setGroupMemberMuteTime"
        />
        <template #reference>
          <van-button size="mini" style="color:red;">禁言</van-button>
        </template>
      </van-popover>
    </div>
    <div>
      <span class="label">昵称:</span>
      {{ member.nick || '暂无' }}
    </div>
    <div>
      <span class="label">别名:</span>
      {{ member.nameCard || '暂无' }}
      <van-popover trigger="click" title="修改群名片" v-model="nameCardPopoverVisible" v-show="showEditNameCard">
        <van-field
          v-model="nameCard"
          placeholder="请输入群名片"
          @keydown.enter.native="setGroupMemberNameCard"
        />
        <template #reference>
          <van-button size="mini" style="color:red;">修改群名片</van-button>
        </template>
      </van-popover>
    </div>
    <div>
      <span class="label">角色:</span>
      <span class="content role" :title="changeRoleTitle">{{ member.role }}</span>
    </div>
    <div v-if="showMuteUntil">
      <span class="label">禁言至:</span>
      <span class="content">{{ muteUntil }}</span>
    </div>
    <van-button size="mini" v-if="canChangeRole" @click="changeMemberRole">
      {{
      member.role === 'Admin' ? '取消管理员' : '设为管理员'
      }}
    </van-button>
    <van-button size="mini" v-if="showKickout" style="color:red;" @click="kickoutGroupMember">踢出群组</van-button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Popover } from 'vant';
import { getFullDate } from '@/utils/date';
import { Field, Button } from 'vant';

export default {
  components: {
    [Popover.name]: Popover,
    [Field.name]: Field,
    [Button.name]: Button,
  },
  props: ['member'],
  data() {
    return {
      muteTime: '',
      popoverVisible: false,
      nameCardPopoverVisible: false,
      nameCard: this.member.nameCard
    }
  },
  computed: {
    ...mapState({
      currentConversation: state => state.conversation.currentConversation,
      currentUserProfile: state => state.user.currentUserProfile,
      current: state => state.current
    }),
    // 是否显示踢出群成员按钮
    showKickout() {
      return (this.isOwner || this.isAdmin) && !this.isMine
    },
    isOwner() {
      return this.currentConversation.groupProfile.selfInfo.role === 'Owner'
    },
    isAdmin() {
      return this.currentConversation.groupProfile.selfInfo.role === 'Admin'
    },
    isMine() {
      return this.currentUserProfile.userID === this.member.userID
    },
    canChangeRole() {
      return (
        this.isOwner &&
        ['ChatRoom', 'Public'].includes(this.currentConversation.subType)
      )
    },
    changeRoleTitle() {
      if (!this.canChangeRole) {
        return ''
      }
      return this.isOwner && this.member.role === 'Admin'
        ? '设为：Member'
        : '设为：Admin'
    },
    // 是否显示禁言时间
    showMuteUntil() {
      // 禁言时间小于当前时间
      return this.member.muteUntil * 1000 > this.current
    },
    // 是否显示取消禁言按钮
    showCancelBan() {
      if (
        this.showMuteUntil &&
        this.currentConversation.type === this.TIM.TYPES.CONV_GROUP &&
        !this.isMine
      ) {
        return this.isOwner || this.isAdmin
      }
      return false
    },
    // 是否显示禁言按钮
    showBan() {
      if (this.currentConversation.type === this.TIM.TYPES.CONV_GROUP) {
        return this.isOwner || this.isAdmin
      }
      return false
    },
    // 是否显示编辑群名片按钮
    showEditNameCard() {
      return this.isOwner || this.isAdmin
    },
    // 日期格式化后的禁言时间
    muteUntil() {
      return getFullDate(new Date(this.member.muteUntil * 1000))
    }
  },
  methods: {
    kickoutGroupMember() {
      this.tim
        .deleteGroupMember({
          groupID: this.currentConversation.groupProfile.groupID,
          reason: '我要踢你出群',
          userIDList: [this.member.userID]
        })
        .then(() => {
          this.$store.commit('deleteGroupMemeber', this.member.userID)
        })
        .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
    },
    changeMemberRole() {
      if (!this.canChangeRole) {
        return
      }
      let currentRole = this.member.role
      this.tim
        .setGroupMemberRole({
          groupID: this.currentConversation.groupProfile.groupID,
          userID: this.member.userID,
          role: currentRole === 'Admin' ? 'Member' : 'Admin'
        })
        .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
    },
    setGroupMemberMuteTime() {
      this.tim
        .setGroupMemberMuteTime({
          groupID: this.currentConversation.groupProfile.groupID,
          userID: this.member.userID,
          muteTime: Number(this.muteTime)
        })
        .then(() => {
          this.muteTime = ''
          this.popoverVisible = false
        })
        .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
    },
    // 取消禁言
    cancelMute() {
      this.tim
        .setGroupMemberMuteTime({
          groupID: this.currentConversation.groupProfile.groupID,
          userID: this.member.userID,
          muteTime: 0
        })
        .then(() => {
          this.muteTime = ''
        })
        .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
    },
    setGroupMemberNameCard() {
      if (this.nameCard.trim().length === 0) {
        this.$toast({
          message: '不能设置空的群名片',
          type: 'warning'
        })
        return
      }
      this.tim
        .setGroupMemberNameCard({
          groupID: this.currentConversation.groupProfile.groupID,
          userID: this.member.userID,
          nameCard: this.nameCard
        })
        .then(() => {
          this.nameCardPopoverVisible = false
          this.$toast({
            message: '修改成功'
          })
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
.group-member-info {
  padding: 20px;
}
.label {
  color: rgb(204, 200, 200);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
