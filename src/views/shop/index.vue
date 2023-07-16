<template>
  <div class="shop-page">
    <div class="user-info">
      <div class="avatar-panel">
        <img
          class="user-avatar"
          :src="userInfo.avatar | getAvatarUrl">
      </div>
      <div class="content">
        <div class="nickname">
          {{userInfo.nick_name || userInfo.username}}
          <span style="color:red;" v-if="userInfo.status === 2">（已冻结）</span>
        </div>
        <div class="user-label">
          <span class="certified" v-if="userInfo.is_certified">已认证</span>
        </div>
      </div>
    </div>
    <div class="statistics">
      <div class="item">
        <div class="number">{{totalRecordCount || 0}}</div>
        已发布任务
      </div>
      <div class="item">
        <div class="number">{{statistics.taskCount || 0}}</div>
        已完成任务
      </div>
      <div class="item">
        <div class="number">{{statistics.taskMoney || 0}}</div>
        总发放佣金
      </div>
    </div>
    <van-empty v-if="finished && !tasks.length" description="该用户尚未发布任务" />
    <div class="task-list" v-else>
      <div class="title">发布的任务</div>
      <van-list
        v-model="loading"
        :finished="finished"
        :finished-text="$t('noMore')"
        @load="loadTasks">
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
  </div>
</template>
<script>
import {
  List,
  Cell,
  Image,
  Empty,
} from 'vant';
import UserProxy from '@/proxies/users';
import TasksProxy from '@/proxies/tasks';
import StatisticsProxy from '@/proxies/statistics';
import { judgeClient } from '@/utils/tools';

export default {
  data() {
    return {
      userId: this.$route.params.id,
      userInfo: {},
      tasks: [],
      finished: false,
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      totalRecordCount: 0,
      autoLoad: false,
      statistics: {
        taskCount: 0,
        taskMoney: 0,
      },
      now: new Date().getTime(),
    };
  },
  components: {
    [List.name]: List,
    [Cell.name]: Cell,
    [Image.name]: Image,
    [Empty.name]: Empty,
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
    async getInfoByID() {
      const params = {
        userId: this.userId,
      };
      const res = await UserProxy.getInfoByID(params);
      if (res.success) {
        this.userInfo = res.data;
      }
    },
    async getTaskCount() {
      const params = {
        userId: this.userId,
        taskStatus: 3,
      };
      const res = await StatisticsProxy.getTaskCount(params);
      if (res.success) {
        this.statistics.taskCount = res.data.taskCount;
      }
    },
    async getMoneyByTaskStatus() {
      const params = {
        creatorId: this.userId,
        taskStatus: 3,
      };
      const res = await StatisticsProxy.getMoneyByTaskStatus(params);
      if (res.success) {
        this.statistics.taskMoney = res.data.money;
      }
    },
    async loadTasks() {
      const params = {
        page: this.pageIndex,
        forReview: 0,
        client: this.clientType,
        creator: this.userId,
      };
      this.loading = true;
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
    this.getInfoByID();
    this.getTaskCount();
    this.getMoneyByTaskStatus();
  },
  mounted() {
    this.autoLoad = true;
  },
};
</script>
<style lang="less">
.shop-page {
  .user-info {
    display: flex;
    color: #333;
    padding: 10px;
    background-color: #fff;
  }
  .avatar-panel {
    position: relative;
    margin-right: 10px;
  }
  .user-avatar {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    border: 2px solid #fafafa;
    background-color: #eee;
    overflow: hidden;
    border-radius: 50%;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    -ms-border-radius: 50%;
    -o-border-radius: 50%;
  }
  .user-label {
    display: flex;
    margin-top: 10px;
    .certified {
      background-color: #5fc48d;
      border-radius: 20px;
      color: #fff;
      font-size: 12px;
      padding: 2px 8px;
      font-weight: bold;
    }
  }
  .nickname {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }
  .statistics {
    background-color: #fff;
    display: flex;
    justify-content: space-around;
    padding-bottom: 20px;
    padding-top: 10px;
    color: #999;
    font-size: 12px;
    text-align: center;
    .number {
      color: #666;
      margin: 6px;
      font-weight: bold;
      font-size: 14px;
    }
  }
  .task-list {
    margin: 0;
    &>.title {
      font-weight: bold;
      margin: 8px 15px;
    }
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
