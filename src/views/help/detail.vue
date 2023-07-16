<template>
  <div class="help-detail-page">
    <div class="title">{{helpArticleDetail.title}}</div>
    <div class="content" v-html="helpArticleDetail.content"></div>
  </div>
</template>
<script>
import HelpProxy from '@/proxies/help';

export default {
  name: 'help-detail',
  data() {
    return {
      helpArticleDetail: {},
    };
  },
  methods: {
    async getHelpArticleDetail() {
      const params = {
        id: this.$route.params.id,
      };
      const res = await HelpProxy.detail(params);
      if (res.success) {
        this.helpArticleDetail = res.data;
      }
    },
  },
  created() {
    this.getHelpArticleDetail();
  },
};
</script>
<style lang="less">
  .help-detail-page {
    background-color: #fff;
    padding: 10px;
    .title {
      font-size: 18px;
      text-align: center;
      padding: 10px;
    }
    .content {
      word-break: break-all;
      img {
        max-width: 100%;
        height: auto;
      }
    }
  }
</style>
