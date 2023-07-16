<template>
  <div class="self-tasks-page">
    <div class="search">
      <van-search
        maxlength="15"
        @search="handleSearch"
        shape="round"
        placeholder="请输入关键词"
        v-model="keywords" />
    </div>
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="$t('noMore')"
      @load="onLoad">
      <van-cell v-for="(item, index) in tasks" :key="index">
        <router-link :to="`/task/detail/${item.id}`" class="task-item shadow">
          <van-image width="45" height="45" :src="item.thumbnail | getQiniuFullUrl" />
          <div class="top" v-if="item.top_timeout > now">置顶</div>
          <div class="task-text">
            <div class="title">{{item.title}}</div>
            <div class="task-cost">
              已被领取{{item.grab_quantity}}份, 剩余
              <span class="red">{{item.quantity}}</span>份
            </div>
          </div>
          <div class="task-money">+{{item.money}}元</div>
        </router-link>
      </van-cell>
    </van-list>
  </div>
</template>
<script>
import {
  List,
  Cell,
  Image,
  Search,
} from 'vant';
import TasksProxy from '@/proxies/tasks';
import { judgeClient } from '@/utils/tools';

export default {
  data() {
    return {
      keywords: '',
      banners: [],
      tasks: [],
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
    [List.name]: List,
    [Cell.name]: Cell,
    [Image.name]: Image,
    [Search.name]: Search,
  },
  computed: {
    systemInfo() {
      return this.$store.state.system.info;
    },
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
    onLoad() {
      this.loading = true;
      setTimeout(() => {
        this.loadTasks();
      }, 500);
    },
    handleSearch() {
      this.tasks = [];
      this.finished = false;
      this.loading = true;
      this.pageIndex = 1;
      this.pageSize = 10;
      this.loadTasks();
    },
    async loadTasks() {
      const params = {
        page: this.pageIndex,
        forReview: 0,
        title: this.keywords,
        order: '5',
        client: this.clientType,
      };
      const res = await TasksProxy.getTasks(params);
      this.loading = false;
      if (!res.fail) {
        // 如果是获取第一页就清空整个列表TODO
        if (this.pageIndex === 1) {
          this.tasks = [];
        }
        this.pageIndex += 1;
        this.tasks = this.tasks.concat(res.data.list);
        this.totalRecordCount = res.data.totalCount;
        // 无数据
        if (this.tasks.length === this.totalRecordCount || !res.data.list.length) {
          this.finished = true;
        } else if (this.tasks.length < this.totalRecordCount) {
        // 还有数据
          this.finished = false;
        }
      }
    },
  },
  created() {
  },
  mounted() {
    this.autoLoad = true;
  },
};
</script>

<style lang="less">
  .self-tasks-page {
    .task-list {
      margin: 0;
      padding: 0 10px;
    }
    .task-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      .van-image, .task-money {
        flex-shrink: 0;
      }
      img {
        border-radius: 5px;
      }
    }
    .task-text {
      flex-grow: 1;
      margin-left: 10px;
      font-size: 16px;
      .title {
        overflow : hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
    }
    .task-cost {
      color: #666;
      font-size: 12px;
    }
    .task-money {
      font-size: 16px;
      color: #F56C6C;
    }
    .task-time {
      color: #bbb;
    }
    .task-todo {
      color: red;
    }
    .top {
      position: absolute;
      left: 0;
      bottom: 0;
      line-height: 14px;
      width: 35px;
      font-size: 12px;
      color: #fff;
      background-color: rgba(245, 107, 107, .8);
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      text-align: center;
      padding: 0 5px;
    }
  }
</style>
