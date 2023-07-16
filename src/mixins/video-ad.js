export default {
  data() {
    return {
      adReward: null,
    };
  },
  methods: {
    // 加载APP广告
    rewardedVideoAd(adpid, cb, compatible) {
      console.info('广告ID', adpid);
      if (!this.$isApp) {
        this.$toast('此广告仅支持APP端');
        return;
      }
      if (this.adReward) {
        this.$toast('正在加载激励视频广告');
        return;
      }
      console.log('#视频激励广告#');
      this.$toast.loading({
        message: '加载中...',
        forbidClick: true,
      });
      this.adReward = window.plus.ad.createRewardedVideoAd({ adpid: adpid });
      this.adReward.onLoad(() => {
        console.log('加载成功');
        this.$toast.clear();
        this.adReward.show();
      });
      this.adReward.onError((e) => {
        this.$toast.clear();
        console.log('加载失败: ', JSON.stringify(e));
        if (compatible) {
          cb(); // 加载失败，直接执行回调
        }
        this.$toast(e.message);
        this.adReward.destroy();
        this.adReward = null;
      });
      this.adReward.onClose((e) => {
        if (e.isEnded) {
          console.log('激励视频播放完成');
          cb();
        } else {
          console.log('激励视频未播放完成关闭!');
        }
        this.adReward.destroy();
        this.adReward = null;
      });
      this.adReward.load();
    },
  },
};
