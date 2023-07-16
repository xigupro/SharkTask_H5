<template>
  <div class="message-detail-page">
    <div class="title">{{messageDetail.title}}</div>
    <div class="time">{{messageDetail.created_at | transLocalTime}}</div>
    <div class="content" v-html="messageDetail.content"></div>
    <div class="aciton" :class="{'visible': showDetailButton}">
      <van-button type="primary" size="small" @click="toDetail">去查看</van-button>
    </div>
  </div>
</template>
<script>
import {
  Button,
} from 'vant';
import MessageProxy from '@/proxies/messages';

export default {
  data() {
    return {
      messageDetail: {
        type: 1,
      },
    };
  },
  components: {
    [Button.name]: Button,
  },
  watch: {
    userId() {
      this.getMessageDetail();
    },
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
    type() {
      return this.$route.query.type;
    },
    showDetailButton() {
      return !([1, 7].includes(this.messageDetail.type));
    },
  },
  methods: {
    async getMessageDetail() {
      const params = {
        user_id: this.userId,
        id: this.$route.params.id,
      };
      const res = await MessageProxy[this.type === 1 ? 'getNoticeDetail' : 'detail'](params);
      if (!res.fail) {
        this.messageDetail = res.data;
      }
    },
    toDetail() {
      let params = {};
      if (this.messageDetail.business_id) {
        params = JSON.parse(this.messageDetail.business_id);
      }
      switch (this.messageDetail.type) {
        case 1:
          // 普通公告，无跳转
          break;
        case 2:
          // 任务详情
          this.$router.push({
            name: 'task.detail',
            params: {
              id: params.task_id,
            },
          });
          break;
        case 3:
          // 审核详情(雇主)
          this.$router.push({
            name: 'review.do',
            query: {
              task_id: params.task_id,
              user_id: params.user_id,
              review_id: params.review_id,
            },
          });
          break;
        case 4:
          // 审核详情(领主)
          this.$router.push({
            name: 'review.detail',
            query: {
              taskId: params.task_id,
              userTaskId: params.user_task,
              reviewId: params.review_id,
            },
          });
          break;
        case 5:
          // 提现详情
          this.$router.push({
            name: 'withdraw.detail',
            query: {
              id: params.withdraw_id,
            },
          });
          break;
        case 6:
          // 超级会员
          break;
        default:
          this.$toast('消息类型不存在');
          break;
      }
    },
  },
  created() {
    if (this.userId) {
      this.getMessageDetail();
    }
  },
};
</script>
<style lang="less">
  .message-detail-page {
    background-color: #fff;
    padding: 10px;
    .title {
      font-size: 18px;
    }
    .time {
      font-size: 12px;
      color: #999;
      border-bottom: 1px solid #eee;
      margin: 10px 0;
      padding-bottom: 10px;
    }
    .content {
      white-space: pre;
    }
    .aciton {
      margin: 40px 0;
      text-align: center;
      display: none;
      &.visible {
        display: block;
      }
    }
  }
</style>
