<template>
  <div class="help-index-page">
    <div class="search">
      <van-search
        @search="handleSearch"
        shape="round"
        placeholder="请输入关键词搜索"
        v-model="keywords" />
    </div>
    <van-sticky>
      <van-tabs v-model="activeTypeIndex">
        <van-tab :id="0" title="全部"></van-tab>
        <van-tab
          :id="item.id"
          :title="item.name"
          v-for="(item, index) in typeList"
          :key="index">
        </van-tab>
      </van-tabs>
    </van-sticky>
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="$t('noMore')"
      @load="getHelpArticleList">
      <van-cell
        v-for="(item, index) in helpArticleList"
        :title="item.title"
        :key="index"
        :to="`/help/detail/${item.id}`"
        center
        is-link />
    </van-list>
  </div>
</template>
<script>
import {
  Tab,
  Tabs,
  List,
  Cell,
  Image,
  Search,
  Sticky,
} from 'vant';
import HelpProxy from '@/proxies/help';

export default {
  name: 'help-index',
  data() {
    return {
      keywords: '',
      banners: [],
      typeList: [],
      activeTypeIndex: 0,
      helpArticleList: [],
      finished: false,
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      totalRecordCount: 0,
      autoLoad: false,
      now: new Date().getTime(),
    };
  },
  components: {
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [List.name]: List,
    [Cell.name]: Cell,
    [Image.name]: Image,
    [Search.name]: Search,
    [Sticky.name]: Sticky,
  },
  watch: {
    activeTypeIndex(val) {
      if (val >= 0) {
        this.pageIndex = 1;
        this.getHelpArticleList();
      }
    },
  },
  methods: {
    handleSearch() {
      this.helpArticleList = [];
      this.finished = false;
      this.loading = true;
      this.pageIndex = 1;
      this.pageSize = 10;
      this.getHelpArticleList();
    },
    async getTypeList() {
      const res = await HelpProxy.typeList();
      if (!res.fail) {
        const type = this.$route.query.id;
        res.data.forEach((item, index) => {
          if (Number(item.id) === Number(type)) {
            this.activeTypeIndex = index + 1;
          }
        });
        this.typeList = res.data;
      }
    },
    async getHelpArticleList() {
      const params = {
        page: this.pageIndex,
        title: this.keywords,
      };
      if (this.activeTypeIndex !== 0) {
        params.type = this.typeList[this.activeTypeIndex - 1].id;
      }
      this.loading = true;
      const res = await HelpProxy.list(params);
      this.loading = false;
      if (!res.fail) {
        // 如果是获取第一页就清空整个列表TODO
        if (this.pageIndex === 1) {
          this.helpArticleList = [];
        }
        this.pageIndex += 1;
        this.helpArticleList = this.helpArticleList.concat(res.data.list);
        this.totalRecordCount = res.data.totalCount;
        // 无数据
        if (this.helpArticleList.length === this.totalRecordCount || !res.data.list.length) {
          this.finished = true;
        } else if (this.helpArticleList.length < this.totalRecordCount) {
        // 还有数据
          this.finished = false;
        }
      }
    },
  },
  created() {
    this.getTypeList();
  },
  mounted() {
    this.autoLoad = true;
  },
};
</script>

<style lang="less">
  .help-index-page {}
</style>
