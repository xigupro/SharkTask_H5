<template>
  <div class="task-publish-page">
    <van-cell-group title="基本信息">
      <van-cell title="缩略图" required>
        <vue-core-image-upload
          :crop="false"
          @imageuploaded="(res)=>{return handleImageUploaded(res, 'thumbnail')}"
          @imagechanged="handleImageSelected"
          @errorhandle="handleUploadError"
          :data="qiniu"
          inputOfFile="file"
          inputAccept="image/*"
          :max-file-size="10485760"
          :credentials="false"
          :url="uploadServer" >
          <div class="img-box" v-if="thumbnail">
            <van-image
              width="82"
              height="82"
              :src="thumbnail | getQiniuFullUrl"
            />
            <div class="change">修改</div>
          </div>
          <upload-button v-else style="float: right" />
        </vue-core-image-upload>
      </van-cell>
      <van-cell title="所属分类" @click="showTypeSelector=true" is-link required>
        {{typeName}}
      </van-cell>
      <van-field
        maxlength="255"
        v-model="title"
        required
        clearable
        label="标题"/>
      <van-field
        maxlength="10"
        v-model="money"
        required
        clearable
        :disabled="is_edit"
        type="number"
        placeholder="单位元"
        label="金额"/>
      <van-field
        maxlength="12"
        v-model="quantity"
        required
        clearable
        type="digit"
        label="数量"/>
      <van-cell required title="时间限制" @click="showLimitedTimeSelector=true" is-link>
        {{limited_time_text}}
      </van-cell>
      <van-cell required title="审核时间" @click="showReviewTimeSelector=true" is-link>
        {{review_time_text}}
      </van-cell>
      <van-cell title="下架时间" @click="toggleAutoendVisible" is-link>
        {{autoend_at | transLocalTime}}
      </van-cell>
      <van-field
        v-model="description"
        rows="1"
        autosize
        required
        label="任务简介"
        type="textarea"
        placeholder=""
      />
      <van-cell title="可重复领">
        <van-checkbox v-model="repeatable"></van-checkbox>
      </van-cell>
      <van-cell title="立即上架" v-if="!systemInfo.need_review">
        <van-checkbox v-model="status"></van-checkbox>
      </van-cell>
      <van-cell title="位置" @click="handleMapSelectClicked" is-link v-if="systemInfo.enable_location">
        {{locationName}}
      </van-cell>
    </van-cell-group>
    <van-cell-group title="操作步骤">
      <van-cell v-for="(item, stepIndex) in textStep" :key="item.key">
        <div class="step-index inline-title">
          <span>步骤{{stepIndex + 1}}</span>
          <van-button size="small" @click="removeTextStep(stepIndex)">删除步骤</van-button>
        </div>
        <van-field
          v-model="item.value"
          rows="1"
          autosize
          required
          type="textarea"
          placeholder="请输入详细的步骤"
        />
        <van-field
          v-model="item.copyText"
          rows="1"
          autosize
          type="textarea"
          placeholder="请输入一键复制的内容"
        />
        <div
          class="image-item"
          v-for="(image, imageIndex) in item.images"
          :key="`${image}${imageIndex}`">
          <van-icon class="remove" @click="removeImage(stepIndex, imageIndex)" name="clear" />
          <video v-if="isVideo(image)" controls :src="image | getQiniuFullUrl" />
          <van-image
            v-else
            :src="image | getQiniuFullUrl"
          />
        </div>
        <vue-core-image-upload
          style="float: left"
          :crop="false"
          @imageuploaded="(res)=>{return handleImageUploaded(res, item.images)}"
          @imagechanged="handleImageSelected"
          @errorhandle="handleUploadError"
          :data="qiniu"
          inputOfFile="file"
          :inputAccept="`image/*, ${accessVideo.join(',')}`"
          :max-file-size="10485760"
          :credentials="false"
          :url="uploadServer" >
          <upload-button />
        </vue-core-image-upload>
      </van-cell>
      <van-cell>
        <van-button type="primary" size="small" @click="addTextStep">添加步骤</van-button>
      </van-cell>
    </van-cell-group>
    <van-cell-group title="审核步骤">
      <van-cell v-for="(item, stepIndex) in reviewStep" :key="item.key">
        <div class="step-index inline-title">
          <span>步骤{{stepIndex + 1}}</span>
          <van-button
            v-if="reviewStep.length"
            size="small"
            @click="removeReviewStep(item.key)">
              删除步骤
          </van-button>
        </div>
        <van-field
          v-model="item.name"
          rows="1"
          autosize
          required
          type="textarea"
          placeholder="请输入详细的步骤"
        />
        <van-field
          v-model="item.copyText"
          rows="1"
          autosize
          type="textarea"
          placeholder="请输入一键复制的内容"
        />
        <van-cell title="示例图" required>
          <vue-core-image-upload
            :crop="false"
            @imageuploaded="(res)=>{return handleImageUploaded(res, item)}"
            @imagechanged="handleImageSelected"
            @errorhandle="handleUploadError"
            :data="qiniu"
            inputOfFile="file"
            inputAccept="image/*"
            :max-file-size="10485760"
            :credentials="false"
            :url="uploadServer" >
            <div class="img-box" v-if="item.value">
              <van-image
                width="82"
                height="82"
                :src="item.value | getQiniuFullUrl"
              />
              <div class="change">修改</div>
            </div>
            <upload-button v-else style="float: right" />
          </vue-core-image-upload>
        </van-cell>
      </van-cell>
      <van-cell>
        <van-button type="primary" size="small" @click="addReviewStep">添加步骤</van-button>
      </van-cell>
    </van-cell-group>
    <van-cell-group title="审核字段">
      <van-cell v-for="(item, fieldIndex) in reviewField" :key="item.key">
        <div class="step-index inline-title">
          <span>字段{{fieldIndex + 1}}</span>
          <van-button
            v-if="reviewField.length"
            size="small"
            @click="removeReviewField(item.key)">
              删除字段
          </van-button>
        </div>
        <van-field
          v-model="item.name"
          required
          placeholder="请输入字段名"
        />
        <van-field
          v-model="item.placeholder"
          placeholder="请输入字段填写提示"
        />
      </van-cell>
      <van-cell>
        <van-button type="primary" size="small" @click="addReviewField">添加字段</van-button>
      </van-cell>
    </van-cell-group>
    <!--编辑时暂不支持使用积分抵扣-->
    <van-cell-group class="alone" v-if="!is_edit && systemInfo.score_for_task">
      <van-cell>
        <van-checkbox v-model="useScore" :disabled="scoreMoney <= 0">
          <template v-if="scoreMoney">可用{{userInfo.score}}积分抵用{{scoreMoney}}元</template>
          <template v-else>暂无可用积分</template>
        </van-checkbox>
      </van-cell>
    </van-cell-group>
    <van-submit-bar
      :price="finalPrice"
      label=" "
      :disabled="isLoading || !userInfo.id"
      :suffix-label="is_edit ? '' : `含服务费${service_price}元`"
      :button-text="is_edit ? '更新任务' : '发布任务'"
      button-type="primary"
      @submit="submitConfirm"
    />
    <van-action-sheet
      description="用户需在此时间段内完成任务，否则将会超时"
      v-model="showLimitedTimeSelector"
      :actions="limitedTimeList"
      @select="onLimitedTimeSelect" />
    <van-action-sheet
      description="你需要在此时间内完成审核，否则任务审核将自动通过"
      v-model="showReviewTimeSelector"
      :actions="reviewTimeList"
      @select="onReviewTimeSelect" />
    <van-action-sheet v-model="showAutoendSelector">
      <van-datetime-picker
        v-model="autoend_at"
        :min-date="minDate"
        @confirm="toggleAutoendVisible"
        @cancel="toggleAutoendVisible"
        type="datetime"
        title="选择自动下架时间" />
    </van-action-sheet>
    <van-action-sheet
      v-model="showTypeSelector"
      :actions="typeList"
      title="请选择任务分类"
      @select="onTypeSelect">
    </van-action-sheet>
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
  SubmitBar,
  Image,
  Icon,
  DatetimePicker,
} from 'vant';
// import moment from 'moment';
import VueCoreImageUpload from 'vue-core-image-upload/dist/vue-core-image-upload';
import UploadButton from '@/components/common/upload-button';
import CommonProxy from '@/proxies/common';
import TasksProxy from '@/proxies/tasks';
import TimesProxy from '@/proxies/times';
import PreviewImage from '@/mixins/image-preview';
import { judgeClient, isEmpty } from '@/utils/tools';

