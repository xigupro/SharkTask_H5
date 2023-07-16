<template>
  <div class="withdraw-detail-page">
    <div class="withdraw-notice">
      <span v-if="detail.status == 1">提现中</span>
      <span v-else-if="detail.status == 2">已成功</span>
      <span v-else-if="detail.status == 3">已驳回，{{detail.withdraw_remark}}</span>
    </div>
    <div>
      <van-cell-group>
        <van-field readonly :value="detail.money + '元'" label="提现金额"></van-field>
        <van-field readonly :value="detail.commission_ratio + '%'" label="提现费率"></van-field>
        <van-field readonly :value="detail.truename" label="收款人"></van-field>
        <van-field readonly :value="detail.withdraw_type" label="收款方式"></van-field>
        <van-field readonly :value="detail.withdraw_account" label="收款账号"></van-field>
        <van-field readonly :value="detail.created_at | transLocalTime" label="申请时间"></van-field>
        <van-field
          readonly
          v-if="detail.handle_at"
          :value="detail.handle_at | transLocalTime"
          label="处理时间">
        </van-field>
        <van-cell title="收款二维码" v-if="detail.withdraw_image">
          <van-image
            width="100"
            height="100"
            @click="preview(detail.withdraw_image)"
            lazy-load
            :src="detail.withdraw_image | getQiniuFullUrl" />
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>
<script>
import {
  Field,
  CellGroup,
  Cell,
  Image,
  ImagePreview,
} from 'vant';
import WithdrawProxy from '@/proxies/withdraw';
import PreviewImage from '@/mixins/image-preview';

export default {
  data() {
    return {
      detail: {},
    };
  },
  mixins: [PreviewImage],
  components: {
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Cell.name]: Cell,
    [Image.name]: Image,
    [ImagePreview.name]: ImagePreview,
  },
  methods: {
    async getWithdrawDetail() {
      const params = {
        id: this.$route.query.id,
      };
      const res = await WithdrawProxy.withdrawDetail(params);
      if (res.success) {
        this.detail = res.data;
      }
    },
    preview(img) {
      const images = [`${window.API_CONFIG['qiniu_download']}${img}`];
      this.previewImages(images, 0);
    },
  },
  created() {
    this.getWithdrawDetail();
  },
};
</script>
<style lang="less" scoped>
  .withdraw-detail-page {
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
  }
</style>
