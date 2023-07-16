<!--提交审核-->
<template>
<div class="submit-review-page">
  <div class="task-notice" v-if="showCountDown">
    <template v-if="!isTimeout">
    <span>将在</span>
    {{countDownText}}
    <span>后超时，请抓紧时间完成</span>
    </template>
    <template v-else-if="isSubmited">
      <span>已提交审核，请耐心等待</span>
    </template>
    <template v-else>
      <span>未在限定时间内完成任务，已过期</span>
    </template>
  </div>
  <div class="task-info shadow">
    <van-image width="60" height="60" :src="taskThumbnail | getQiniuFullUrl" />
    <div class="task-center">
      <div class="title">{{taskName}}</div>
    </div>
    <div class="task-right">
      <div class="money">+{{taskMoney}}<span class="small">元</span></div>
    </div>
  </div>
  <div class="task-step shadow" v-if="fields && fields.length">
    <van-cell-group>
      <van-field
        v-for="(item, index) in fields"
        :key="`field${index}`"
        maxlength="255"
        :label="item.name"
        v-model="item.reviewValue"
        :placeholder="item.placeholder"
      />
    </van-cell-group>
  </div>
  <div class="task-step shadow">
    <div class="title">审核步骤</div>
    <div class="item" v-for="(item, index) in steps" :key="index">
      <div class="item-title">
        {{index + 1}}.{{item.text || ''}}
        <span
          class="copy-btn"
          v-if="item.copy_text"
          v-clipboard:copy="item.copy_text"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError">复制</span>
      </div>
      <div class="inline-title" v-if="item.image">示例图</div>
      <div class="item-image">
        <img class="shadow" v-if="item.image" :src="item.image | getQiniuFullUrl" />
        <div class="upload">
          <vue-core-image-upload
            :crop="false"
            @imageuploaded="(res)=>{return handleImageUploaded(res, item.id)}"
            @imagechanged="handleImageSelected"
            @errorhandle="handleUploadError"
            :data="qiniuData"
            inputOfFile="file"
            inputAccept="image/*"
            :max-file-size="10485760"
            text="添加图片"
            :credentials="false"
            :url="uploadServer" >
          </vue-core-image-upload>
        </div>
      </div>
      <div class="review-image" v-if="uploadPicture[item.id] && uploadPicture[item.id].length">
        <div class="inline-title">你提交的审核图</div>
        <div class="step-scroll">
          <div class="image-item" v-for="image in uploadPicture[item.id]" :key="image">
            <van-icon class="remove-image" @click="removeImage(item.id, image)" name="clear" />
            <img :src="image | getQiniuFullUrl" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="grab-task">
    <div v-if="isTimeout && endTime > 0">
      <van-button type="primary" size="large" :disabled="isTimeout">已过期</van-button>
    </div>
    <div v-else-if="isSubmited">
      <van-button type="primary" size="large" :disabled="isSubmited">已提交审核</van-button>
    </div>
    <div class="actions" v-else>
      <van-button :loading="isSubmiting" @click="submitTaskReview(1)" type="primary">
        提交审核
      </van-button>
      <van-button :loading="isSubmiting" @click="submitTaskReview(4)">保存草稿</van-button>
    </div>
  </div>
</div>

</template>
<script>
import {
  Dialog,
  Button,
  Icon,
  Field,
  CellGroup,
  Image,
} from 'vant';
import VueCoreImageUpload from 'vue-core-image-upload/dist/vue-core-image-upload';
import CommonProxy from '@/proxies/common';
import TasksProxy from '@/proxies/tasks';

