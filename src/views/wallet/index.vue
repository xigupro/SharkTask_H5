<template>
  <div class="wallet-page">
    <div class="money">
      <div class="money-item">
        <div>余额</div>
        <div style="color: #666;font-size:12px;">
          {{userTotalMoney || 0}}元
        </div>
      </div>
      <div class="money-item">
        <div>总充值</div>
        <div style="color: #666;font-size:12px;">
          {{taskTotalRechargeSum || 0}}元
        </div>
      </div>
      <div class="money-item">
        <div>总提现</div>
        <div style="color: #666;font-size:12px;">
          {{withdrawTotalMoney || 0}}元
        </div>
      </div>
      <div class="money-item">
        <div>总发放</div>
        <div style="color: #F56C6C;font-size:12px;">
          {{taskTotalPaySum || 0}}元
        </div>
      </div>
    </div>
    <div class="money">
      <div class="money-item">
        <div>今日收益</div>
        <div style="color: #999;font-size:12px;">
          {{todayIncomeSum || 0}}元
        </div>
      </div>
      <div class="money-item">
        <div>昨日收益</div>
        <div style="color: #999;font-size:12px;">
          {{yesterdayIncomeSum || 0}}元
        </div>
      </div>
      <div class="money-item">
        <div>总收入</div>
        <div style="color: #999;font-size:12px;">
          {{totalIncomeSum || 0}}元
        </div>
      </div>
    </div>
    <div class="action-panel">
      <van-button
        v-if="systemInfo.show_wallet_recharge"
        @click="gotoPage('recharge.index')"
        size="small"
        type="primary">立即充值</van-button>
      <van-button @click="gotoPage('withdraw.submit')" size="small">立即提现</van-button>
      <van-button @click="gotoPage('withdraw.list')" size="small">提现记录</van-button>
    </div>
    <van-tabs v-model="currentStreamTypeIndex" :swipe-threshold="5">
      <van-tab
        :sticky="true"
        :title="item.value"
        v-for="(item, index) in streamTypeList"
        :key="index">
      </van-tab>
    </van-tabs>
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="$t('noMore')"
      @load="onLoad">
      <van-cell v-for="(item, index) in streamList" :key="index">
        <div class="stream-item">
          <div class="stream-text">
            <div>{{item.remark || currentStreamTypeValue}}</div>
            <div class="stream-time">{{item.created_at | transLocalTime}}</div>
          </div>
          <div class="stream-money">{{item.is_income ? "+" : "-"}}{{item.money}}元</div>
        </div>
      </van-cell>
    </van-list>
  </div>
</template>

<script>
import {
  Tab,
  Tabs,
  List,
  Cell,
  Button,
} from 'vant';
import MoneyProxy from '@/proxies/money';
import StatisticsProxy from '@/proxies/statistics';

export default {
  data() {
    return {
      streamList: [],
      page: 1,
      size: 10,
      loading: false,
      finished: false,
      streamTypeList: [
        { id: 1, value: '充值' },
        { id: 2, value: '提现' },
        { id: 3, value: '收入' },
        { id: 4, value: '支出' },
      ],
      currentStreamTypeIndex: 0,
      currentStreamTypeValue: '充值',
      noMore: false,
      // 总充值金额
      taskTotalRechargeSum: '',
      // 总发放佣金
      taskTotalPaySum: '',
      // 今天收益
      todayIncomeSum: '',
      // 昨天收益
      yesterdayIncomeSum: '',
      // 总收入佣金
      totalIncomeSum: '',
      // 总提现金额
      withdrawTotalMoney: '',
      // 未提现总金额
      userTotalMoney: '',
    };
  },
  watch: {
    currentStreamTypeIndex(val) {
      this.page = 1;
      this.currentStreamTypeValue = this.streamTypeList[val].value;
      this.getUserStreamList();
    },
    userId() {
      this.page = 1;
      this.getUserMoneyStatistics();
    },
  },
  components: {
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [List.name]: List,
    [Cell.name]: Cell,
    [Button.name]: Button,
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
  },
  created() {
    if (this.userId) {
      this.getUserMoneyStatistics();
      this.getUserStreamList();
    }
  },
  methods: {
    onLoad() {
      this.finished = true;
      this.loading = true;
      setTimeout(() => {
        this.getUserStreamList();
      }, 500);
    },
    gotoPage(page) {
      this.$router.push({
        name: page,
      });
    },
    async getUserStreamList() {
      const params = {
        userId: this.userId,
        type: this.streamTypeList[this.currentStreamTypeIndex].id,
        page: this.page,
        size: this.size,
      };
      const res = await MoneyProxy.getUserStreamList(params);
      this.loading = false;
      if (res.success) {
        // 如果是获取第一页就清空整个列表TODO
        if (this.page === 1) {
          this.streamList = [];
        }
        this.page += 1;
        this.streamList = this.streamList.concat(res.data.list);
        this.totalRecordCount = res.data.totalCount;
        // 无数据
        if (this.streamList.length === this.totalRecordCount || !res.data.list.length) {
          this.finished = true;
        } else if (this.streamList.length < this.totalRecordCount) {
        // 还有数据
          this.finished = false;
        }
      }
    },
    async getUserMoneyStatistics() {
      const params = {
        userId: this.userId,
      };
      const res = await StatisticsProxy.getUserMoneyStatistics(params);
      if (res.success) {
        this.taskTotalRechargeSum = res.data.taskTotalRechargeSum;
        this.taskTotalPaySum = res.data.taskTotalPaySum;
        this.totalIncomeSum = res.data.totalIncomeSum;
        this.withdrawTotalMoney = res.data.withdrawTotalMoney;
        this.userTotalMoney = res.data.userTotalMoney;
        this.todayIncomeSum = res.data.todayIncomeSum;
        this.yesterdayIncomeSum = res.data.yesterdayIncomeSum;
      }
    },
  },
};
</script>

<style lang="less">
  .wallet-page {
    .stream-list {
      margin: 0;
      padding: 0 10px;
    }
    .stream-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #fff;
      overflow: hidden;
      position: relative;
    }
    .stream-text {
      flex-grow: 1;
      margin-left: 20rpx;
    }
    .stream-time {
      font-size: 26rpx;
      color: #bbb;
    }
    .stream-money {
      color: #F56C6C;
    }
    .action-panel {
      background-color: #fff;
      margin-bottom: 10px;
      padding: 10px 0;
      display: flex;
      justify-content: space-around;
    }
    .money {
      display: flex;
      padding: 10px;
      text-align: center;
      font-size: 14px;
      color: #333;
      background: #fff;
    }
    .money-item {
      border-right: 1px solid #eee;
      width: 25%;
      box-sizing: border-box;
    }
    .money-item:last-child {
      border-right: 0;
    }
  }
</style>
