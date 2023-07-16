<template>
  <div class="goods-list-page">
    <div class="search">
      <van-search
        maxlength="15"
        @search="handleSearch"
        shape="round"
        placeholder="请输入关键词"
        v-model="keywords" />
    </div>
    <van-sticky>
      <van-tabs v-model="activeTypeIndex">
        <van-tab :id="0" title="全部"></van-tab>
        <van-tab
          :id="item.id"
          :title="item.name"
          v-for="(item, index) in types"
          :key="index">
        </van-tab>
      </van-tabs>
    </van-sticky>
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="$t('noMore')"
      @load="loadGoodsList">
        <van-row :gutter="5" class="goods-list">
          <van-col :span="12" v-for="(item, index) in goodsList" :key="index">
            <router-link
              :to="`/goods/detail/${item.id}`"
              class="goods-item shadow">
              <van-image width="100%" :height="128" :src="item.thumbnail | getQiniuFullUrl" />
              <div class="goods-title">{{item.title}}</div>
              <div class="goods-sub">
                <div class="goods-price"><small>￥</small>{{item.price}}</div>
                <div class="goods-quantity">剩余{{item.quantity}}</div>
              </div>
            </router-link>
          </van-col>
        </van-row>
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
} from 'vant';
import GoodsProxy from '@/proxies/goods';

export default {
  name: 'goods-list',
  data() {
    return {
      keywords: '',
      banners: [],
      types: [],
      activeTypeIndex: 0,
      goodsList: [],
      finished: false,
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      totalRecordCount: 0,
      autoLoad: false,
      now: new Date().getTime(),
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
  },
  watch: {
    activeTypeIndex(val) {
      if (val >= 0) {
        this.pageIndex = 1;
        this.loadGoodsList();
      }
    },
  },
  computed: {
    systemInfo() {
      return this.$store.state.system.info;
    },
    isAPP() {
      return navigator.userAgent.indexOf('Html5Plus') > -1;
    },
  },
  methods: {
    handleSearch() {
      this.goods = [];
      this.finished = false;
      this.loading = true;
      this.pageIndex = 1;
      this.pageSize = 10;
      this.loadGoodsList();
    },
    async getGoodsTypeList() {
      const res = await GoodsProxy.getGoodsTypeList();
      if (!res.fail) {
        const type = this.$route.query.id;
        res.data.forEach((item, index) => {
          if (Number(item.id) === Number(type)) {
            this.activeTypeIndex = index + 1;
          }
        });
        this.types = res.data;
      }
    },
    async loadGoodsList() {
      const params = {
        page: this.pageIndex,
        title: this.keywords,
        status: 1,
      };
      if (this.activeTypeIndex !== 0) {
        params.type = this.types[this.activeTypeIndex - 1].id;
      }
      this.loading = true;
      const res = await GoodsProxy.getGoodsList(params);
      this.loading = false;
      if (!res.fail) {
        // 如果是获取第一页就清空整个列表TODO
        if (this.pageIndex === 1) {
          this.goodsList = [];
        }
        this.pageIndex += 1;
        this.goodsList = this.goodsList.concat(res.data.list);
        this.totalRecordCount = res.data.totalCount;
        // 无数据
        if (this.goodsList.length === this.totalRecordCount || !res.data.list.length) {
          this.finished = true;
        } else if (this.goodsList.length < this.totalRecordCount) {
        // 还有数据
          this.finished = false;
        }
      }
    },
    async init() {
      await this.getGoodsTypeList();
    },
  },
  created() {
    this.init();
  },
  mounted() {
    this.autoLoad = true;
  },
};
</script>

<style lang="less">
  .goods-list-page {
    padding-bottom: 60px;
    .all-type {
      width: 100vw;
      overflow-y: scroll;
      padding: 10px 0;
      li {
        width: 20%;
        text-align: center;
        padding: 10px 0;
        display: inline-block;
      }
    }
    .mint-tab-item-label {
      font-size: 16px;
    }
    .goods-header {
      margin: 20px 5px 10px 5px;
      border-left: 4px solid #F56C6C;
      padding-left: 5px;
      font-size: 15px;
      line-height: 13px;
      font-weight: bold;
      font-family: auto;
      color: #333;
      small {
        color: #666;
        font-weight: 400;
        font-size: 12px;
      }
    }
    .goods-list {
      margin: 5px;
      .van-col {
        padding-bottom: 5px;
      }
    }
    .goods-item {
      background-color: #fff;
      border-radius: 5px;
      padding: 10px;
      display: block;
      .goods-title {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        word-break: break-all;
      }
      .goods-sub {
        display: flex;
        align-items: center;
        margin-top: 6px;
        justify-content: space-between;
      }
      .van-image, .task-money {
        flex-shrink: 0;
      }
      img {
        border-radius: 5px;
      }
    }

    .goods-list {
      margin: 0;
      padding: 0 10px;
    }
    .goods-price {
      font-size: 16px;
      color: #F56C6C;
    }
    .goods-quantity {
      color: #666;
      font-size: 12px;
    }
  }
</style>
