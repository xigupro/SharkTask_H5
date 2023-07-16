<template>
  <div class="entry-page" :style="{'paddingTop': isAPP ? '44px' : '0'}">
    <van-nav-bar v-if="isAPP" fixed title="发现" />
    <entry :entries="entries" :vertical="true" />
  </div>
</template>
<script>
import { NavBar } from 'vant';
import Entry from '@/components/business/entry';
import { judgeClient } from '@/utils/tools';
import EntriesProxy from '@/proxies/entries';

export default {
  data() {
    return {
      entries: [],
    };
  },
  components: {
    [NavBar.name]: NavBar,
    Entry,
  },
  computed: {
    isAPP() {
      return navigator.userAgent.indexOf('Html5Plus') > -1;
    },
    clientType() {
      const platform = judgeClient();
      let type = 2;
      if (this.isAPP) {
        switch (platform) {
          case 'ios':
            type = 4;
            break;
          case 'android':
            type = 3;
            break;
          default:
            console.info(platform);
            break;
        }
      }
      return type;
    },
  },
  methods: {
    async getEntries() {
      this.entries = [];
      const params = {
        client: this.clientType,
        type: 2,
      };
      const res = await EntriesProxy.list(params);
      if (!res.fail) {
        this.entries = res.data.filter(item => item.is_show);
      }
    },
  },
  created() {
    this.getEntries();
  },
};
</script>

<style lang="less">
  .entry-page {
    padding-bottom: 60px;
  }
</style>
