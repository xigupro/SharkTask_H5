<template>
  <div class="refresh-page">
    <div class="title">
      <span>剩余 {{userInfo.refresh_count}} 次刷新，请选择以下套餐购买次数</span>
      <van-icon @click="showTips" name="question-o" />
    </div>
    <van-list
      v-model="loading"
      class="list"
      :finished="finished"
      :finished-text="$t('noMore')"
      @load="onLoad">
      <van-cell v-for="(item, index) in priceList" :key="index">
        <div class="item" @click="handleSelected(item)">
          <div><span class="round"></span>{{item.count}}次</div>
          <div class="single">{{ item.price / item.count | mathFixed(2)}}/次</div>
          <div>
            <span class="original">原价￥{{item.original_price}}</span>
            <span class="price">￥{{item.price}}</span>
          </div>
        </div>
      </van-cell>
    </van-list>
  </div>
</template>
<script>
import {
  List,
  Cell,
  Icon,
  Dialog,
  Notify,
} from 'vant';
import RefreshProxy from '@/proxies/refresh';

export default {
  data() {
    return {
      priceList: [],
      selected: {},
      finished: false,
      loading: false,
      pageIndex: 1,
      totalRecordCount: 0,
      autoLoad: false,
    };
  },
  components: {
    [List.name]: List,
    [Cell.name]: Cell,
    [Icon.name]: Icon,
    [Dialog.Component.name]: Dialog.Component,
    [Notify.name]: Notify,
  },
  computed: {
    systemInfo() {
      return this.$store.state.system.info;
    },
    userInfo() {
      return this.$store.state.account.info;
    },
  },
  methods: {
    onLoad() {
      this.loading = true;
      setTimeout(() => {
        this.refreshList();
      }, 500);
    },
    handleSelected(item) {
      this.selected = item;
      if (this.userInfo.account_amount < item.price) {
        Notify({ type: 'danger', message: '余额不足，请充值' });
        return;
      }
      Dialog.confirm({
        title: '购买确认',
        message: `需支付${item.price}，是否确认使用平台余额购买?`,
        beforeClose: async (action, done) => {
          if (action === 'confirm') {
            const params = {
              user_id: this.userInfo.id,
              id: this.selected.id,
            };
            const res = await RefreshProxy.buyRefreshCount(params);
            done();
            if (res.success) {
              this.$toast(res.message);
              // 更新用户信息
              this.$store.dispatch('account/find', {
                userId: this.userInfo.id,
              });
            }
          } else {
            done();
          }
        },
      });
    },
    showTips() {
      Dialog.alert({
        message: '刷新任务后可在一段时间内保持排名靠前',
      });
    },
    async refreshList() {
      const params = {
        page: this.pageIndex,
      };
      const res = await RefreshProxy.refreshList(params);
      this.loading = false;
      if (!res.fail) {
        // 如果是获取第一页就清空整个列表TODO
        if (this.pageIndex === 1) {
          this.priceList = [];
        }
        this.pageIndex += 1;
        this.priceList = this.priceList.concat(res.data.list);
        this.totalRecordCount = res.data.totalCount;
        // 无数据
        if (this.priceList.length === this.totalRecordCount || !res.data.list.length) {
          this.finished = true;
        } else if (this.priceList.length < this.totalRecordCount) {
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
  .refresh-page {
    .title {
      margin: 10px;
      color: #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .van-cell {
      padding: 0;
    }
    .list {
      margin-bottom: 0;
    }
    .item {
      padding: 20px;
      border-radius: 5px;
      -webkit-border-radius: 5px;
      -moz-border-radius: 5px;
      -ms-border-radius: 5px;
      -o-border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #fff;
      color: #333;
    }
    .round {
      width: 20px;
      height: 20px;
      float: left;
      margin-right: 10px;
      border: 1px solid #ddd;
      border-radius: 50%;
      -webkit-border-radius: 50%;
      -moz-border-radius: 50%;
      -ms-border-radius: 50%;
      -o-border-radius: 50%;
    }
    .original {
      text-decoration: line-through;
      font-size: 12px;
      color: #999;
      margin-right: 10px;
    }
    .single {
      font-size: 12px;
      color: #999;
    }
    .price {
      color: #F56C6C;
    }
  }
</style>
