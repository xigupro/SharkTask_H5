<template>
  <div class="publish-page">
    <van-tabs v-model="activeStatusIndex" :swipe-threshold="5">
      <van-tab
        :sticky="true"
        :title="item.value"
        v-for="(item, index) in status"
        :key="index">
      </van-tab>
    </van-tabs>
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="$t('noMore')"
      @load="onLoad">
      <van-cell v-for="(item, index) in tasks" :key="index">
        <router-link :to="{name:'task.detail', params: {id:item.id}}" class="task-item shadow">
          <van-image width="45" height="45" :src="item.thumbnail | getQiniuFullUrl" />
          <div class="task-text">
            <div class="title">{{item.title}}</div>
            <div class="task-time">{{item.created_at | transLocalTime}}</div>
          </div>
          <div class="task-todo">+{{item.money}}元</div>
        </router-link>
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
  Image,
} from 'vant';
import TasksProxy from '@/proxies/tasks';

export default {
  data() {
    return {
      status: [
        { id: 1, value: '已上架' },
        { id: 2, value: '已下架' },
        { id: 3, value: '待审核' },
        { id: 4, value: '审核不通过' },
      ],
      activeStatusIndex: 0,
      tasks: [],
      finished: false,
      loading: false,
      page: 1,
      size: 10,
      totalRecordCount: 0,
      autoLoad: false,
    };
  },
  components: {
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [List.name]: List,
    [Cell.name]: Cell,
    [Image.name]: Image,
  },
  watch: {
    activeStatusIndex() {
      this.page = 1;
      this.loadTasks();
    },
    userId() {
      this.page = 1;
      this.loadTasks();
    },
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
  },
  methods: {
    onLoad() {
      this.finished = true;
      this.loading = true;
      setTimeout(() => {
        this.loadTasks();
      }, 500);
    },
    async loadTasks() {
      const params = {
        userId: this.userId,
        status: this.status[this.activeStatusIndex].id,
        page: this.page,
        size: this.size,
      };
      const res = await TasksProxy.getUserPublishedTasks(params);
      this.loading = false;
      if (!res.fail) {
        // 如果是获取第一页就清空整个列表TODO
        if (this.page === 1) {
          this.tasks = [];
        }
        this.page += 1;
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
    if (this.userId) {
      this.loadTasks();
    }
    this.autoLoad = true;
  },
};
</script>

<style lang="less">
  .publish-page {
    .task-count {
      background-color: #fff;
      padding: 20rpx;
      text-align:center;
    }
    .task-count .count {
      font-size:24rpx;
      color:#666;
    }
    .task-count .money {
      color:#333;
    }
    .task-count .none {
      color:green;
      font-size: 28rpx;
    }
    .task-list {
      margin: 10px 0;
      padding: 0 10px;
    }
    .task-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #fff;
      .van-image, .task-todo {
        flex-shrink: 0;
      }
    }
    .task-item img {
      border-radius: 5px;
      -webkit-border-radius: 5px;
      -moz-border-radius: 5px;
      -ms-border-radius: 5px;
      -o-border-radius: 5px;
      flex-grow: 0;
    }
    .task-text {
      flex-grow: 1;
      margin-left: 10px;
      .title {
        overflow : hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
    }
    .task-cost {
      color: orange;
    }
    .task-money {
      color: orange;
    }
    .task-time {
      color: #bbb;
      font-size: 12px;
    }
    .task-todo {
      font-size: 18px;
      color: #F56C6C;
    }
  }
</style>
