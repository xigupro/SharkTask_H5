<!--审核详情-->
<template>
  <div class="review-detail-page">
    <div class="task-notice">
      <span v-if="taskStatus === 2">已提交，请耐心等待审核</span>
      <span v-else-if="taskStatus === 3">已完成，赏金已发放</span>
      <span v-else-if="taskStatus === 4">已过期</span>
      <span v-else-if="taskStatus === 5">审核失败：{{reason}}</span>
      <span v-else>未知状态</span>
    </div>
    <div class="task-step shadow" v-if="fields && fields.length">
      <div v-for="(item, index) in fields" :key="`field${index}`">
        {{item.name}}: {{item.reviewValue}}
      </div>
    </div>
    <div class="task-step shadow">
      <div class="title">审核步骤</div>
      <div class="item" v-for="(item, index) in steps" :key="index">
        <div class="item-title">{{index + 1}}.{{item.text || ''}}</div>
        <template v-if="item.stepImage">
          <div class="inline-title">示例图</div>
          <div class="item-image">
            <img @click="previewImages([item.stepImage], 0)" class="shadow" :src="item.stepImage" />
          </div>
        </template>
        <div class="item-image">
          <div class="inline-title">你提交的审核图</div>
          <img
            @click="previewImages(item.reviewImage, imageIndex)"
            class="shadow"
            v-for="(image, imageIndex) in item.reviewImage"
            :src="image"
            :key="image" />
        </div>
      </div>
    </div>
    <div class="grab-task" v-if="taskStatus === 5">
      <router-link
        v-if="!detail.deleted"
        :to="goUpdate">
        <van-button block size="normal" type="primary">修改</van-button>
      </router-link>
      <router-link
        v-if="systemInfo.open_appeal"
        :to="{name: 'review.appeal', query: {
          task_id: taskId,
          user_task: userTaskId,
          review_id: reviewId}}">
        <van-button block size="normal">申诉</van-button>
      </router-link>
    </div>
  </div>

</template>
<script>
import {
  Button,
} from 'vant';
import TasksProxy from '@/proxies/tasks';
import PreviewImage from '@/mixins/image-preview';

export default {
  data() {
    return {
      taskId: '',
      userTaskId: null,
      reviewId: null,
      steps: [],
      fields: [],
      taskStatus: null,
      reason: '',
      detail: {},
    };
  },
  mixins: [PreviewImage],
  components: {
    [Button.name]: Button,
  },
  computed: {
    goUpdate() {
      const path = '/review/submit?';
      const taskId = `taskId=${this.taskId}`;
      const isResubmit = 'isResubmit=1';
      const userTaskId = `userTaskId=${this.userTaskId}`;
      const reviewId = `reviewId=${this.reviewId}`;
      return `${path}${taskId}&${isResubmit}&${userTaskId}&${reviewId}`;
    },
    userInfo() {
      return this.$store.state.account.info;
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
  },
  watch: {
    'userInfo.id'() {
      this.updateReviewTimeoutTask();
    },
  },
  methods: {
    buildImageArray(list) {
      return list.map(item => window.API_CONFIG['qiniu_download'] + item);
    },
    // 根据ID获取审核的任务
    async getReviewTaskDetail() {
      const userId = this.userInfo.id;
      const params = {
        taskId: this.taskId,
        userId: userId,
        userTask: this.userTaskId,
        reviewId: this.reviewId,
      };
      const res = await TasksProxy.getReviewTaskDetail(params);
      if (res.success) {
        let { images } = res.data.reviewDetail;
        const { steps } = res.data;
        if (images && steps) {
          const fullSteps = [];
          images = JSON.parse(images);
          steps.forEach((item) => {
            for (const id in images) {
              if (+item.id === (+id)) {
                fullSteps.push({
                  id: id,
                  stepImage: item.image ? window.API_CONFIG['qiniu_download'] + item.image : '',
                  reviewImage: this.buildImageArray(images[id]),
                  text: item.text,
                });
              }
            }
          });
          this.steps = fullSteps;
          this.taskStatus = res.data.reviewDetail.task_status;
          this.reason = res.data.reviewDetail.remark;
          this.detail = res.data.reviewDetail;
          this.fields = res.data.reviewDetail.fields
            && res.data.reviewDetail.fields !== 'undefined'
            ? JSON.parse(res.data.reviewDetail.fields)
            : [];
        }
      }
    },
    // 处理审核超时的任务
    async updateReviewTimeoutTask() {
      const params = {
        id: this.reviewId,
        userId: this.userInfo.id,
        taskId: this.taskId,
        type: 3,
        taskType: 3,
      };
      const res = await TasksProxy.updateReviewTimeoutTask(params);
      console.info(res);
      this.getReviewTaskDetail();
    },
  },
  created() {
    this.taskId = this.$route.query.taskId;
    this.userTaskId = this.$route.query.userTaskId;
    this.reviewId = this.$route.query.reviewId;
    if (this.userInfo && this.userInfo.id) {
      this.updateReviewTimeoutTask();
    }
  },
};
</script>

<style lang="less" scoped>
  .review-detail-page {
    padding-bottom: 60px;
    .task-notice {
      background-color: bisque;
      color: orange;
      text-align:center;
      padding:10px;
      display:flex;
      justify-content:center;
    }
    .title {
      color: #333;
      font-size: 18px;
    }
    .task-step,
    .account-info {
      margin:10px;
      background:#fff;
      padding:10px;
      border-radius: 2px;
      color: #555;
    }
    .account-info .section {
      margin:10px 0;
      font-size: 16px;
      border-bottom:0.5px solid #eee;
    }
    .item-image img {
      width: 31.33%;
      height: 140px;
      margin-right: 2%;
      margin-top: 5px;
      object-fit: cover;
      &:last-child {
        margin-right: 0;
      }
    }
    .item-title {
      color: #666;
      background-color: #eee;
      padding: 10px;
      margin: 10px -10px;
    }
    .grab-task {
      position: fixed;
      bottom: 0;
      left: 0;
      padding: 10px;
      box-sizing: border-box;
      width: 100%;
      background-color: #fff;
      box-shadow: 0 1px 6px 0 rgba(229,229,229,0.5);
      border-top:1px solid #eee;
      display: flex;
      justify-content: space-between;
      a {
        margin-right: 10px;
        flex: 1;
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
</style>
