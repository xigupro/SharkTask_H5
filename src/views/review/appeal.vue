<template>
  <div class="review-appeal-page">
    <div class="notice" v-if="status">
      <span v-if="status == 1">已提交，请耐心等待处理</span>
      <span v-else-if="status == 2">已处理，{{result}}</span>
      <span v-else-if="status == 3">已撤回</span>
    </div>
    <van-cell-group title="申诉内容">
      <van-field
        v-model="content"
        rows="3"
        autosize
        required
        type="textarea"
        placeholder=""
      />
    </van-cell-group>
    <van-cell-group class="image-group" title="相关图片">
      <div
        class="image-item"
        v-for="(image, imageIndex) in images"
        :key="`${image}${imageIndex}`">
        <van-icon class="remove" @click="removeImage(image)" name="clear" />
        <van-image
          :src="image | getQiniuFullUrl"
        />
      </div>
      <vue-core-image-upload
        style="float: left"
        :crop="false"
        @imageuploaded="(res)=>{return handleImageUploaded(res, images)}"
        @imagechanged="handleImageSelected"
        @errorhandle="handleUploadError"
        :data="qiniu"
        inputOfFile="file"
        inputAccept="image/*"
        :max-file-size="10485760"
        :credentials="false"
        :url="uploadServer" >
        <upload-button />
      </vue-core-image-upload>
    </van-cell-group>
    <div class="action-panel">
      <van-button size="normal" :disabled="isSubmiting" @click="submit" type="primary">
        {{isEdit ? (status == 3 || status == 2 ? '重新提交' : '更新') : '提交'}}
      </van-button>
      <van-button
        size="normal"
        v-if="status == 1"
        :disabled="isSubmiting"
        @click="recall">撤回</van-button>
    </div>
  </div>
</template>

<script>
import {
  Dialog,
  Field,
  Cell,
  CellGroup,
  Button,
  ActionSheet,
  Checkbox,
  Uploader,
  Image,
  Icon,
} from 'vant';
import VueCoreImageUpload from 'vue-core-image-upload/dist/vue-core-image-upload';
import UploadButton from '@/components/common/upload-button';
import CommonProxy from '@/proxies/common';
import TasksProxy from '@/proxies/tasks';

export default {
  data() {
    return {
      task_id: null,
      review_id: null,
      content: '',
      images: [],
      isSubmiting: false,
      status: 0,
      result: '',
      isEdit: false,
      isRecall: false,
      qiniu: {
        token: '',
      },
      uploadServer: window.API_CONFIG['qiniu_upload'],
    };
  },
  watch: {
    userInfo() {
      this.getAppeal();
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.account.info;
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
  },
  components: {
    'upload-button': UploadButton,
    'vue-core-image-upload': VueCoreImageUpload,
    [Dialog.Component.name]: Dialog.Component,
    [Field.name]: Field,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button,
    [ActionSheet.name]: ActionSheet,
    [Checkbox.name]: Checkbox,
    [Uploader.name]: Uploader,
    [Image.name]: Image,
    [Icon.name]: Icon,
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      this.task_id = this.$route.query.task_id;
      this.review_id = this.$route.query.review_id;
      if (this.userInfo && this.userInfo.id && this.review_id && this.task_id) {
        this.getAppeal();
      }
      this.getQiniuToken();
    },
    removeImage(image) {
      this.images = this.images.filter(item => item !== image);
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
    handleImageUploaded(res, name) {
      setTimeout(() => {
        this.$toast('上传成功');
      }, 800);
      if (name instanceof Array) {
        name.push(res.key);
      } else {
        const { key } = res;
        if (name instanceof Object) {
          name.value = key;
        } else {
          this[name] = key;
        }
      }
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
    // 表单校验
    validateForm() {
      if (!this.content) {
        this.$toast('请输入申诉内容');
        return false;
      }
      return true;
    },
    // 撤回申诉
    recall() {
      this.isRecall = true;
      this.submit();
    },
    // 提交申诉
    async submit() {
      if (!this.validateForm()) {
        return;
      }
      const params = {
        task_id: this.task_id,
        user_id: this.userInfo.id,
        review_id: this.review_id,
        content: this.content,
        // 撤回3，更新或新增将状态设为1
        status: this.isRecall ? 3 : 1,
        images: this.images.join(','),
      };
      this.isSubmiting = true;
      const res = await TasksProxy[this.isEdit ? 'updateAppeal' : 'addAppeal'](params);
      this.isSubmiting = false;
      if (res.success) {
        // 返回
        this.$toast(res.message);
        setTimeout(() => {
          this.$router.go(-1);
        }, 1000);
      }
    },
    async getAppeal() {
      const params = {
        user_id: this.userInfo.id,
        review_id: this.review_id,
      };
      const res = await TasksProxy.getAppeal(params);
      if (res.success && res.data instanceof Object) {
        this.content = res.data.content;
        this.result = res.data.result;
        this.status = res.data.status;
        this.images = res.data.images ? res.data.images.split(',') : [];
        this.isEdit = true;
      }
    },

  },
};
</script>

<style lang="less">
.review-appeal-page {
  padding-bottom: 60px;
  .van-cell-group {
    display: flex;
    flex-wrap: wrap;
  }
  .notice {
    background-color: bisque;
    color: orange;
    text-align:center;
    padding:10px;
    display:flex;
    justify-content:center;
  }
  .image-group {
    padding: 10px;
  }
  .action-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    z-index: 900;
    background-color: #fff;
    box-shadow: 0 1px 6px 0 rgba(229,229,229,0.5);
    border-top: 1px solid #eee;
    display: flex;
    justify-content: space-between;
  }
  .action-panel button {
    flex: 1;
    &:first-child {
      margin-right: 10px;
    }
  }
  .image-item {
    margin: 8px 8px 0 0;
    position: relative;
    .remove {
      position: absolute;
      z-index: 1;
      top: -6px;
      right: -6px;
      color: #969799;
      font-size: 18px;
      background-color: #fff;
      border-radius: 100%;
    }
    img {
      width: 82px;
      height: 82px;
      object-fit: cover;
    }
  }
}
</style>
