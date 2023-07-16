<template>
    <div class="comment-wrapper">
      <div class="message-list" ref="message-list">
        <template v-for="(item, index) in avChatRoomMessageList">
          <!-- 进群提示消息 -->
          <template v-if="item.type === 'TIMGroupTipElem' && item.payload.groupJoinType === 1">
            <div class="msg-item-join" :key="`join_msg_item_${index}`">{{`欢迎${item.nick || item.payload.userIDList.join('')}进入直播间`}}</div>
          </template>
          <!-- 退群提示消息 -->
          <template v-if="item.type === 'TIMGroupTipElem' && item.payload.groupJoinType === 0">
            <div class="msg-item-join" :key="`leave_msg_item_${index}`">{{`${item.nick || item.payload.userIDList.join('')}离开了直播间`}}</div>
          </template>
          <!-- 普通文本消息 -->
          <template v-if="item.type === 'TIMTextElem'">
            <div class="msg-item-text" :key="`text_msg_item_${index}`">
              <img class="avatar" :src="getAvatar(item)" alt=""/>
              <p class="nick" >{{getNick(item)}}</p>
              <p class="msg" ><span class="msg-text">{{ item.payload.text }}</span></p>
            </div>
          </template>
          <template v-if="item.type === 'TIMCustomElem'">
            <!-- native 弹幕消息 -->
            <template v-if="item.payload.data.command === '5'">
              <div class="msg-item-text" :key="`barrage_msg_item_${index}`">
              <img class="avatar" :src="getAvatar(item)" alt=""/>
              <p class="nick" >{{getNick(item)}}</p>
              <p class="msg" ><span class="msg-text">{{ item.payload.data.message }}</span></p>
            </div>
            </template>
            <!-- 礼物消息 -->
            <template v-if="item.payload.data.command === '6'">
              <div class="msg-item-gift" :key="`gift_msg_item_${index}`">
                <img class="avatar" :src="getAvatar(item)" alt=""/>
                <p class="nick" >{{getNick(item)}}</p>
                <p class="msg" >送了一个{{ giftInfo[item.payload.data.message - 1].name }}</p>
                <img class="gift-pic" :src="giftInfo[item.payload.data.message - 1].icon" alt="" />
              </div>
            </template>
          </template>
        </template>
      </div>
      <live-gift  v-if="!isAnchor" />
      <div class="send-container">
        <textarea
          class="comment-message"
          :placeholder="`${sendAvailable ? '请输入内容...' : '开始直播后可以互动聊天哦！'}`"
          v-model="messageContent"
          :disabled="!sendAvailable"
          @keyup.enter="sendMessage"
        ></textarea>
          <div class="btn-send" @click="sendMessage">
          <div class="tim-icon-send"></div>
        </div>
      </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import liveGift from './live-gift'

