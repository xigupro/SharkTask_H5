<template>
  <div class="header-component">
    <van-nav-bar
      fixed
      left-text="返回"
      left-arrow
      @click-left="goBack"
      @click-right="handleRightClick">
        <van-icon :name="topRight.icon" slot="right" />
    </van-nav-bar>
  </div>
</template>
<script>
import { NavBar, Icon } from 'vant';
import { getQiniuFullUrl } from '@/filters';

export default {
  name: 'xg-header',
  components: {
    [NavBar.name]: NavBar,
    [Icon.name]: Icon,
  },
  data() {
    return {
      specialPath: [
        '/recharge/index',
      ],
    };
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
    isWechat() {
      return this.$tools.isWechat();
    },
    isAPP() {
      return navigator.userAgent.indexOf('Html5Plus') > -1;
    },
    topRight() {
      const tr = this.$route.meta.topRight;
      if (!tr) {
        // 默认是首页按钮
        return {
          icon: 'wap-home',
          event: 'goHome',
        };
      }
      return tr;
    },
    hideHeader() {
      return this.$tools.judgeClient() === 'ios'
        && this.isAPP
        && !this.$route.meta.showHeaderInApp;
    },
    code() {
      return this.$tools.getUrlParam('code');
    },
  },
  methods: {
    handleRightClick() {
      this[this.topRight.event]();
    },
    goBack() {
      if (this.code && this.specialPath.includes(this.$route.path)) {
        window.location.href = `${window.location.origin}/#/ucenter`;
      } else {
        this.$router.go(-1);
      }
    },
    // APP系统分享
    shareSystem() {
      const taskDetail = this.$store.state.task.info;
      let href = `${window.API_CONFIG['task_detail']}/${taskDetail.id}`;
      if (this.isAPP) {
        // APP则直接唤起系统分享
        const params = {
          type: 'web',
          title: taskDetail.title,
          content: `${taskDetail.title}`,
          thumbs: [getQiniuFullUrl(taskDetail.thumbnail)],
          href,
        };
        window.plus.share.sendWithSystem(params, () => {
          console.log('分享成功');
        }, (e) => {
          console.log(JSON.stringify(e));
        });
      } else {
        // h5复制链接
        this.$copyText(href).then(() => {
          this.$toast('链接复制成功，赶紧去分享吧');
        }, () => {
          this.$toast('复制失败');
        });
      }
    },
    // 返回首页
    goHome() {
      if (this.code && this.specialPath.includes(this.$route.path)) {
        window.location.href = window.location.origin;
      } else {
        this.$router.push({
          name: 'home.index',
        });
      }
    },
  },
};
</script>
<style lang="less" scoped>
  .header-component {
    height: 44px;
    .van-icon {
      font-size: 22px;
    }
  }
</style>
