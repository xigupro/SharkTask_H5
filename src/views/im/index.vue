<template>
  <div class="im-page">
    <div class="chat-wrapper">
      <side-bar />
    </div>
    <image-previewer />
    <group-live />
  </div>
</template>

<script>
import { Notify } from 'vant';
import { mapState } from 'vuex'
import ImMixin from '@/mixins/im'
import { getQiniuFullUrl } from '@/filters'
import SideBar from '@/components/im/layout/side-bar'
import ImagePreviewer from '@/components/im/message/image-previewer'
import { translateGroupSystemNotice } from '@/utils/common'
import GroupLive from '@/components/im/group-live/index'
import { ACTION } from '@/utils/trtcCustomMessageMap'
// import MTA from '@/utils/mta'

export default {
  title: 'im',
  data() {
    return {
      loginType: 2, // github 登录只使用默认账号登录
    }
  },
  mixins: [ImMixin],
  components: {
    SideBar,
    ImagePreviewer,
    GroupLive,
  },

  computed: {
    userInfo() {
      return this.$store.state.account.info;
    },
    ...mapState({
      currentUserProfile: state => state.user.currentUserProfile,
      currentConversation: state => state.conversation.currentConversation,
      videoCall: state => state.conversation.videoCall,
      audioCall: state => state.conversation.audioCall,
      isLogin: state => state.user.isLogin,
      isSDKReady: state => state.user.isSDKReady,
      isBusy: state => state.video.isBusy,
      userID: state => state.user.userID,
      userSig: state => state.user.userSig,
      sdkAppID: state => state.user.sdkAppID,
    }),
    // 是否显示 Loading 状态
    showLoading() {
      return !this.isSDKReady
    },
  },
  mounted() {
    // 初始化监听器
    this.initListener()
    this.tim.getConversationList().then(({ data }) => {
      this.onUpdateConversationList({ data: data.conversationList })
    })
  },

  watch: {
    isLogin(next) {
      console.info('isLogin', this.isLogin)
      if (next) {
        // MTA.clickStat('link_two', { show: 'true' })
      }
    },
  },

  methods: {
    initListener() {
      // 登录成功后会触发 SDK_READY 事件，该事件触发后，可正常使用 SDK 接口
      this.tim.on(this.TIM.EVENT.SDK_READY, this.onReadyStateUpdate, this)
      // SDK NOT READT
      this.tim.on(this.TIM.EVENT.SDK_NOT_READY, this.onReadyStateUpdate, this)
      // 被踢出
      this.tim.on(this.TIM.EVENT.KICKED_OUT, this.onKickOut)
      // SDK内部出错
      this.tim.on(this.TIM.EVENT.ERROR, this.onError)
      // 收到新消息
      this.tim.on(this.TIM.EVENT.MESSAGE_RECEIVED, this.onReceiveMessage)
      // 会话列表更新
      this.tim.on(this.TIM.EVENT.CONVERSATION_LIST_UPDATED, this.onUpdateConversationList)
      // 群组列表更新
      this.tim.on(this.TIM.EVENT.GROUP_LIST_UPDATED, this.onUpdateGroupList)
      // 网络监测
      this.tim.on(this.TIM.EVENT.NET_STATE_CHANGE, this.onNetStateChange)
      // 已读回执
      this.tim.on(this.TIM.EVENT.MESSAGE_READ_BY_PEER, this.onMessageReadByPeer)
    },

    onReceiveMessage({ data: messageList }) {
      this.handleVideoMessage(messageList)
      this.handleQuitGroupTip(messageList)
      this.handleCloseGroupLive(messageList)
      this.$store.commit('pushCurrentMessageList', messageList)
      this.$store.commit('pushAvChatRoomMessageList', messageList)
    },

    onError({ data }) {
      if (data.message !== 'Network Error') {
        this.$toast({
          message: data.message,
          type: 'error',
        })
      }
    },
    onMessageReadByPeer() {

    },
    onReadyStateUpdate({ name }) {
      const isSDKReady = name === this.TIM.EVENT.SDK_READY
      this.$store.commit('toggleIsSDKReady', isSDKReady)

      if (isSDKReady) {
        const options = {
          avatar: getQiniuFullUrl(this.userInfo.avatar),
          nick: this.userInfo.nick_name || this.userInfo.username,
        }
        // 更新im用户信息
        this.tim.updateMyProfile(options)
        this.tim
          .getMyProfile()
          .then(({ data }) => {
            this.$store.commit('updateCurrentUserProfile', data)
          })
          .catch((error) => {
            this.$toast({
              type: 'error',
              message: error.message,
            })
          })
        this.$store.dispatch('getBlacklist')
        // 登录trtc calling
        this.trtcCalling.login({
          sdkAppID: this.sdkAppID,
          userID: this.userID,
          userSig: this.userSig,
        })
      }
    },
    kickedOutReason(type) {
      switch (type) {
        case this.TIM.TYPES.KICKED_OUT_MULT_ACCOUNT:
          return '由于多实例登录'
        case this.TIM.TYPES.KICKED_OUT_MULT_DEVICE:
          return '由于多设备登录'
        case this.TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED:
          return '由于 userSig 过期'
        default:
          return ''
      }
    },
    checkoutNetState(state) {
      switch (state) {
        case this.TIM.TYPES.NET_STATE_CONNECTED:
          return { message: '已接入网络', type: 'success' }
        case this.TIM.TYPES.NET_STATE_CONNECTING:
          return { message: '当前网络不稳定', type: 'warning' }
        case this.TIM.TYPES.NET_STATE_DISCONNECTED:
          return { message: '当前网络不可用', type: 'error' }
        default:
          return ''
      }
    },
    onNetStateChange(event) {
      this.$toast(this.checkoutNetState(event.data.state))
    },
    onKickOut(event) {
      this.$toast({
        message: `${this.kickedOutReason(event.data.type)}被踢出，请重新登录。`,
        type: 'error',
      })
      this.$store.commit('toggleIsLogin', false)
      this.$store.commit('reset')
    },
    onUpdateConversationList(event) {
      this.$store.commit('updateConversationList', event.data)
    },
    onUpdateGroupList(event) {
      this.$store.commit('updateGroupList', event.data)
    },
    onReceiveGroupSystemNotice(event) {
      const isKickedout = event.data.type === 4
      const isCurrentConversation = `GROUP${event.data.message.payload.groupProfile.groupID}`
        === this.currentConversation.conversationID
      // 在当前会话被踢，需reset当前会话
      if (isKickedout && isCurrentConversation) {
        this.$store.commit('resetCurrentConversation')
      }
      Notify({
        message: translateGroupSystemNotice(event.data.message),
        duration: 3000,
        onClick: () => {
          const SystemConversationID = '@TIM#SYSTEM'
          this.$store.dispatch('checkoutConversation', SystemConversationID)
        },
      })
    },

    selectConversation(conversationID) {
      if (conversationID !== this.currentConversation.conversationID) {
        this.$store.dispatch('checkoutConversation', conversationID)
      }
    },
    isJsonStr(str) {
      try {
        JSON.parse(str)
        return true
      } catch {
        return false
      }
    },
    handleVideoMessage(messageList) {
      const videoMessageList = messageList.filter(message => message.type
        === this.TIM.TYPES.MSG_CUSTOM
        && this.isJsonStr(message.payload.data))
      if (videoMessageList.length === 0) return
      const videoPayload = JSON.parse(videoMessageList[0].payload.data)
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_DIALING) {
        if (this.isBusy) {
          this.$bus.$emit('busy', videoPayload, videoMessageList[0])
          return
        }
        this.$store.commit('GENERATE_VIDEO_ROOM', videoPayload.room_id)
        this.selectConversation(videoMessageList[0].conversationID) // 切换当前会话页
        if (videoMessageList[0].from !== this.userID) {
          this.$bus.$emit('isCalled')
        }
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_SPONSOR_CANCEL) {
        this.$bus.$emit('missCall')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_REJECT) {
        this.$bus.$emit('isRefused')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_SPONSOR_TIMEOUT) {
        this.$bus.$emit('missCall')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_ACCEPTED) {
        this.$bus.$emit('isAccept')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_HANGUP) {
        this.$bus.$emit('isHungUp')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_LINE_BUSY) {
        this.$bus.$emit('isRefused')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_ERROR) {
        this.$bus.$emit('isRefused')
      }
    },
    /**
     * 使用 window.Notification 进行全局的系统通知
     * @param {Message} message
     */
    notifyMe(message) {
      // 需检测浏览器支持和用户授权
      if (!('Notification' in window)) {
        console.warn(message)
      } else if (window.Notification.permission === 'granted') {
        this.handleNotify(message)
      } else if (window.Notification.permission !== 'denied') {
        window.Notification.requestPermission().then((permission) => {
          // 如果用户同意，就可以向他们发送通知
          if (permission === 'granted') {
            this.handleNotify(message)
          }
        })
      }
    },
    handleNotify(message) {
      const notification = new window.Notification('有人提到了你', {
        icon: 'https://webim-1252463788.file.myqcloud.com/demo/img/logo.dc3be0d4.png',
        body: message.payload.text,
      })
      notification.onclick = () => {
        window.focus()
        this.$store.dispatch('checkoutConversation', message.conversationID)
        notification.close()
      }
    },
    handleLinkClick() {
      // MTA.clickStat('link_two', { click: 'true' })
    },
    /**
     * 收到有群成员退群/被踢出的groupTip时，需要将相关群成员从当前会话的群成员列表中移除
     * @param {Message[]} messageList
     */
    handleQuitGroupTip(messageList) {
      // 筛选出当前会话的退群/被踢群的 groupTip
      const groupTips = messageList.filter(message => (this.currentConversation.conversationID
        === message.conversationID
        && message.type === this.TIM.TYPES.MSG_GRP_TIP
        && (message.payload.operationType === this.TIM.TYPES.GRP_TIP_MBR_QUIT
        || message.payload.operationType === this.TIM.TYPES.GRP_TIP_MBR_KICKED_OUT)))
      // 清理当前会话的群成员列表
      if (groupTips.length > 0) {
        groupTips.forEach((groupTip) => {
          if (Array.isArray(groupTip.payload.userIDList)
            || groupTip.payload.userIDList.length > 0) {
            this.$store.commit('deleteGroupMemberList', groupTip.payload.userIDList)
          }
        })
      }
    },
    /**
     * 收到结束直播自定义消息，派发事件关闭组件
     * @param {Message[]} messageList
     */
    handleCloseGroupLive(messageList) {
      messageList.forEach((message) => {
        if (this.currentConversation.conversationID
          === message.conversationID && message.type === this.TIM.TYPES.MSG_CUSTOM) {
          let data = {}
          try {
            data = JSON.parse(message.payload.data)
          } catch (e) {
            data = {}
          }
          if (data.roomId && Number(data.roomStatus) === 0) {
            this.$bus.$emit('close-group-live')
          }
        }
      })
    },
  },
}
</script>
<style lang="less" scoped>
.im-page {
  min-height: calc(100vh - 44px);
  background-color: #fff;
}
</style>