export default {
  name: 'liveChat',
  data() {
    return {
      sendAvailable: false,
      messageContent: '',
      defaultAvatar: 'https://imgcache.qq.com/open/qcloud/video/act/webim-avatar/avatar-2.png',
      giftInfo: [
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1590482989_25.png',
          name: '火箭'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1507876726_3',
          name: '鸡蛋'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1590482294_7.png',
          name: '吻'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1590482461_11.png',
          name: '跑车'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1594714453_7.png',
          name: '嘉年华'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1590482754_17.png',
          name: '玫瑰'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1594281297_11.png',
          name: '直升机'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1507876472_1',
          name: '点赞'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1590483038_27.png',
          name: '比心'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1590483168_31.png',
          name: '冰淇淋'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1590483225_33.png',
          name: '玩偶'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1590483278_35.png',
          name: '蛋糕'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1590483348_37.png',
          name: '豪华轿车'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1590483429_39.png',
          name: '游艇'
        },
        {
          icon: 'https://8.url.cn/huayang/resource/now/new_gift/1590483505_41.png',
          name: '翅膀'
        }
      ]
    }
  },
  computed: {
    ...mapState({
      user: state => state.user,
      groupLiveInfo: state => state.groupLive.groupLiveInfo,
      avChatRoomMessageList: state => {
        const list = state.groupLive.avChatRoomMessageList
        list.map((item) => {
          if (item.type === 'TIMCustomElem' && typeof item.payload.data === 'string' && item.payload.data.indexOf('{') > -1) {
            item.payload.data = JSON.parse(item.payload.data)
          }
          return item
        })
        return list
      },
      // avChatRoomBarrageMessageList: state => state.groupLive.avChatRoomBarrageMessageList,
      // avChatRoomGiftMessageList: state => state.groupLive.avChatRoomGiftMessageList,
    }),
    isAnchor () {
      return this.user.userID === this.groupLiveInfo.anchorID
    }
  },
  components: {
    liveGift,
  },
  created() {
    // 此处监听，防止观众侧派发加群事件时，该组件中还未注册监听
    this.$bus.$on('join-group-live-avchatroom', () => {
      this.joinGroupLiveAvChatRoom()
    })
  },
  mounted() {
    this.$bus.$on('group-live-send-gift', (index)=> {
      const message = this.tim.createCustomMessage({
        to: this.groupLiveInfo.roomID,
        conversationType: this.TIM.TYPES.CONV_GROUP,
        payload: {
          data: JSON.stringify({version: '1.0.0' ,'message': `${index}`,'command':'6','action':301}),
          description: '',
          extension: ''
        }
      })
      // 此处用JSON序列化和反序列化对message断链
      this.$store.commit('pushAvChatRoomMessageList', JSON.parse(JSON.stringify(message)))
      this.tim.sendMessage(message).catch(error => {
        this.$toast({
          type: 'error',
          message: error.message
        })
      })
    })
  },
  beforeDestroy() {
    this.$bus.$off('join-group-live-avchatroom')
    this.$bus.$off('group-live-send-gift')
    if (!this.isAnchor && this.groupLiveInfo.isNeededQuitRoom === 1) {
      this.quitGroupLiveAvChatRoom()
    }
    this.$store.commit('updateGroupLiveInfo', { isNeededQuitRoom: 0 })
  },
  methods: {
    getAvatar (item) {
      if (item.from === this.user.userID) {
        return this.user.currentUserProfile.avatar || this.defaultAvatar
      }
      return item.avatar || this.defaultAvatar
    },
    getNick (item) {
      if (item.from === this.user.userID) {
        return this.user.currentUserProfile.nick || item.from
      }
      return item.nick || item.from
    },
    // 进入直播互动群
    joinGroupLiveAvChatRoom() {
      this.tim.joinGroup({
        groupID: this.groupLiveInfo.roomID
      }).then((imResponse) => {
        const status = imResponse.data.status
        if (status === this.TIM.TYPES.JOIN_STATUS_SUCCESS || status === this.TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP) {
          this.sendAvailable = true
        }
      }).catch(() => {})
    },
    // 退出直播互动群
    quitGroupLiveAvChatRoom() {
      this.tim.quitGroup(this.groupLiveInfo.roomID).then(() => {}).catch(() => {})
    },
    sendMessage() {
      if (!this.sendAvailable) {
        this.$toast({
          message: '开始直播后可以互动聊天哦！',
          type: 'warning'
        })
        return
      }
      if (this.messageContent === '' || this.messageContent.trim().length === 0) {
        this.messageContent = ''
        this.$toast({
          message: '不能发送空消息哦！',
          type: 'info'
        })
        return
      }
      const message = this.tim.createTextMessage({
        to: this.groupLiveInfo.roomID,
        conversationType: this.TIM.TYPES.CONV_GROUP,
        payload: { text: this.messageContent }
      })
      // 此处用JSON序列化和反序列化对message断链
      this.$store.commit('pushAvChatRoomMessageList', JSON.parse(JSON.stringify(message)))
      this.tim.sendMessage(message).catch(error => {
        this.$toast({
          type: 'error',
          message: error.message
        })
      })
      this.messageContent = ''
    }
  },
  watch: {
    avChatRoomMessageList: function() {
      this.$nextTick(() => {
        let messageListNode = this.$refs['message-list']
        if (!messageListNode) {
          return
        }
        messageListNode.scrollTop = messageListNode.scrollHeight
      })
    }
  }
}
</script>
<style lang="less" scoped>
  ::-webkit-textarea-placeholder {
    color: #a5b5c1
  }
  ::-moz-textarea-placeholder {
    color: #a5b5c1
  }
  ::-ms-textarea-placeholder {
    color: #a5b5c1
  }
  // Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 3 times
