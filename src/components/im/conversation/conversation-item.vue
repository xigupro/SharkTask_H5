<template>
    <div
        class="conversation-item-container"
        :class="{ 'choose': conversation.conversationID === currentConversation.conversationID }"
        @click="selectConversation"
    >
      <div class="close-btn">
        <van-icon name="cross" @click="deleteConversation" />
      </div>
      <div class="warp">
        <van-image width="50px" height="50px" round :src="avatar" :type="conversation.type" />
        <div class="content">
          <div class="row-1">
            <div class="name">
              <div class="text-ellipsis">
                <span :title="conversation.userProfile.nick || conversation.userProfile.userID"
                  v-if="conversation.type ===  TIM.TYPES.CONV_C2C"
                  >{{conversation.userProfile.nick || conversation.userProfile.userID}}
                </span>
                <span :title="conversation.groupProfile.name || conversation.groupProfile.groupID"
                  v-else-if="conversation.type ===  TIM.TYPES.CONV_GROUP"
                  >{{conversation.groupProfile.name || conversation.groupProfile.groupID}}
                </span>
                <span
                  v-else-if="conversation.type === TIM.TYPES.CONV_SYSTEM"
                  >系统通知
                </span>
              </div>
            </div>
            <div class="unread-count" v-if="showUnreadCount">
              <span class="badge">
                {{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}}
              </span>
            </div>
          </div>
          <div class="row-2">
            <div class="summary">
              <div v-if="conversation.lastMessage" class="text-ellipsis">
                <span class="remind"  v-if="hasMessageAtMe">{{messageAtMeText}}</span>
                <span class="text" :title="conversation.lastMessage.messageForShow">
                  {{messageForShow}}
                </span>
              </div>
            </div>
            <div class="date">
              {{date}}
            </div>
          </div>
        </div>
      </div>
    </div>

</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { isToday, getDate, getTime } from '@/utils/date'
import { Image, Icon } from 'vant'
export default {
  name: 'conversation-item',
  props: ['conversation'],
  data() {
    return {
      popoverVisible: false,
      showMessageAtMe_text:''
    }
  },
  components: {
    [Image.name]: Image,
    [Icon.name]: Icon,
  },
  computed: {
    hasMessageAtMe() {
      return (
              this.currentConversation.conversationID !==
              this.conversation.conversationID && this.conversation.groupAtInfoList && this.conversation.groupAtInfoList.length > 0
      )
    },
    messageAtMeText() {
      let text = ''
      if (this.conversation.groupAtInfoList.length > 0) {
        this.conversation.groupAtInfoList.forEach((item) => {
          if (item.atTypeArray[0] === this.TIM.TYPES.CONV_AT_ME) {
            text.indexOf('[@所有人]') !== -1 ? text = '[@所有人][有人@我]' : text = '[有人@我]'
          }
          if (item.atTypeArray[0] === this.TIM.TYPES.CONV_AT_ALL) {
            text.indexOf('[有人@我]') !== -1 ? text = '[有人@我][@所有人]' : text = '[@所有人]'
          }
          if (item.atTypeArray[0] === this.TIM.TYPES.CONV_AT_ALL_AT_ME) {
            text = '[@所有人][有人@我]'
          }
        })
      }
      return text
    },
    showUnreadCount() {
      if (this.$store.getters.hidden) {
        return this.conversation.unreadCount > 0
      }
      // 是否显示未读计数。当前会话和未读计数为0的会话，不显示。
      return (
        this.currentConversation.conversationID !==
          this.conversation.conversationID && this.conversation.unreadCount > 0
      )
    },
    date() {
      if (
        !this.conversation.lastMessage ||
        !this.conversation.lastMessage.lastTime
      ) {
        return ''
      }
      const date = new Date(this.conversation.lastMessage.lastTime * 1000)
      if (isToday(date)) {
        return getTime(date)
      }
      return getDate(date)
    },
    avatar: function() {
      switch (this.conversation.type) {
        case 'GROUP':
          return this.conversation.groupProfile.avatar
        case 'C2C':
          return this.conversation.userProfile.avatar
        default:
          return ''
      }
    },
    conversationName: function() {
      if (this.conversation.type === this.TIM.TYPES.CONV_C2C) {
        return this.conversation.userProfile.nick || this.conversation.userProfile.userID
      }
      if (this.conversation.type === this.TIM.TYPES.CONV_GROUP) {
        return this.conversation.groupProfile.name || this.conversation.groupProfile.groupID
      }
      if (this.conversation.type === this.TIM.TYPES.CONV_SYSTEM) {
        return '系统通知'
      }
      return ''
    },
    showGrayBadge() {
      if (this.conversation.type !== this.TIM.TYPES.CONV_GROUP) {
        return false
      }
      return (
        this.conversation.groupProfile.selfInfo.messageRemindType ===
        'AcceptNotNotify'
      )
    },
    messageForShow() {
      if (this.conversation.lastMessage.isRevoked) {
        if (this.conversation.lastMessage.fromAccount === this.currentUserProfile.userID) {
          return '你撤回了一条消息'
        }
        if (this.conversation.type === this.TIM.TYPES.CONV_C2C) {
          return '对方撤回了一条消息'
        }
        return `${this.conversation.lastMessage.fromAccount}撤回了一条消息`
      }
      return this.conversation.lastMessage.messageForShow
    },
    ...mapState({
      currentConversation: state => state.conversation.currentConversation,
      currentUserProfile: state => state.user.currentUserProfile
    }),
    ...mapGetters(['toAccount'])
  },
  mounted() {

  },
  methods: {
    selectConversation() {
      this.$router.push({ name: 'im.chat' });
      if (this.conversation.conversationID !== this.currentConversation.conversationID) {
        this.$store.dispatch(
          'checkoutConversation',
          this.conversation.conversationID
        )
      }
    },
    deleteConversation(event) {
      // 停止冒泡，避免和点击会话的事件冲突
      event.stopPropagation()
      this.tim
        .deleteConversation(this.conversation.conversationID)
        .then(() => {
          this.$toast({
            message: `会话【${this.conversationName}】删除成功!`,
            type: 'success'
          })
          this.popoverVisible = false
          this.$store.commit('resetCurrentConversation')
        })
        .catch(error => {
          this.$toast({
            message: `会话【${this.conversationName}】删除失败!, error=${error.message}`,
            type: 'error'
          })
          this.popoverVisible = false
        })
    },
    showContextMenu() {
      this.popoverVisible = true
    },
  }
}
</script>

