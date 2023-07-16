<template>
  <div class="chat-bubble" @mousedown.stop @contextmenu.prevent>
    <van-popover
      ref="dropdown"
      v-model="showPopover"
      v-if="!message.isRevoked"
      trigger="click"
      :actions="actions"
      @select="handleCommand"
    >
      <template #reference>
        <div style="display: flex">
          <div v-if="isMine && messageReadByPeer" class="message-status">
            <span>{{messageReadByPeer}}</span>
          </div>
          <div class="message-content" :class="bubbleStyle">
            <slot></slot>
          </div>
        </div>
      </template>
    </van-popover>
    <div class="group-tip-element-wrapper" v-if="message.isRevoked">
      {{text}}
      <van-button size="mini" v-show="isEdit" @click="reEdit">重新编辑</van-button>
    </div>
  </div>
</template>

<script>
  import { Button, Popover } from 'vant';

  export default {
  name: 'MessageBubble',
  components: {
    [Button.name]: Button,
    [Popover.name]: Popover,
  },
  data() {
    return {
      showPopover: false,
      isTimeout: false,
      showConversationList: false,
      relayMessage: {},
      selectedConversation: [],
      testMergerMessage: {}
    }
  },
  props: {
    isMine: {
      type: Boolean
    },
    isNew: {
      type: Boolean
    },
    message: {
      type: Object,
      required: true
    }
  },
  created() {
    this.isTimeoutHandler()
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
    actions() {
      const actionList = []
      if (this.isMine&&!this.isTimeout) {
        actionList.push({ text: '撤回' })
      }
      if (this.message.status !=='fail') {
        actionList.push({ text: '转发' })
        actionList.push({ text: '多选' })
      }
      return actionList;
    },
    bubbleStyle() {
      let classString = ''
      if (this.isMine) {
        classString += 'message-send'
      } else {
        classString += 'message-received'
      }
      if (this.isNew) {
        classString += 'new'
      }
      return classString
    },
    text() {
      if (this.message.conversationType === this.TIM.TYPES.CONV_C2C && !this.isMine) {
        return '对方撤回了一条消息'
      }
      if (this.message.conversationType === this.TIM.TYPES.CONV_GROUP && !this.isMine) {
        return `${this.message.from}撤回了一条消息`
      }
      return '你撤回了一条消息'
    },
    messageReadByPeer() {
      if (this.message.status !== 'success') {
        return false
      }
      if (this.message.conversationType === this.TIM.TYPES.CONV_C2C && this.message.isPeerRead) {
        return '已读'
      }
      if (this.message.conversationType === this.TIM.TYPES.CONV_C2C && !this.message.isPeerRead) {
        return '未读'
      }
      return ''
    },
    isEdit() {
      if (!this.isMine) {
        return false
      }
      if (this.message.type !== this.TIM.TYPES.MSG_TEXT) {
        return false
      }
      if (this.isTimeout) {
        return false
      }
      return true
    },
  },
  methods: {
    handleDropDownMousedown(e) {
      if (e.buttons === 2) {
        if (this.$refs.dropdown.visible) {
          this.$refs.dropdown.hide()
        } else {
          this.$refs.dropdown.show()
        }
      }
    },
    handleCommand(action, index) {
      switch (action.text) {
        case '撤回':
          this.tim.revokeMessage(this.message).then(() => {
            this.isTimeoutHandler()
          }).catch((err) => {
            this.$toast({
              message: err,
              type: 'warning'
            })
          })
          break
        case '转发':
          this.showConversationList = true
          this.$store.commit('setRelayType', 1)
          this.$store.commit('showConversationList', true)
          this.$store.commit('setRelayMessage', this.message)
          break
        case '对选':
          this.$bus.$emit('mergerSelected',true)
          break
        default:
          break
      }
    },
    isTimeoutHandler() { // 从发送消息时间开始算起，两分钟内可以编辑
      let now = new Date()
      if (parseInt(now.getTime() / 1000) - this.message.time > 2 * 60) {
        this.isTimeout = true
        return
      }
      setTimeout(this.isTimeoutHandler, 1000)
    },
    reEdit() {
      this.$bus.$emit('reEditMessage', this.message.payload.text)
    }
  }
}
</script>

