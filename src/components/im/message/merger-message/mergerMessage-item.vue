<template>
    <div class="message-wrapper col-2">
        <div class="content-wrapper">
<!--文本消息-->
            <div class="message-container" v-if="message.type === 'TIMTextElem'">
                <div class="text-message" v-for="(item, index) in contentList" :key="index">
                    <span  :key="index" v-if="item.name === 'text'">{{ item.text }}</span>
                    <img v-else-if="item.name === 'img'" :src="item.src" width="20px" height="20px" :key="index"/>
                </div>
            </div>
<!--图片消息-->
            <div class="message-container" v-else-if="message.type === 'TIMImageElem'">
                <img class="image-element" :src="payload.imageInfoArray[0].url" @load="onImageLoaded" @click="handlePreview()" />
            </div>
<!--文件消息-->
            <div class="message-container" v-else-if="message.type === 'TIMFileElem'">
                <div class="file-element-wrapper" title="单击下载" @click="downloadFile">
                    <div class="file-box">
                        <i class="el-icon-document file-icon"></i>
                        <div class="file-element">
                            <span class="file-name">{{ payload.fileName }}</span>
                            <span class="file-size">{{ fileSize }}</span>
                        </div>
                    </div>
                </div>
            </div>
<!--表情消息-->

            <div class="message-container" v-else-if="message.type === 'TIMFaceElem'">
                <img :src="faceUrl"/>
            </div>
<!--视频消息-->
            <div class="message-container" v-else-if="message.type === TIM.TYPES.MSG_VIDEO">
                <video
                        :src="payload.videoUrl"
                        controls
                        class="merger-video"
                        @error="videoError"
                ></video>
            </div>
<!--音频消息-->
            <div class="sound-element-wrapper"  v-else-if="message.type === TIM.TYPES.MSG_AUDIO" title="单击播放" @click="play">
                <i class="iconfont icon-voice"></i>
                {{ payload.second + '"' }}
            </div>
 <!--自定义消息-->
            <div class="message-container" v-else-if="message.type === 'TIMCustomElem'">
                <div class="custom-element-wrapper">
                    <div class="survey"  v-if="this.payload.data === 'survey'">
                        <div class="title">对IM DEMO的评分和建议</div>
                        <van-rate v-model="rate" disabled />
                        <div class="suggestion">{{this.payload.extension}}</div>
                    </div>
                    <span class="text" title="您可以自行解析自定义消息" v-else>
                      <template >{{translateCustomMessage(this.payload)}}</template>
                    </span>
                </div>
            </div>
