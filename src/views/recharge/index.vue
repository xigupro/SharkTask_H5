<template>
  <div class="recharge-page">
    <van-notice-bar
      left-icon="volume-o"
      v-if="notice"
      :text="notice"
    />
    <!--使用app支付-->
    <template v-if="isAPP && (systemInfo.use_app_alipay || systemInfo.use_apppay)">
      <van-field
        v-model="money"
        type="number"
        label="金额"
        center
        placeholder="请输入金额">
         <van-button
         class="copy"
          slot="button"
           size="small"
          type="primary"
          @click="togglePaySheet">充值</van-button>
      </van-field>
      <van-action-sheet v-model="showPayType" title="请选择支付方式">
        <van-cell-group>
          <van-cell
            clickable
            v-if="systemInfo.use_apppay"
            @click="gotoPay">
            <template #title>
              <van-icon size="36px" style="vertical-align: bottom;" color="#04BE02" name="wechat" />
              <span class="pay-label">微信</span>
            </template>
            <template #right-icon>
              <van-checkbox />
            </template>
          </van-cell>
          <van-cell
            clickable
            v-if="systemInfo.use_app_alipay"
            @click="goAppAlipay">
            <template #title>
              <van-icon size="36px" style="vertical-align: bottom;" color="#108ee9" name="alipay" />
              <span class="pay-label">支付宝</span>
            </template>
            <template #right-icon>
              <van-checkbox />
            </template>
          </van-cell>
        </van-cell-group>
      </van-action-sheet>
    </template>
    <!--使用公众号支付-->
    <template v-else-if="isWechat && systemInfo.use_publicpay">
      <van-field
        v-model="money"
        type="number"
        label="金额"
        center
        placeholder="请输入金额">
         <van-button
         class="copy"
          slot="button"
           size="small"
          type="primary"
          @click="publicAddOrder">充值</van-button>
      </van-field>
    </template>
    <template v-else>
      <div class="panel shadow">
        <div class="title">充值指引</div>
        <div class="content">
          请将以下其中一个收款二维码保存到本地(长按保存或截图)，然后使用支付宝或微信扫码支付金额(充多少钱则支付多少钱)，支付时
          <strong class="text-danger">请备注用户ID</strong>，支付完成后管理员会为您充值。
        </div>
        <div>
          <span>您的ID是: {{userInfo.id}}</span>
          <van-button
            class="copy"
            size="small"
            v-clipboard:copy="userInfo.id"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">一键复制</van-button>
        </div>
      </div>
      <div class="panel shadow">
        <div class="title">支付宝收款二维码</div>
        <div class="content qrcode">
          <img v-if="systemInfo.alipay_code" :src="systemInfo.alipay_code | getQiniuFullUrl" />
        </div>
      </div>
      <div class="panel shadow">
        <div class="title">微信收款二维码</div>
        <div class="content qrcode">
          <img v-if="systemInfo.wepay_code" :src="systemInfo.wepay_code | getQiniuFullUrl" />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {
  Button,
  field,
  Notify,
  Toast,
  ActionSheet,
  Icon,
  Cell,
  CellGroup,
  Checkbox,
  NoticeBar,
} from 'vant';
import CommonProxy from '@/proxies/common';

