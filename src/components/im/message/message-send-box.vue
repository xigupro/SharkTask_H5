<template>
  <div id="message-send-box-wrapper" :style="focus ? {'backgroundColor': 'white'} : {}" @drop="dropHandler">
    <div class="send-header-bar">
      <van-popover v-model="showEmoji" placement="top" trigger="click">
        <div class="emojis">
          <div v-for="item in emojiName" class="emoji" :key="item" @click="chooseEmoji(item)">
            <img :src="emojiUrl + emojiMap[item]" style="width:30px;height:30px" />
          </div>
        </div>
      </van-popover>
      <span @click="showEmoji = true">
        <van-icon size="24" name="smile-o" />
      </span>
      <span @click="handleSendImageClick">
        <van-icon size="24" name="photo-o" />
      </span>
      <span @click="handleSendVideoClick">
        <van-icon size="24" name="video-o" />
      </span>
      <!-- <span @click="handleSendFileClick">文件</span> -->
      <span v-if="currentConversationType !== TIM.TYPES.CONV_GROUP" @click="sendMoneyDialogVisible = true; form.data = 'money'">
        <van-icon size="24" name="gold-coin-o" />
      </span>
      <!-- <span @click="sendCustomDialogVisible = true">自定义消息</span> -->
      <!-- <span @click="surveyDialogVisible = true">小调查</span> -->
      <template  v-if="toAccount !== userID">
        <span @click="trtcCalling('video')">
          <van-icon size="24" name="play-circle-o" />
        </span>
        <span @click="trtcCalling('audio')">
          <van-icon size="24" name="volume-o" />
        </span>
      </template>
      <!-- <div v-if="currentConversationType === TIM.TYPES.CONV_GROUP && groupProfile.type !== 'AVChatRoom'" @click="groupLive">
        群直播
      </div> -->
    </div>
    <van-dialog
      title="红包"
      v-model="sendMoneyDialogVisible"
      showCancelButton
      @cancel="sendMoneyDialogVisible = false"
      @confirm="sendMoneyMessage">
      <van-form label-width="100px">
        <van-field label="金额" placeholder="请输入" type="number" v-model="form.extension"></van-field>
        <van-field label="备注" placeholder="请输入" v-model="form.description"></van-field>
      </van-form>
    </van-dialog>
    <van-dialog
      title="发自定义消息"
      v-model="sendCustomDialogVisible"
      showCancelButton
      @cancel="sendCustomDialogVisible = false"
      @confirm="sendCustomMessage">
      <van-form label-width="100px">
        <van-field label="data" v-model="form.data"></van-field>
        <van-field label="description" v-model="form.description"></van-field>
        <van-field label="extension" v-model="form.extension"></van-field>
      </van-form>
    </van-dialog>
    <van-dialog title="对IM Web demo的建议和使用感受" v-model="surveyDialogVisible">
      <van-form label-width="100px">
        <van-field name="rate" label="评分">
          <template #input>
            <van-rate v-model="rate" />
          </template>
        </van-field>
        <van-field
          label="建议"
          type="textarea"
          :rows="2"
          placeholder="请输入内容"
          resize="none"
          v-model="suggestion"
        ></van-field>
      </van-form>
      <span slot="footer" class="dialog-footer">
        <van-button @click="surveyDialogVisible = false">取 消</van-button>
        <van-button type="primary" @click="sendSurvey">确 定</van-button>
      </span>
    </van-dialog>
    <div class="bottom">
      <van-field
        v-model="messageContent"
        rows="1"
        autosize
        ref="text-input"
        class="text-input"
        type="textarea"
        placeholder="请输入消息"
        @focus="focus = true"
        @blur="focus = false"
        @input="inputChange"
        @keydown.enter.exact.prevent="handleEnter"
        @keyup.ctrl.enter.prevent.exact="handleLine"
        @keydown.up.stop="handleUp"
        @keydown.down.stop="handleDown">
        <template #button>
          <van-button size="small" type="primary" @click="sendTextMessage">发送</van-button>
        </template>
      </van-field>
    </div>
    <input
      type="file"
      id="imagePicker"
      ref="imagePicker"
      accept=".jpg, .jpeg, .png, .gif, .bmp"
      @change="sendImage"
      style="display:none"
    />
    <input type="file" id="filePicker" ref="filePicker" @change="sendFile" style="display:none" />
    <input type="file" id="videoPicker" ref="videoPicker" @change="sendVideo" style="display:none" accept=".mp4"/>
    <div class="calling-member-list" v-if="currentConversationType === TIM.TYPES.CONV_GROUP && showCallingMember">
      <calling-member-list @getList="getList" :type="listTpye"></calling-member-list>
      <div class="calling-list-btn">
        <span class="calling-btn" @click="cancelCalling">取消</span>
        <span class="calling-btn" @click="callingHandler">确定</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import callingMemberList from './trtc-calling/group-member-list';
