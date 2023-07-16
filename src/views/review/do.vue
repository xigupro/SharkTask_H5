<!--审核任务-->
<template>
  <div class="review-detail-page">
    <div class="task-notice">
      <span v-if="detail.status === 1">待审核</span>
      <span v-else-if="detail.status === 2">审核通过</span>
      <span v-else-if="detail.status === 3">审核失败：{{remark}}</span>
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
          <div class="inline-title">用户提交的审核图</div>
          <img
            @click="previewImages(item.reviewImage, imageIndex)"
            class="shadow"
            v-for="(image, imageIndex) in item.reviewImage"
            :src="image"
            :key="image" />
        </div>
      </div>
    </div>
    <template v-if="detail.deleted">
      <div class="action-panel">
        <van-button size="small">已取消</van-button>
      </div>
    </template>
    <template v-else>
      <div class="action-panel" v-if="detail.status == 1">
        <van-button @click="rejectConfirm" size="small">驳回</van-button>
        <van-button @click="resolveConfirm" size="small" type="primary">通过</van-button>
      </div>
      <div class="action-panel" v-else-if="detail.status == 3">
        <van-button @click="removeConfirm" size="small">取消任务</van-button>
      </div>
    </template>
    <van-popup
      v-model="rejectDialogVisible"
      position="bottom"
      :style="{ height: '20%' }">
      <div class="form">
        <van-field v-model="remark" placeholder="请输入驳回理由" />
        <van-button
          :disabled="isSubmiting"
          @click="reject"
          size="large"
          type="primary">确定</van-button>
      </div>
    </van-popup>
  </div>

</template>
<script>
import {
  Button,
  Dialog,
  Popup,
  Field,
} from 'vant';
import TasksProxy from '@/proxies/tasks';
import PreviewImage from '@/mixins/image-preview';

export default {
  data() {
    return {
      taskId: '',
      userId: null,
      reviewId: null,
      steps: [],
      fields: [],
      taskStatus: null,
      remark: '',
      detail: {},
      rejectDialogVisible: false,
      isSubmiting: false,
    };
  },
  mixins: [PreviewImage],
  components: {
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
    [Popup.name]: Popup,
    [Field.name]: Field,
  },
  created() {
    this.taskId = this.$route.query.task_id;
    this.userId = this.$route.query.user_id;
    this.reviewId = this.$route.query.review_id;
    this.getReviewDetailForUser();
  },
  computed: {
    userInfo() {
      return this.$store.state.account.info;
    },
  },
  methods: {
    rejectConfirm() {
      this.rejectDialogVisible = true;
    },
    async reject() {
      if (this.isSubmiting) {
        // 防止重复调用
        return;
      }
      if (!this.remark) {
        this.$toast('请输入驳回理由');
        return;
      }
      this.isSubmiting = true;
      const params = {
        id: this.reviewId,
        userId: this.userId,
        taskId: this.taskId,
        remark: this.remark,
        reviewBy: this.userInfo.id,
        reviewRole: 1,
      };
      const res = await TasksProxy.reviewReject(params);
      setTimeout(() => {
        this.isSubmiting = false;
      }, 1000);
      if (res.success) {
        this.rejectDialogVisible = false;
        this.getReviewDetailForUser();
      }
    },
    resolveConfirm() {
      Dialog.confirm({
        title: '操作确认',
        message: '是否确认审核通过',
        beforeClose: this.resolve,
      });
    },
    removeConfirm() {
      Dialog.confirm({
        title: '取消任务',
        message: '取消后用户仍可发起申诉，是否取消?',
        beforeClose: this.remove,
      });
    },
    async remove(action, done) {
      if (action !== 'confirm') {
        done();
        return;
      }
      if (this.isSubmiting) {
        // 防止重复调用
        return;
      }
      this.isSubmiting = true;
      const params = {
        id: this.reviewId,
        task_id: this.taskId,
      };
      const res = await TasksProxy.reviewRemove(params);
      setTimeout(() => {
        this.isSubmiting = false;
      }, 1000);
      if (res.success) {
        done();
        this.$router.go(-1);
      }
    },
    async resolve(action, done) {
      if (action !== 'confirm') {
        done();
        return;
      }
      if (this.isSubmiting) {
        // 防止重复调用
        return;
      }
      this.isSubmiting = true;
      const params = {
        id: this.reviewId,
        userId: this.userId,
        taskId: this.taskId,
        type: 3,
        taskType: 3,
        reviewBy: this.userInfo.id,
        reviewRole: 1,
      };
      const res = await TasksProxy.reviewResolve(params);
      setTimeout(() => {
        this.isSubmiting = false;
      }, 1000);
      if (res.success) {
        done();
        this.getReviewDetailForUser();
      }
    },
    buildImageArray(list) {
      return list.map(item => window.API_CONFIG['qiniu_download'] + item);
    },
    // 根据ID获取审核的任务
    async getReviewDetailForUser() {
      const params = {
        reviewId: this.reviewId,
        taskId: this.taskId,
      };
      const res = await TasksProxy.getReviewDetailForUser(params);
      if (!res.fail) {
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
          this.remark = res.data.reviewDetail.remark;
          this.detail = res.data.reviewDetail;
          this.fields = res.data.reviewDetail.fields
            && res.data.reviewDetail.fields !== 'undefined'
            ? JSON.parse(res.data.reviewDetail.fields)
            : [];
        }
      }
    },
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
    .action-panel {
      position: fixed;
      padding: 10px 0;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: #fff;
      box-shadow: 0 1px 6px 0 rgba(229,229,229,0.5);
      border-top:1rpx solid #eee;
      display: flex;
      justify-content: space-around;
    }
    .form {
      padding: 15px;
      .van-field {
        margin-bottom: 15px;
        border: 1px solid #eee;
      }
    }
  }
</style>
