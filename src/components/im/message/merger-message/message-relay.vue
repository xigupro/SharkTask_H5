<template>
    <div class="chat-bubble" @mousedown.stop @contextmenu.prevent>
      <ConversationSelectedList @getList="getList"></ConversationSelectedList>
      <div class="conversation-list-btn">
          <van-button class="conversation-btn" @click="cancel">取消</van-button>
          <van-button class="conversation-btn" @click="messageRelay">发送</van-button>
      </div>
    </div>
</template>

<script>
  import { mapState } from 'vuex'
  import ConversationSelectedList from '../../conversation/conversation-selected-list'

  export default {
    name: 'MessageBubble',
    components: {
      ConversationSelectedList
    },
    data() {
      return {
        isTimeout: false,
        showConversationList: false,
        selectedConversation: [],
        testMergerMessage: {}
      }
    },
    created() {
    },
    mounted() {
      if (this.$refs.dropdown && this.$refs.dropdown.$el) {
        this.$refs.dropdown.$el.addEventListener('mousedown', this.handleDropDownMousedown)
      }
    },
    beforeDestroy() {
      if (this.$refs.dropdown && this.$refs.dropdown.$el) {
        this.$refs.dropdown.$el.removeEventListener('mousedown', this.handleDropDownMousedown)
      }
    },
    updated() {
    },
    computed: {
      ...mapState({
        isShowConversationList: state => state.conversation.isShowConversationList,
        selectedMessageList: state => state.conversation.selectedMessageList,
        relayType: state => state.conversation.relayType,
        relayMessage: state => state.conversation.relayMessage
      }),
    },
    methods: {
      cancel() {
        this.$store.commit('showConversationList', false)
      },
      getList(value) {
        this.selectedConversation = value

      },
      sendSingleMessage(to, type, message) {
        const _message = this.tim.createForwardMessage({
          to: to,
          conversationType: type,
          payload: message,
          priority: this.TIM.TYPES.MSG_PRIORITY_NORMAL
        })
        this.$store.commit('pushCurrentMessageList', _message)   // ??
        return _message
      },
      mergerSort() {
        this.selectedMessageList.sort((a, b) =>  {
          if(a.time !== b.time) {
            return a.time - b.time
          }else {
            return a.sequence - b.sequence
          }
        })
      },
      mergerMessage(to, type) {
        let _abstractList = [], _count = 0, _title = ''
        _count = this.selectedMessageList.length < 3 ? this.selectedMessageList.length : 3

        for(let i = 0; i < _count; i++) {
          _abstractList.push(this.setAbstractList(this.selectedMessageList[i]))
        }
        _title = this.selectedMessageList[0].conversationType === 'GROUP' ? '群聊的聊天记录' : `${this.selectedMessageList[0].nick || this.selectedMessageList[0].from} 和 ${this.selectedMessageList[0].to} 的聊天记录`
        let message = this.tim.createMergerMessage({
          to: to,
          conversationType: type,
          payload: {
            messageList: this.selectedMessageList ,
            title: _title,
            abstractList: _abstractList,
            compatibleText: '请升级IMSDK到v2.10.1或更高版本查看此消息'
          }
        })
        this.$store.commit('pushCurrentMessageList', message)   // ??
        return message
      },
      async messageRelay() {
        let _type = '', _to = ''
        for (let item of this.selectedConversation) {
          if(item.indexOf(this.TIM.TYPES.CONV_C2C) !== -1) {
            _type = this.TIM.TYPES.CONV_C2C
            _to = item.substring(3, item.length)
          }
          if(item.indexOf(this.TIM.TYPES.CONV_GROUP) !== -1) {
            _type = this.TIM.TYPES.CONV_GROUP
            _to = item.substring(5, item.length)
          }
          // 排序
          this.mergerSort()
          if (this.relayType === 1) {
            let message = this.sendSingleMessage(_to, _type, this.relayMessage)
            this.sendMessageHandler(message)
          }

          if (this.relayType === 2) {
            if(this.selectedMessageList.length > 30) {
              this.$toast({
                message: '转发消息仅支持30条以内',
                type: 'error'
              })
              return
            }
            for (let selectedMessage of this.selectedMessageList) {
              let message = await this.sendSingleMessage(_to, _type, selectedMessage)
              await this.tim.sendMessage(message)
                .then((res) => {
                  return res
                })
                .catch(imError => {
                  this.$toast({
                    message: imError.message,
                    type: 'error'
                  })
                })

            }
          }
          if (this.relayType === 3) {
            let message = this.mergerMessage(_to, _type)
            this.sendMessageHandler(message)
          }
        }
        this.$store.commit('showConversationList', false)
        this.$store.commit('resetSelectedMessage', false)
      },

      sendMessageHandler(message) {
        this.tim.sendMessage(message).catch(imError => {
            this.$toast({
              message: imError.message,
              type: 'error'
            })
          })
      },
      setAbstractList(message) {
        let nick = message.nick || message.from
        switch (message.type) {
          case this.TIM.TYPES.MSG_TEXT:
            return `${nick}: ${message.payload.text}`
          case this.TIM.TYPES.MSG_MERGER:
            return `${nick}: [聊天记录]`
          case this.TIM.TYPES.MSG_IMAGE:
            return `${nick}: [图片]`
          case this.TIM.TYPES.MSG_AUDIO:
            return `${nick}: [音频]`
          case this.TIM.TYPES.MSG_VIDEO:
            return `${nick}: [视频]`
          case this.TIM.TYPES.MSG_CUSTOM:
            return `${nick}: [自定义消息]`
          case this.TIM.TYPES.MSG_FILE:
            return `${nick}: [文件]`
          case this.TIM.TYPES.MSG_FACE:
            return `${nick}: [动画表情]`
        }
      },
      handleDropDownMousedown(e) {
        if (e.buttons === 2) {
          if (this.$refs.dropdown.visible) {
            this.$refs.dropdown.hide()
          } else {
            this.$refs.dropdown.show()
          }
        }
      }
    }
  }
</script>

<style lang="less" scoped>
    // Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 2 times



.conversation-container {
	background-color: @color0;
	left: 0;
	margin: auto;
	position: absolute;
	right: 0;
	top: 0;
	width: 80%;
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
</style>
