<template>
  <div class="pusher">
    <div class="header-bar">
      <live-header fr="pusher" :pusherTime="pusherTime" :isPushingStream="isPushingStream" :stopPushStream="stopPushStream"/>
      <div class="input-name-box" v-show="!isPushingStream">
        <img class="avatar" :src="anchorAvatar" alt="" />
        <input class="room-name" v-model="roomName" placeholder="标题有趣吸引人气" />
      </div>
    </div>
    <div id="video-container" class="video-container">
    </div>
    <div class="setting-bar">
      <!-- <live-share v-if="isPushingStream" /> -->
      <div>
        <div v-if="!isPushingStream"  class="pusher-start cursor" @click="startPushStream">
          <img class="pusher-icon" src="../../../../assets/images/web-pusher-start.png">
          <span class="play-text">开始直播</span>
        </div>
        <div v-else class="pusher-start cursor" @click="stopPushStream">
          <img class="pusher-icon" src="../../../../assets/images/web-pusher-stop.png">
          <span class="play-text">结束直播</span>
        </div>
      </div>
      <div>
        <div v-if="isMute" class="pusher-mic cursor" @click="startMicrophone">
          <img class="pusher-icon" src="../../../../assets/images/close-mic.png">
          <span class="mic-text">麦克风</span>
        </div>
        <div v-else class="pusher-mic cursor" @click="stopMicrophone">
          <img class="pusher-icon" src="../../../../assets/images/open-mic.png">
          <span class="mic-text">麦克风</span>
        </div>
      </div>
      <div>
        <div v-if="isStartCamera" class="pusher-mic cursor" style="right: 300px" @click="startCamera">
          <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>摄像头关闭</title>
            <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="j进度条备份" transform="translate(-751.000000, -22.000000)">
                <g id="编组-9" transform="translate(751.000000, 22.000000)">
                  <g id="编组-11">
                    <path d="M15,7.5 C15,11.6421356 11.6421356,15 7.5,15 C6.57050116,15 5.68049488,14.8309122 4.85906245,14.5218179 L6.43561423,12.8970864 C6.77997642,12.9646116 7.13585551,13 7.5,13 C10.5375661,13 13,10.5375661 13,7.5 C13,7.0789865 12.9526952,6.66902162 12.8631108,6.27513055 L14.4397563,4.65055194 C14.8008626,5.52907797 15,6.49128347 15,7.5 Z M7.5,0 C9.88955323,0 12.0181001,1.11750106 13.3915381,2.85840064 L11.9813778,4.31063973 C10.984196,2.91201268 9.34860401,2 7.5,2 C4.46243388,2 2,4.46243388 2,7.5 C2,9.40763139 2.97118511,11.0884303 4.44609208,12.0749336 L3.03637255,13.5276986 C1.1940301,12.1611583 0,9.97001947 0,7.5 C0,3.35786438 3.35786438,0 7.5,0 Z" id="形状结合" fill="#8A9099" fill-rule="nonzero"></path>
                    <path d="M7.5,5 C8.54350703,5 9.43769004,5.63933214 9.81221332,6.5476607 L6.61637488,9.83935679 C5.67174144,9.48236445 5,8.56962904 5,7.5 C5,6.11928813 6.11928813,5 7.5,5 Z" id="形状结合" fill="#8A9099"></path>
                    <path d="" id="形状结合" stroke="#8A9099" stroke-width="2"></path>
                    <line x1="13.3137085" y1="2" x2="2" y2="13.3137085" id="直线-5" stroke="#8A9099" stroke-width="2" stroke-linecap="square"></line>
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <span class="mic-text">摄像头</span>
        </div>
        <div v-else class="pusher-mic cursor" style="right: 300px" @click="stopCamera">
          <img class="pusher-icon" src="../../../../assets/images/camera-open.png">
          <span class="mic-text">摄像头</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'
import liveHeader from './live-header'
// import liveShare from './live-share'
import { formatTime } from '@/utils/date.js'

