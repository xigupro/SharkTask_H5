<template>
  <div class="tabbar-component">
    <van-tabbar v-model="activeTab" inactive-color="#bec2c8" active-color="#564f5f">
      <van-tabbar-item
        v-for="(item, index) in list"
        :key="index"
        :to="{ name: item.to }"
        :icon="item.icon">
        {{item.name}}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>
<script>
import { Tabbar, TabbarItem } from 'vant';

export default {
  data() {
    return {
      activeTab: 0,
      list: [{
        name: '首页',
        to: 'home.index',
        icon: 'wap-home',
      }, {
        name: '任务',
        to: 'task.list',
        icon: 'bill',
      }, {
        name: '发现',
        to: 'discover.index',
        icon: 'browsing-history',
      }, {
        name: '我的',
        to: 'ucenter.index',
        icon: 'manager',
      }],
    };
  },
  mounted() {
    this.list.forEach((item, index) => {
      if (item.to === this.$route.name) {
        this.activeTab = index;
      }
    });
  },
  components: {
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem,
  },
};
</script>

<style lang="less" scoped>
.tabbar-component {
  .menu-icon {
    height: 22px;
  }
}
</style>