import { emojiMap, emojiName, emojiUrl } from '@/utils/emojiMap';
import { Field, Dialog, Button, Popover, Form, Rate, Icon } from 'vant';
import MoneyProxy from '@/proxies/money'

export default {
  name: 'message-send-box',
  props: ['scrollMessageListToButtom'],
  components: {
    callingMemberList: callingMemberList,
    [Field.name]: Field,
    [Form.name]: Form,
    [Button.name]: Button,
    [Popover.name]: Popover,
    [Rate.name]: Rate,
    [Icon.name]: Icon,
    [Dialog.Component.name]: Dialog.Component,
  },
  data() {
    return {
      callingList: [],
      groupAtList: [],
      listTpye:'',
      callingType: '',
      groupAt:false,
      showCallingMember: false,
      colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
      messageContent: '',
      isSendCustomMessage: false,
      sendCustomDialogVisible: false,
      sendMoneyDialogVisible: false,
      surveyDialogVisible: false,
      form: {
        data: '',
        description: '',
        extension: ''
      },
      rate: 5, // 评分
      suggestion: '', // 建议
      file: '',
      showEmoji: false,
      emojiMap: emojiMap,
      emojiName: emojiName,
      emojiUrl: emojiUrl,
      showAtGroupMember: false,
      atUserID: '',
      focus: false
    }
  },
  computed: {
    ...mapGetters(['toAccount', 'currentConversationType']),
    ...mapState({
      memberList: state => state.group.currentMemberList,
      userID: state => state.user.userID,
      groupProfile: state => state.conversation.currentConversation.groupProfile
    })
  },
  mounted() {
    this.$refs['text-input'].addEventListener('paste', this.handlePaste)
    this.$bus.$on('reEditMessage', this.reEditMessage)
  },
  beforeDestroy() {
    this.$refs['text-input'].removeEventListener('paste', this.handlePaste)
  },
  methods: {
    getList(value) {
      this.callingList = value.map((item) => {
        let obj = JSON.parse(item)
        return obj.userID
      })
      this.groupAtList = value.map((item) => {
        let data = JSON.parse(item)
        return data.nick
      })
    },
    cancelCalling() {
      this.showCallingMember = false
    },
    callingHandler() {
      if (this.callingList.length < 1) {
        this.$toast({
          type: 'warning',
          message: '请选择成员'
        })
        return
      }
      if (this.listTpye === 'groupAt') {
        this.groupAtList.forEach((item, index) => {
          if(index===0) {
            this.messageContent += `${item} `
          }else{
            this.messageContent += `@${item} `
          }
        })
        this.showCallingMember = false
        this.$refs['text-input'].focus()
        return
      }
      if (this.listTpye === 'calling') {
        let callingData = {
          memberList:this.callingList,
          type:this.TIM.TYPES.CONV_GROUP
        }
        this.$store.commit('setCallingList',callingData)
        if (this.callingType === 'video') {
          this.$bus.$emit('video-call')
        }
        if (this.callingType === 'audio') {
          this.$bus.$emit('audio-call')
        }
        this.showCallingMember = false
      }

    },
    trtcCalling(type) {
      this.listTpye = 'calling'
      if (type === 'video') {
        this.callingType = 'video'
      }
      if (type === 'audio') {
        this.callingType = 'audio'
      }
      // 呼叫方设置
      if(this.currentConversationType === 'C2C') {
        let member = [this.toAccount]
        let callingData = {
          memberList:member,
          type:'C2C'
        }
        this.$store.commit('setCallingList',callingData)
        this.$bus.$emit(`${type}-call`)
        return
      }
      if(this.currentConversationType === this.TIM.TYPES.CONV_GROUP) {
        this.showCallingMember = true
      }
      // this.$store.commit('pushCurrentMessageList', true)
    },
    handleEmojiShow () {
      this.emojiShow = true
      this.bigEmojiShow = false
    },
    handleBigEmojiShow(index) {
      let elm = document.getElementById('bigEmojiBox')
      elm && (elm.scrollTop = 0)
      this.curItemIndex = index
      this.curBigEmojiItemList = this.bigEmojiList[index].list
      this.emojiShow = false
      this.bigEmojiShow = true
    },
    chooseBigEmoji(item) {
      this.popoverVisible = false
      let message = this.tim.createFaceMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: {
          index: this.curItemIndex + 1,
          data: `${item}@2x`
        }
      })
      this.$store.commit('pushCurrentMessageList', message)
      this.$bus.$emit('scroll-bottom')
      this.tim.sendMessage(message).catch(error => {
        this.$toast({
          type: 'error',
          message: error.message
        })
      })
    },
    reEditMessage(payload) {
      this.messageContent = payload
    },
    handleUp() {
      const index = this.memberList.findIndex(
        member => member.userID === this.atUserID
      )
      if (index - 1 < 0) {
        return
      }
      this.atUserID = this.memberList[index - 1].userID
    },
    handleDown() {
      const index = this.memberList.findIndex(
        member => member.userID === this.atUserID
      )
      if (index + 1 >= this.memberList.length) {
        return
      }
      this.atUserID = this.memberList[index + 1].userID
    },
    handleEnter() {
      this.sendTextMessage()
    },
    inputChange(value) {
      if (this.currentConversationType === this.TIM.TYPES.CONV_GROUP && value.data === '@') {
        this.groupAt = true
        this.listTpye = 'groupAt'
        this.showCallingMember = true
      }
      if (value.data === ' ' && this.messageContent.indexOf('@ ') !== -1) {
        this.groupAt = false
        this.listTpye = ''
        this.showCallingMember = false
      }
    },
    handleLine() {
      this.messageContent += '\n'
    },
    handlePaste(e) {
      let clipboardData = e.clipboardData
      let file
      if (
        clipboardData &&
        clipboardData.files &&
        clipboardData.files.length > 0
      ) {
        file = clipboardData.files[0]
      }

      if (typeof file === 'undefined') {
        return
      }
      // 1. 创建消息实例，接口返回的实例可以上屏
      let message = this.tim.createImageMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: {
          file: file
        },
        onProgress: percent => {
          this.$set(message, 'progress', percent) // 手动给message 实例加个响应式属性: progress
        }
      })
      this.$store.commit('pushCurrentMessageList', message)

      // 2. 发送消息
      let promise = this.tim.sendMessage(message)
      promise.catch(error => {
        this.$toast({
          type: 'error',
          message: error.message
        })
      })
    },
    dropHandler(e) {
      e.preventDefault()
      let file = e.dataTransfer.files[0]
      let message = {}
      if (file.type === 'video/mp4') {
        message = this.tim.createVideoMessage({
          to: this.toAccount,
          conversationType: this.currentConversationType,
          payload: {
            file: file
          },
          onProgress: percent => {
            this.$set(message, 'progress', percent) // 手动给message 实例加个响应式属性: progress
          }
        })
      } else {
        message = this.tim.createFileMessage({
          to: this.toAccount,
          conversationType: this.currentConversationType,
          payload: {
            file: file
          },
          onProgress: percent => {
            this.$set(message, 'progress', percent) // 手动给message 实例加个响应式属性: progress
          }
        })
      }
      this.$store.commit('pushCurrentMessageList', message)
      this.tim
        .sendMessage(message)
        .then(() => {
          this.$refs.videoPicker.value = null
        })
        .catch(imError => {
          this.$toast({
            message: imError.message,
            type: 'error'
          })
        })
    },
    sendTextMessage() {
      if (
        this.messageContent === '' ||
        this.messageContent.trim().length === 0
      ) {
        this.messageContent = ''
        this.$toast({
          message: '不能发送空消息哦！',
          type: 'info'
        })
        return
      }
      if (this.currentConversationType === this.TIM.TYPES.CONV_GROUP && this.groupAt) {
        let message = this.tim.createTextAtMessage({
          to: this.toAccount,
          conversationType: this.TIM.TYPES.CONV_GROUP,
          payload: {
            text: this.messageContent,
            atUserList: this.callingList // 'denny' 'lucy' 都是 userID，而非昵称
          }
        })
        this.$store.commit('pushCurrentMessageList', message)
        this.$bus.$emit('scroll-bottom')
        this.tim.sendMessage(message).catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
        this.messageContent = ''
        this.groupAt = false
        return
      }
      const message = this.tim.createTextMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: { text: this.messageContent }
      })
      this.$store.commit('pushCurrentMessageList', message)
      this.$bus.$emit('scroll-bottom')
      this.tim.sendMessage(message).catch(error => {
        this.$toast({
          type: 'error',
          message: error.message
        })
      })
      this.messageContent = ''
    },
    // 发红包
    async sendMoneyMessage() {
      if (
        this.form.extension <= 0.01
      ) {
        this.$toast({
          message: '请输入合法金额',
          type: 'info'
        })
        return
      }
      const { success, data: redId } = await MoneyProxy.sendRed({
        userId: this.userID,
        from_user: this.userID,
        to_user: this.toAccount,
        money: this.form.extension,
        remark: this.form.description
      })
      if (!success) return
      const message = this.tim.createCustomMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: {
          data: this.form.data,
          // 拼接红包id，方便接受者领取
          description: `${this.form.description}@@@ID:${redId}`,
          extension: this.form.extension,
        }
      })
      this.$store.commit('pushCurrentMessageList', message)
      this.tim.sendMessage(message).catch(error => {
        this.$toast({
          type: 'error',
          message: error.message
        })
      })
      Object.assign(this.form, {
        data: '',
        description: '',
        money: ''
      })
      this.sendMoneyDialogVisible = false
    },
    sendCustomMessage() {
      if (
        this.form.data.length === 0 &&
        this.form.description.length === 0 &&
        this.form.extension.length === 0
      ) {
        this.$toast({
          message: '不能发送空消息',
          type: 'info'
        })
        return
      }
      const message = this.tim.createCustomMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: {
          data: this.form.data,
          description: this.form.description,
          extension: this.form.extension
        }
      })
      this.$store.commit('pushCurrentMessageList', message)
      this.tim.sendMessage(message).catch(error => {
        this.$toast({
          type: 'error',
          message: error.message
        })
      })
      Object.assign(this.form, {
        data: '',
        description: '',
        extension: ''
      })
      this.sendCustomDialogVisible = false
    },
    random(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    },
    sendSurvey() {
      const message = this.tim.createCustomMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: {
          data: 'survey',
          description: String(this.rate),
          extension: this.suggestion
        }
      })
      this.$store.commit('pushCurrentMessageList', message)
      Object.assign(this.form, {
        data: '',
        description: '',
        extension: ''
      })
      this.tim
        .sendMessage(message)
        .then(() => {
          Object.assign(this, {
            rate: 5,
            suggestion: ''
          })
        })
        .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
      this.surveyDialogVisible = false
    },
    chooseEmoji(item) {
      this.messageContent += item
    },
    handleSendImageClick() {
      this.$refs.imagePicker.click()
    },
    handleSendFileClick() {
      this.$refs.filePicker.click()
    },
    handleSendVideoClick() {
      this.$refs.videoPicker.click()
    },
    groupLive() {
      this.$store.commit('updateGroupLiveInfo', {
        groupID: this.toAccount,
        anchorID: this.userID,
      })
      this.$bus.$emit('open-group-live', { channel: 1 })
    },
    sendImage() {
      const message = this.tim.createImageMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: {
          file: document.getElementById('imagePicker') // 或者用event.target
        },
        onProgress: percent => {
          this.$set(message, 'progress', percent) // 手动给message 实例加个响应式属性: progress
        }
      })
      this.$store.commit('pushCurrentMessageList', message)
      this.tim
        .sendMessage(message)
        .then(() => {
          this.$refs.imagePicker.value = null
        })
        .catch(imError => {
          this.$toast({
            message: imError.message,
            type: 'error'
          })
        })
    },
    sendFile() {
      const message = this.tim.createFileMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: {
          file: document.getElementById('filePicker') // 或者用event.target
        },
        onProgress: percent => {
          this.$set(message, 'progress', percent) // 手动给message 实例加个响应式属性: progress
        }
      })
      this.$store.commit('pushCurrentMessageList', message)
      this.tim
        .sendMessage(message)
        .then(() => {
          this.$refs.filePicker.value = null
        })
        .catch(imError => {
          this.$toast({
            message: imError.message,
            type: 'error'
          })
        })
    },
    sendVideo() {
      const message = this.tim.createVideoMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: {
          file: document.getElementById('videoPicker') // 或者用event.target
        },
        onProgress: percent => {
          this.$set(message, 'progress', percent) // 手动给message 实例加个响应式属性: progress
        }
      })
      this.$store.commit('pushCurrentMessageList', message)
      this.tim
        .sendMessage(message)
        .then(() => {
          this.$refs.videoPicker.value = null
        })
        .catch(imError => {
          this.$toast({
            message: imError.message,
            type: 'error'
          })
        })
    }
  }
}
</script>
<style lang="less" scoped>
// Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 2 times

