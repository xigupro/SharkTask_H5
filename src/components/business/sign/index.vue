<template>
  <div class="sign-component">
    <div class="wrapper">
      <div class="block" @click.stop>
        <div class="sign-header">
          <div class="left">
            已连续签到<strong>{{currentSignCount}}</strong>天
          </div>
          <div class="right">
            明天签到可得<strong>{{nextScore}}</strong>积分
          </div>
        </div>
        <div class="sign-list">
          <div
            class="sign-item"
            :class="{'disabled': item.disabled || isSign && step === index,
              'active': step === index}"
            v-for="(item, index) in list"
            @click="doSign(item, index)"
            :key="index">
            <div class="coin chest" v-if="index === (list.length - 1)">
              <template v-if="item.disabled || isSign && step === index">
                {{item.score}}
              </template>
            </div>
            <div class="coin" v-else>{{item.score}}</div>
            <div v-if="item.disabled || isSign && step === index">已领</div>
            <div v-else>{{step === index ? '领取' : item.name}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import { Icon } from 'vant';
import SignProxy from '@/proxies/sign';

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    [Icon.name]: Icon,
  },
  data() {
    return {
      list: [],
      nextScore: 0,
      step: 0,
      isSign: false,
      currentSignCount: 0,
    };
  },
  watch: {
    '$store.state.account.info.sign_at'() {
      this.getSignList();
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.account.info;
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    getIsSign() {
      const signAt = this.userInfo.sign_at ? new Date(+this.userInfo.sign_at) : new Date();
      const start = moment(moment(signAt, 'YYYY-MM-DD')).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      const end = moment(moment(new Date(), 'YYYY-MM-DD'));
      const days = end.diff(start, 'days');
      // 当天已签到
      this.isSign = this.userInfo.sign_at && days === 0;
      return days;
    },
    async getSignList() {
      const days = this.getIsSign();
      const res = await SignProxy.list();
      console.info(days, this.isSign);
      if (res.success) {
        const { sign_count: signCount } = this.userInfo;
        // 以签到规则列表元素长度为一个签到周期
        if (days > 1) {
          // 如果距离上次签到时间大于一天，则从零开始
          this.step = 0;
          this.currentSignCount = 0;
        } else {
          this.currentSignCount = signCount;
          if ((this.isSign ? (signCount - 1) : signCount) >= res.data.length) {
            // 如果连续签到天数大于或等于一个签到周期的天数
            this.step = signCount % res.data.length;
          } else {
            this.step = signCount;
          }
        }
        if (this.isSign) {
          // 如果今天已签到
          this.step -= 1;
        }
        // 如果当天是一个周期的最后一天，且当天未签到，则隐藏可得积分
        if (!this.isSign && this.step + 1 === res.data.length) {
          this.nextScore = '?';
        } else {
          if (this.step + 1 === res.data.length) {
            this.nextScore = res.data[0].score;
          } else {
            this.nextScore = res.data[this.step + 1].score;
          }
        }
        console.info('step', this.step);
        this.list = res.data.map((item, index) => {
          if (index < this.step || this.step < 0) {
            item.disabled = true;
          }
          return item;
        });
      }
    },
    async doSign(item, index) {
      if (item.disabled || this.step !== index) {
        return;
      }
      const params = {
        user_id: this.userInfo.id,
        sign_id: item.id,
        // 本次签到积分
        sign_score: item.score,
        // 上次签到次数
        sign_count: this.userInfo.sign_count,
        // 上次签到时间
        sign_at: this.userInfo.sign_at,
      };
      const res = await SignProxy.do(params);
      if (res.success) {
        this.$toast('签到成功');
        this.$store.dispatch('account/find', {
          userId: this.userInfo.id,
        });
      }
    },
  },
  created() {
    if (this.userInfo.id) {
      this.getSignList();
    }
  },
};
</script>
<style lang="less">
.sign-component {
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    .block {
      width: 100%;
      padding: 30px 10px 10px;
      border-radius: 10px;
      box-sizing: border-box;
      background-color: #fff;
      position: relative;
      .close {
        position: absolute;
        top: 6px;
        right: 6px;
      }
    }
  }
  .sign-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left {
      font-size: 16px;
      color: #666;
    }
    .right {
      font-size: 12px;
      color: #999;
    }
    strong {
      color: #F56C6C;
      margin: 0 2px;
    }
  }
  .sign-list {
    display: flex;
    flex-wrap: wrap;
    margin: 20px 0;
    flex-wrap: wrap;
    .sign-item {
      font-size: 12px;
      text-align: center;
      margin: 2px 10px;
      &.active {
        color: #F56C6C;
        .coin {
          background-image: url("../../../assets/images/coin-active.png");
        }
      }
      .coin {
        line-height: 30px;
        color: #fff;
        font-weight: bold;
        width: 30px;
        height: 30px;
        background-image: url("../../../assets/images/coin.png");
        background-repeat: no-repeat;
        background-size: 100% 100%;
        margin-bottom: 6px;
        position: relative;
        &.chest {
          background-image: url("../../../assets/images/chest.png");
        }
      }
      &.disabled {
        color: #999;
        .coin {
          color: #999;
          background-image: url("../../../assets/images/coin-disabled.png");
        }
      }
    }
  }
}
</style>