export default {
  name: 'livePusher',
  data() {
    return {
      pusher: null,
      roomID: 0,
      roomName: '',
      isPushingStream: false, // 是否正在推流
      updateTimer: 0,
      pusherTime: '00:00:00',
      time: 0, // 直播时长 秒
      recordTimer: null, // 记录直播时长
      isMute: false,   //是否禁言
      isStartCamera: true
    }
  },
  computed: {
    ...mapState({
      user: state => state.user,
      groupLiveInfo: state => state.groupLive.groupLiveInfo
    }),
    anchorAvatar() {
      return this.user.currentUserProfile.avatar || 'https://imgcache.qq.com/open/qcloud/video/act/webim-avatar/avatar-2.png'
    }
  },
  created() {
    this.$store.commit('resetGroupLiveInfo', { roomID: 0 })
  },
  mounted() {
    this.init()
  },
  async beforeDestroy() {
    if (this.isPushingStream) {
      clearInterval(this.updateTimer)
      clearInterval(this.recordTimer)
      await this.stopPush()
    }
  },
  components: {
    liveHeader,
    // liveShare,
  },
  methods: {
    // 初始化
    init() {
      this.pusher = this.TWebLive.createPusher({
        userID: this.user.userID
      })
      this.setRenderView()
      this.pusher.on(this.TWebLive.EVENT.RTC_CONNECTION_STATE_CHANGED, this.onRTCConnectionStateChanged)
      this.pusher.on(this.TWebLive.EVENT.RTC_CLIENT_BANNED, this.onRTCClientBanned)
      this.pusher.on(this.TWebLive.EVENT.RTC_CLIENT_ERROR, this.onRTCError)
    },
    // eslint-disable-next-line no-unused-vars
    onRTCConnectionStateChanged(event) {},
    // eslint-disable-next-line no-unused-vars
    onRTCClientBanned(event) {},
    // eslint-disable-next-line no-unused-vars
    onRTCError(event) {},
    //开启本地预览
    setRenderView() {
      this.pusher.setRenderView({
        elementID: 'video-container',
        audio: true,
        video: true
      }).then(() => {
        // 设置背景
       let el = window.document.getElementById('video-container').childNodes
        el[0].style.backgroundColor = 'rgba(0,0,0,0)'
        this.isStartCamera = false
      }).catch(() => {})
    },
    // 摄像头、麦克风操作
    startCamera() {
      this.pusher.startCamera().then(() => {
        this.isStartCamera = false
      }).catch(() => {})
    },
    stopCamera() {
      this.pusher.stopCamera().then(() => {
        this.isStartCamera = true
      }).catch(() => {})
    },
    startMicrophone() {
      this.pusher.startMicrophone().then(() => {
        this.isMute = false
      }).catch(() => {})
    },
    stopMicrophone() {
      this.pusher.stopMicrophone().then(() => {
        this.isMute = true
      }).catch(() => {})
    },
    // 生成roomID
    generateRoomID(min, max) {
      return Math.floor(Math.random()*(max - min) + min).toString()
    },
    // 创建直播房间
    async createRoom() {
      this.roomID = this.generateRoomID(1000, 2000000000)
      this.roomName = this.roomName ? this.roomName : `${this.user.userID}的直播`
      await axios (`https://service-62h5r0ea-1252463788.gz.apigw.tencentcs.com/release/forTestAdvanced?method=createRoom&appId=${this.user.sdkAppID}&type=groupLive&title=${this.roomName}&anchorId=${this.user.userID}&roomId=${this.roomID}`)
      this.$store.commit('updateGroupLiveInfo', { roomID: this.roomID, roomName: this.roomName })
      this.createGroupLiveAvChatRoom()
    },
    // 解散直播间
    async destroyRoom() {
      await axios (`https://service-c2zjvuxa-1252463788.gz.apigw.tencentcs.com/release/forTest?method=destroyRoom&appId=${this.user.sdkAppID}&type=groupLive&roomId=${this.roomID}`)
    },
    // 更新直播间 10s 上报一次，心跳保活，如果不上报，后台检测不到心跳会销毁房间
    updateRoom() {
      axios (`https://service-c2zjvuxa-1252463788.gz.apigw.tencentcs.com/release/forTest?method=updateRoom&appId=${this.user.sdkAppID}&type=groupLive&roomId=${this.roomID}`)
    },
    // 创建直播互动群
    async createGroupLiveAvChatRoom() {
      await this.tim.createGroup({
        name: this.roomName,
        groupID: this.roomID,
        type: this.TIM.TYPES.GRP_AVCHATROOM,
      })
      this.$bus.$emit('join-group-live-avchatroom')
    },
    //开始推流
    async startPushStream() {
      await this.createRoom()
      //streamID 拼接规则： sdkappid_roomid_userid_main
      const streamID = `${this.user.sdkAppID}_${this.roomID}_${this.user.userID}_main`
      // 对userSig进行encode,防止userSig中带有+时被浏览器解析为空格，导致trtc ws连接失败
      const url = `room://livedomainname=tuikit.qcloud.com&sdkappid=${this.user.sdkAppID}&roomid=${this.roomID}&userid=${this.user.userID}&usersig=${encodeURIComponent(this.user.userSig)}&streamid=${streamID}`
      this.pusher.startPush(url).then(() => {
        this.isPushingStream = true
        this.sendNoticeToGroup(1)
        this.updateTimer = setInterval(() => {
          this.updateRoom()
        }, 10000)
        this.recordTimer = setInterval(() => {
          this.recordLiveTime()
        }, 1000)
      }).catch(() => {})
    },
    // 停止推流
    stopPushStream() {
      // 派发关闭浮层组件事件
      this.$bus.$emit('close-group-live')
    },
    async stopPush() {
      await this.destroyRoom()
      await this.pusher.stopPush()
      await this.tim.dismissGroup(this.roomID) // 解散直播群组
      this.isPushingStream = false
      this.sendNoticeToGroup(0)
    },
    // 给群内发送开始直播、结束直播自定义消息
    // roomStatus 1 开始直播 0 结束直播
    sendNoticeToGroup(roomStatus) {
      if (!this.groupLiveInfo.groupID) {
        return
      }
      const { userID, nick, avatar } = this.user.currentUserProfile
      const form = {
        roomId: this.roomID,
        roomName: this.roomName,
        roomCover: avatar,
        roomStatus: `${roomStatus}`,
        anchorName: nick,
        version: 4,
        roomType: 'liveRoom',
        anchorId: userID,
        businessID: 'group_live'
      }
      const message = this.tim.createCustomMessage({
        to: this.groupLiveInfo.groupID,
        conversationType: this.TIM.TYPES.CONV_GROUP,
        priority: this.TIM.TYPES.MSG_PRIORITY_NORMAL,
        payload: {
          data: JSON.stringify(form),
          description: '',
          extension: '',
        },
      })
      this.$store.commit('pushCurrentMessageList', message)
      this.tim.sendMessage(message).then(() => {}).catch(() => {})
    },
    // 记录直播时间
    recordLiveTime () {
      this.time++
      this.pusherTime = formatTime(this.time)
    }
  }
}
</script>

