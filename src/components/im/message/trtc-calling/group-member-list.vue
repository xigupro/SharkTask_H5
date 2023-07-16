<template>
    <div class="group-member-list-wrapper">
        <div class="header">
            <span class="member-count text-ellipsis">群成员：{{currentConversation.groupProfile.memberCount}}</span>
        </div>
        <div class="scroll-content">
            <div class="group-member-list">
                <el-checkbox-group v-model="callingList" @change="handleCheckedMembersChange">
                    <el-checkbox v-if="type === 'groupAt'"  :label="JSON.stringify({userID:this.TIM.TYPES.MSG_AT_ALL,nick:'所有人'})" >
                        <div class="group-member">
                            <van-image  :src="''" />
                            <div class="member-name text-ellipsis">
                                <span >所有人</span>
                            </div>
                        </div>
                    </el-checkbox>
                    <el-checkbox v-for="member in members" :disabled="member.userID===userID" :label="JSON.stringify({userID:member.userID,nick:member.nameCard || member.nick || member.userID})" :key="member.userID">
                       <div class="group-member">
                           <van-image  :src="member.avatar" />
                           <div class="member-name text-ellipsis">
                               <span v-if="member.nameCard" >{{ member.nameCard }}</span>
                               <span v-else-if="member.nick" >{{ member.nick }}</span>
                               <span v-else >{{ member.userID }}</span>
                           </div>
                       </div>
                    </el-checkbox>
                </el-checkbox-group>
            </div>
        </div>
        <div class="more">
            <van-button size="mini" v-if="showLoadMore" @click="loadMore">查看更多</van-button>
        </div>
    </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { Button, Image } from 'vant';
  export default {
    props:['type'],
    data() {
      return {
        callingList:[],
        addGroupMemberVisible: false,
        currentMemberID: '',
        count: 30 // 显示的群成员数量
      }
    },
    components: {
      [Button.name]: Button,
      [Image.name]: Image,
    },
    computed: {
      ...mapState({
        userID: state => state.user.userID,
        currentConversation: state => state.conversation.currentConversation,
        currentMemberList: state => state.group.currentMemberList
      }),
      showLoadMore() {
        return this.members.length < this.currentConversation.groupProfile.memberCount
      },
      members() {
        return this.currentMemberList.slice(0, this.count)
      }
    },
    methods: {
      handleCheckedMembersChange() {
        this.$emit('getList',this.callingList)
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
@width1: 100px; // Appears 2 times
@width3: 100%; // Appears 2 times


.group-member-list-wrapper {
	.header {
		border-bottom: 1px solid #eee;
		height: 50px;
		padding: 10px 16px 10px 20px;
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
				color: #eee;
			}
		}
	}
	.scroll-content {
		max-height: 250px;
		overflow-y: scroll;
		padding: 10px 15px 10px 15px;
		width: @width3;
		.group-member-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
			width: @width3;
		}
		.group-member {
			align-content: center;
			color: #000;
			cursor: pointer;
			display: flex;
			flex-direction: column;
			height: 80px;
			justify-content: center;
			text-align: center;
			width: @width1;
			.avatar {
				border-radius: 50%;
				height: 40px;
				margin: 0 auto;
				width: 40px;
			}
			.member-name {
				font-size: 12px;
				text-align: center;
				width: @width1;
			}
		}
	}
	.more {
		border-bottom: 1px solid #eee;
		padding: 0 20px;
	}
}
</style>
