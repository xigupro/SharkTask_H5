<template>
  <div @click="handleGroupClick" class="scroll-container">
    <div class="group-item">
      <van-image round width="50" height="50" :src="group.avatar || require('../../../assets/images/group.svg')" />
      <div class="group-name text-ellipsis">{{ group.name }}</div>
    </div>
  </div>
</template>

<script>
import { Image } from 'vant';
export default {
  props: ['group'],
  data() {
    return {
      visible: false,
      options: [
        {
          text: '退出群组',
          handler: this.quitGroup
        }
      ]
    }
  },
  components: {
    [Image.name]: Image,
  },
  methods: {
    handleGroupClick() {
      this.$router.push({ name: 'im.chat' })
      const conversationID = `GROUP${this.group.groupID}`
      this.$store.dispatch('checkoutConversation', conversationID)
    },
    quitGroup() {
      this.tim.quitGroup(this.group.groupID)
      .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
.scroll-container {
	flex: 1;
	overflow-y: scroll;
	.group-item {
		cursor: pointer;
		display: flex;
		overflow: hidden;
		padding: 10px 20px;
		position: relative;
		transition: 0.2s;
		&:hover {
			background-color: #eee;
		}
		.avatar {
			border-radius: 50%;
			flex-shrink: 0;
			height: 30px;
			margin-right: 10px;
			width: 30px;
		}
		.group-name {
			color: #111;
			flex: 1;
      margin-left: 10px;
			line-height: 30px;
		}
	}
}
</style>