<style lang="less" scoped>
  .conversation-container {
    position: absolute;
    top: 0;
    left: 0px;
    width: 100%;
    background-color: #fff;
    z-index: 999;
  }
  .conversation-list-btn {
    width: 140px;
    display: flex;
    float: right;
    margin: 10px 0;
    .conversation-btn {
      cursor: pointer;
      padding: 6px 12px;
      background: #00A4FF;
      color: #ffffff;
      font-size: 14px;
      border-radius: 20px;
      margin-left: 13px;
    }
  }
// Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 4 times



.chat-bubble {
	.message-status {
		align-items: center;
		color: #6e7981;
		display: flex;
		font-size: 12px;
		justify-content: center;
		margin-right: 10px;
		min-width: 25px;
	}
	.message-content {
		box-shadow: 0 5px 10px 0 rgba(0,0,0,0.1);
		font-size: 14px;
		max-width: 200px;
		outline: none;
		padding: 10px;
		position: relative;
		word-break: break-all;
		word-wrap: break-word;
		span {
			margin: 0;
			text-shadow: #eee 0 0 0.05em;
			white-space: pre-wrap;
		}
		img {
			vertical-align: bottom;
		}
		&:before {
				content: "\e900";
				font-family: 'tim' !important;
				font-size: 24px;
				height: 40px;
				position: absolute;
				top: 0;
				width: 12px;
			}
	}
	.message-received {
		background-color: @color0;
		border-radius: 0 4px 4px 4px;
		margin-left: 15px;
		&:before {
				color: @color0;
				left: -10px;
				transform: scaleX(-1);
			}
	}
	.message-received.new {
		animation: bounce 500ms linear both;
		transform-origin: top left;
		transform: scale(0);
	}
	.message-send {
		background-color: #eee;
		border-radius: 4px 0 4px 4px;
		color: #333;
		margin-right: 15px;
		&:before {
				color: #eee;
				right: -10px;
			}
	}
	.message-send.new {
		animation: bounce 500ms linear both;
		transform-origin: top right;
		transform: scale(0);
	}
	.el-dropdown {
		border: none;
		display: flex;
		outline: none;
		vertical-align: top;
		.el-dropdown {
			margin-left: 15px;
		}
	}
	.el-icon-arrow-down {
		font-size: 12px;
	}
}
.group-tip-element-wrapper {
	background: @color0;
	border-radius: 3px;
	color: #eee;
	font-size: 12px;
	padding: 4px 15px;
}
.edit-button {
	font-size: 10px;
	height: 20px;
	padding-top: 4px;
}
@keyframes bounce {
  0% { transform: matrix3d(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  4.7% { transform: matrix3d(0.45, 0, 0, 0, 0, 0.45, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  9.41% { transform: matrix3d(0.883, 0, 0, 0, 0, 0.883, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  14.11% { transform: matrix3d(1.141, 0, 0, 0, 0, 1.141, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  18.72% { transform: matrix3d(1.212, 0, 0, 0, 0, 1.212, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  24.32% { transform: matrix3d(1.151, 0, 0, 0, 0, 1.151, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  29.93% { transform: matrix3d(1.048, 0, 0, 0, 0, 1.048, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  35.54% { transform: matrix3d(0.979, 0, 0, 0, 0, 0.979, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  41.04% { transform: matrix3d(0.961, 0, 0, 0, 0, 0.961, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  52.15% { transform: matrix3d(0.991, 0, 0, 0, 0, 0.991, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  63.26% { transform: matrix3d(1.007, 0, 0, 0, 0, 1.007, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  85.49% { transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  100% { transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
}
</style>
