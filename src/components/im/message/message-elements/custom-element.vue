<template>
<div class="custom-element-wrapper">
  <div class="survey"  v-if="payload.data === 'survey'">
    <div class="title">评分和建议</div>
    <van-rate v-model="rate" disabled />
    <div class="suggestion">{{payload.extension}}</div>
  </div>
  <div class="money" v-else-if="payload.data === 'money'" @click="showRedDialog = true">
    <!-- <div class="title">红包</div>
    <div class="suggestion">金额：{{payload.extension}}元</div> -->
  </div>
  <span class="text" title="您可以自行解析自定义消息" v-else>
    <template v-if="text.isFromGroupLive && text.isFromGroupLive === 1">
      <message-group-live-status :liveInfo='text' />
    </template>
    <template v-else>{{text}}</template>
  </span>
  <van-dialog
    title="红包"
    :confirmButtonText="redDetail.status === 1 ? '领取' : ''"
    show-cancel-button
    cancel-button-text="关闭"
    :showConfirmButton="redDetail.from_user != userID && redDetail.status === 1"
    @confirm="onReceive"
    v-model="showRedDialog">
    <div class="red-dialog">
      <div>状态：
        <van-tag v-if="redDetail.status === 1" type="primary">未领取</van-tag>
        <van-tag v-else-if="redDetail.status === 2" type="success">已领取</van-tag>
        <van-tag v-else-if="redDetail.status === 3" type="danger">已退回</van-tag>
      </div>
      <div>金额：<strong style="color: red">￥{{payload.extension}}</strong></div>
      <div>备注：{{description}}</div>
    </div>
  </van-dialog>
</div>
</template>

<script>
import { mapState } from 'vuex'
import MessageBubble from '../message-bubble'
import { Rate, Dialog, Tag } from 'vant'
import MoneyProxy from '@/proxies/money'
import MessageGroupLiveStatus from '../message-group-live-status'

export default {
  name: 'CustomElement',
  props: {
    payload: {
      type: Object,
      required: true
    },
    message: {
      type: Object,
      required: true
    },
    isMine: {
      type: Boolean
    }
  },
  components: {
    MessageBubble,
    [Rate.name]: Rate,
    [Tag.name]: Tag,
    [Dialog.Component.name]: Dialog.Component,
    MessageGroupLiveStatus
  },
  data() {
    return {
      showRedDialog: false,
      redDetail: {}
    }
  },
  computed: {
    ...mapState({
      currentUserProfile: state => state.user.currentUserProfile,
      userID: state => state.user.userID,
    }),
    text() {
      return this.translateCustomMessage(this.payload)
    },
    description() {
      const { description } = this.payload
      const descriptionArray = description.split('@@@ID:')
      return descriptionArray[0]
    },
    // 红包ID
    redId() {
      const { description } = this.payload
      const descriptionArray = description.split('@@@ID:')
      return descriptionArray.length === 2 ? descriptionArray[1] : null
    },
    rate() {
      return parseInt(this.payload.description)
    }
  },
  watch: {
    showRedDialog(val) {
      val && this.getRedDetail(this.redId)
    }
  },
  methods: {
    // 领取红包
    async onReceive() {
      const { success } = await MoneyProxy.redReceive(this.redDetail)
      if (success) {
        this.$toast('领取成功');
        this.showRedDialog = false
      }
    },
    // 红包订单详情
    async getRedDetail(id) {
      if (!id) {
        this.$toast('红包异常')
        return
      }
      const { success, data } = await MoneyProxy.getRedDetail({ id })
      if (success) {
        this.redDetail = data
      }
    },
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
    }
  }
}
</script>

<style lang="less" scoped>
.custom-element-wrapper {
  margin-right: 20px;
}
.text {
	font-weight: bold;
}
.title {
	font-size: 16px;
	font-weight: 600;
	padding-bottom: 10px;
}
.survey {
	background-color: #ffffff;
	color: #000000;
	display: flex;
	flex-direction: column;
	padding: 20px;
}
.money {
  background-image: url('../../../../assets/images/red-packet.svg');
  background-size: 100%;
  width: 80px;
  height: 80px;
}
.suggestion {
	font-size: 14px;
	padding-top: 10px;
}
.red-dialog {
  padding: 15px;
  div {
    margin: 10px 5px;
  }
}
</style>