<style lang="less" scoped>


// Width variables (appears count calculates by raw css)
@width0: 40px; // Appears 2 times
@width1: 0px; // Appears 2 times

// Height variables (appears count calculates by raw css)
@height0: 40px; // Appears 2 times

.conversation-item-container {
	cursor: pointer;
	overflow: hidden;
	padding: 10px;
	position: relative;
	transition: 0.2s;
	.close-btn {
		color: #666;
		position: absolute;
    right: 5px;
    top: 10px;
		transition: all 0.2s ease;
	}
	.warp {
		display: flex;
	}
	.avatar {
		border-radius: 50%;
		flex-shrink: 0;
		height: @height0;
		margin-right: 10px;
		width: @width0;
	}
	.content {
		flex: 1;
		height: @height0;
		overflow: hidden;
    margin-left: 10px;
		.row-1 {
			display: flex;
			line-height: 21px;
			.name {
				color: #000;
				flex: 1;
				min-width: @width1;
			}
			.unread-count {
				flex-shrink: 0;
				font-size: 12px;
				.badge {
					background-color: red;
					border-radius: 10px;
					color: #ffffff;
					display: inline-block;
					font-size: 12px;
					height: 18px;
					line-height: 18px;
					max-width: @width0;
					padding: 0 6px;
					text-align: center;
					vertical-align: bottom;
					white-space: nowrap;
				}
			}
		}
		.row-2 {
			display: flex;
			font-size: 12px;
			padding-top: 3px;
			.summary {
				color: #333;
				flex: 1;
				min-width: @width1;
				overflow: hidden;
				.remind {
					color: red;
				}
			}
			.date {
				color: #999;
				flex-shrink: 0;
				padding-left: 10px;
				text-align: right;
			}
		}
	}
}
.choose {
  background-color: #eee;
}
.context-menu-button {
  padding: 10px;
  border: 2px solid #eee;
  border-radius: 8px;
}
</style>
