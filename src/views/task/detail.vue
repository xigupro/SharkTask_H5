<template>
  <div class="task-detail-page">
    <div class="task-info">
      <van-image width="60" height="60" :src="detail.thumbnail | getQiniuFullUrl" />
      <div class="task-center">
        <div class="title">{{detail.title}}</div>
        <div class="task-label" v-if="labels.length">
          <span class="text-red" v-if="detail.created_from == 1">自营</span>
          <span v-for="(item, index) in labels" :key="index">{{item}}</span>
        </div>
      </div>
      <div class="task-right">
        <div class="package-size"></div>
        <div class="money">
          <div>+{{detail.money || 0}}<span class="small">元</span></div>
        </div>
      </div>
    </div>
    <div class="task-countdown" v-if="isGrab && endTime > 0">
      <div class="title">
        <span>将在</span>
        {{countDownText}}
        <span>后超时</span>
      </div>
    </div>
    <div class="task-status" v-if="(userTaskStatus === 2 && !repeatable) || detail.status === 3">
      <div class="title">任务审核中，请耐心等待</div>
    </div>
    <div class="task-status" v-if="detail.status === 4">
      <div class="title">任务审核不通过，{{detail.status_text}}</div>
    </div>
    <div class="task-notice">
      <div class="item">
        <span class="strong">时间限制：</span>
        <span v-if="detail.limited_time > 0">{{detail.limited_time | formatDuring}}</span>
        <span v-else>无限制</span>
      </div>
      <div class="item">
        <span class="strong">审核时间：</span>
        <span v-if="detail.review_time > 0">{{detail.review_time | formatDuring}}</span>
        <span v-else>无限制</span>
      </div>
      <div class="item">
        <span class="strong">剩余数量：</span>
        <span style="color: #f56c6c;">{{detail.quantity}}</span>
      </div>
      <div class="item" v-if="detail.autoend_at">
        <span class="strong">结束时间：</span>
        <span style="color: #f56c6c;">{{detail.autoend_at | transLocalTime}}</span>
      </div>
      <div class="item">
        <span class="strong">任务描述：</span>
        <span>{{detail.description}}</span>
      </div>
    </div>
    <div class="text-step">
      <div class="title">操作步骤</div>
      <div class="step-item" v-for="(item, index) in detail.textStep" :key="index">
        <div class="index">第{{index+1}}步</div>
        <div class="step-text">
          {{item.text}}
          <span
            class="copy-btn"
            v-if="item.copy_text"
            v-clipboard:copy="item.copy_text"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">复制</span>
        </div>
        <div style="margin-top: 6px;">
          <div class="image-item" v-for="(image, imageIndex) in item.images" :key="image">
            <video
              v-if="isVideo(image)"
              @click="previewVideo(image)"
              controls
              :src="image | getQiniuFullUrl" />
            <img v-else @click="previewImages(item.images, imageIndex)" :src="image" />
          </div>
        </div>
      </div>
    </div>
    <div class="grab-task">
      <template v-if="detail.created_by && detail.created_by == userId">
        <van-goods-action>
          <van-goods-action-icon
            v-if="detail.status == 1 || detail.status == 2"
            :icon="detail.status == 1 ? 'arrow-down' : 'arrow-up'"
            :text="detail.status == 1 ? '下架' : '上架'"
            @click="toggleSellStatus" />
          <van-goods-action-icon
            icon="replay"
            text="刷新"
            @click="refresh" />
          <van-goods-action-icon
            icon="good-job-o"
            text="推荐"
            @click="handleRecommendDialogShow" />
          <van-goods-action-icon
            icon="upgrade"
            text="置顶"
            @click="handleTopDialogShow" />
          <van-goods-action-icon
            icon="delete"
            color="red"
            text="删除"
            @click="handleTaskRemoveConfirm" />
          <van-goods-action-button
            type="primary"
            :to="{name:'task.update', params: {id:detail.id}}"
            text="编辑"
          />
        </van-goods-action>
      </template>
      <template v-else>
        <van-goods-action>
          <van-goods-action-icon
            v-if="detail.created_from != 1"
            icon="chat-o"
            text="聊天"
            @click="toChat" />
          <van-goods-action-icon
            :icon="isFavorite ? 'star' : 'star-o'"
            :text="isFavorite ? '已收藏' : '收藏'"
            @click="toggleFavorite" />
          <van-goods-action-icon
            v-if="detail.created_from != 1"
            icon="shop-o"
            text="店铺"
            @click="toShop" />
          <van-goods-action-button
            v-if="isGrab || (!repeatable && userTaskStatus === 2)"
            type="danger"
            @click="cancelTaskConfirm"
            text="取消任务"
          />
          <van-goods-action-button
            type="primary"
            disabled
            v-if="detail.status == 2"
            text="已下架"
          />
          <van-goods-action-button
            v-else-if="isGrab"
            type="primary"
            :to="goSubmitReview"
            text="去完成"
          />
          <van-goods-action-button
            type="primary"
            disabled
            v-else-if="userTaskStatus === 4 && !repeatable"
            text="已过期"
          />
          <van-goods-action-button
            type="primary"
            v-else-if="(!repeatable && userTaskStatus === 2) || (isEnd && !repeatable)"
            :to="goReviewDetail"
            text="去查看"
          />
          <van-goods-action-button
            type="primary"
            disabled
            v-else-if="detail.quantity <= 0"
            text="已被抢完"
          />
          <van-goods-action-button
            type="primary"
            :disabled="isBlock || loading"
            v-else
            @click="handleADButtonClick"
            :text="grabButtonText"
          />
        </van-goods-action>
      </template>
    </div>
    <van-dialog
      @confirm="recommend"
      v-model="recommendDialogVisible"
      title="推荐到首页"
      show-cancel-button>
      <div class="dialog-content">
      <div>
        优惠价{{systemInfo.recommend_price}}元/小时
      </div>
      <div class="number-input">
        推荐 <van-field v-model="recommend_time" type="digit" /> 小时
      </div>
      </div>
    </van-dialog>
    <van-dialog
      @confirm="top"
      v-model="topDialogVisible"
      title="任务置顶"
      show-cancel-button>
      <div class="dialog-content">
      <div>
        优惠价{{systemInfo.top_price}}元/小时
      </div>
      <div class="number-input">
        置顶 <van-field v-model="top_time" type="digit" /> 小时
      </div>
      </div>
    </van-dialog>
  </div>
