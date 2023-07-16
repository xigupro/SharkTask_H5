<template>
  <div class="ucenter-page">
    <van-pull-refresh
      v-model="isLoading"
      success-text="刷新成功"
      @refresh="onRefresh">
      <div class="header">
        <div>
          <router-link :to="{name: 'message.list'}">
            <van-icon
              :badge="unreadCount > 99 ? '99+' : (unreadCount || '')"
              size="20px"
              color="#564f5f"
              name="bell" />
          </router-link>
          <router-link :to="{name: 'sign.index'}" style="margin-left: 25px">
            <van-icon size="20px" color="#564f5f" name="sign" />
          </router-link>
        </div>
        <router-link :to="{name: 'account.index'}">
          <van-icon size="20px" color="#564f5f" name="setting-o" />
        </router-link>
      </div>
      <div class="user-info">
        <div class="avatar-panel">
          <vue-core-image-upload
            :crop="false"
            @imageuploaded="(res)=>{return handleImageUploaded(res)}"
            @imagechanged="handleImageSelected"
            @errorhandle="handleUploadError"
            :data="qiniu"
            inputOfFile="file"
            inputAccept="image/*"
            :max-file-size="10485760"
            :credentials="false"
            :url="uploadServer" >
            <img
            class="user-avatar"
            :src="userInfo.avatar | getAvatarUrl">
          </vue-core-image-upload>
        </div>
        <div class="user-text">
          <div class="user-nickname">
            {{userInfo.nick_name || userInfo.username}}
            <span style="color:red;" v-if="userInfo.status === 2">（已冻结）</span>
          </div>
          <div class="user-label">
            <template v-if="systemInfo.show_certification">
              <van-tag
                size="medium"
                color="#6040c1"
                v-if="userInfo.is_certified"
                round
                @click="toCertificate">
                已认证
              </van-tag>
              <van-tag size="medium" color="#ccc" v-else round @click="toCertificate">未认证</van-tag>
            </template>
            <van-tag
              size="medium"
              color="#ebebfb"
              text-color="#444"
              round
              @click="showTaskCountInfo">
              <van-icon size="16px" name="fire" color="#9998e9" />
              {{taskCount}}
            </van-tag>
            <van-tag
              size="medium"
              color="#554f5e"
              text-color="#fff"
              round
              @click="toPartner">
              <van-icon size="16px" name="diamond" color="#d5b17d" />
              {{userInfo.level_info.name}}
            </van-tag>
          </div>
        </div>
        <div class="user-id" v-if="userInfo.id">
          ID: <span
              v-if="userInfo.id"
              v-clipboard:copy="userInfo.id"
              v-clipboard:success="onCopy"
              v-clipboard:error="onError">{{userInfo.id}}</span>
        </div>
        <router-link to="/account">
          <van-icon name="arrow" color="#aaa" />
        </router-link>
      </div>
      <div class="money">
        <router-link to="/grabbed/index" class="money-item">
          <div class="number">
            {{unfinishedMoney || 0}}<span class="small">元</span>
          </div>
          <div class="text">待完成</div>
        </router-link>
        <div class="money-item">
          <div class="number red">
            {{userInfo.account_amount || 0}}<span class="small">元</span>
          </div>
          <div class="text">总余额</div>
        </div>
        <router-link to="/withdraw/list" class="money-item">
          <div class="number">
            {{userInfo.withdraw_amount || 0}}<span class="small">元</span>
          </div>
          <div class="text">提现中</div>
        </router-link>
        <div class="money-item">
          <div class="number">
            <span>{{userInfo.score || 0}}</span>
          </div>
          <div class="text">积分</div>
        </div>
      </div>
      <div class="link-plus">
        <router-link to="/grabbed/index" class="plus-item">
          <div class="title">
            <span>我参与的</span>
            <van-icon name="arrow" color="#999" />
          </div>
          <div class="bottom-tips">总获得</div>
          <div><strong>{{totalTaskIncome}}</strong>元佣金</div>
          <div class="bottom-tips">共完成{{finishedTaskCount}}个任务</div>
        </router-link>
        <router-link v-if="showMyPublish" to="/published/index" class="plus-item">
          <div class="title">
            <span>我发布的</span>
            <van-icon name="arrow" color="#999" />
          </div>
          <div class="bottom-tips">总发放</div>
          <div><strong>{{totalTaskExpend}}</strong>元佣金</div>
          <div class="bottom-tips">共审核完{{reviewedTaskCount}}个任务</div>
        </router-link>
      </div>
      <van-swipe class="sub-swiper" :autoplay="4000">
        <van-swipe-item v-for="(item, index) in bannerList" :key="index">
          <div @click="handleEntryClick(item.url)">
            <img :src="item.image | getQiniuFullUrl">
          </div>
        </van-swipe-item>
      </van-swipe>
      <div class="links">
        <router-link
          class="link-item"
          v-if="systemInfo.show_wallet"
          to="/wallet/index">
          <van-icon size="28px" name="balance-pay" />
          <div>我的钱包</div>
        </router-link>
        <router-link
          class="link-item"
          v-if="systemInfo.show_withdraw"
          to="/withdraw/submit">
          <van-icon size="28px" name="cash-back-record" />
          <div>立即提现</div>
        </router-link>
        <router-link
          class="link-item"
          v-if="systemInfo.show_recharge"
          to="/recharge/index">
          <van-icon size="28px" name="gold-coin-o" />
          <div>立即充值</div>
        </router-link>
        <router-link
          class="link-item"
          to="/favorite/index">
          <van-icon size="28px" name="star-o" />
          <div>我的收藏</div>
        </router-link>
        <router-link
          class="link-item"
          v-if="systemInfo.show_certification"
          to="/certification/index">
          <van-icon size="28px" name="idcard" />
          <div>实名认证</div>
        </router-link>
        <router-link
          class="link-item"
          v-if="systemInfo.show_publish"
          to="/task/form">
          <van-icon size="28px" name="add-o" />
          <div>发布任务</div>
        </router-link>
        <router-link
          class="link-item"
            v-if="showMyPublish"
          to="/review/list">
          <van-icon size="28px" name="balance-list-o" />
          <div>任务审核</div>
        </router-link>
        <router-link
          class="link-item"
          :to="`/shop/${userInfo.id}`">
          <van-icon size="28px" name="shop-o" />
          <div>我的主页</div>
        </router-link>
        <router-link
          class="link-item"
          v-if="systemInfo.show_refresh"
          to="/refresh/index">
          <van-icon size="28px" name="after-sale" />
          <div>付费刷新</div>
        </router-link>
        <router-link
          class="link-item"
          to="/order/list">
          <van-icon size="28px" name="orders-o" />
          <div>商城订单</div>
        </router-link>
        <router-link
          class="link-item"
          to="/address/list">
          <van-icon size="28px" name="logistics" />
          <div>收货地址</div>
        </router-link>
        <div class="link-item" v-if="systemInfo.show_contact" @click="contact">
          <van-icon size="28px" name="service-o" />
          <div>专属客服</div>
        </div>
        <router-link
          class="link-item"
          to="/help">
          <van-icon size="28px" name="question-o" />
          <div>帮助中心</div>
        </router-link>
        <router-link
          class="link-item"
          v-if="systemInfo.show_about"
          to="/about">
          <van-icon size="28px" name="circle" />
          <div>关于我们</div>
        </router-link>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script>