<style lang="less"  scoped>
  ::-webkit-input-placeholder {
    color: #fff
  }
  ::-moz-input-placeholder {
    color: #fff
  }
  ::-ms-input-placeholder {
    color: #fff
  }
  .cursor {
    cursor: pointer;
  }
  // Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 4 times
@color1: #363e47; // Appears 2 times

// Width variables (appears count calculates by raw css)
@width2: 100%; // Appears 3 times

// Height variables (appears count calculates by raw css)
@height1: 100%; // Appears 2 times
@height5: 55px; // Appears 3 times

.active {
	color: #2d8cf0;
}
.pusher {
	background: #000000;
	display: flex;
	flex-direction: column;
	flex-flow: column;
	height: @height1;
	position: relative;
	width: @width2;
	.video-container {
		height: calc(@height1 - 125px);
		position: relative;
		.stop-camera {
			align-items: center;
			background-color: @color0;
			bottom: 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
			left: 0;
			position: absolute;
			right: 0;
			top: 0;
		}
	}
	.header-bar {
		background-color: @color1;
		height: 70px;
		padding: 10px 10px 10px 20px;
		position: relative;
		width: @width2;
		.input-name-box {
			align-items: center;
			display: flex;
			height: @height1;
			left: 0;
			padding: 10px 20px;
			position: absolute;
			top: 0px;
			width: calc(@width2 - 100px);
			z-index: 99;
			.avatar {
				border-radius: 50%;
				height: 50px;
				margin: 0px 10px 0px 0px;
				width: 50px;
			}
			.room-name {
				background: rgba(255,255,255,0);
				border-bottom: 1px solid @color0;
				border: hidden;
				color: @color0;
				font-size: 20px;
				height: 40px;
				outline-style: none;
				width: 60%;
			}
		}
	}
	.setting-bar {
		background-color: @color1;
		height: @height5;
		position: relative;
		width: @width2;
		.pusher-start {
			align-items: center;
			background: #5cadff;
			bottom: 0;
			display: flex;
			height: @height5;
			justify-content: center;
			position: absolute;
			right: 0;
			width: 210px;
		}
		.pusher-mic {
			align-items: center;
			bottom: 0;
			display: flex;
			height: @height5;
			justify-content: center;
			padding: 0 10px;
			position: absolute;
			right: 220px;
		}
		.play-text {
			color: @color0;
			font-size: 16px;
			margin-left: 5px;
		}
		.pusher-icon {
			height: 14px;
			width: 14px;
		}
		.mic-text {
			color: #8a9099;
			font-size: 14px;
			margin-left: 5px;
		}
	}
}
</style>
