<template>
    <div class="merger-conversation-wrapper">
        <div class="current-conversation" @scroll="onScroll">
            <div class="content">
                <div class="message-list" ref="message-list" @scroll="this.onScroll">
                    <div   v-for="(messageItem, index) in mergerList(mergerMessage)" :key="index">
                        <div class="message-item">
                            <div class="avatar-box">
                                <van-image class="group-member-avatar" :src="messageItem.avatar"/>
                            </div>
                            <div class="container-box">
                                <div class="nick-date">
                                    <div class="name text-ellipsis">{{messageItem.nick || messageItem.from || '小晨曦'}}</div>
                                    <div class="date">{{ getDate(messageItem.time) }}</div>
                                </div>
                                <merger-message-item v-for="(item,index) in messageItem.messageBody" :key="index" :message="item" :payload="item.payload"/>
                            </div>
                        </div>
                        <el-divider></el-divider>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import {  mapState } from 'vuex'
import { Image } from 'vant';
  import MergerMessageItem from './mergerMessage-item'
  import { getFullDate } from '@/utils/date'
  export default {
    name: 'CurrentConversation',
    components: {
      MergerMessageItem,
      [Image.name]: Image
    },
    data() {
      return {
        preScrollHeight: 0,
        mergerMessageList: [],
        showMessage: null,

      }
    },
    computed: {
      ...mapState({
        currentConversation: state => state.conversation.currentConversation,
        mergerMessage: state => state.conversation.mergerMessage
      }),
      mergerList() {
        return function(message) {
          return message.payload.messageList
        }
      }
    },
    created () {
    },
    mounted() {

    },
    updated() {

    },
    watch: {

    },
    methods: {
      getDate(time) {
        return getFullDate(new Date(time * 1000))
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
      onImageLoaded() {
        this.keepMessageListOnButtom()
      }
    }
  }
</script>

<style lang="less" scoped>
    /* 当前会话的骨架屏 */
    // Width variables (appears count calculates by raw css)
@width0: 100%; // Appears 4 times

// Height variables (appears count calculates by raw css)
@height1: 100%; // Appears 2 times

.merger-conversation-wrapper {
	color: #fff;
	display: flex;
	height: 54vh;
	.current-conversation {
		display: flex;
		flex-direction: column;
		height: @height1;
		width: @width0;
	}
}
.content {
	display: flex;
	flex-direction: column;
	flex: 1;
	height: @height1;
	overflow: hidden;
	position: relative;
	.message-list {
		box-sizing: border-box;
		overflow-y: scroll;
		padding: 0 10px;
		width: @width0;
	}
}
.footer {
	border-top: 1px solid #eee;
}
.show-more {
	padding: 10px 20px 0 0;
	text-align: right;
}
el-checkbox {
	width: @width0;
}
el-checkbox__label {
	box-sizing: border-box;
	padding-right: 20px;
	width: @width0;
}
el-divider--horizontal {
	display: block;
	height: 1px;
	margin: 0 auto 8px;
	width: 90%;
}
.message-item {
	display: flex;
}
.avatar-box {
	.avatar {
		border-radius: 50%;
		box-shadow: 0 5px 10px 0 rgba(0,0,0,0.1);
		height: 36px;
		width: 36px;
	}
}
.container-box {
	display: flex;
	flex-direction: column;
	.nick-date {
		color: #b3b3b3;
		display: flex;
		flex-direction: row;
		font-size: 12px;
		.name {
			margin: 0 5px;
		}
	}
}
</style>
