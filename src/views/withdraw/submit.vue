<template>
  <div class="withdraw-submit-page">
    <div class="withdraw-notice" v-if="systemInfo.withdraw_notice">
      <div>{{systemInfo.withdraw_notice}}</div>
    </div>
    <template v-if="withDrawMoneyType.length">
      <van-radio-group v-model="currentType">
        <van-cell-group title="收款方式">
          <van-cell
            v-for="type in withDrawMoneyType"
            :key="type.value"
            :title="type.label"
            clickable
            @click="currentType = type.value">
            <van-radio slot="right-icon" :name="type.value" />
          </van-cell>
        </van-cell-group>
      </van-radio-group>
      <div>
        <van-cell-group>
          <div slot="title" class="cell-group-title">
            <div>收款信息</div>
            <div>
              <span>余额</span>
              <span class="red">￥{{userInfo.account_amount}}</span>
            </div>
          </div>
          <van-field
            label="提现金额"
            :maxlength="`${systemInfo.withdraw_max}`.length + 3"
            :placeholder="`金额最小${withdrawMin}元, 最大${systemInfo.withdraw_max}元`"
            v-model="money"></van-field>
          <van-field label="收款人" placeholder="请输入姓名" v-model="withdrawName"></van-field>
          <van-field label="支付宝账号" v-if="currentType==='1'" v-model="alipayAccount"></van-field>
          <van-field label="微信号" v-else-if="currentType==='2'" v-model="wechatAccount"></van-field>
          <template v-else>
            <van-field label="开户行" placeholder="请输入开户银行名称" v-model="bankName"></van-field>
            <van-field label="卡号" placeholder="请输入银行卡号" v-model="bankCardNumber"></van-field>
          </template>
        </van-cell-group>
        <div class="image" v-if="currentType !== '3' && needUploadWechatCode">
          <img v-if="withdrawImage" class="shadow" :src="withdrawImage | getQiniuFullUrl" />
          <vue-core-image-upload
            class="btn btn-primary"
            :crop="false"
            @imageuploaded="(res)=>{return handleImageUploaded(res)}"
            @imagechanged="handleImageSelected"
            @errorhandle="handleUploadError"
            :data="qiniuData"
            inputOfFile="file"
            inputAccept="image/*"
            :max-file-size="10485760"
            :text="withdrawImage ? '更换收款二维码' : '上传收款二维码'"
            :credentials="false"
            :url="uploadServer" >
          </vue-core-image-upload>
        </div>
        <van-submit-bar
          :price="actualAmount*100"
          :button-text="withdrawButtonText"
          text-align="left"
          :disabled="actualAmount<=0"
          label="实际到账"
          button-type="primary"
          :tip="`${isFirstWithdraw ? '首次' : ''}提现费率为${commissionRatio}%，手续费￥${commission}`"
          @submit="handleADButtonClick"
          :loading="isSubmiting">
          <template #tip v-if="needBindWeChat">
            您尚未绑定微信, 请绑定后再申请提现, <router-link :to="{name: 'account.index'}">立即绑定</router-link>
          </template>
        </van-submit-bar>
      </div>
    </template>
    <template v-else>
      <van-empty description="提现入口暂时关闭" />
    </template>
  </div>
</template>
<script>
import {
  Button,
  Field,
  RadioGroup,
  Radio,
  CellGroup,
  Cell,
  Icon,
  SubmitBar,
  Dialog,
  Empty,
} from 'vant';
import VueCoreImageUpload from 'vue-core-image-upload/dist/vue-core-image-upload';
import CommonProxy from '@/proxies/common';
import WithdrawProxy from '@/proxies/withdraw';
import VideoAD from '@/mixins/video-ad';

