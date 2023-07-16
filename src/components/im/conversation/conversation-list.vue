<template>
  <div class="list-container">
    <div class="header-bar">
      <van-button size="mini" @click="handleRefresh">
        刷新
      </van-button>
      <van-button size="mini" @click="handleAddButtonClick">
        创建会话
      </van-button>
    </div>
    <div class="scroll-container">
      <conversation-item
        :conversation="item"
        v-for="item in conversationList"
        :key="item.conversationID"
      />
    </div>
    <van-dialog
      :showCancelButton="true"
      v-model="showDialog"
      title="快速发起会话"
      @confirm="handleConfirm">
      <van-field placeholder="请输入用户ID" v-model="userID"/>
    </van-dialog>
  </div>
</template>

<script>
import ConversationItem from './conversation-item';
import { mapState } from 'vuex';
import { Field, Dialog, Button } from 'vant';

export default {
  name: 'ConversationList',
  components: {
    ConversationItem,
    [Field.name]: Field,
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
  },
  data() {
    return {
      showDialog: false,
      userID: '',
      isCheckouting: false, // 是否正在切换会话
      timeout: null
    }
  },
  computed: {
    ...mapState({
      conversationList: state => state.conversation.conversationList,
      currentConversation: state => state.conversation.currentConversation
    })
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
  },
  destroyed() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    handleRefresh() {
      this.refreshConversation()()
    },
    refreshConversation() {
      let that = this
      return function () {
        if (!that.timeout) {
          that.timeout = setTimeout(() => {
            that.timeout = null
            that.tim.getConversationList().then(({ data }) => {
              that.$store.commit('updateConversationList', data.conversationList)
              that.$toast({
                message: '刷新成功',
                type: 'success',
              })
            })
          }, 1000)
        }
      }
    },
    handleAddButtonClick() {
      this.showDialog = true
    },
    handleConfirm() {
      if (this.userID !== '@TIM#SYSTEM') {
        this.$store
          .dispatch('checkoutConversation', `C2C${this.userID}`)
          .then(() => {
            this.showDialog = false
          }).catch(() => {
            this.$toast({
              message: '没有找到该用户',
              type: 'warning',
            })
          })
      } else {
        this.$toast({
          message: '没有找到该用户',
          type: 'warning',
        })
      }
      this.userID = ''
    },
    handleKeydown(event) {
      if ((event.keyCode !== 38 && event.keyCode !== 40) || this.isCheckouting) {
        return
      }
      const currentIndex = this.conversationList.findIndex(
        item => item.conversationID === this.currentConversation.conversationID,
      )
      if (event.keyCode === 38 && currentIndex - 1 >= 0) {
        this.checkoutPrev(currentIndex)
      }
      if (
        event.keyCode === 40
        && currentIndex + 1 < this.conversationList.length
      ) {
        this.checkoutNext(currentIndex)
      }
    },
    checkoutPrev(currentIndex) {
      this.isCheckouting = true
      this.$store
        .dispatch(
          'checkoutConversation',
          this.conversationList[currentIndex - 1].conversationID,
        )
        .then(() => {
          this.isCheckouting = false
        })
        .catch(() => {
          this.isCheckouting = false
        })
    },
    checkoutNext(currentIndex) {
      this.isCheckouting = true
      this.$store
        .dispatch(
          'checkoutConversation',
          this.conversationList[currentIndex + 1].conversationID,
        )
        .then(() => {
          this.isCheckouting = false
        })
        .catch(() => {
          this.isCheckouting = false
        })
    },
  },
}
</script>

<style lang="less" scoped>
.list-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	.header-bar {
		flex-shrink: 0;
    text-align: right;
		padding: 10px 10px 10px 20px;
	}
	.scroll-container {
		flex: 1;
		overflow-y: scroll;
	}
}
.bottom-circle-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.refresh {
  bottom: 70px;
}
</style>
