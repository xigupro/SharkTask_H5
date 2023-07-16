<template>
  <div class="grabbed-page">
    <van-tabs v-model="activeStatusIndex" :swipe-threshold="4">
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
      <van-cell
        v-for="(item, index) in tasks"
        :key="index">
        <van-swipe-cell>
          <router-link :to="selectedStatusId | taskListUrl(item)" class="task-item shadow">
            <van-image width="45" height="45" :src="item.thumbnail | getQiniuFullUrl" />
            <div class="task-text">
              <div class="title">{{item.title}}</div>
              <div class="task-time">{{item.created_at | transLocalTime}}</div>
            </div>
            <div class="task-todo">
              <div>+{{item.money}}元</div>
            </div>
          </router-link>
          <template #right>
            <van-button
              @click="cancelTaskConfirm(item, index)"
              square
              type="danger"
              :disabled="!!item.deleted"
              :text="item.deleted ? '已取消' : '取消任务'" />
          </template>
        </van-swipe-cell>
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
  SwipeCell,
  Dialog,
  Toast,
  Button,
} from 'vant';
import TasksProxy from '@/proxies/tasks';

export default {
  data() {
    return {
      status: [
        { id: 1, value: '进行中' },
        { id: 2, value: '审核中' },
        { id: 3, value: '已完成' },
        { id: 4, value: '已过期' },
        { id: 5, value: '被驳回' },
        { id: 0, value: '已取消' },
      ],
      activeStatusIndex: 0,
      tasks: [],
      finished: false,
      loading: false,
      pageIndex: 1,
      pageSize: 10,
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
    [SwipeCell.name]: SwipeCell,
    [Dialog.Component.name]: Dialog.Component,
    [Toast.name]: Toast,
    [Button.name]: Button,
  },
  watch: {
    activeStatusIndex() {
      this.pageIndex = 1;
      this.loadTasks();
    },
    userId() {
      this.pageIndex = 1;
      this.loadTasks();
    },
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
    selectedStatusId() {
      return this.status[this.activeStatusIndex].id;
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
    cancelTaskConfirm(row, index) {
      Dialog.confirm({
        message: '确定取消任务吗？',
      }).then(() => {
        this.cancelTask(row, index);
      });
    },
    // 取消任务
    async cancelTask(row, index) {
      const params = {
        user_task_id: row.id,
        task_id: row.task_id,
        id: row.review_id || '',
      };
      const res = await TasksProxy.reviewRemove(params);
      if (res.success) {
        this.$toast('取消成功');
        this.tasks.splice(index, 1);
      }
    },
    async loadTasks() {
      const params = {
        userId: this.userId,
        status: this.selectedStatusId,
        page: this.pageIndex,
        size: this.pageSize,
      };
      const res = await TasksProxy.getUserTasks(params);
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
  mounted() {
    if (this.userId) {
      this.loadTasks();
    }
    this.autoLoad = true;
  },
};
</script>

<style lang="less">
  .grabbed-page {
    .van-cell {
      padding: 0;
      .van-swipe-cell__right {
        .van-button {
          height: 100%;
        }
      }
    }
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
      padding: 10px 16px;
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
    .remove {
      height: 80px;
    }
  }
</style>