export default {
  data() {
    return {
      uploadPicture: {},
      uploadServer: window.API_CONFIG['qiniu_upload'],
      qiniuData: {
        token: '',
      },
      taskId: '',
      isTimeout: false,
      endTime: 0,
      showCountDown: false,
      steps: [],
      fields: [],
      clearTimer: false,
      timeFormat: ['时', '分', '秒'],
      countDownText: '',
      dialogVisible: false,
      successDialogVisible: false,
      // 是否是审核失败重新提审过来的
      isResubmit: false,
      isUpdate: false,
      isSubmited: false,
      userTask: null,
      reviewId: '',
      actionStatus: 1,
      isSubmiting: false,
      taskCreator: null,
      taskThumbnail: '',
      taskName: '',
      taskMoney: 0,
    };
  },
  components: {
    'vue-core-image-upload': VueCoreImageUpload,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Icon.name]: Icon,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Image.name]: Image,
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
  },
  watch: {
    '$store.state.account.info.id'() {
      if (!this.isResubmit && this.userId) {
        // 如果是审核失败重新提审的，就不显示倒计时了
        this.getTaskDetail();
      }
    },
  },
  methods: {
    onCopy() {
      this.$toast('复制成功');
    },
    onError() {
      this.$toast('复制失败');
    },
    removeImage(id, image) {
      this.uploadPicture[id] = this.uploadPicture[id].filter(item => item !== image);
    },
    // 倒计时
    countDown(timeStr) {
      const checkTime = (i) => { // 将0-9的数字前面加上0，例1变为01
        if (i < 10) {
          i = `0${i}`;
        }
        return i;
      };
      const interval = setInterval(() => {
        const nowTime = new Date(timeStr) - new Date();
        if (nowTime <= 0) {
          clearInterval(interval);
          this.isTimeout = true;
        } else {
          let minutes = parseInt((nowTime / 1000 / 60) % 60, 10);// 计算剩余的分钟
          let seconds = parseInt((nowTime / 1000) % 60, 10);// 计算剩余的秒数
          minutes = checkTime(minutes);
          seconds = checkTime(seconds);
          let days = parseInt(nowTime / 1000 / 60 / 60 / 24, 10); // 计算剩余的天数
          let hours = parseInt((nowTime / 1000 / 60 / 60) % 24, 10); // 计算剩余的小时
          days = checkTime(days);
          hours = checkTime(hours);
          this.countDownText = `${days}天${hours}小时${minutes}分${seconds}秒`;
        }
      }, 1000);
    },
    gotoHome() {
      this.$router.replace({
        path: '/home',
      });
    },
    // 去个人中心》我的任务
    gotoMyTasks() {
      this.$router.replace({
        name: 'grabbed.index',
      });
    },
    // 提交任务审核
    submitTaskReview(status) {
      this.actionStatus = status;
      if (status === 1) {
        // 如果上传的图片不够，则提示
        const keyLength = Object.keys(this.uploadPicture).length;
        const valueLength = Object.values(this.uploadPicture).filter(item => !!item.length).length;
        if ((valueLength !== keyLength) || (keyLength < this.steps.length)) {
          this.$toast('有步骤未上传图片，请检查');
          return;
        }
        if (this.fields.some(item => !item.reviewValue)) {
          this.$toast('信息尚未填写完整，请检查');
          return;
        }
        Dialog.confirm({
          title: '温馨提示',
          message: '审核期间无法修改内容，是否确认提交',
        }).then(() => {
          this.handleDialogSubmit();
        });
      } else if (status === 4) {
        this.handleDialogSubmit();
      }
    },
    // 提交审核
    async handleDialogSubmit() {
      const params = {
        images: JSON.stringify(this.uploadPicture),
        fields: this.fields,
        taskId: this.taskId,
        userId: this.userId,
        userTask: this.userTask,
        reviewId: this.reviewId,
        status: this.actionStatus,
        taskCreator: this.taskCreator,
      };
      this.isSubmited = true;
      const res = await TasksProxy[this.isResubmit || this.isUpdate ? 'updateTaskReview' : 'submitTaskReview'](params);
      this.isSubmited = false;
      if (!res.fail) {
        if (!this.isResubmit && !this.isUpdate && res.data) {
          // 首次提交，包括直接提交和保存草稿，则将返回值data里的reviewId赋值
          this.reviewId = res.data;
        }
        if (params.status === 1) {
          this.isSubmited = true;
          setTimeout(() => {
            Dialog.confirm({
              title: '温馨提示',
              message: '已提交审核，可在我的任务查看',
              confirmButtonText: '去查看',
              cancelButtonText: '做任务',
              closeOnClickOverlay: true,
            }).then(() => {
              this.gotoMyTasks();
            }).catch(() => {
              this.gotoHome();
            });
          }, 300);
        } else if (params.status === 4) {
          this.isUpdate = true;
          this.$toast('保存成功');
        }
      }
    },
    // 倒计时结束
    limitTimeout() {
      if (this.steps instanceof Array) {
        console.info('timeout');
        this.setData({
          isTimeout: true,
        });
      }
    },
    // 获取任务详情
    async getTaskDetail() {
      const params = {
        id: this.userTask,
        userId: this.userId,
      };
      const res = await TasksProxy.userTaskDetail(params);
      if (!res.fail) {
        this.endTime = res.data.end_time;
        this.taskCreator = res.data.created_by;
        this.countDown(this.endTime);
        // 时间限制小于或等于0，表示无时间限制
        this.showCountDown = !this.isResubmit && res.data.limited_time > 0;
        this.taskThumbnail = res.data.thumbnail;
        this.taskName = res.data.title;
        this.taskMoney = res.data.money;
        this.steps = res.data.reviewStep;
        this.fields = res.data.reviewField;
        if (this.reviewId) {
          this.isUpdate = true;
          this.getReviewTaskDetail();
        }
      }
    },
    // 根据ID获取审核的任务
    async getReviewTaskDetail() {
      const params = {
        taskId: this.taskId,
        userId: this.userId,
        userTask: this.userTask,
        reviewId: this.reviewId,
      };
      const res = await TasksProxy.getReviewTaskDetail(params);
      if (!res.fail) {
        const { images, fields } = res.data.reviewDetail;
        this.uploadPicture = images ? JSON.parse(images) : {};
        this.fields = fields && fields !== 'undefined' ? JSON.parse(fields) : [];
      }
    },
    async getQiniuToken() {
      const res = await CommonProxy.getQiniuUploadToken();
      if (!res.fail) {
        this.qiniuData.token = res.data.uptoken;
      }
    },
    // 图片选择事件
    handleImageSelected() {
      this.$toast.loading({
        message: '上传中...',
        forbidClick: true,
        duration: 0,
        closeOnClick: true,
      });
    },
    // 截图上传到七牛
    handleImageUploaded(res, id) {
      setTimeout(() => {
        this.$toast('上传成功');
      }, 800);
      if (this.uploadPicture[id] instanceof Array) {
        this.uploadPicture[id].push(res.key);
      } else {
        this.$set(this.uploadPicture, id, [res.key]);
      }
    },
    handleUploadError(error) {
      this.$toast(error);
    },
  },
  created() {
    this.getQiniuToken();
  },
  mounted() {
    this.taskId = this.$route.query.taskId;
    this.isResubmit = !!(+this.$route.query.isResubmit);
    this.userTask = this.$route.query.userTaskId;
    this.reviewId = this.$route.query.reviewId === 'undefined' || this.$route.query.reviewId === 'null' ? '' : this.$route.query.reviewId;
    if (this.userTask && this.userId) {
      // 如果是审核失败重新提审的，就不显示倒计时了
      this.getTaskDetail();
    }
  },
};
</script>

