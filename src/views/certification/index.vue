<template>
  <div class="certification-submit-page">
    <div class="alert alert-success" v-if="reviewStatus == 1">
      恭喜！已通过实名认证
    </div>
    <div class="alert alert-danger" v-else-if="reviewStatus == 2">
      审核不通过，{{reviewResult}}
    </div>
    <div class="alert alert-warning" v-else-if="isAdd">
      已提交，请等待管理员审核
    </div>
    <van-cell-group title="认证信息">
      <van-field label="真实姓名" v-model="truename"></van-field>
      <van-field
        label="身份证"
        v-if="systemInfo.show_certification_card_number"
        v-model="idCard"></van-field>
      <van-field type="tel" label="手机号" v-model="phone"></van-field>
      <van-field label="备注" v-model="remark"></van-field>
      <div class="image" v-if="systemInfo.show_certification_IDcard">
        <img v-if="certificate" class="shadow" :src="certificate | getQiniuFullUrl" />
        <vue-core-image-upload
          v-if="reviewStatus != 1"
          class="btn btn-primary"
          :crop="false"
          @imageuploaded="(res)=>{return handleImageUploaded(res)}"
          @imagechanged="handleImageSelected"
          @errorhandle="handleUploadError"
          :data="qiniuData"
          inputOfFile="file"
          inputAccept="image/*"
          :max-file-size="10485760"
          :text="certificate ? '更换证件' : '上传证件'"
          :credentials="false"
          :url="uploadServer" >
        </vue-core-image-upload>
        <p class="tips">可为身份证、营业执照、职业资格证等</p>
      </div>
      <div class="submit-panel" v-if="reviewStatus != 1">
        <div class="agreement">
          <van-checkbox v-model="isAgree">同意</van-checkbox>
          <div class="tips">
            <router-link :to="{name: 'about.agreement'}">《服务协议》</router-link>
            和<router-link :to="{name: 'about.policy'}">《隐私政策》</router-link>
          </div>
        </div>
        <van-button
          :loading="isSubmiting"
          size="medium"
          block
          @click="handleSubmit"
          type="primary">
            {{(isReviewing || reviewStatus == 2) ? '更新' : '提交'}}
        </van-button>
      </div>
    </van-cell-group>
  </div>
</template>
<script>
import {
  Field,
  Dialog,
  Button,
  Checkbox,
  Cell,
  CellGroup,
} from 'vant';
import VueCoreImageUpload from 'vue-core-image-upload/dist/vue-core-image-upload';
import CommonProxy from '@/proxies/common';
import CertificationProxy from '@/proxies/certifications';

export default {
  data() {
    return {
      uploadServer: window.API_CONFIG['qiniu_upload'],
      qiniuData: {
        token: '',
      },
      isAgree: false,
      certificate: '',
      reviewStatus: '',
      reviewResult: '',
      truename: '',
      idCard: '',
      phone: '',
      remark: '',
      isReviewing: false,
      isAdd: false, // 是否已提交审核
      agreementVisible: false,
      agreement_content: '',
      isSubmiting: false,
    };
  },
  components: {
    'vue-core-image-upload': VueCoreImageUpload,
    [Field.name]: Field,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Checkbox.name]: Checkbox,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
  },
  computed: {
    systemInfo() {
      return this.$store.state.system.info;
    },
    userInfo() {
      return this.$store.state.account.info;
    },
  },
  watch: {
    '$store.state.account.info.id'() {
      this.getCertificationDetail();
    },
    reviewStatus(val) {
      if (val === 1) {
        // 审核通过，刷新用户信息
        this.$store.dispatch('account/find', {
          userId: this.userInfo.id,
        });
      }
    },
  },
  methods: {
    showMessage(title, message) {
      Dialog.alert({
        title,
        message,
      });
    },
    async handleSubmit() {
      if (!this.isAgree) {
        this.$toast('请同意协议');
        return;
      }
      if (!this.truename) {
        this.$toast('请输入真实姓名');
        return;
      }
      if (!/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(this.idCard)
          && this.systemInfo.show_certification_card_number) {
        this.$toast('请输入正确的身份证号');
        return;
      }
      if (!/^(1[3,4,5,7,8,9])\d{9}$/.test(this.phone)) {
        this.$toast('请输入正确的手机号');
        return;
      }
      if (!this.certificate && this.systemInfo.show_certification_IDcard) {
        this.$toast('请上传证件');
        return;
      }
      const params = {
        userId: this.userInfo.id,
        idCard: this.idCard,
        truename: this.truename,
        phone: this.phone,
        remark: this.remark,
        certificate: this.certificate,
      };
      const api = (this.isReviewing || (+this.reviewStatus === 2)) ? 'updateCertification' : 'addCertification';
      this.isSubmiting = true;
      const res = await CertificationProxy[api](params);
      this.isSubmiting = false;
      if (!res.fail) {
        this.$toast('提交成功，请等待审核');
        setTimeout(() => {
          this.$router.push({
            path: '/ucenter',
          });
        }, 1000);
      }
    },
    async getCertificationDetail() {
      const userId = this.userInfo.id;
      const params = {
        userId: userId,
      };
      const res = await CertificationProxy.getCertificationDetail(params);
      if (!res.fail && res.data instanceof Object) {
        this.truename = res.data.truename;
        this.phone = res.data.phone;
        this.idCard = res.data.id_card;
        this.remark = res.data.remark;
        this.certificate = res.data.certificate;
        this.isReviewing = !res.data.status;
        this.reviewStatus = res.data.status;
        this.reviewResult = res.data.result;
        this.isAdd = res.data.created_at;
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
      this.certificate = res.key;
    },
    handleUploadError(error) {
      this.$toast(error);
    },
  },
  created() {
    this.getQiniuToken();
    if (this.userInfo && this.userInfo.id) {
      this.getCertificationDetail();
    }
  },
};
</script>
<style lang="less" scoped>
  .certification-submit-page {
    padding-bottom: 104px;
    .tips {
      a {
        color: #619FFF!important;
      }
    }
    .alert {
      width: 100%;
      height: 30px;
      line-height: 30px;
      padding: 0 10px;
      margin-bottom: 10px;
      color: #fff;
    }
    .alert-success {
      background-color: #67C23A;
    }
    .alert-danger {
      background-color: #F56C6C;
    }
    .alert-warning {
      background-color: #E6A23C;
    }
    .withdraw-notice {
      background-color: bisque;
      color: orange;
      text-align:center;
      padding:10px;
    }
    .ratio {
      float: right;
      color: red;
    }
    .form-title {
      font-size: 12px;
      margin: 8px;
      display: block;
      color: #888;
    }
    .image {
      text-align: center;
      padding: 15px;
      .btn {
        border: 1px solid #eee;
        padding: 10px;
        background-color: #fff;
      }
      .tips {
        color: #666;
        margin: 10px;
      }
    }
    .image img {
      max-width: 50%;
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
      .agreement {
        display: flex;
        align-items: center;
        margin: 10px 0;
      }
    }
  }
</style>