export default {
  components: {
    [Button.name]: Button,
    [field.name]: field,
    [Notify.name]: Notify,
    [Toast.name]: Toast,
    [ActionSheet.name]: ActionSheet,
    [Icon.name]: Icon,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Checkbox.name]: Checkbox,
    [NoticeBar.name]: NoticeBar,
  },
  data() {
    return {
      money: 100,
      channels: [],
      openId: '',
      showPayType: false,
      payType: '',
    };
  },
  computed: {
    systemInfo() {
      return this.$store.state.system.info;
    },
    notice() {
      let text = '';
      const { recharge_rate: rechargeRate } = this.systemInfo;
      if (rechargeRate > 100) {
        // 充值赠送
        text = `充值赠送${rechargeRate - 100}%，
          即充100送${((rechargeRate / 100) * 100 - 100).toFixed(2)}`;
      } else if (rechargeRate === 100) {
        text = '';
      } else {
        text = `充值将收取${100 - rechargeRate}%的手续费，
          即充100收${(100 - (rechargeRate / 100) * 100).toFixed(2)}`;
      }
      return text;
    },
    userInfo() {
      return this.$store.state.account.info;
    },
    isAPP() {
      return navigator.userAgent.indexOf('Html5Plus') > -1;
    },
    isWechat() {
      return this.$tools.isWechat();
    },
    appid() {
      return window.API_CONFIG['wechat_appid'];
    },
  },
  mounted() {
    if (this.isAPP) {
      this.plusReady();
    }
    // 从缓存读取openid
    const openid = this.$storage.getItem('openid');
    if (openid && openid !== 'undefined' && openid !== 'null') {
      this.openId = openid;
    }
    // 从缓存里读取用户此前输入的金额
    const money = this.$storage.getItem('rechargeMoney');
    if (money && money !== 'undefined' && money !== 'null') {
      this.money = +money;
    } else {
      this.money = 0;
    }
    const { code } = this.$route.query;
    if (code && this.isWechat) {
      // 如果是微信授权回调
      this.publicSession(code);
    }
  },
  methods: {
    onCopy() {
      this.$toast('复制成功');
    },
    onError() {
      this.$toast('复制失败');
    },
    togglePaySheet() {
      this.showPayType = !this.showPayType;
    },
    // 支付宝支付
    async goAppAlipay() {
      this.payType = 'alipay';
      if (this.money <= 0) {
        Notify('请输入大于0的金额');
        return;
      }
      const params = {
        money: this.money,
        name: 'APP支付宝充值',
        user_id: this.userInfo.id,
        notify_url: `${window.API_CONFIG['app']}/order/alipayRechargeNotify`,
      };
      const res = await CommonProxy.appAlipayAddOrder(params);
      if (res.success) {
        this.requestAppPay(res.data);
      }
    },
    // 获取app支付通道
    plusReady() {
      window.plus.payment.getChannels((channels) => {
        this.channels = channels;
      }, (e) => {
        Notify(`获取支付通道失败：${e.message}`);
      });
    },
    getPayChannel() {
      let channel = '';
      for (const i in this.channels) {
        if (this.channels[i].id === this.payType) {
          channel = this.channels[i];
        }
      }
      return channel;
    },
    // app微信下单
    async gotoPay() {
      if (this.money <= 0) {
        Notify('请输入大于0的金额');
        return;
      }
      this.payType = 'wxpay';
      if (!this.showPayType) {
        this.showPayType = true;
        return;
      }
      const params = {
        money: this.money,
        user_id: this.userInfo.id,
        notify_url: `${window.API_CONFIG['app']}/order/rechargeMoneyNotify`,
        remark: 'APP充值',
      };
      const res = await CommonProxy.appAddOrder(params);
      if (res.success) {
        this.requestAppPay(res.data);
      }
    },
    // 唤起APP支付
    requestAppPay(data) {
      const channel = this.getPayChannel();
      window.plus.payment.request(channel, data, (result) => {
        // 支付成功
        console.info(result);
        Toast('支付成功');
        this.$store.dispatch('account/find', {
          userId: this.userInfo.id,
        });
        setTimeout(() => {
          this.$router.push({
            name: 'wallet.index',
          });
        });
      }, (error) => {
        Notify(`支付失败${error.code}`);
      });
    },
    // 公众号获取openid
    async publicSession(code) {
      const params = {
        code,
      };
      const res = await CommonProxy.publicSession(params);
      if (res.success) {
        this.openId = res.data.openid;
        this.publicAddOrder();
      }
    },
    // 公众号充值
    async publicAddOrder() {
      if (this.money <= 0) {
        Notify('请输入大于0的金额');
        return;
      }
      if (!this.openId) {
        // 如果没有openId，则先去获取
        this.wechatAuth();
        return;
      }
      const params = {
        openId: this.openId,
        money: this.money,
        user_id: this.userInfo.id,
        notify_url: `${window.API_CONFIG['app']}/order/rechargeMoneyNotify`,
        remark: 'H5充值',
      };
      const res = await CommonProxy.publicAddOrder(params);
      if (res.success) {
        this.publicInvokePay(res.data);
      }
    },
    // 微信跳转授权
    wechatAuth() {
      // 先缓存用户输入的金额
      this.$storage.setItem('rechargeMoney', this.money || 0);
      this.$storage.setItem('wechatAuthFrom', 2);
      window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.appid}&redirect_uri=${window.location.origin}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
    },
    // 公众号网页唤起微信支付
    publicInvokePay(data) {
      window.WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        {
          appId: data.appId,
          timeStamp: data.timeStamp,
          nonceStr: data.nonceStr,
          package: `prepay_id=${data.prepayId}`,
          signType: 'MD5',
          paySign: data.paySign,
        },
        (res) => {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
            // res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
            this.$store.dispatch('account/find', {
              userId: this.userInfo.id,
            });
            setTimeout(() => {
              this.$router.push({
                name: 'wallet.index',
              });
            });
          }
        },
      );
    },
  },
};
</script>

<style lang="less" scoped>
  .recharge-page {
    .panel {
      background-color: #fff;
      margin: 10px;
      padding: 10px;
      border-radius: 2px;
      .title {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 10px;
      }
      .content {
        .price {
          font-size: 18px;
          color: #F56C6C;
          font-weight: bold;
        }
        &.qrcode {
          text-align: center;
          img {
            max-width: 50%;
          }
        }
      }
      .copy {
        margin-left: 10px;
      }
    }
    .pay-label {
      display: inline-block;
      vertical-align: super;
      margin-left: 10px;
    }
  }
</style>