<style lang="less" scoped>
.submit-review-page {
  padding-bottom: 60px;
  overflow-x: hidden;
  .inline-title {
    margin: 10px 0;
    font-size: 14px;
    border-left: 4px solid #2cbdfb;
    color: #303133;
    padding-left: 5px;
  }
  .task-info {
    background-color: #fff;
    padding: 15px;
    display: flex;
    align-items: center;
    font-size: 18px;
    position: relative;
    overflow: hidden;
    img {
      border-radius: 5px;
    }
    .money {
      color: #F56C6C;
      font-size: 28px;
      text-align: right;
    }
    .money .small {
      font-size: 14px;
    }
  }
  .task-center {
    flex-grow: 1;
    margin-left: 10px;
  }
  .copy-btn {
    color: dodgerblue;
    margin: 0 10rpx;
    word-break: keep-all;
  }
  .task-notice {
    background-color: bisque;
    color: orange;
    text-align:center;
    padding:10px;
    display:flex;
    justify-content:center;
    font-size: 12px;
  }
  .task-notice i-count-down {
    margin-top: -36px;
  }
  .title {
    color: #333;
    font-size: 14px;
  }
  .task-step,
  .account-info {
    margin:10px;
    background:#fff;
    padding:10px;
    border-radius: 2px;
  }
  .account-info .section {
    margin: 10px 0;
    input {
      border: 1px solid #eee;
      padding: 10px 5px;
      width: 100%;
      box-sizing: border-box;
    }
  }
  .item-image {
    display:flex;
    align-items:center;
    margin-bottom: 20px;
  }
  .item-image img {
    max-width: 48%;
    margin: 0 1%;
    border: 1px solid #eee;
    box-sizing: border-box;
  }
  .task-step .upload {
    padding: 5px 10px;
    text-align: center;
    flex-grow: 1;
    height: 40px;
    line-height: 40px;
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
    .actions {
      display: flex;
      justify-content: space-around;
    }
  }
  .review-image .image-item {
    width: 31.33%;
    height: 100px;
    display:inline-block;
    border-radius: 5px;
    margin-right: 2%;
    margin-top: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    -ms-border-radius: 5px;
    -o-border-radius: 5px;
    box-sizing:border-box;
    position: relative;
    &:nth-child(3n) {
      margin-right: 0;
    }
  }
  .image-item .remove-image{
    position: absolute;
    z-index: 1;
    top: -6px;
    right: -6px;
    color: #969799;
    font-size: 18px;
    background-color: #fff;
    border-radius: 100%;
  }
  .image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

</style>