@color1: #5cadff; // Appears 3 times
@color2: #a5b5c1; // Appears 2 times

// Width variables (appears count calculates by raw css)
@width0: 150px; // Appears 2 times
@width3: 100%; // Appears 4 times
@width4: 45px; // Appears 2 times

// Height variables (appears count calculates by raw css)
@height1: 100%; // Appears 2 times
@height2: 60px; // Appears 2 times
@height3: 45px; // Appears 2 times

.comment-wrapper {
	box-sizing: border-box;
	display: flex;
	flex-flow: column;
	height: @height1;
	position: relative;
	width: @width3;
}
.message-list {
	-webkit-box-sizing: border-box;
	-webkit-overflow-scrolling: touch;
	box-sizing: border-box;
	flex: 1;
	margin-bottom: 5px;
	overflow-x: hidden;
	overflow-y: scroll;
	overflow: auto;
	padding: 20px;
	position: relative;
	width: @width3;
	.msg-item-join {
		border-radius: 3px;
		box-sizing: border-box;
		color: @color2;
		font-size: 12px;
		margin: 0 30px 20px 30px;
		overflow: hidden;
		padding: 4px 15px;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.msg-item-text {
		min-height: @height2;
		width: @width3;
		.avatar {
			border-radius: 50%;
			height: @height3;
			width: @width4;
		}
		.nick {
			color: @color2;
			display: inline-block;
			font-size: 14px;
			left: 8px;
			margin: 0;
			max-width: @width0 !important;
			overflow: hidden;
			position: relative;
			text-overflow: ellipsis;
			top: -24px;
			white-space: nowrap;
		}
		.msg {
			color: @color0;
			left: 60px;
			margin: 0;
			max-width: 230px;
			position: relative;
			top: -25px;
			word-break: break-all;
			.msg-text {
				background-color: @color1;
				border-radius: 0 4px 4px 4px;
				display: inline-block;
				font-size: 14px;
				height: @height1;
				padding: 10px;
			}
			&:before {
					color: @color1;
					content: "\E900";
					font-family: 'tim' !important;
					font-size: 24px;
					height: 40px;
					left: -10px;
					position: absolute;
					top: 0;
					transform: scaleX(-1);
					width: 12px;
				}
			}
	}
	.msg-item-gift {
		background: @color1;
		border-radius: 30px;
		height: @height2;
		margin: 0 0 20px 0;
		min-width: 290px;
		position: relative;
		width: 60%;
		.avatar {
			border-radius: 50%;
			height: @height3;
			margin: 8px;
			width: @width4;
		}
		.nick {
			color: @color0;
			display: inline-block;
			font-size: 14px;
			left: 0px;
			margin: 0;
			max-width: @width0 !important;
			overflow: hidden;
			position: relative;
			text-overflow: ellipsis;
			top: -32px;
			white-space: nowrap;
		}
		.msg {
			color: @color0;
			font-size: 14px;
			left: -5px;
			margin: 0;
			padding: 0 0 0 65px;
			position: relative;
			top: -35px;
			word-break: break-all;
		}
		.gift-pic {
			height: 75px;
			position: absolute;
			right: -18px;
			top: -15px;
			width: 75px;
		}
	}
}
.send-container {
	-webkit-box-sizing: border-box;
	border-top: 1px solid #e6e6e6;
	box-sizing: border-box;
	display: flex;
	flex-flow: column;
	height: 100px;
	position: relative;
	width: @width3;
	.comment-message {
		border-radius: 0;
		border: hidden;
		color: #000000;
		flex: 1;
		font-size: 16px;
		margin: 0;
		outline-style: none;
		padding: 10px;
		resize: none;
	}
	.btn-send {
		bottom: 0px;
		color: #2d8cf0;
		cursor: pointer;
		padding: 6px 6px 4px 4px;
		position: absolute;
		right: 0px;
	}
}
</style>
