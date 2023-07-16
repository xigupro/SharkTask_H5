<template>
  <div class="withdraw-list-page">
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="$t('noMore')"
      @load="onLoad">
      <van-cell class="item" v-for="(item, index) in withdrawList" :key="index">
        <router-link :to="{name: 'withdraw.detail', query: {id: item.id}}">
          <div class="text">
            <div>
              提现至{{item.withdraw_type}}
            </div>
            <div class="money">{{item.money}}元</div>
          </div>
          <div class="todo">
            <div class="time">
              {{item.created_at | transLocalTime}}
            </div>
            <div>
              <van-tag v-if="item.status == 3" type="warning">已驳回</van-tag>
              <van-tag v-else-if="item.status == 2" type="success">已成功</van-tag>
              <van-tag v-else-if="item.status == 1" type="primary">提现中</van-tag>
            </div>
          </div>
        </router-link>
      </van-cell>
    </van-list>
  </div>
</template>

<script>
import {
  List,
  Cell,
  Button,
  Tag,
} from 'vant';
import WithdrawProxy from '@/proxies/withdraw';

export default {
  data() {
    return {
      withdrawList: [],
      page: 1,
      size: 10,
      loading: false,
      finished: false,
      noMore: false,
    };
  },
  watch: {
    userId() {
      this.page = 1;
      this.getWithdrawList();
    },
  },
  components: {
    [List.name]: List,
    [Cell.name]: Cell,
    [Button.name]: Button,
    [Tag.name]: Tag,
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
  },
  created() {
    if (this.userId) {
      this.getWithdrawList();
    }
  },
  methods: {
    onLoad() {
      this.finished = true;
      this.loading = true;
      setTimeout(() => {
        this.getWithdrawList();
      }, 500);
    },
    gotoPage(page) {
      this.$router.push({
        name: page,
      });
    },
    async getWithdrawList() {
      const params = {
        user_id: this.userId,
        page: this.page,
        size: this.size,
      };
      const res = await WithdrawProxy.withdrawList(params);
      this.loading = false;
      if (res.success) {
        // 如果是获取第一页就清空整个列表TODO
        if (this.page === 1) {
          this.withdrawList = [];
        }
        this.page += 1;
        this.withdrawList = this.withdrawList.concat(res.data.list);
        this.totalRecordCount = res.data.totalCount;
        // 无数据
        if (this.withdrawList.length === this.totalRecordCount || !res.data.list.length) {
          this.finished = true;
        } else if (this.withdrawList.length < this.totalRecordCount) {
        // 还有数据
          this.finished = false;
        }
      }
    },
  },
};
</script>

<style lang="less">
  .withdraw-list-page {
    .van-tag--warning {
      background-color: #ff976a;
    }
    .list {
      margin: 0;
      padding: 0 10px;
    }
    .item {}
    .text {
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .money {
      color: #F56C6C;
    }
    .time {
      font-size: 12px;
      color: #bbb;
    }
    .todo {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
</style>