<!--合并的消息-->
            <div class="message-container"  @click="mergerHandler(message)" v-else-if="message.type === TIM.TYPES.MSG_MERGER">
                <div class="merger-item">
                    <p class="merger-title">{{payload.title}}</p>
                    <p class="merger-text" v-for="(item, index) in payload.abstractList" :key="index">
                        {{item}}
                    </p>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { decodeText } from '@/utils/decodeText'
  import { getFullDate } from '@/utils/date'
  import { Rate } from 'vant'

  export default {
    name: 'MessageItem',
    props: {
      message: {
        type: Object,
        required: true
      },
      payload: {
        type: Object,
        required: true
      },

    },
    components: {
      [Rate.name]: Rate,
    },
    data() {
      return {
        renderDom: [],
        showConversationList: false,
        relayMessage: {},
        selectedConversation: [],
        messageSelected:[],
      }
    },
    computed: {
      ...mapState({
        currentConversation: state => state.conversation.currentConversation,
        currentUserProfile: state => state.user.currentUserProfile,
        isShowConversationList: state => state.conversation.isShowConversationList,

      }),
      // 自定义消息
      rate() {
        return parseInt(this.payload.description)
      },
      // 图片消息
      imageUrl() {
        const url = this.payload.imageInfoArray[0].imageUrl
        if (typeof url !== 'string') {
          return ''
        }
        return url.slice(0, 2) === '//' ? `https:${url}` : url
      },
      // showProgressBar() {
      //   return this.$parent.message.status === 'unSend'
      // },
      percentage() {
        return Math.floor((this.$parent.message.progress || 0) * 100)
      },
      // 表情消息
      faceUrl() {
        let name = ''
        if (this.payload.data.indexOf('@2x') > 0) {
          name = this.payload.data
        } else {
          name = this.payload.data + '@2x'
        }
        return `https://webim-1252463788.file.myqcloud.com/assets/face-elem/${name}.png`
      },
      // 时间换算
      date() {
        return getFullDate(new Date(this.message.time * 1000))
      },

      // 文件消息大小
      fileSize() {
        const size = this.payload.fileSize
        if (size > 1024) {
          if (size / 1024 > 1024) {
            return `${this.toFixed(size / 1024 / 1024)} Mb`
          }
          return `${this.toFixed(size / 1024)} Kb`
        }
        return `${this.toFixed(size)}B`
      },
      // 消息昵称
      from() {
        const isC2C = this.currentConversation.type === this.TIM.TYPES.CONV_C2C
        // 自己发送的用昵称渲染
        if (this.isMine) {
          return  this.currentUserProfile.nick || this.currentUserProfile.userID
        }
        // 1. C2C 的消息体中还无 nick / avatar 字段，需从 conversation.userProfile 中获取
        if (isC2C) {
          return (
            this.currentConversation.userProfile.nick ||
            this.currentConversation.userProfile.userID
          )
        }
        // 2. 群组消息，用消息体中的 nick 渲染。nameCard暂时支持不完善
        return this.message.nameCard ||  this.message.nick || this.message.from
      },
      avatar() {
        if (this.currentConversation.type === 'C2C') {
          return this.isMine
            ? this.currentUserProfile.avatar
            : this.currentConversation.userProfile.avatar
        } else if (this.currentConversation.type === 'GROUP') {
          return this.isMine
            ? this.currentUserProfile.avatar
            : this.message.avatar
        } else {
          return ''
        }
      },
      currentConversationType() {
        return this.currentConversation.type
      },
      isMine() {
        return this.message.flow === 'out'
      },
      contentList() {
        return decodeText(this.payload)
      },
    },
    methods: {
      // 自定义消息解析
      translateCustomMessage(payload) {
        let videoPayload = {}
        try{
          videoPayload = JSON.parse(payload.data)
        } catch(e) {
          videoPayload = {}
        }
        if (payload.data === 'group_create') {
          return `${payload.extension}`
        }
        if (videoPayload.roomId) {
          videoPayload.roomId = videoPayload.roomId.toString()
          videoPayload.isFromGroupLive = 1
          return videoPayload
        }
        if(payload.text) {
          return payload.text
        }else{
          return '[自定义消息]'
        }
      },
      // 图片消息
      onImageLoaded(event) {
        this.$bus.$emit('image-loaded', event)
      },
      handlePreview() {
        this.$bus.$emit('image-preview', {
          url: this.payload.imageInfoArray[0].url,
          flag: true
        })
      },
      toFixed(number, precision = 2) {
        return number.toFixed(precision)
      },
      showGroupMemberProfile(event) {
        this.tim
          .getGroupMemberProfile({
            groupID: this.message.to,
            userIDList: [this.message.from]
          })
          .then(({ data: { memberList } }) => {
            if (memberList[0]) {
              this.$bus.$emit('showMemberProfile', { event, member: memberList[0] })
            }
          })
      },
      messageClick(message) {
        this.$store.commit('showConversationList', false)
        this.showConversationList = true
        this.relayMessage = message   // 需要深拷贝吗？
      },
      showMergerMessage() {
        this.$bus.$emit('mergerMessage', true)
      },
      cancel() {
        this.showConversationList = false
      },
      getList(value) {
        this.selectedConversation = value
      },
      messageRelay() {
        let type = ''
        let toUserId = ''
        this.selectedConversation.forEach((item) => {
          if(item.indexOf(this.TIM.TYPES.CONV_C2C) !== -1) {
            type = this.TIM.TYPES.CONV_C2C
            toUserId = item.substring(3,item.length)
          }
          if(item.indexOf(this.TIM.TYPES.CONV_GROUP) !== -1) {
            type = this.TIM.TYPES.CONV_GROUP
            toUserId = item.substring(5,item.length)
          }
          const message = this.tim.createForwardMessage({
            to: toUserId,
            conversationType: type,
            payload: this.relayMessage,
            priority: this.TIM.TYPES.MSG_PRIORITY_NORMAL
          })
          this.tim.sendMessage(message).catch(imError => {
            this.$toast({
              message: imError.message,
              type: 'error'
            })
          })
          this.showConversationList = false
        })
      },
      // 合并的消息
      mergerHandler(message) {
        this.$store.commit('setMergerMessage', message)
        // this.$bus.$emit('mergerMessage', message)
      },
      // 视频消息
      videoError(e) {
        this.$toast({ type: 'error', message: '视频出错，错误原因：' + e.target.error.message })
      },
      // 音频消息
      play() {
        // 目前移动端的语音消息采用 aac 格式，以前用 amr 格式。默认先用 audio 标签播放，若无法播放则尝试 amr 格式播放。
        const audio = document.createElement('audio')
        audio.addEventListener('error', this.tryPlayAMR) // 播放出错，则尝试使用 AMR 播放
        audio.src = this.payload.url
        const promise = audio.play()
        if (promise) {
          promise.catch(() => {})
        }
      },
      tryPlayAMR() {
        try {
          const isIE = /MSIE|Trident|Edge/.test(window.navigator.userAgent)
          // amr 播放组件库在 IE 不支持
          if (isIE) {
            this.$toast({
              message: '您的浏览器不支持该格式的语音消息播放，请尝试更换浏览器，建议使用：谷歌浏览器',
              type: 'warning'
            })
            return
          }
          // 动态插入 amr 播放组件库
          if (!window.BenzAMRRecorder) {
            const script = document.createElement('script')
            script.addEventListener('load', this.playAMR)
            script.src = './BenzAMRRecorder.js'
            const firstScript = document.getElementsByTagName('script')[0]
            firstScript.parentNode.insertBefore(script, firstScript)
            return
          }
          this.playAMR()
        } catch (error) {
          this.$toast({
            message: '您的浏览器不支持该格式的语音消息播放，请尝试更换浏览器，建议使用：谷歌浏览器',
            type: 'warning'
          })
        }
      },
      playAMR() {
        if (!this.amr && window.BenzAMRRecorder) {
          this.amr = new window.BenzAMRRecorder()
        }
        if (this.amr.isInit()) {
          this.amr.play()
          return
        }
        this.amr.initWithUrl(this.url).then(() => {
          this.amr.play()
        })
      },
      // 文件消息
      downloadFile() {
        // 浏览器支持fetch则用blob下载，避免浏览器点击a标签，跳转到新页面预览的行为
        if (window.fetch) {
          fetch(this.payload.fileUrl)
            .then(res => res.blob())
            .then(blob => {
              let a = document.createElement('a')
              let url = window.URL.createObjectURL(blob)
              a.href = url
              a.download = this.payload.fileName
              a.click()
            })
        } else {
          let a = document.createElement('a')
          a.href = this.payload.fileUrl
          a.target = '_blank'
          a.download = this.filename
          a.click()
        }
      }
    }
  }