export default {
  data() {
    return {
      withdrawImage: '',
      uploadServer: window.API_CONFIG['qiniu_upload'],
      qiniuData: {
        token: '',
      },
      withdrawName: '',
      alipayAccount: '',
      wechatAccount: '',
      bankName: '',
      bankCardNumber: '',
      money: '',
      isSubmiting: false,
      currentType: null,
    };
  },
  components: {
    'vue-core-image-upload': VueCoreImageUpload,
    [Button.name]: Button,
    [Field.name]: Field,
    [RadioGroup.name]: RadioGroup,
    [Radio.name]: Radio,
    [CellGroup.name]: CellGroup,
    [Cell.name]: Cell,
    [Icon.name]: Icon,
    [SubmitBar.name]: SubmitBar,
    [Dialog.Component.name]: Dialog.Component,
    [Empty.name]: Empty,
  },
  watch: {
    currentType() {
      this.loadCacheWithdrawImage();
    },
    withDrawMoneyType: {
      handler(val) {
        if (val.length) {
          // 默认选中第一个
          this.currentType = val[0].value;
        }
      },
      immediate: true,
    },
  },
  computed: {
    withdrawButtonText() {
      let text = '提交';
      if (this.systemInfo.withdraw_btn_ad && this.$isApp) {
        text = '观看广告并提交';
      }
      return text;
    },
    needBindWeChat() {
      return this.systemInfo.withdraw_need_bind_wechat && !this.userInfo.openid;
    },
    withDrawMoneyType() {
      const type = [];
      const {
        show_alipay_withdraw: alipay,
        show_wechat_withdraw: wechat,
        show_bank_withdraw: bank,
      } = this.systemInfo;
      if (alipay) {
        type.push({ value: '1', label: '支付宝' });
      }
      if (wechat) {
        type.push({ value: '2', label: '微信' });
      }
      if (bank) {
        type.push({ value: '3', label: '银行卡' });
      }
      return type;
    },
    needUploadWechatCode() {
      // 如果用户绑定了微信，且后台开启了企业支付到微信零钱，则不显示上传微信二维码
      if (this.userInfo.openid
          && this.systemInfo.pay_to_wechat
          && this.currentType === '2') {
        return false;
      }
      return true;
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
    userInfo() {
      return this.$store.state.account.info;
    },
    // 实际到账金额
    actualAmount() {
      return this.money - this.commission;
    },
    // 是否是首次提现
    isFirstWithdraw() {
      // 已提现金额和提现中金额等于零，就说明是首次提现
      return !this.userInfo.finished_amount && !this.userInfo.withdraw_amount;
    },
    // 手续费
    commission() {
      return (this.money * (this.commissionRatio / 100)).toFixed(2);
    },
    // 手续费率
    commissionRatio() {
      let ratio = 0;
      if (this.isFirstWithdraw) {
        // 首次提现
        ratio = this.systemInfo.first_commission_ratio;
      } else {
        ratio = this.systemInfo.commission_ratio;
      }
      return ratio;
    },
    // 最小提现金额
    withdrawMin() {
      return this.isFirstWithdraw
        ? this.systemInfo.first_withdraw_min
        : this.systemInfo.withdraw_min;
    },
  },
  mixins: [VideoAD],
  methods: {
    // 广告按钮点击事件
    handleADButtonClick() {
      if (this.systemInfo.withdraw_btn_ad && this.$isApp) {
        // 设置了广告ID，且在APP里打开，则展示激励视频
        this.rewardedVideoAd(this.systemInfo.withdraw_btn_ad, this.handleSubmit, true);
      } else {
        this.handleSubmit();
      }
    },
    async handleSubmit() {
      if (this.needBindWeChat) {
        Dialog.confirm({
          title: '',
          message: '提现需要先绑定微信，是否去绑定？',
        }).then(() => {
          this.$router.push({
            name: 'account.index',
          });
        });
        return;
      }
      if (this.systemInfo.withdraw_need_certificate && !this.userInfo.is_certified) {
        this.$toast('需实名认证通过后才能提现');
        setTimeout(() => {
          this.$router.push({
            name: 'certification.index',
          });
        }, 800);
        return;
      }
      if (!this.currentType) {
        this.$toast('请选择收款方式');
        return;
      }
      if (Number.isNaN(Number(this.money))) {
        this.$toast('请输入正确的金额');
        return;
      }
      if (Number(this.money) < this.withdrawMin) {
        this.$toast(`最小提现金额为${this.withdrawMin}元`);
        return;
      }
      if (Number(this.money) > this.systemInfo.withdraw_max) {
        this.$toast(`最大提现金额为${this.systemInfo.withdraw_max}元`);
        return;
      }
      if (Number(this.money) > this.userInfo.account_amount) {
        this.$toast('余额不足');
        return;
      }
      if (!this.withdrawName) {
        this.$toast('请输入姓名');
        return;
      }
      if (this.currentType === '1' && !this.alipayAccount) {
        // 支付宝
        this.$toast('请输入支付宝账号');
        return;
      }
      if (this.currentType === '2' && !this.wechatAccount) {
        // 微信
        this.$toast('请输入微信号');
        return;
      }
      if (this.currentType === '2' && !this.withdrawImage && this.needUploadWechatCode) {
        // 微信收款码
        this.$toast('请上传微信收款码');
        return;
      }
      if (this.currentType === '3' && (!this.bankName || !this.bankCardNumber)) {
        this.$toast('请填写银行卡信息');
        return;
      }
      const params = {
        userId: this.userInfo.id,
        truename: this.withdrawName,
        withdrawType: this.withDrawMoneyType.find(item => item.value === this.currentType).label,
        withdrawAccount: this.alipayAccount || this.wechatAccount || this.bankCardNumber,
        withdrawRemark: this.bankName,
        withdrawImage: this.withdrawImage,
        money: Number(this.money),
        commissionRatio: this.commissionRatio,
      };
      this.isSubmiting = true;
      const res = await WithdrawProxy.submitWithdraw(params);
      setTimeout(() => {
        this.isSubmiting = false;
      }, 1000);
      if (!res.fail) {
        this.cacheWithdrawInfo();
        this.$store.dispatch('account/find', {
          userId: this.userInfo.id,
        });
        this.$toast('提交成功，请等待审核');
        setTimeout(() => {
          this.$router.push({
            name: 'withdraw.detail',
            query: {
              id: res.data,
            },
          });
        }, 1000);
      }
    },
    cacheWithdrawInfo() {
      if (this.alipayAccount) {
        this.$storage.setItem('alipayAccount', this.alipayAccount);
      }
      if (this.wechatAccount) {
        this.$storage.setItem('wechatAccount', this.wechatAccount);
      }
      if (this.bankCardNumber) {
        this.$storage.setItem('bankCardNumber', this.bankCardNumber);
      }
      if (this.bankName) {
        this.$storage.setItem('bankName', this.bankName);
      }
      if (this.withdrawName) {
        this.$storage.setItem('withdrawName', this.withdrawName);
      }
      if (this.withdrawImage) {
        if (this.currentType === '1') {
          // 支付宝
          this.$storage.setItem('alipayWithdrawImage', this.withdrawImage);
        } else if (this.currentType === '2') {
          // 微信
          this.$storage.setItem('wechatWithdrawImage', this.withdrawImage);
        }
      }
    },
    loadCacheWithdrawInfo() {
      this.loadCacheWithdrawImage();
      const alipayAccount = this.$storage.getItem('alipayAccount');
      if (alipayAccount && alipayAccount !== 'null' && alipayAccount !== 'undefined') {
        this.alipayAccount = alipayAccount;
      }
      const wechatAccount = this.$storage.getItem('wechatAccount');
      if (wechatAccount && wechatAccount !== 'null' && wechatAccount !== 'undefined') {
        this.wechatAccount = wechatAccount;
      }
      const bankCardNumber = this.$storage.getItem('bankCardNumber');
      if (bankCardNumber && bankCardNumber !== 'null' && bankCardNumber !== 'undefined') {
        this.bankCardNumber = bankCardNumber;
      }
      const bankName = this.$storage.getItem('bankName');
      if (bankName && bankName !== 'null' && bankName !== 'undefined') {
        this.bankName = bankName;
      }
      const withdrawName = this.$storage.getItem('withdrawName');
      if (withdrawName && withdrawName !== 'null' && withdrawName !== 'undefined') {
        this.withdrawName = withdrawName;
      }
    },
    loadCacheWithdrawImage() {
      if (this.currentType === '1') {
        // 支付宝
        const alipayWithdrawImage = this.$storage.getItem('alipayWithdrawImage');
        if (alipayWithdrawImage && alipayWithdrawImage !== 'null' && alipayWithdrawImage !== 'undefined') {
          this.withdrawImage = alipayWithdrawImage;
        } else {
          this.withdrawImage = '';
        }
      } else if (this.currentType === '2') {
        // 微信
        const wechatWithdrawImage = this.$storage.getItem('wechatWithdrawImage');
        if (wechatWithdrawImage && wechatWithdrawImage !== 'null' && wechatWithdrawImage !== 'undefined') {
          this.withdrawImage = wechatWithdrawImage;
        } else {
          this.withdrawImage = '';
        }
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
    handleImageUploaded(res) {
      setTimeout(() => {
        this.$toast('上传成功');
      }, 800);
      this.withdrawImage = res.key;
    },
    handleUploadError(error) {
      this.$toast(error);
    },
  },
  created() {
    this.getQiniuToken();
    this.loadCacheWithdrawInfo();
  },
};
</script>
<style lang="less" scoped>
  .withdraw-submit-page {
    padding-bottom: 80px;
    .tips {
      color: #999;
      font-size: 12px;
    }
    .withdraw-notice {
      background-color: bisque;
      color: orange;
      text-align:center;
      padding:10px;
    }
    .image {
      text-align: center;
      margin-top: 10px;
      margin-bottom: 10px;
      .btn {
        border: 1px solid #eee;
        padding: 10px;
        background-color: #fff;
      }
    }
    .image img {
      max-width: 50%;
    }
    .cell-group-title {
      display: flex;
      justify-content: space-between;
      .red {
        color: red;
      }
    }
    .submit-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      padding: 10px;
      box-sizing: border-box;
      width: 100%;
      background-color: #fff;
      box-shadow: 0 1px 6px 0 rgba(229,229,229,0.5);
      border-top:1px solid #eee;
    }
  }
</style>
