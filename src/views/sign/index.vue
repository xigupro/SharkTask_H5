<template>
  <div class="sign-page">
    <sign :visible="true" />
    <div class="score">当前积分余额: <strong>{{userInfo.score}}</strong></div>
    <div class="box">
      <img :src="require('../../assets/images/lucky-bg.png')" width="100%" />
      <img :src="require('../../assets/images/lucky-pointer.png')" class="pointer" />
      <LuckyWheel
        class="luck-draw"
        ref="LuckyWheel"
        width="275px"
        height="275px"
        :prizes="prizes"
        :buttons="buttons"
        :default-style="defaultStyle"
        :default-config="defaultConfig"
        @start="startCallBack"
        @end="endCallBack"
      />
    </div>
  </div>
</template>
<script>
import { LuckyWheel } from 'vue-luck-draw';
import UserProxy from '@/proxies/users';
import Sign from '@/components/business/sign';

export default {
  data() {
    return {
      prizes: [],
      buttons: [{
        radius: '40px',
        imgs: [
          { src: require('../../assets/images/lucky-btn.png'), width: '140%', top: '-135%' },
        ],
      }],
      defaultStyle: {
        fontColor: '#000',
        fontSize: '13px',
        fontStyle: 'SimHei',
      },
      defaultConfig: {
        offsetDegree: 22.5,
      },
    };
  },
  components: {
    Sign,
    LuckyWheel,
  },
  computed: {
    userInfo() {
      return this.$store.state.account.info;
    },
  },
  methods: {
    // 获取转盘列表
    async getLuckyDrawList() {
      const res = await UserProxy.getLuckyDrawList();
      if (!res.fail) {
        const prizes = [];
        // const data = [
        //   { name: '+12积分', value: 12, img: require('../../assets/images/lucky-1.png'), color: '#FEF3FC' },
        //   { name: '谢谢参与', value: 0, img: require('../../assets/images/lucky-0.png'), color: '#F8DEF8' },
        //   { name: '+10积分', value: 10, img: require('../../assets/images/lucky-1.png'), color: '#FEF3FC' },
        //   { name: '-10积分', value: -10, img: require('../../assets/images/lucky-0.png'), color: '#F8DEF8' },
        //   { name: '+5积分', value: 5, img: require('../../assets/images/lucky-1.png'), color: '#FEF3FC' },
        //   { name: '-5积分', value: -5, img: require('../../assets/images/lucky-0.png'), color: '#F8DEF8' },
        //   { name: '+1积分', value: 1, img: require('../../assets/images/lucky-1.png'), color: '#FEF3FC' },
        //   { name: '-1积分', value: -1, img: require('../../assets/images/lucky-0.png'), color: '#F8DEF8' },
        // ];
        res.data.forEach((item) => {
          const img = item.value > 0 ? require('../../assets/images/lucky-1.png') : require('../../assets/images/lucky-0.png')
          prizes.push({
            name: item.name,
            value: item.value,
            background: item.value > 0 ? '#F8DEF8' : '#FEF3FC',
            fonts: [{ text: item.name, top: '12%' }],
            imgs: [{ src: img, width: '45%', top: '35%' }],
          });
        });
        this.prizes = prizes;
      }
    },
    // 加减积分
    async updateUserScore(score) {
      const params = {
        user_id: this.userInfo.id,
        score: score,
        remark: score > 0 ? '转盘奖励' : '转盘扣除',
        type: 8,
      };
      const res = await UserProxy.updateScore(params);
      if (!res.fail) {
        this.$notify.success({
          title: '成功',
          message: res.message,
        });
      }
    },
    startCallBack() {
      if (!this.prizes
        .filter(item => item.value < 0)
        .every((item) => this.userInfo.score >= (item.value) * -1))  {
        // 如果用户剩余积分小于转盘最大扣除额，则不允许操作
        this.$toast('积分余额不足')
        return;
      }
      this.$refs.LuckyWheel.play();
      setTimeout(() => {
        this.$refs.LuckyWheel.stop(Math.random() * 8 >> 0);
      }, 2000);
    },
    endCallBack(prize) {
      this.$toast(prize.value > 0 ? `恭喜你，${prize.name}` : `很遗憾，${prize.name}`);
      if (prize.value !== 0) {
        this.updateUserScore(prize.value)
        this.$store.dispatch('account/find', {
          userId: this.userInfo.id,
        });
      }
    },
  },
  mounted() {
    this.getLuckyDrawList();
  },
};
</script>
<style lang="less">
.sign-page {
  .score {
    padding: 10px 10px 0 10px;
  }
  .box {
    position: relative;
    width: 350px;
    height: 350px;
    margin-top: 20px;
    left: 50%;
    transform: translateX(-50%);
  }
  .pointer {
    width: 38px;
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    z-index: 999;
  }
  .luck-draw {
    width: 275px;
    height: 275px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