// Width variables (appears count calculates by raw css)
@width3: 25px; // Appears 3 times

// Height variables (appears count calculates by raw css)
@height2: 25px; // Appears 3 times

#message-send-box-wrapper {
	box-sizing: border-box;
	overflow: hidden;
	padding: 5px;
}
.emojis {
	box-sizing: border-box;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	height: 160px;
	overflow-y: scroll;
}
.emoji {
	box-sizing: border-box;
	height: 40px;
	width: 40px;
}
.send-header-bar {
	box-sizing: border-box;
	padding: 3px 0 0 0;
	span {
		color: #000;
		cursor: pointer;
		margin: 0 20px 0 0;
	}
}
textarea {
	resize: none;
}
.text-input {
	background-color: transparent;
	border: none;
	box-sizing: box-sizing;
	font-size: 16px;
	outline: none;
	width: 100%;
}
.block {
	align-items: center;
	display: flex;
	padding: 10px 0;
}
.bottom {
	padding-top: 10px;
	position: relative;
	.btn-send {
		bottom: 10px;
		position: absolute;
		right: 5px;
		cursor: pointer;
	}
}
.group-live-icon-box {
	display: inline-block;
	height: @height2;
	margin-right: 12px;
	position: relative;
	top: 3px;
	width: @width3;
	.group-live-icon {
		background-size: cover;
		background: url("../../../assets/images/live-icon.png") center no-repeat;
		display: inline-block;
		height: @height2;
		left: 0;
		position: absolute;
		top: 0;
		width: @width3;
		z-index: 2;
	}
	.group-live-icon-hover {
		background-size: cover;
		background: url("../../../assets/images/live-icon-hover.png") center no-repeat;
		display: inline-block;
		height: @height2;
		left: 0;
		position: absolute;
		top: 0;
		width: @width3;
		z-index: 1;
	}
	&:hover {
		.group-live-icon {
			z-index: 1;
		}
		.group-live-icon-hover {
			z-index: 2;
		}
	}
}
.calling-member-list {
	background: @color0;
	margin-right: 20px;
	position: absolute;
	top: 50px;
	.calling-list-btn {
		display: flex;
		float: right;
		margin: 10px 0;
		width: 140px;
		.calling-btn {
			background: #00a4ff;
			border-radius: 20px;
			color: @color0;
			cursor: pointer;
			font-size: 14px;
			margin-left: 13px;
			padding: 6px 12px;
		}
	}
}
.van-popover {
	padding: 12px 0 0 0 !important;
}
</style>