</script>

<style lang="less" scoped>
    // Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 5 times

// Width variables (appears count calculates by raw css)
@width4: 100%; // Appears 3 times
@width5: 56px; // Appears 3 times
@width6: 30px; // Appears 3 times

// Height variables (appears count calculates by raw css)
@height0: 300px; // Appears 2 times
@height1: 56px; // Appears 3 times

.conversation-container {
	background-color: @color0;
	left: 0px;
	position: absolute;
	top: 0;
	width: @width4;
	z-index: 999;
}
.conversation-list-btn {
	display: flex;
	float: right;
	margin: 10px 0;
	width: 140px;
	.conversation-btn {
		background: #00a4ff;
		border-radius: 20px;
		color: @color0;
		cursor: pointer;
		font-size: 14px;
		margin-left: 13px;
		padding: 6px 12px;
	}
}
.message-wrapper {
	margin: 5px 5px 10px 5px;
	.content-wrapper {
		align-items: center;
		display: flex;
		.message-container {
			width: @width4;
			.text-message {
				padding: 3px 10px;
			}
			.image-element {
				max-height: @height0;
			}
			.merger-item {
				background-color: @color0;
				border-radius: 6px;
				border: 1px solid #dedede;
				padding: 0 10px;
				.merger-title {
					font-size: 15px;
					max-width: 180px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.merger-text {
					color: #b3b3b3;
					font-size: 13px;
					margin: 10px 0;
					max-width: 280px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}
	}
}
.group-layout {
	display: flex;
	.col-1 {
		.avatar {
			border-radius: 50%;
			box-shadow: 0 5px 10px 0 rgba(0,0,0,0.1);
			height: @height1;
			width: @width5;
		}
	}
	.group-member-avatar {
		cursor: pointer;
	}
	.col-2 {
		display: flex;
		flex-direction: column;
		.chat-bubble {
			margin-top: 5px;
			outline: none;
		}
	}
	.col-3 {
		width: @width6;
	}
}
.c2c-layout {
	display: flex;
	.col-1 {
		.avatar {
			border-radius: 50%;
			box-shadow: 0 5px 10px 0 rgba(0,0,0,0.1);
			height: @height1;
			width: @width5;
		}
	}
	.group-member-avatar {
		cursor: pointer;
	}
	.col-2 {
		display: flex;
		flex-direction: column;
		.base {
			margin-top: 3px;
		}
	}
	.col-3 {
		width: @width6;
	}
}
.system-layout {
	display: flex;
	.col-1 {
		.avatar {
			border-radius: 50%;
			box-shadow: 0 5px 10px 0 rgba(0,0,0,0.1);
			height: @height1;
			width: @width5;
		}
	}
	.group-member-avatar {
		cursor: pointer;
	}
	.col-2 {
		display: flex;
		flex-direction: column;
	}
	.col-3 {
		width: @width6;
	}
}
.group-layout.position-left {
	.col-2 {
		align-items: flex-start;
	}
}
.c2c-layout.position-left {
	.col-2 {
		align-items: flex-start;
	}
}
.system-layout.position-left {
	.col-2 {
		align-items: flex-start;
	}
}
.group-layout.position-right {
	flex-direction: row-reverse;
	.col-2 {
		align-items: flex-end;
	}
}
.c2c-layout.position-right {
	flex-direction: row-reverse;
	.col-2 {
		align-items: flex-end;
	}
}
.system-layout.position-right {
	flex-direction: row-reverse;
	.col-2 {
		align-items: flex-end;
	}
}
.group-layout.position-center {
	justify-content: center;
}
.c2c-layout.position-center {
	justify-content: center;
}
.system-layout.position-center {
	justify-content: center;
}
.right {
	display: flex;
	flex-direction: row-reverse;
}
.left {
	display: flex;
	flex-direction: row;
}
.base {
	color: #eee;
	font-size: 12px;
}
.name {
	max-width: 100px;
	overflow: hidden;
	padding: 0 4px;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.merger-video {
	max-height: @height0;
	width: @width4;
}
.file-box {
	display: flex;
}
.file-icon {
	font-size: 40px !important;
}
.file-element {
	display: flex;
	flex-direction: column;
	margin-left: 12px;
}
.file-size {
	font-size: 12px;
	padding-top: 5px;
}
.text {
	font-size: 16px;
	font-weight: 600;
	padding-bottom: 10px;
}
font-weight {
	bold {
		font-size: 16px;
		font-weight: 600;
		padding-bottom: 10px;
	}
}
.title {
	font-size: 16px;
	font-weight: 600;
	padding-bottom: 10px;
}
.survey {
	background-color: @color0;
	color: #000000;
	display: flex;
	flex-direction: column;
	padding: 20px;
}
.suggestion {
	font-size: 14px;
	padding-top: 10px;
}
.sound-element-wrapper {
	background-color: @color0;
	border-radius: 3px;
	cursor: pointer;
	padding: 2px 13px;
}
</style>
