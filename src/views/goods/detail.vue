<template>
  <div class="goods-detail-page">
    <div class="thumbnail">
      <van-image width="100%" :src="detail.thumbnail | getQiniuFullUrl" />
    </div>
    <div class="info">
      <div class="title">{{detail.title}}</div>
      <div class="sub-info">
        <div class="price"><small>￥</small>{{detail.price}}</div>
        <div class="quantity">剩余 {{detail.quantity}}</div>
      </div>
    </div>
    <div class="content">
      <div class="title">详情</div>
      <van-image
        v-for="(item, index) in detail.content"
        :key="index"
        width="100%"
        :src="item | getQiniuFullUrl" />
    </div>
    <van-goods-action>
      <van-goods-action-button
        type="primary"
        :disabled="isBlock || loading"
        @click="exchange"
        :text="grabButtonText"
      />
    </van-goods-action>
    <van-action-sheet v-model="exchangeVisible" title="兑换确认">
      <div class="exchange-content">
        <van-card
          :num="1"
          :price="detail.price"
          :desc="detail.sub_title"
          :title="detail.title"
          :thumb="detail.thumbnail | getQiniuFullUrl"
        />
        <van-cell-group title="收货地址" :border="false">
          <van-cell
            :to="{name: 'address.list', query: { type: 1 }}"
            :value="!defaultAddress.name ? '添加收货地址' : ''"
            center
            :title="defaultAddress.name ? addressTitle : ''"
            :label="defaultAddress.address ? defaultAddress.address : ''"
            is-link />
          </van-cell-group>
        <van-button type="primary" round block @click="goodsExchange">确认兑换</van-button>
      </div>
    </van-action-sheet>
  </div>
</template>
<script>
import {
  Dialog,
  Button,
  Image,
  Field,
  Icon,
  GoodsAction,
  GoodsActionButton,
  ActionSheet,
  Card,
  Cell,
  CellGroup,
} from 'vant';
import GoodsProxy from '@/proxies/goods';
import AddressProxy from '@/proxies/address';
import PreviewImage from '@/mixins/image-preview';

export default {
  name: 'goods-detail',
  data() {
    return {
      detail: {},
      loading: false,
      defaultAddress: {},
      exchangeVisible: false,
    };
  },
  mixins: [PreviewImage],
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Image.name]: Image,
    [Field.name]: Field,
    [Icon.name]: Icon,
    [GoodsAction.name]: GoodsAction,
    [GoodsActionButton.name]: GoodsActionButton,
    [ActionSheet.name]: ActionSheet,
    [Card.name]: Card,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
  },
  computed: {
    addressTitle() {
      return `${this.defaultAddress.name} ${this.defaultAddress.tel}`;
    },
    grabButtonText() {
      let text = '立即兑换';
      if (this.isBlock) {
        text = '你已被冻结';
      }
      return text;
    },
    userInfo() {
      return this.$store.state.account.info;
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
    userId() {
      return this.$store.state.account.info.id;
    },
    // 用户被禁用则不可兑换
    isBlock() {
      return this.$store.state.account.info.status === 2;
    },
    goodsId() {
      return this.$route.params.id;
    },
  },
  watch: {
    '$store.state.account.info.id'() {
      this.getGoodsDetail();
    },
  },
  destroyed() {
    this.$toast.clear();
  },
  methods: {
    async exchange() {
      this.exchangeVisible = !this.exchangeVisible;
      if (this.exchangeVisible) {
        let selectedAddress = localStorage.getItem('selectedAddress');
        selectedAddress = selectedAddress && selectedAddress !== 'undefined' && selectedAddress !== 'null'
          ? JSON.parse(selectedAddress) : false;
        if (selectedAddress) {
          this.defaultAddress = selectedAddress;
        } else {
          // 如果没选中的地址，则从接口获取
          // {"id":10,"name":"唐文雍","tel":"15918575650","address":"天津市天津市万科云","is_default":0}
          this.getAddressList();
        }
      }
    },
    async getAddressList() {
      const params = {
        userId: this.userId,
      };
      this.loading = true;
      const res = await AddressProxy.getAddressList(params);
      this.loading = false;
      if (res.success) {
        this.defaultAddress = res.data && res.data.length ? {
          id: res.data[0].id,
          name: res.data[0].name,
          tel: res.data[0].tel,
          address: `${res.data[0].province}${res.data[0].city}${res.data[0].address}`,
          is_default: res.data[0].is_default,
        } : null;
      }
    },
    async getGoodsDetail() {
      this.loading = true;
      const params = {
        id: this.goodsId,
      };
      const res = await GoodsProxy.getGoodsDetail(params);
      this.loading = false;
      if (!res.fail) {
        this.detail = res.data;
        this.detail.content = this.detail.content ? this.detail.content.split(',') : '';
      }
    },
    async goodsExchange() {
      this.loading = true;
      const params = {
        goodsId: this.goodsId,
        userId: this.userId,
        name: this.defaultAddress.name,
        tel: this.defaultAddress.tel,
        address: this.defaultAddress.address,
      };
      const res = await GoodsProxy.goodsExchange(params);
      this.loading = false;
      if (res.success) {
        this.$toast('兑换成功');
        setTimeout(() => {
          this.$router.push({
            name: 'order.list',
          });
        }, 800);
      }
    },
  },
  mounted() {
    this.getGoodsDetail();
  },
};
</script>

<style lang="less">
  .goods-detail-page {
    padding-bottom: 60px;
    .van-image {
      display: block;
    }
    .exchange-content {
      padding: 15px;
    }
    .content {
      .title {
        font-size: 14px;
        font-weight: 600;
        background-color: #fff;
        padding: 5px 10px;
      }
    }
    .info {
      padding: 10px;
      background-color: #fff;
      border-bottom: 10px solid #f8f8f8;
      .sub-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 10px;
      }
      .title {
        font-size: 16px;
      }
      .price {
        font-size: 16px;
        color: #F56C6C;
      }
      .quantity {
        color: #666;
        font-size: 12px;
      }
    }
  }
</style>
