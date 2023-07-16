<template>
  <div class="order-detail-page">
    <van-steps :active="orderDetail.status">
      <van-step>买家下单</van-step>
      <template v-if="orderDetail.status === 3">
        <van-step>已取消</van-step>
      </template>
      <template v-else>
        <van-step>商家接单</van-step>
        <van-step>商家发货</van-step>
      </template>
    </van-steps>
    <div class="orderInfo" v-if="orderDetail.status === 2">
      <div class="orderNo">
        <div>快递单号: {{orderDetail.express_no}}</div>
        <van-button
          size="mini"
          v-clipboard:copy="orderDetail.express_no"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError">复制</van-button></div>
    </div>
    <div class="receiveInfo">
      <div><strong>{{orderDetail.name}}</strong> {{orderDetail.tel}}</div>
      <div>{{orderDetail.address}}</div>
    </div>
    <van-card
      style="background: #fff"
      :num="orderDetail.order_quantity"
      :price="orderDetail.price"
      :desc="orderDetail.sub_title"
      :title="orderDetail.title"
      :thumb="orderDetail.thumbnail | getQiniuFullUrl"
    />
    <div class="orderInfo">
      <div class="orderNo">
        <div>订单编号: {{orderDetail.order_no}}</div>
        <van-button
          size="mini"
          v-clipboard:copy="orderDetail.order_no"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError">复制</van-button></div>
      <div>订单日期: {{orderDetail.created_at | transLocalTime}}</div>
    </div>
    <div class="footer" v-if="orderDetail.status === 1">
      <van-button block round @click="confirmCancelOrder">取消订单</van-button>
    </div>
  </div>
</template>
<script>
import {
  Button,
  Card,
  Step,
  Steps,
  Dialog,
} from 'vant';
import GoodsProxy from '@/proxies/goods';

export default {
  name: 'order-detail',
  data() {
    return {
      orderDetail: {},
    };
  },
  components: {
    [Button.name]: Button,
    [Card.name]: Card,
    [Step.name]: Step,
    [Steps.name]: Steps,
    [Dialog.Component.name]: Dialog.Component,
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
  },
  methods: {
    onCopy() {
      this.$toast('复制成功');
    },
    onError() {
      this.$toast('复制失败');
    },
    async getOrderDetail() {
      const params = {
        id: this.$route.params.id,
      };
      const res = await GoodsProxy.getOrderDetail(params);
      if (res.success) {
        this.orderDetail = res.data;
      }
    },
    confirmCancelOrder() {
      Dialog.confirm({
        title: '取消订单',
        message: '是否确认取消？',
      }).then(() => {
        this.cancelOrder();
      });
    },
    async cancelOrder() {
      const params = {
        id: this.$route.params.id,
        userId: this.userId,
      };
      const res = await GoodsProxy.cancelOrder(params);
      if (res.success) {
        this.$toast('取消成功');
        this.getOrderDetail();
      }
    },
  },
  created() {
    this.getOrderDetail();
  },
};
</script>

<style lang="less">
  .order-detail-page {
    padding-bottom: 60px;
    .van-address-list {
      padding: 0;
      .van-address-item {
        border-radius: 0;
      }
    }
    .van-address-item__edit {
      display: none;
    }
    .receiveInfo,
    .orderInfo {
      margin-top: 10px;
      background-color: #fff;
      padding: 12px;
      line-height: 24px;
      color: #666;
      .orderNo {
        display: flex;
        .van-button {
          margin-left: 4px;
        }
      }
    }
    .footer {
      margin: 20px;
    }
  }
</style>
