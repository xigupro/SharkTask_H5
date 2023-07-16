<template>
  <div class="order-list-page">
    <div class="search">
      <van-search
        maxlength="15"
        @search="handleSearch"
        shape="round"
        placeholder="请输入关键词"
        v-model="keywords" />
    </div>
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="$t('noMore')"
      @load="loadGoodsList">
      <router-link
        :to="`/order/detail/${item.id}`"
        v-for="(item, index) in orderList"
        :key="index">
        <van-card
          :num="item.order_quantity"
          :price="item.price"
          :desc="item.sub_title"
          :title="item.title"
          :thumb="item.thumbnail | getQiniuFullUrl">
          <template #tag>
            <van-tag mark :type="orderStatusTag[item.status]">
              {{orderStatusMap[item.status]}}
            </van-tag>
          </template>
        </van-card>
      </router-link>
    </van-list>
  </div>
</template>
<script>
import {
  Tab,
  Tabs,
  List,
  Cell,
  Image,
  Search,
  Sticky,
  Row,
  Col,
  Button,
  Card,
  Tag,
} from 'vant';
import GoodsProxy from '@/proxies/goods';
import { OrderStatusMap } from '@/constant';

export default {
  name: 'order-list',
  data() {
    return {
      keywords: '',
      types: [],
      orderList: [],
      orderStatusMap: OrderStatusMap,
      orderStatusTag: {
        1: 'primary',
        2: 'success',
        3: 'danger',
      },
      finished: false,
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      totalRecordCount: 0,
      autoLoad: false,
    };
  },
  components: {
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [List.name]: List,
    [Cell.name]: Cell,
    [Image.name]: Image,
    [Search.name]: Search,
    [Sticky.name]: Sticky,
    [Row.name]: Row,
    [Col.name]: Col,
    [Button.name]: Button,
    [Card.name]: Card,
    [Tag.name]: Tag,
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
  },
  methods: {
    handleSearch() {
      this.order = [];
      this.finished = false;
      this.loading = true;
      this.pageIndex = 1;
      this.pageSize = 10;
      this.loadGoodsList();
    },
    async loadGoodsList() {
      const params = {
        page: this.pageIndex,
        title: this.keywords,
        userId: this.userId,
      };
      this.loading = true;
      const res = await GoodsProxy.getOrderList(params);
      this.loading = false;
      if (!res.fail) {
        // 如果是获取第一页就清空整个列表TODO
        if (this.pageIndex === 1) {
          this.orderList = [];
        }
        this.pageIndex += 1;
        this.orderList = this.orderList.concat(res.data.list);
        this.totalRecordCount = res.data.totalCount;
        // 无数据
        if (this.orderList.length === this.totalRecordCount || !res.data.list.length) {
          this.finished = true;
        } else if (this.orderList.length < this.totalRecordCount) {
        // 还有数据
          this.finished = false;
        }
      }
    },
  },
  mounted() {
    this.autoLoad = true;
  },
};
</script>

<style lang="less">
  .order-list-page {
    padding-bottom: 60px;
    .van-card {
      background-color: #fff;
    }
  }
</style>