export default {
  data() {
    return {
      useScore: false,
      task_id: '',
      thumbnail: '',
      title: '',
      money: '',
      sort: 0,
      recommend: 0,
      quantity: '',
      // 修改之前的任务数量，仅用于修改任务
      prevQuantity: 0,
      // 修改之前的任务金额，仅用于修改任务
      prevMoney: 0,
      // 修改任务，多退少补的金额，负数为退回给用户的金额，正数为用户需要补交的金额
      money_compare: 0,
      // 补交的服务费
      catch_service_price: 0,
      limited_time: '',
      limited_time_text: '',
      review_time: 4320,
      review_time_text: '',
      description: '',
      repeatable: false,
      longitude: undefined,
      latitude: undefined,
      autoend_at: '',
      minDate: new Date(),
      type: '',
      typeName: '',
      showTypeSelector: false,
      showLimitedTimeSelector: false,
      showReviewTimeSelector: false,
      showAutoendSelector: false,
      // 分类列表
      typeList: [],
      limitedTimeList: [],
      reviewTimeList: [],
      textStep: [],
      reviewStep: [],
      reviewField: [],
      removeReviewStepIds: [],
      removeReviewFieldIds: [],
      status: true,
      uploading: false,
      isLoading: false,
      is_edit: false,
      clients: ['1', '2', '3', '4'],
      locationName: '',
      cacheKey: 'taskSelectedLocation',
      qiniu: {
        token: '',
      },
      uploadServer: window.API_CONFIG['qiniu_upload'],
    };
  },
  mixins: [PreviewImage],
  computed: {
    // 任务服务费，服务费计算方式，true按照任务金额的百分比，false按照固定的金额
    service_price() {
      return this.systemInfo.is_ratio
        ? this.quantity * this.money * (this.taskPrice / 100)
        : this.taskPrice;
    },
    taskPrice() {
      return this.systemInfo.task_price;
    },
    // 最终价格，单位 分，含积分抵扣
    finalPrice() {
      let result = this.total_money;
      if (this.useScore) {
        // 是否开启使用积分抵扣
        if (this.scoreMoney > result) {
          // 如果积分可兑换金额大于任务总金额，则返回0
          result = 0;
        } else {
          result -= this.scoreMoney;
        }
      }
      return result * 100;
    },
    // 积分可抵用金额
    scoreMoney() {
      return this.userInfo.score * this.systemInfo.score_rate;
    },
    // 任务总金额，含服务费，不含积分抵扣
    total_money() {
      return this.quantity * this.money + this.service_price;
    },
    userInfo() {
      return this.$store.state.account.info;
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
    isAPP() {
      return navigator.userAgent.indexOf('Html5Plus') > -1;
    },
  },
  watch: {
    userInfo(val) {
      this.thumbnail = val.avatar || '';
      this.validateIsCertificate();
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
    [SubmitBar.name]: SubmitBar,
    [Image.name]: Image,
    [Icon.name]: Icon,
    [DatetimePicker.name]: DatetimePicker,
  },
  created() {
    this.init();
  },
  activated() {
    if (this.systemInfo.enable_location) {
      let locationName = localStorage.getItem(`${this.cacheKey}.name`)
      locationName = isEmpty(locationName) ? null : locationName
      let defaultlocationName = localStorage.getItem('selectedLocation.name')
      defaultlocationName = isEmpty(defaultlocationName) ? null : defaultlocationName
      this.locationName = locationName || defaultlocationName
    }
  },
  methods: {
    async init() {
      if (this.userInfo && this.userInfo.id) {
        this.thumbnail = this.userInfo.avatar || '';
        this.validateIsCertificate();
      }
      this.getTimeSteps();
      await this.getTaskTypeList();
      this.task_id = this.$route.params.id;
      if (this.task_id) {
        this.is_edit = true;
        this.getMyTaskDetail();
      }
      this.getQiniuToken();
      this.getClientType();
    },
    handleMapSelectClicked() {
      localStorage.setItem('mapSelectRedirectUrl', this.$route.fullPath)
      this.$router.push({
        name: 'amap.select',
        query: {
          cacheKey: this.cacheKey,
        },
      })
    },
    getClientType() {
      const platform = judgeClient();
      let type = 3;
      if (this.isAPP) {
        switch (platform) {
          case 'ios':
            type = 5;
            break;
          case 'android':
            type = 4;
            break;
          default:
            console.info(platform);
            break;
        }
      }
      this.clientType = type;
    },
    toggleAutoendVisible() {
      setTimeout(() => {
        this.showAutoendSelector = !this.showAutoendSelector;
      });
    },
    async getTimeSteps() {
      const res = await TimesProxy.getTimeSteps();
      if (!res.fail) {
        res.data.forEach((item) => {
          if (Number(item.type) === 1) {
            this.limitedTimeList.push(item);
          }
          if (Number(item.type) === 2) {
            this.reviewTimeList.push(item);
          }
        });
      }
    },
    validateIsCertificate() {
      if (this.userInfo
          && !this.userInfo.is_certified
          && this.systemInfo.publish_need_certification) {
        Dialog.confirm({
          closeOnPopstate: false,
          message: '你还未实名认证，是否现在去认证?',
        }).then(() => {
          this.$router.push({
            name: 'certification.index',
          });
        }).catch(() => {
          this.$router.go(-1);
        });
      }
    },
    // 移除操作步骤
    removeTextStep(index) {
      this.textStep.splice(index, 1);
    },
    // 移除审核步骤
    removeReviewStep(key) {
      this.reviewStep.forEach((item, index) => {
        if (item.key === key) {
          this.reviewStep.splice(index, 1);
          if (!item.isNew) {
            // 如果是已经存过数据库，则标记此条数据为删除
            this.removeReviewStepIds.push(item.key);
          }
        }
      });
    },
    // 移除审核字段
    removeReviewField(key) {
      this.reviewField.forEach((item, index) => {
        if (item.key === key) {
          this.reviewField.splice(index, 1);
          if (!item.isNew) {
            // 如果是已经存过数据库，则标记此条数据为删除
            this.removeReviewFieldIds.push(item.key);
          }
        }
      });
    },
    removeImage(stepIndex, imageIndex) {
      this.textStep[stepIndex].images.splice(imageIndex, 1);
    },
    // 图片选择事件
    handleImageSelected(file) {
      const type = file.type.split('/');
      if (type[0] === 'video') {
        // 如果是视频文件，则携带后缀
        this.qiniu.key = `${this.$tools.randomString()}.${type[1]}`;
      }
      this.$toast.loading({
        message: '上传中...',
        forbidClick: true,
        duration: 0,
        closeOnClick: true,
      });
    },
    // 截图上传到七牛
    handleImageUploaded(res, name) {
      if (this.qiniu.key) {
        delete this.qiniu.key;
      }
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
    onTypeSelect(item) {
      this.type = item.id;
      this.typeName = item.name;
      this.showTypeSelector = false;
    },
    onLimitedTimeSelect(item) {
      this.limited_time = item.minute;
      this.limited_time_text = item.name;
      this.showLimitedTimeSelector = false;
    },
    onReviewTimeSelect(item) {
      this.review_time = item.minute;
      this.review_time_text = item.name;
      this.showReviewTimeSelector = false;
    },
    addTextStep() {
      this.textStep.push({
        value: '',
        copyText: '',
        images: [],
        key: Date.now(),
      });
    },
    addReviewStep() {
      this.reviewStep.push({
        value: '',
        copyText: '',
        name: '',
        key: Math.floor(Date.now() / 100),
        isNew: true,
      });
    },
    addReviewField() {
      this.reviewField.push({
        placeholder: '',
        name: '',
        key: Math.floor(Date.now() / 100),
        isNew: true,
      });
    },
    async getTaskTypeList() {
      const res = await TasksProxy.getTypes();
      if (res.success) {
        this.typeList = res.data;
      }
    },
    // 表单校验
    validateForm() {
      if (!this.thumbnail) {
        this.$toast('请上传任务缩略图');
        return false;
      }
      if (!this.type) {
        this.$toast('请选择分类');
        return false;
      }
      if (!this.title) {
        this.$toast('请输入标题');
        return false;
      }
      if (this.title.length >= 13) {
        this.$toast('请输入少于13个字的标题');
        return false;
      }
      if (!this.money || Number.isNaN(Number(this.money))) {
        this.$toast('请输入金额');
        return false;
      } else if (this.money < this.systemInfo.min_task_price) {
        this.$toast(`任务金额不能小于${this.systemInfo.min_task_price}元`);
        return false;
      } else if (
        this.money > this.systemInfo.max_task_price
        && this.systemInfo.max_task_price > -1) {
        this.$toast(`任务金额不能大于${this.systemInfo.max_task_price}元`);
        return false;
      }
      if (Number.isNaN(Number(this.limited_time))) {
        this.$toast('请输入时间限制');
        return false;
      } else if (Number(this.limited_time) < Number(this.systemInfo.min_limit_time)) {
        if (+this.systemInfo.max_limit_time === -1 && +this.limited_time === 0) {
          // 不限制，则limited_time可设置为零
        } else {
          this.$toast(`时间限制不能小于${this.systemInfo.min_limit_time}分钟`);
          return false;
        }
      } else if (
        Number(this.limited_time) > Number(this.systemInfo.max_limit_time)
        && Number(this.systemInfo.max_limit_time) > -1) {
        this.$toast(`时间限制不能大于${this.systemInfo.max_limit_time}分钟`);
        return false;
      }
      if (Number.isNaN(Number(this.review_time))) {
        this.$toast('请输入审核时间');
        return false;
      } else if (this.review_time <= 0) {
        this.$toast('审核时间不能小于0');
        return false;
      } else if (this.review_time > (+this.systemInfo.max_review_time)) {
        this.$toast(`审核时间不能大于${this.systemInfo.max_review_time}`);
        return false;
      }
      if (!this.description) {
        this.$toast('请输入描述');
        return false;
      }
      if (this.description.length >= 2048) {
        this.$toast('请输入少于2048个字的描述');
        return false;
      }
      if (Number.isNaN(Number(this.quantity)) || this.quantity < 0) {
        this.$toast('请输入数量');
        return false;
      }
      if (!this.is_edit && this.quantity <= 0) {
        this.$toast('数量必须要大于0');
        return false;
      }
      if (!this.textStep.length) {
        this.$toast('请添加操作步骤');
        return false;
      }
      if (this.textStep.some(item => !item.value)) {
        this.$toast('操作步骤内容不能为空');
        return false;
      }
      if (!this.reviewStep.length) {
        this.$toast('请添加审核步骤');
        return false;
      }
      if (this.reviewStep.some(item => !item.name)) {
        this.$toast('审核步骤内容不能为空');
        return false;
      }
      if (this.reviewStep.some(item => !item.value)) {
        this.$toast('请上传审核步骤示例图');
        return false;
      }
      if (this.reviewField.some(item => !item.name)) {
        this.$toast('请填写提审字段名');
        return false;
      }
      this.money_compare = this.money * this.quantity - this.prevMoney * this.prevQuantity;
      if (this.systemInfo.is_ratio) {
        // 通过百分比计算服务费
        if (this.is_edit && this.money_compare > 0) {
          // 如果是编辑，且需补交佣金，则加上补交部分的服务费
          this.catch_service_price = this.money_compare * (this.taskPrice / 100);
          this.money_compare += this.catch_service_price;
        }
      }
      if (this.is_edit
        ? this.money_compare > Number(this.userInfo.account_amount)
        : (this.finalPrice / 100) > Number(this.userInfo.account_amount)) {
        this.$toast('余额不足，请先充值');
        return false;
      }
      return true;
    },
    submitConfirm() {
      if (!this.validateForm()) {
        return;
      }
      let message = '';
      if (this.is_edit) {
        if (this.money_compare === 0) {
          message = `${this.systemInfo.need_review ? '此修改需要重新审核，' : ''}是否确认更新`;
        } else {
          message = `当前修改${this.money_compare > 0
            ? '需补交' : '将退回'}${this.money_compare < 0
            ? -this.money_compare : this.money_compare}元，确认更新吗？`;
        }
      } else {
        message = `当前任务共花费${(this.finalPrice / 100).toFixed(2)}元，是否确认发布?`;
      }
      Dialog.confirm({
        message,
        beforeClose: this.submit,
      });
    },
    // 添加任务
    async submit(action, done) {
      if (action !== 'confirm') {
        done();
        return;
      }
      const status = this.status ? 1 : 2;
      const scoreMoney = this.scoreMoney > this.total_money ? this.total_money : this.scoreMoney;
      const params = {
        sort: this.sort,
        thumbnail: this.thumbnail,
        title: this.title,
        status: this.systemInfo.need_review ? 3 : status,
        money: this.money,
        description: this.description,
        type: this.type,
        limited_time: this.limited_time,
        review_time: this.review_time,
        labels: [],
        textStep: this.textStep,
        reviewStep: this.reviewStep,
        reviewField: this.reviewField,
        for_review: 0,
        repeatable: +this.repeatable,
        removeReviewStepIds: this.removeReviewStepIds,
        removeReviewFieldIds: this.removeReviewFieldIds,
        quantity: this.quantity,
        recommend: this.recommend,
        created_by: this.userInfo.id,
        created_from: this.clientType,
        id: this.task_id,
        money_compare: this.money_compare,
        catch_service_price: this.catch_service_price,
        service_price: this.service_price,
        is_ratio: this.systemInfo.is_ratio,
        total_money: this.finalPrice / 100,
        clients: this.clients,
        // 使用积分兑换了的金额
        scoreMoney,
        // 对人民币汇率
        score_rate: this.systemInfo.score_rate,
        // 用了多少积分
        score: Math.floor(scoreMoney / this.systemInfo.score_rate),
        autoend_at: this.autoend_at ? new Date(this.autoend_at).getTime() : '',
      };
      if (this.systemInfo.enable_location) {
        let lng = localStorage.getItem(`${this.cacheKey}.lng`)
        lng = isEmpty(lng) ? null : lng
        let lat = localStorage.getItem(`${this.cacheKey}.lat`)
        lat = isEmpty(lat) ? null : lat
        let locationName = localStorage.getItem(`${this.cacheKey}.name`)
        locationName = isEmpty(locationName) ? null : locationName

        let defaultlng = localStorage.getItem('selectedLocation.lng')
        defaultlng = isEmpty(defaultlng) ? null : defaultlng
        let defaultlat = localStorage.getItem('selectedLocation.lat')
        defaultlat = isEmpty(defaultlat) ? null : defaultlat
        let defaultlocationName = localStorage.getItem('selectedLocation.name')
        defaultlocationName = isEmpty(defaultlocationName) ? null : defaultlocationName
        params.longitude = lng || defaultlng
        params.latitude = lat || defaultlat
        params.location_name = locationName || defaultlocationName
      }
      this.isLoading = true;
      const res = await TasksProxy[this.is_edit ? 'updateTask' : 'addTask'](params);
      this.isLoading = false;
      done();
      if (res.success) {
        this.$toast(res.message);
        // 更新用户信息
        this.$store.dispatch('account/find', {
          userId: this.userInfo.id,
        });

        // 跳转到任务详情
        setTimeout(() => {
          this.$router.push({
            name: 'task.detail',
            params: {
              id: this.is_edit ? this.task_id : res.taskId,
            },
          });
        }, 1000);
      }
    },
    // 获取任务详情
    async getMyTaskDetail() {
      this.isLoading = true;
      const params = {
        taskId: this.task_id,
      };
      const res = await TasksProxy.getMyTaskDetail(params);
      this.isLoading = false;
      if (res.success) {
        const textStep = res.data.textStep.map(item => ({
          value: item.text,
          copyText: item.copy_text,
          key: item.id,
          images: item.images ? item.images.split(',') : [],
        }));
        const reviewStep = res.data.reviewStep.map(item => ({
          value: item.image,
          copyText: item.copy_text,
          name: item.text,
          key: item.id,
          isNew: false,
        }));
        const reviewField = res.data.reviewField.map(item => ({
          placeholder: item.placeholder,
          name: item.name,
          key: item.id,
          isNew: false,
        }));
        this.removeReviewStepIds = [];
        this.removeReviewFieldIds = [];
        this.textStep = textStep;
        this.reviewStep = reviewStep;
        this.reviewField = reviewField;
        this.title = res.data.title;
        this.thumbnail = res.data.thumbnail;
        this.sort = res.data.sort;
        this.recommend = res.data.recommend;
        this.money = res.data.money;
        this.quantity = res.data.quantity;
        this.prevMoney = res.data.money;
        this.prevQuantity = res.data.quantity;
        this.limited_time = res.data.limited_time;
        this.review_time = res.data.review_time;
        this.description = res.data.description;
        this.repeatable = !!res.data.repeatable;
        this.status = res.data.status === 1;
        this.locationName = res.data.location_name || ''
        localStorage.setItem(`${this.cacheKey}.lng`, res.data.longitude)
        localStorage.setItem(`${this.cacheKey}.lat`, res.data.latitude)
        localStorage.setItem(`${this.cacheKey}.name`, res.data.location_name)
        this.clients = res.data.client ? res.data.client.split(',') : [];
        this.autoend_at = res.data.autoend_at ? new Date(+res.data.autoend_at) : '';
        this.onTypeSelect(this.typeList.find(item => item.id === res.data.type));

        const limitedTimeItem = this.limitedTimeList.find(
          item => item.minute === res.data.limited_time,
        );
        if (limitedTimeItem) {
          this.onLimitedTimeSelect(limitedTimeItem);
        } else {
          this.limited_time_text = `${res.data.limited_time}分钟`;
        }
        const reviewTimeItem = this.reviewTimeList.find(
          item => item.minute === res.data.review_time,
        );
        if (reviewTimeItem) {
          this.onReviewTimeSelect(reviewTimeItem);
        } else {
          this.review_time_text = `${res.data.review_time}分钟`;
        }
      }
    },
  },
};
</script>

<style lang="less">
.task-publish-page {
  padding-bottom: 60px;
  .inline-title {
    font-size: 14px;
    border-left: 4px solid #2cbdfb;
    color: #303133;
    padding-left: 5px;
    line-height: 28px;
  }
  .van-checkbox {
    display: inline-block;
  }
  .alone {
    margin-top: 10px;
    .van-checkbox {
      display: flex;
    }
  }
  .step-index {
    display: flex;
    justify-content: space-between;
  }
  .img-box {
    position: relative;
    .change {
      position: absolute;
      bottom: 7px;
      width: 82px;
      right: 0;
      text-align: center;
      font-size: 12px;
      background-color: #eee;
      opacity: .8;
      height: 18px;
      line-height: 18px;
      color: #1989fa;
    }
  }
  .image-item {
    float: left;
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
    img,video {
      width: 82px;
      height: 82px;
      object-fit: cover;
    }
  }
  .van-submit-bar__suffix-label {
    font-size: 12px;
    color: #666;
  }
}
</style>