import {
  Dialog,
  Cell,
  Button,
  Icon,
  Swipe,
  SwipeItem,
  PullRefresh,
  Tag,
} from 'vant';
import VueCoreImageUpload from 'vue-core-image-upload/dist/vue-core-image-upload';
import CommonProxy from '@/proxies/common';
import BannersProxy from '@/proxies/banners';
import UserProxy from '@/proxies/users';
import StatisticsProxy from '@/proxies/statistics';
import MessageProxy from '@/proxies/messages';
import EntryMixin from '@/mixins/entry';
import { judgeClient } from '@/utils/tools';
import avatar from '@/assets/images/avatar.png';

export default {
  data() {
    return {
      bannerList: [],
      isLoading: false,
      unfinishedMoney: 0,
      totalTaskExpend: 0,
      totalTaskIncome: 0,
      reviewedTaskCount: 0,
      finishedTaskCount: 0,
      unreadCount: 0,
      defaultAvatar: avatar,
      newAvatar: '',
      qiniu: {
        token: '',
      },
      uploadServer: window.API_CONFIG['qiniu_upload'],
    };
  },
  mixins: [EntryMixin],
  components: {
    VueCoreImageUpload,
    [Dialog.Component.name]: Dialog.Component,
    [Cell.name]: Cell,
    [Button.name]: Button,
    [Icon.name]: Icon,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [PullRefresh.name]: PullRefresh,
    [Tag.name]: Tag,
  },
  computed: {
    showMyPublish() {
      return this.systemInfo.show_publish;
    },
    taskCount() {
      return (this.userInfo.task_limit < 0)
        ? '无限制' : `${(this.userInfo.task_limit || 0)}个额度`;
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
    userInfo() {
      return this.$store.state.account.info;
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
  watch: {
    '$store.state.account.info.id'() {
      this.init();
    },
  },
  activated() {
    this.getUnreadCount();
  },
  methods: {
    toCertificate() {
      this.$router.push({
        path: '/certification/index',
      });
    },
    toPartner() {
      this.$router.push({
        path: '/partner/index',
      });
    },
    showTaskCountInfo() {
      Dialog.alert({
        message: `你的可领取任务数还剩余: ${this.taskCount}`,
        theme: 'round-button',
      });
    },
    async getBanners() {
      const params = {
        client: this.clientType,
        type: 3,
      };
      const res = await BannersProxy.getBanners(params);
      if (!res.fail) {
        this.bannerList = res.data;
      }
    },
    onRefresh() {
      this.isLoading = true;
      this.$store.dispatch('account/find', {
        userId: this.userInfo.id,
      });
      this.init();
      setTimeout(() => {
        this.isLoading = false;
      }, 800);
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
    handleImageUploaded(res) {
      setTimeout(() => {
        this.$toast('上传成功');
      }, 800);
      const { key } = res;
      this.newAvatar = key;
      this.updateUser();
    },
    handleUploadError(error) {
      this.$toast(error);
    },
    async getQiniuToken() {
      const res = await CommonProxy.getQiniuUploadToken();
      if (!res.fail) {
        this.qiniu.token = res.data.uptoken;
      }
    },
    onCopy() {
      this.$toast('复制成功');
    },
    onError() {
      this.$toast('复制失败');
    },
    async updateUser() {
      const params = {
        userId: this.$store.state.account.info.id,
        avatar: this.newAvatar,
      };
      const res = await UserProxy.updateUser(params);
      if (!res.fail) {
        this.$store.dispatch('account/find', {
          userId: this.userInfo.id,
        });
      }
    },
    // 统计当前用户未完成任务的总金额，包括进行中，审核中的任务
    async getMoneyByTaskStatus() {
      const params = {
        taskStatus: '1,2',
        userId: this.userInfo.id,
      };
      const res = await StatisticsProxy.getMoneyByTaskStatus(params);
      if (!res.fail) {
        this.unfinishedMoney = res.data.money;
      }
    },
    async getUserMoneyStatistics() {
      const params = {
        userId: this.userInfo.id,
      };
      const res = await StatisticsProxy.getUserMoneyStatistics(params);
      if (res.success) {
        this.totalTaskExpend = res.data.totalTaskExpend;
        this.totalTaskIncome = res.data.totalTaskIncome;
      }
    },
    async getTaskCount(data) {
      const params = {
        ...data,
        taskStatus: 3,
      };
      const res = await StatisticsProxy.getTaskCount(params);
      if (res.success) {
        if (params.creatorId) {
          this.reviewedTaskCount = res.data.taskCount;
        } else if (params.userId) {
          this.finishedTaskCount = res.data.taskCount;
        }
      }
    },
    async getUnreadCount() {
      const params = {
        userId: this.userInfo.id,
      };
      const res = await MessageProxy.unreadCount(params);
      if (res.success) {
        this.unreadCount = res.data;
      }
    },
    contact() {
      Dialog({
        title: '专属客服',
        message: this.$store.state.system.info.contact,
      });
    },
    init() {
      this.getUnreadCount();
      this.getMoneyByTaskStatus();
      this.getUserMoneyStatistics();
      this.getTaskCount({ userId: this.userInfo.id });
      this.getTaskCount({ creatorId: this.userInfo.id });
    },
  },
  created() {
    if (this.userInfo.id) {
      this.init();
    }
    this.getQiniuToken();
    this.getBanners();
  },
};
</script>

<style lang="less">
  .ucenter-page {
    background-image: linear-gradient(#ffffff, #f8f8f8);
    .van-pull-refresh__track {
      min-height: 100vh;
      box-sizing: border-box;
      padding-bottom: 60px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      padding: 12px 10px 0 10px;
    }
    .red {
      color: #F56C6C;
    }
    .user-info {
      display: flex;
      align-items: center;
      color: #333;
      padding: 10px;
    }
    .user-task {
      font-size: 12px;
      word-break: keep-all;
    }
    .avatar-panel {
      position: relative;
      .g-core-image-upload-btn {
        overflow: visible;
      }
    }
    .user-avatar {
      width: 60px;
      height: 60px;
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
    .user-text {
      margin-left: 10px;
      img {
        width: 30px;
        height: 30px;
        vertical-align: sub;
      }
    }
    .user-id {
      text-align: center;
      color: #666;
      font-weight: bold;
      font-size: 12px;
      flex-grow: 1;
      white-space: nowrap;
    }
    .user-nickname {
      font-size: 18px;
    }
    .user-label {
      display: flex;
      margin-top: 10px;
      .van-tag {
        margin-right: 2px;
        white-space: nowrap;
      }
    }
    .money {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      text-align: center;
      .money-item {
        font-size: 12px;
        flex-grow: 1;
        display: inline-flex;
        flex-direction: column;
        justify-content: space-between;
        .text {
          color: #999;
        }
        .small {
          font-size: 12px;
        }
        .number {
          font-size: 18px;
          line-height: 24px;
        }
      }
    }
    .sub-swiper {
      margin: 0 10px;
      img {
        width: 100%;
        object-fit: cover;
        height: 100%;
        border-radius: 5px;
      }
    }
    .link-plus {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      margin-top: 10px;
      .plus-item {
        border-radius: 5px;
        margin-left: 10px;
        padding: 10px;
        flex: 1;
        background-color: #fff;
        font-size: 12px;
        &:last-child {
          margin-right: 10px;
        }
        .title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }
        strong {
          font-size: 22px;
          font-weight: 400;
        }
        .bottom-tips {
          margin-top: 10px;
          color: #999;
        }
      }
    }
    .links-title {
      padding-left: 10px;
      font-weight: bold;
    }
    .links {
      margin: 10px;
      background-color: #fff;
      border-radius: 5px;
      .link-item {
        width: 25%;
        padding: 10px 0;
        font-size: 12px;
        color: #666!important;
        box-sizing: border-box;
        text-align: center;
        display: inline-block;
        .van-icon {
          color: #333;
          margin-bottom: 6px;
        }
      }
    }
  }
</style>
