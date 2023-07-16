<!--待审核列表-->
<template>
  <div class="review-list-page">
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
      <van-cell v-for="(item, index) in reviewList" :key="index">
        <router-link
          :to="{name:'review.do', query: {
            review_id:item.id,
            task_id:item.task_id,
            user_id:item.user_id}}"
          class="task-item shadow">
          <van-image width="45" height="45" :src="item.thumbnail | getQiniuFullUrl" />
          <div class="task-text">
            <div>{{item.title}}</div>
            <div class="task-time">{{item.created_at | transLocalTime}}</div>
          </div>
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
        { id: 1, value: '待审核' },
        { id: 2, value: '审核通过' },
        { id: 3, value: '审核失败' },
      ],
      activeStatusIndex: 0,
      reviewList: [],
      finished: false,
      loading: false,
      page: 1,
      size: 10,
      totalRecordCount: 0,
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
      this.getReviewList();
    },
    userId() {
      this.page = 1;
      this.getReviewList();
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
        this.getReviewList();
      }, 500);
    },
    async getReviewList() {
      const params = {
        taskCreator: this.userId,
        status: this.status[this.activeStatusIndex].id,
        page: this.page,
        size: this.size,
      };
      const res = await TasksProxy.getReviewList(params);
      this.loading = false;
      if (!res.fail) {
        // 如果是获取第一页就清空整个列表TODO
        if (this.page === 1) {
          this.reviewList = [];
        }
        this.page += 1;
        this.reviewList = this.reviewList.concat(res.data.list);
        this.totalRecordCount = res.data.totalCount;
        // 无数据
        if (this.reviewList.length === this.totalRecordCount || !res.data.list.length) {
          this.finished = true;
        } else if (this.reviewList.length < this.totalRecordCount) {
        // 还有数据
          this.finished = false;
        }
      }
    },
  },
  created() {
    if (this.userId) {
      this.getReviewList();
    }
  },
};
</script>

<style lang="less">
  .review-list-page {
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