</template>
<script>
import {
  Dialog,
  Button,
  Image,
  Field,
  Icon,
  GoodsAction,
  GoodsActionIcon,
  GoodsActionButton,
} from 'vant';
import TasksProxy from '@/proxies/tasks';
import RefreshProxy from '@/proxies/refresh';
import FavoriteProxy from '@/proxies/favorite';
import PreviewImage from '@/mixins/image-preview';
import VideoAD from '@/mixins/video-ad';

export default {
  name: 'task-detail',
  data() {
    return {
      detail: {},
      labels: [],
      isGrab: false,
      userTask: null,
      userTaskStatus: null,
      endTime: 0,
      clearTimer: false,
      timeFormat: ['时', '分', '秒'],
      isTimeout: false,
      countDownText: '',
      isEnd: false,
      // 是否可重复领任务
      repeatable: false,
      loading: false,
      recommendDialogVisible: false,
      topDialogVisible: false,
      recommend_time: 2,
      top_time: 2,
      isFavorite: false,
    };
  },
  mixins: [PreviewImage, VideoAD],
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Image.name]: Image,
    [Field.name]: Field,
    [Icon.name]: Icon,
    [GoodsAction.name]: GoodsAction,
    [GoodsActionIcon.name]: GoodsActionIcon,
    [GoodsActionButton.name]: GoodsActionButton,
  },
  computed: {
    grabButtonText() {
      let text = '立即领取';
      if (this.systemInfo.grab_btn_ad && this.$isApp) {
        text = '观看广告并领取';
      }
      if (this.isBlock) {
        text = '你已被冻结';
      }
      return text;
    },
    userInfo() {
      return this.$store.state.account.info;
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
    userId() {
      return this.$store.state.account.info.id;
    },
    // 用户被禁用则不可抢任务
    isBlock() {
      return this.$store.state.account.info.status === 2;
    },
    taskId() {
      return this.$route.params.id;
    },
    goSubmitReview() {
      return `/review/submit?userTaskId=${this.userTask}&taskId=${this.taskId}&reviewId=${this.detail.review_id}`;
    },
    goReviewDetail() {
      return `/review/detail?userTaskId=${this.userTask}&taskId=${this.taskId}&reviewId=${this.detail.review_id}`;
    },
  },
  watch: {
    '$store.state.account.info.id'() {
      this.getTaskDetail();
    },
  },
  destroyed() {
    this.$toast.clear();
  },
  methods: {
    // 广告按钮点击事件
    handleADButtonClick() {
      if (this.systemInfo.grab_btn_ad && this.$isApp) {
        // 设置了广告ID，且在APP里打开，则展示激励视频
        this.rewardedVideoAd(this.systemInfo.grab_btn_ad, this.grabTask, true);
      } else {
        this.grabTask();
      }
    },
    // 去聊天
    toChat() {
      this.$store
        .dispatch('checkoutConversation', `C2C${this.detail.created_by}`)
        .then(() => {
          this.$router.push({ name: 'im.chat' })
        }).catch(() => {
          this.$toast({
            message: '没有找到该用户',
            type: 'warning',
          })
        })
    },
    toShop() {
      this.$router.push({
        name: 'shop.index',
        params: {
          id: this.detail.created_by,
        },
      });
    },
    cancelTaskConfirm() {
      Dialog.confirm({
        message: '确定取消任务吗？',
      }).then(() => {
        this.cancelTask();
      });
    },
    // 取消任务
    async cancelTask() {
      const params = {
        user_task_id: this.userTask,
        task_id: this.taskId,
        id: this.detail.review_id || '', // review id
      };
      const res = await TasksProxy.reviewRemove(params);
      if (res.success) {
        this.$toast('取消成功');
        this.getTaskDetail();
      }
    },
    refresh() {
      if (this.userInfo.refresh_count < 1) {
        this.$toast('可刷新次数为0，请购买');
        setTimeout(() => {
          this.$router.push({
            name: 'refresh.index',
          });
        }, 800);
        return;
      }
      Dialog.confirm({
        title: '提示',
        message: '刷新任务会在一段时间内提升排名，将消耗一次刷新次数，是否确定？',
        beforeClose: async (action, done) => {
          if (action === 'confirm') {
            const params = {
              id: this.taskId,
              user_id: this.userInfo.id,
            };
            const res = await RefreshProxy.doRefresh(params);
            done();
            if (res.success) {
              this.$toast(res.message);
              // 更新用户信息
              this.$store.dispatch('account/find', {
                userId: this.userInfo.id,
              });
            }
          } else {
            done();
          }
        },
      });
    },
    handleRecommendDialogShow() {
      this.recommendDialogVisible = true;
    },
    handleTopDialogShow() {
      this.topDialogVisible = true;
    },
    async recommend() {
      if (this.recommend_time <= 0) {
        this.$toast('请输入大于0的数字');
        return;
      }
      const money = this.systemInfo['recommend_price'] * this.recommend_time;
      if (this.userInfo.account_amount < money) {
        this.$toast('余额不足，请充值');
        setTimeout(() => {
          this.$router.push({
            name: 'recharge.index',
          });
        }, 800);
        return;
      }
      const now = new Date().getTime();
      // 推荐过期时间 判断上次推荐时间，如果未过期，则叠加
      const recommendTimeout = this.detail.recommend_timeout > now
        ? +this.detail.recommend_timeout + (this.recommend_time * 60 * 60 * 1000)
        : now + (this.recommend_time * 60 * 60 * 1000);
      const params = {
        id: this.taskId,
        user_id: this.userInfo.id,
        time: recommendTimeout,
        money,
      };
      const res = await RefreshProxy.recommend(params);
      if (res.success) {
        this.$toast(res.message);
        // 更新用户信息
        this.$store.dispatch('account/find', {
          userId: this.userInfo.id,
        });
        this.getTaskDetail();
      }
    },
    async top() {
      if (this.top_time <= 0) {
        this.$toast('请输入大于0的数字');
        return;
      }
      const money = this.systemInfo['top_price'] * this.top_time;
      if (this.userInfo.account_amount < money) {
        this.$toast('余额不足，请充值');
        setTimeout(() => {
          this.$router.push({
            name: 'recharge.index',
          });
        }, 800);
        return;
      }
      const now = new Date().getTime();
      // 置顶过期时间 判断上次推荐时间，如果未过期，则叠加
      const topTimeout = this.detail.top_timeout > now
        ? +this.detail.top_timeout + (this.top_time * 60 * 60 * 1000)
        : now + (this.top_time * 60 * 60 * 1000);
      const params = {
        id: this.taskId,
        user_id: this.userInfo.id,
        time: topTimeout,
        money,
      };
      const res = await RefreshProxy.top(params);
      if (res.success) {
        this.$toast(res.message);
        // 更新用户信息
        this.$store.dispatch('account/find', {
          userId: this.userInfo.id,
        });
        this.getTaskDetail();
      }
    },
    getFullUrl(val) {
      if (!val || val === 'undefined') {
        return '';
      }
      return `${window.API_CONFIG['qiniu_download']}${val}`;
    },
    onCopy() {
      this.$toast('复制成功');
    },
    onError() {
      this.$toast('复制失败');
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
          this.isGrab = false;
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
    handleTaskRemoveConfirm() {
      Dialog.confirm({
        title: '删除确认',
        message: '删除后将退还剩余佣金，已被领取的任务依然有效，且其佣金和服务费不退还，是否删除？',
      }).then(() => {
        this.handleTaskRemove();
      });
    },
    // 发布者删除任务
    async handleTaskRemove() {
      const params = {
        taskId: this.taskId,
      };
      const res = await TasksProxy.removeTask(params);
      if (res.success) {
        this.$toast('删除成功，佣金已退还');
        setTimeout(() => {
          this.$router.go(-1);
        }, 1000);
      }
    },
    // 上架下架
    async toggleSellStatus() {
      const params = {
        taskId: this.taskId,
        creator: this.userId,
        status: this.detail.status === 1 ? 2 : 1,
      };
      const res = await TasksProxy.updateStatus(params);
      if (res.success) {
        this.$toast(res.message);
        this.getTaskDetail();
      }
    },
    async getTaskDetail() {
      this.loading = true;
      const params = {
        id: this.taskId,
        userId: this.userId || 0, // 0为未登录的情况
      };
      const res = await TasksProxy.getTaskDetail(params);
      this.loading = false;
      if (!res.fail) {
        this.getIsFavorite();
        this.detail = res.data;
        let isGrab = false;
        let userTask = null;
        let endTime = null;
        let userTaskStatus = null;
        let isEnd = false;
        if (res.data.userTask) {
          // 已领取
          isGrab = res.data.userTask.status === 1;
          userTask = res.data.userTask.id;
          userTaskStatus = res.data.userTask.status;
          endTime = res.data.userTask.end_time;
          if ((new Date().getTime() > endTime && endTime > 0) || userTaskStatus === 3) {
            // 当前时间大于结束时间且结束时间大于0，或者任务状态是4，则表示已过期
            // 结束时间小于等于0表示任务无时间限制
            isEnd = true;
          }
          if (isGrab && endTime > 0) {
            this.countDown(endTime);
          }
        } else {
          if (res.data.deleted) {
            this.$toast({
              message: '任务已被删除',
              mask: true,
              forbidClick: true,
              type: 'fail',
              duration: 0,
            });
          }
        }
        this.labels = res.data.labels ? res.data.labels.split(',') : [];
        this.isGrab = isGrab;
        this.userTask = userTask;
        this.userTaskStatus = userTaskStatus;
        this.endTime = endTime;
        this.isEnd = isEnd;
        this.repeatable = !!res.data.repeatable;
        // 判断显示任务快照或是任务最新值
        if (this.isGrab
              || (this.userTaskStatus === 4 && !this.repeatable)
              || ((!this.repeatable && this.userTaskStatus === 2)
              || (this.isEnd && !this.repeatable))) {
          // 已领取，读取任务快照
          res.data.userTask.textStep = res.data.userTask.textStep
            ? JSON.parse(res.data.userTask.textStep.replace(/[\f\n\r\t\v]/g, ''))
            : [];
          res.data.userTask.textStep.forEach((item) => {
            item.images = item.images ? item.images.split(',') : [];
            item.images = item.images.map(image => this.getFullUrl(image));
          });
          // 剩余数量和任务状态使用任务最新的值
          res.data.userTask.quantity = res.data.quantity;
          res.data.userTask.status = res.data.status;
          this.detail = res.data.userTask;
        } else {
          // 未领取过，读取任务原始详情
          res.data.textStep.forEach((item) => {
            item.images = item.images ? item.images.split(',') : [];
            item.images = item.images.map(image => this.getFullUrl(image));
          });
          this.detail = res.data;
        }
        this.$store.dispatch('task/detail', res.data);
      }
    },
    // 抢任务
    async grabTask() {
      const taskLimit = this.userInfo.task_limit;
      if (!this.userInfo.is_certified && this.systemInfo.need_certification) {
        // 如果用户未通过认证，且系统需要认证后才可领取任务，则弹窗提示
        Dialog.confirm({
          message: '您尚未通过实名认证，是否现在去提交？',
        }).then((action) => {
          if (action) {
            this.$router.push({
              name: 'certification.index',
            });
          }
        });
        return;
      }
      if (taskLimit === 0) {
        // 如果没有领取数量了
        this.$toast('可领任务数量为0, 请联系客服');
        return;
      }
      const params = {
        id: this.taskId,
        userId: this.userId,
      };
      this.loading = true;
      const res = await TasksProxy.grabTask(params);
      if (!res.fail) {
        this.getTaskDetail();
        this.$store.dispatch('account/update', {
          ...this.$store.state.account.info,
          task_limit: taskLimit - 1,
        });
        Dialog.confirm({
          message: '恭喜抢到任务，是否去上传审核内容?',
        }).then((action) => {
          if (action) {
            this.$router.push({
              path: `/review/submit?userTaskId=${this.userTask}&taskId=${this.taskId}`,
            });
          }
        });
      } else {
        this.loading = false;
      }
    },
    // 收藏/取消收藏
    async toggleFavorite() {
      const params = {
        task_id: this.taskId,
        user_id: this.userInfo.id,
        type: 1,
      };
      const res = await FavoriteProxy[this.isFavorite ? 'remove' : 'add'](params);
      if (res.success) {
        this.getIsFavorite();
      }
    },
    // 是否已收藏
    async getIsFavorite() {
      if (!this.userId) {
        return;
      }
      const params = {
        task_id: this.taskId,
        user_id: this.userId,
        type: 1,
      };
      const res = await FavoriteProxy.isFavorite(params);
      if (res.success) {
        this.isFavorite = res.data;
      }
    },
  },
  mounted() {
    this.getTaskDetail();
  },
};
</script>

<style lang="less">
  .task-detail-page {
    padding-bottom: 80px;
    .copy-btn {
      color: dodgerblue;
      margin: 0 10px;
      word-break: keep-all;
    }
    .task-info {
      background-color: #fff;
      padding: 15px;
      display: flex;
      font-size: 14px;
      position: relative;
      overflow: hidden;
      .van-image {
        flex-shrink: 0;
      }
      img {
        border-radius: 5px;
      }
    }
    .task-center {
      flex-grow: 1;
      margin-left: 10px;
    }
    .task-status,
    .task-countdown,
    .task-notice,
    .image-step,
    .text-step {
      margin: 10px;
      background-color: #fff;
      border-radius: 2px;
      -webkit-border-radius: 2px;
      -moz-border-radius: 2px;
      -ms-border-radius: 2px;
      -o-border-radius: 2px;
      color: #666;
      font-size: 14px;
      box-shadow: 0 1px 6px 0 rgba(229,229,229,0.5);
      padding: 10px;
    }
    .task-notice .item {
      margin-bottom: 8px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .text-step button {
      margin:0;
      min-width: 50px;
      white-space: nowrap;
    }
    .step-text {
      margin: 6px 0;
      word-break: break-word;
    }
    .title {
      color: #333;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .task-countdown {
      text-align: center;
    }
    .task-countdown .title {
      color: #000;
      font-size: 18px;
      font-weight: 400;
      margin: 10px 0;
      display: flex;
      justify-content: center;
    }
    .task-status .title {
      font-weight: bold;
      text-align: center;
    }
    .task-notice .strong {
      color: #333;
      font-weight: bold
    }
    .task-label {
      font-size: 12px;
      span {
        border: 1px solid orange;
        border-radius: 3px;
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        -ms-border-radius: 3px;
        -o-border-radius: 3px;
        color: orange;
        margin-right: 3px;
        margin-top: 3px;
        display: inline-block;
        padding: 0 3px;
        white-space: nowrap;
        &.text-red {
          color: #F56C6C;
          border-color: #F56C6C;
        }
      }
    }
    .money {
      color: #F56C6C;
      font-size: 28px;
      text-align: right;
      white-space: nowrap;
    }
    .money .small {
      font-size: 14px;
    }
    .step-scroll {
      height: 100px;
      margin: 20px 0;
      white-space: nowrap;
      width: 100%;
    }
    .text-step .image-item,
    .image-step .step-item {
      width: 32.33%;
      height: 120px;
      display:inline-block;
      border-radius: 5px;
      margin-right: 1%;
      -webkit-border-radius: 5px;
      -moz-border-radius: 5px;
      -ms-border-radius: 5px;
      -o-border-radius: 5px;
      border:1px solid #eee;
      box-sizing:border-box;
      &:nth-child(3n) {
        margin-right: 0;
      }
      img, video {
        width: 100%;
        object-fit: cover;
        height: 100%;
      }
    }
    .text-step .step-item {
      margin-top: 15px;
    }
    .step-item .index {
      background-color: #eee;
      height: 25px;
      line-height: 25px;
      padding: 2px 6px;
      text-align: center;
      display: inline-block;
    }
    .grab-task {
      position: fixed;
      bottom: 0;
      left: 0;
      padding: 10px;
      width: 100%;
      box-sizing: border-box;
      background-color: #fff;
      box-shadow: 0 1px 6px 0 rgba(229,229,229,0.5);
      border-top:1px solid #eee;
      display: flex;
      align-items: center;
      .actions {
        display: flex;
        justify-content: space-around;
        min-width: 100%;
      }
    }
    .dialog-content {
      padding: 0 10px;
    }
    .number-input {
      justify-content: center;
      align-items: center;
      display: flex;
      .van-field {
        width: 100px;
        border: 1px solid #eee;
        margin: 10px;
        padding: 5px 16px;
      }
    }
  }
</style>
