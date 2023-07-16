<template>
  <div class="current-conversation-wrapper">
    <div class="current-conversation" @scroll="onScroll" v-if="showCurrentConversation">
      <div class="header" @click="!currentConversation.conversationID.includes('SYSTEM') && showMore()">
        <div class="avatar">
          <van-image round width="40" :src="avatar" />
        </div>
        <div class="name">
          {{ name }}
        </div>
      </div>
      <div class="content">
        <div class="message-list" ref="message-list" @scroll="this.onScroll">
          <el-checkbox-group v-model="checkList" v-if="selectMessage">
            <el-checkbox :label="message.ID" v-for="message in currentMessageList" :key="message.ID" :disabled="message.status==='fail'">
              <message-item   :message="message"/>
            </el-checkbox>
          </el-checkbox-group>
          <message-item v-else v-for="message in currentMessageList" :key="message.ID" :message="message"/>
          <div class="more" v-if="!isCompleted">
            <van-button
              size="mini"
              @click="$store.dispatch('getMessageList', currentConversation.conversationID)"
            >查看更多</van-button>
          </div>
          <div class="no-more" v-else>没有更多了</div>
        </div>
        <div v-show="isShowScrollButtomTips" class="newMessageTips" @click="scrollMessageListToButtom">回到最新位置</div>
      </div>
      <div class="footer" v-if="showMessageSendBox" >
        <div class="merger-btn"  v-if="selectMessage">
          <div  class="relay-btn" @click="singleRelay">
            <img class="relay-icon" src="../../../assets/images/sig-relay.png">
            <span class="relay-title">逐条转发</span>
          </div>
          <div  class="relay-btn" @click="mergerRelay">
            <img class="relay-icon" src="../../../assets/images/merger-relay.png">
            <span class="relay-title">合并转发</span>
          </div>
          <div  class="relay-btn" @click="closeSelectMessage">
            <img class="relay-icon" src="../../../assets/images/close-relay.png">
            <span class="relay-title">取消</span>
          </div>
        </div>
        <message-send-box v-else/>
      </div>
    </div>
    <van-popup style="width: 80%" v-model="isShowConversationList">
      <message-relay v-if="isShowConversationList"></message-relay>
    </van-popup>
    <van-popup style="width: 80%" v-model="showConversationProfile">
      <conversation-profile/>
    </van-popup>
    <!-- 群成员资料组件 -->
    <member-profile-card />
    <van-popover
            ref="dropdown"
            placement="left-start"
            width="700"
            v-model="mergerMessagePop">
        <div class="pop-header">
          <img src="../../../assets/images/back.png" v-if="mergerMessageList.length >1" class="pop-back" @click="mergerMessageBack"/>
          <span  class="title">{{mergerTitle}}</span>
          <img src="../../../assets/images/close.png" class="pop-close" @click="closeMessagePop"/>
        </div>
      <transition
              name="custom-classes-transition"
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
      >
        <message-merger v-if="mergerMessagePop"></message-merger>
      </transition>
    </van-popover>
    <calling-index ref="callLayer" class="chat-wrapper"/>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { Button, Popover, Popup, Image } from 'vant';
import CallingIndex from '@/components/im/message/trtc-calling/calling-index'
import MessageSendBox from '../message/message-send-box'
import MessageItem from '../message/message-item'
import ConversationProfile from './conversation-profile'
import MemberProfileCard from '../group/member-profile-card'
import MessageMerger from '../message/merger-message/message-merger'
import MessageRelay from '../message/merger-message/message-relay'
import close from '../../../assets/images/close.png'

