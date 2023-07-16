<template>
  <div class="partner-page">
    <div class="header">
      <div class="avatar-panel">
        <img class="avatar" :src="userInfo.avatar | getAvatarUrl" />
        <div class="level">
          <img :src="require(`../../assets/images/partner${userInfo.level}.png`)" />
          <span>{{ userInfo.level > 1 ? userInfo.level_info.name : '' }}</span>
        </div>
      </div>
      <div class="status" v-if="userInfo.next_level">
        <div class="status-head">满足以下方式升级{{userInfo.next_level.name}}合伙人</div>
        <div class="status-item">
          <div class="status-desc">成功完成{{finishedTaskCount}}个任务</div>
          <div class="status-progress">
            <div style="flex:1">
              <van-progress
                :show-pivot="false"
                color="rgb(91, 49, 0)"
                :percentage="Math.floor((finishedTaskCount/userInfo.next_level.task_count)*100)"
                stroke-width="10"
                track-color="#fff" />
            </div>
            <div class="status-num">
              {{finishedTaskCount + '/' + userInfo.next_level.task_count}}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="section">
        <div class="title">当前享受权益</div>
        <div class="benefit-list">
          <div class="benefit-item">
            <van-icon name="add-o" />
            <div class="benefit-title">任务限制</div>
            <div class="benefit-desc">日可领任务{{levelTaskLimit}}个</div>
          </div>
          <div class="benefit-item">
            <van-icon name="balance-o" />
            <div class="benefit-title">等级奖金</div>
            <div class="benefit-desc">
              每月奖励{{userInfo.level_info && userInfo.level_info.money_monthly}}元
            </div>
          </div>
        </div>
      </div>
      <div class="section" v-if="userInfo.next_level">
        <div class="title">成为{{userInfo.next_level.name}}合伙人享多重权益</div>
        <div class="benefit-list">
          <div class="benefit-item">
            <van-icon name="add-o" />
            <div class="benefit-title">任务限制</div>
            <div class="benefit-desc">日可领任务{{nextLevelTaskLimit}}个</div>
          </div>
          <div class="benefit-item">
            <van-icon name="balance-o" />
            <div class="benefit-title">等级奖金</div>
            <div class="benefit-desc">
              每月奖励{{userInfo.next_level && userInfo.next_level.money_monthly}}元
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Progress, Icon } from 'vant';
import StatisticsProxy from '@/proxies/statistics';

export default {
  data() {
    return {
      finishedTaskCount: 0,
    };
  },
  components: {
    [Progress.name]: Progress,
    [Icon.name]: Icon,
  },
  computed: {
    levelTaskLimit() {
      return this.userInfo.level_info.task_limit < 0
        ? '无限' : this.userInfo.level_info.task_limit;
    },
    nextLevelTaskLimit() {
      return this.userInfo.next_level.task_limit < 0
        ? '无限' : this.userInfo.next_level.task_limit;
    },
    userInfo() {
      return this.$store.state.account.info;
    },
  },
  methods: {
    async getTaskCount(data) {
      const params = {
        ...data,
        taskStatus: 3,
      };
      const res = await StatisticsProxy.getTaskCount(params);
      if (res.success) {
        this.finishedTaskCount = res.data.taskCount;
      }
    },
  },
  created() {
    this.getUserAchievement();
    this.getTaskCount({ userId: this.userInfo.id });
  },
};
</script>

<style scoped lang="less">
.partner-page {
  background-image: linear-gradient(#ffffff, #f8f8f8);
  .header {
    background-image: url('../../assets/images/header1.png');
    background-size: 100%;
    padding: 30px 20px;
    .status {
      border-radius: 10px;
      margin-top: 40px;
      padding: 20px;
      background: linear-gradient(to right, #fdf4de, #fae4b2);
      .status-head {
        font-size: 18px;
        font-weight: 500;
        color: rgb(74, 14, 0);
        margin-bottom: 20px;
      }
      .status-item {
        margin-bottom: 8px;
        color: rgb(91, 49, 0);
        .status-progress {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .status-num {
          font-size: 12px;
          width: 80px;
          padding-left: 4px;
          text-align: right;
        }
      }
    }
    .avatar-panel {
      position: relative;
      text-align: center;
      .avatar {
        width: 100px;
        height: 100px;
        flex-shrink: 0;
        background-color: #eee;
        box-shadow: 0px 0px 1px 2px #eee;
        overflow: hidden;
        border-radius: 50%;
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        -ms-border-radius: 50%;
        -o-border-radius: 50%;
      }
      .level {
        position: absolute;
        left: 50%;
        bottom: 10px;
        transform: translateX(-50%);
        height: 20px;
        line-height: 20px;
        min-width: 100px;
        vertical-align: bottom;
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
        img {
          height: 48px;
        }
        span {
          position: absolute;
          top: 17px;
          font-weight: bold;
          right: 4px;
          color: #fff;
          font-style: italic;
        }
      }
    }
  }
  .section {
    padding: 15px;
    .title {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .benefit-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      .benefit-item {
        flex: 1;
        text-align: center;
        margin-bottom: 12px;
        margin-right: 10px;
        padding: 10px;
        box-sizing: border-box;
        border-radius: 10px;
        background-color: rgb(250, 244, 232);
        &:last-child {
          margin-right: 0;
        }
        .van-icon {
          font-size: 48px;
          font-weight: 600;
          color: rgb(122, 68, 6);
          margin: 10px 0;
        }
        .benefit-title {
          font-size: 16px;
        }
        .benefit-desc {
          font-size: 12px;
          color: rgb(91, 49, 0);
          margin-top: 6px;
        }
      }
    }
  }
}
</style>
