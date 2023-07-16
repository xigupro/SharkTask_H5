<template>
  <div class="group-member-list-wrapper">
    <div class="header">
      <div class="header-content">
        <span class="member-count text-ellipsis">群成员：{{currentConversation.groupProfile.memberCount}}</span>
        <van-button size="mini" @click="addGroupMemberVisible=true">添加群成员</van-button>
      </div>
      <van-popup v-model="addGroupMemberVisible" style="width:80%">
        <add-group-member></add-group-member>
      </van-popup>
    </div>
    <div class="scroll-content">
      <div class="group-member-list">
        <div v-for="member in members" :key="member.userID">
          <div
            class="group-member"
            @click="handleMemberClick(member)">
            <van-image width="40px" height="40px" round :title="getGroupMemberAvatarText(member.role)" :src="member.avatar" />
            <div class="member-name text-ellipsis">
              <span v-if="member.nameCard" :title="member.nameCard">{{ member.nameCard }}</span>
              <span v-else-if="member.nick" :title="member.nick">{{ member.nick }}</span>
              <span v-else :title="member.userID">{{ member.userID }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="more">
      <van-button size="mini" v-if="showLoadMore" @click="loadMore">查看更多</van-button>
    </div>
    <van-popup style="width: 80%" v-model="showMemberInfo">
      <group-member-info :member="selectedMember" />
    </van-popup>
  </div>
</template>

<script>
import { Popover, Button, Image, Popup } from 'vant'
import { mapState } from 'vuex'
import AddGroupMember from './add-group-member.vue'
import GroupMemberInfo from './group-member-info.vue'
export default {
  data() {
    return {
      addGroupMemberVisible: false,
      selectedMember: {},
      showMemberInfo: false,
      currentMemberID: '',
      count: 30 // 显示的群成员数量
    }
  },
  props: ['groupProfile'],
  components: {
    [Popover.name]: Popover,
    [Button.name]: Button,
    [Image.name]: Image,
    [Popup.name]: Popup,
    AddGroupMember,
    GroupMemberInfo
  },
  computed: {
    ...mapState({
      currentConversation: state => state.conversation.currentConversation,
      currentMemberList: state => state.group.currentMemberList
    }),
    showLoadMore() {
      return this.members.length < this.groupProfile.memberCount
    },
    members() {
      return this.currentMemberList.slice(0, this.count)
    }
  },
  methods: {
    handleMemberClick(member) {
      this.currentMemberID = member.userID;
      this.selectedMember = member;
      this.showMemberInfo = true;
    },
    getGroupMemberAvatarText(role) {
      switch (role) {
        case 'Owner':
          return '群主'
        case 'Admin':
          return '管理员'
        default:
          return '群成员'
      }
    },
    loadMore() {
      this.$store
        .dispatch('getGroupMemberList', this.groupProfile.groupID)
        .then(() => {
          this.count += 30
        })
    }
  }
}
</script>

<style lang="less" scoped>
// Width variables (appears count calculates by raw css)
@width2: 100%; // Appears 2 times
@width3: 40px; // Appears 2 times

.group-member-list-wrapper {
	.header {
		border-bottom: 1px solid #eee;
		padding: 10px 16px 10px 20px;
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
		.member-count {
			display: inline-block;
			font-size: 14px;
			line-height: 30px;
			max-width: 130px;
			vertical-align: bottom;
		}
		.btn-add-member {
			cursor: pointer;
			float: right;
			font-size: 28px;
			height: 30px;
			line-height: 32px;
			text-align: center;
			width: 30px;
			&:hover {
				color: #efefef;
			}
		}
	}
	.scroll-content {
		max-height: 250px;
		overflow-y: scroll;
		padding: 10px;
		.group-member-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
			width: @width2;
		}
		.group-member {
			align-content: center;
			color: #000;
			cursor: pointer;
			display: flex;
			flex-direction: column;
			height: 70px;
			justify-content: center;
			text-align: center;
			width: @width3;
      margin: 0 5px;
			.avatar {
				border-radius: 50%;
				height: 40px;
				width: @width3;
			}
			.member-name {
				font-size: 12px;
				text-align: center;
        margin-top: 5px;
			}
		}
	}
	.more {
		border-bottom: 1px solid #eee;
		padding: 0 20px;
	}
}
// .add-group-member {
//   cursor: pointer;
// }
// .add-button {
//   border: 1px solid gray;
//   text-align: center;
//   line-height: 30px;
// }
</style>