export default {
  name: 'CurrentConversation',
  components: {
    MessageSendBox,
    MessageItem,
    ConversationProfile,
    MemberProfileCard,
    MessageMerger,
    MessageRelay,
    CallingIndex,
    [Button.name]: Button,
    [Popover.name]: Popover,
    [Popup.name]: Popup,
    [Image.name]: Image,
  },
  data() {
    return {
      close: close,
      isShowScrollButtomTips: false,
      preScrollHeight: 0,
      showConversationProfile: false,
      timeout: '',
      checkList: [],
      // selectMessage: false,
      selectedMessageList: [],
      mergerMessagePop: false,
      mergerMessage: null,
      positionX: 0,
      positionY: 0,
    }
  },
  computed: {
    ...mapState({
      currentConversation: state => state.conversation.currentConversation,
      currentUnreadCount: state => state.conversation.currentConversation.unreadCount,
      currentMessageList: state => state.conversation.currentMessageList,
      isCompleted: state => state.conversation.isCompleted,
      mergerMessageList: state => state.conversation.mergerMessageList,
      isShowConversationList: state => state.conversation.isShowConversationList,
      selectMessage: state => state.conversation.selectMessage,
    }),
    ...mapGetters(['toAccount', 'hidden']),
    // 是否显示当前会话组件
    showCurrentConversation() {
      return !!this.currentConversation.conversationID
    },
    avatar() {
      if (this.currentConversation.userProfile) {
        return this.currentConversation.userProfile.avatar
      }
      if (this.currentConversation.groupProfile) {
        return this.currentConversation.groupProfile.avatar
      }
      return null
    },
    name() {
      if (this.currentConversation.type === 'C2C') {
        let name = this.currentConversation.userProfile.nick || this.toAccount
        let list = this.currentMessageList
        let len = list.length
        for (let i = len - 1; i >= 0; i--) {
          // C2C 会话对端更新nick时需要更新会话title
          if (list[i].flow === 'in' && list[i].nick && name !== list[i].nick) {
            name = list[i].nick
            break
          }
        }
        return name
      } else if (this.currentConversation.type === 'GROUP') {
        return this.currentConversation.groupProfile.name || this.toAccount
      } else if (this.currentConversation.conversationID === '@TIM#SYSTEM') {
        return '系统通知'
      }
      return this.toAccount
    },
    showMessageSendBox() {
      return this.currentConversation.type !== this.TIM.TYPES.CONV_SYSTEM
    },
    mergerTitle() {
      if (this.mergerMessage) {
        return this.mergerMessage.payload.title || '聊天记录'
      } else {
        return  '聊天记录'
      }
    }
  },

  mounted() {
    if (this.$refs.dropdown && this.$refs.dropdown.$el) {
      this.$refs.dropdown.$el.addEventListener('mousedown', this.move)
    }
    this.$bus.$on('image-loaded', this.onImageLoaded)
    this.$bus.$on('scroll-bottom', this.scrollMessageListToButtom)
    this.$bus.$on('mergerSelected', this.mergerSelectedHandler)
    this.$bus.$on('mergerMessageShow', this.mergerShow)


    if (this.currentConversation.conversationID === '@TIM#SYSTEM') {
      return false
    }
  },
  beforeDestroy() {
    if (this.$refs.dropdown && this.$refs.dropdown.$el) {
      this.$refs.dropdown.$el.removeEventListener('mousedown', this.move)
    }
  },
  updated() {
    this.keepMessageListOnButtom()
    // 1. 系统会话隐藏右侧资料组件
    // 2. 没有当前会话时，隐藏右侧资料组件。
    //    背景：退出群组/删除会话时，会出现一处空白区域
    if (this.currentConversation.conversationID === '@TIM#SYSTEM' ||
        typeof this.currentConversation.conversationID === 'undefined') {
      this.showConversationProfile = false
    }
  },
  watch: {
    currentUnreadCount(next) {
      if (!this.hidden && next > 0) {
        this.tim.setMessageRead({ conversationID: this.currentConversation.conversationID })
      }
    },
    hidden(next) {
      if (!next && this.currentUnreadCount > 0) {
        this.tim.setMessageRead({ conversationID: this.currentConversation.conversationID })
      }
    }
  },
  methods: {
    move(e) {
      let odiv = this.$refs.dropdown.$el.children[0]//e.target        //获取目标元素
      //算出鼠标相对元素的位置
      let disX = e.clientX - odiv.offsetLeft
      let disY = e.clientY - odiv.offsetTop
      document.onmousemove = (e)=>{       //鼠标按下并移动的事件
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = e.clientX - disX
        let top = e.clientY - disY

        //绑定元素位置到positionX和positionY上面
        this.positionX = top
        this.positionY = left

        //移动当前元素
        odiv.style.left = left + 'px'
        odiv.style.top = top + 'px'
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    mergerMessageBack() {
      let index = this.mergerMessageList.length - 2
      this.$store.commit('updateMergerMessage', this.mergerMessageList[index])
      // this.mergerMessageList.pop()
    },
    closeMessagePop() {
      this.mergerMessagePop = false
      this.$store.commit('resetMergerMessage')
    },
    closeSelectMessage() {
      this.$store.commit('resetSelectedMessage', false)
    },
    mergerSelectedHandler() {
      this.selectedMessageList = []
      this.checkList = []
      this.$store.commit('setSelectedMessage', true)
    },
    mergerShow(value) {
      this.mergerMessagePop = true
      this.mergerMessage = value
      this.$store.commit('setMergerMessage', value)
    },
    mergerRelay() {
      this.selectedMessage()
      this.$store.commit('setRelayType', 3)
    },
    singleRelay() {
      this.selectedMessage()
      this.$store.commit('setRelayType', 2)
    },
    selectedMessage () {
      let messageList = []
      this.selectedMessageList = []
      this.checkList.forEach((id) => {
        messageList = this.currentMessageList.find((item) => {
          return item.ID === id
        })
        this.selectedMessageList.push(messageList)
      })

      this.$store.commit('showConversationList', true)
      //this.closeSelectMessage() // TODO
      this.$store.commit('setSelectedMessageList', this.selectedMessageList)
    },
    onScroll({ target: { scrollTop } }) {
      let messageListNode = this.$refs['message-list']
      if (!messageListNode) {
        return
      }
      if (this.preScrollHeight - messageListNode.clientHeight - scrollTop < 20) {
        this.isShowScrollButtomTips = false
      }
    },
    // 如果滚到底部就保持在底部，否则提示是否要滚到底部
    keepMessageListOnButtom() {
      let messageListNode = this.$refs['message-list']
      if (!messageListNode) {
        return
      }
      // 距离底部20px内强制滚到底部,否则提示有新消息
      if (this.preScrollHeight - messageListNode.clientHeight - messageListNode.scrollTop < 20) {
        this.$nextTick(() => {
          messageListNode.scrollTop = messageListNode.scrollHeight
        })
        this.isShowScrollButtomTips = false
      } else {
        this.isShowScrollButtomTips = true
      }
      this.preScrollHeight = messageListNode.scrollHeight
    },
    // 直接滚到底部
    scrollMessageListToButtom() {
      this.$nextTick(() => {
        let messageListNode = this.$refs['message-list']
        if (!messageListNode) {
          return
        }
        messageListNode.scrollTop = messageListNode.scrollHeight
        this.preScrollHeight = messageListNode.scrollHeight
        this.isShowScrollButtomTips = false
      })
    },
    showMore() {
      this.showConversationProfile = !this.showConversationProfile
    },
    onImageLoaded() {
      this.keepMessageListOnButtom()
    }
  }
}
</script>

<style lang="less" scoped>
/* 当前会话的骨架屏 */
// Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 2 times

// Width variables (appears count calculates by raw css)
@width2: 100%; // Appears 2 times

// Height variables (appears count calculates by raw css)
@height0: 100; // Appears 3 times
@height2: 30px; // Appears 2 times

.current-conversation-wrapper {
	background-color: #eee;
	display: flex;
	height: calc(100vh - 44px);
  box-sizing: border-box;
	.current-conversation {
		display: flex;
		flex-direction: column;
		height: 100;
		width: @width2;
	}
	.profile {
		border-left: 1px solid #eee;
		flex-shrink: 0;
		height: 100;
		overflow-y: scroll;
		width: 220px;
	}
	.more {
		display: flex;
		font-size: 12px;
		justify-content: center;
    margin-bottom: 10px;
	}
	.no-more {
		color: #eee;
		display: flex;
		font-size: 12px;
		justify-content: center;
		padding: 10px 10px;
	}
}
.header {
	border-bottom: 1px solid #eee;
	height: 40px;
  padding: 5px 10px;
  display: flex;
	.name {
		color: #333;
		line-height: 40px;
		padding: 0 10px;
	}
}
.content {
	display: flex;
	flex-direction: column;
	flex: 1;
	height: 100%;
	overflow: hidden;
	position: relative;
  background-color: #fff;
	.message-list {
		box-sizing: border-box;
		overflow-y: scroll;
		padding: 0 10px;
		width: @width2;
	}
	.newMessageTips {
		background-color: @color0;
		border-radius: 10px;
		border: #eee 1px solid;
		bottom: 5px;
		color: #333;
		cursor: pointer;
		font-size: 12px;
		left: 0;
		margin: auto;
		padding: 5px;
		position: absolute;
		right: 0;
		text-align: center;
		width: 120px;
	}
}
.footer {
  border-top: 1px solid #eee;
  .merger-btn {
    height: 150px;
    padding: 3px 20px 20px 20px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    padding-top: 50px;
    .relay-btn {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 60px;
      height: 50px;
      .relay-icon {
        display: block;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        background-color: #ffffff;
        margin-bottom: 5px;
      }
      .relay-title {
        display: block;
        font-size: 13px;
      }
    }
  }
}

// Width variables (appears count calculates by raw css)
@width1: 100%; // Appears 2 times


show-more {
	padding: 10px 20px 0 0;
	text-align: right;
}
el-checkbox {
	font-weight: 300;
	margin-right: 0;
	white-space: normal;
	width: @width1;
}
el-checkbox__label {
	box-sizing: border-box;
	line-height: normal;
	margin-left: 10px;
	margin: -10px 0;
	padding-right: 20px;
	width: @width1;
}
.van-popover {
	background-color: #f7f7f7;
	cursor: pointer;
	left: 30vw;
	margin: 0;
	padding: 0;
	position: fixed;
	top: 15vh;
	width: 700px;
}
el-checkbox__inner {
	border-radius: 50%;
	height: 18px;
	width: 18px;
	&:after {
    height: 8px;
    left: 6px;
    top: 2px;
  }
}
el-checkbox__input {
	left: -10px;
	position: absolute;
	top: 30px;
}
.pop-header {
	background-color: #f3f3f3;
	border-bottom: 1px solid #dedede;
	margin-bottom: 10px;
	padding: 8px 8px;
	position: relative;
	img {
		cursor: pointer;
		display: block;
		height: 22px;
		position: absolute;
		top: 8px;
		width: 22px;
	}
	.title {
		display: block;
		text-align: center;
	}
	.pop-close {
		right: 5px;
	}
	.pop-back {
		left: 5px;
	}
}

</style>
