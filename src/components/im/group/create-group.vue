<template>
  <div>
    <van-form ref="createGroupForm">
      <van-field placeholder="请输入" label="群名称" v-model="form.name"></van-field>
      <van-field
        readonly
        label="群类型"
        clickable
        name="picker"
        :value="form.type"
        placeholder="点击选择群类型"
        @click="showTypePicker = true"
      />
      <van-popup v-model="showTypePicker" position="bottom">
        <van-picker
          show-toolbar
          :columns="Object.keys(this.typeList)"
          @confirm="onTypeConfirm"
          @cancel="showTypePicker = false"
        />
      </van-popup>
      <!-- <van-field placeholder="请输入" label="群头像地址" v-model="form.avatar"></van-field> -->
      <van-field placeholder="请输入" label="群简介" type="textarea" v-model="form.introduction" :maxlength="240"></van-field>
      <van-field placeholder="请输入" label="群公告" type="textarea" v-model="form.notification" :maxlength="300"></van-field>
      <van-field
        :readonly="joinOptionDisabled"
        label="加群方式"
        clickable
        name="picker"
        :value="form.joinOption"
        placeholder="点击选择群类型"
        @click="showJoinPicker = true"
      />
      <van-popup v-model="showJoinPicker" position="bottom">
        <van-picker
          show-toolbar
          :columns="Object.keys(this.joinList)"
          @confirm="onJoinConfirm"
          @cancel="showJoinPicker = false"
        />
      </van-popup>
      <!-- <el-form-item label="群成员列表">
        <el-select
          v-model="form.memberList"
          default-first-option
          multiple
          filterable
          remote
          :disabled="form.type === TIM.TYPES.GRP_AVCHATROOM"
          :remote-method="handleSearchUser"
          :loading="loading"
          placeholder="请输入群成员 userID"
        >
          <el-option v-for="item in options" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item> -->
    </van-form>
    <div slot="footer" class="footer">
      <van-button size="small" type="primary" @click="onSubmit('createGroupForm')">立即创建</van-button>
      <van-button size="small" @click="closeCreateGroupModel">取消</van-button>
    </div>
  </div>
</template>

<script>
import { Form, Field, Button, Picker, Popup } from 'vant';

export default {
  components: {
    [Form.name]: Form,
    [Field.name]: Field,
    [Button.name]: Button,
    [Picker.name]: Picker,
    [Popup.name]: Popup,
  },
  data() {
    return {
      showTypePicker: false,
      showJoinPicker: false,
      typeList: {
        Work: TIM.TYPES.GRP_WORK ,
        Public: TIM.TYPES.GRP_PUBLIC ,
        Meeting: TIM.TYPES.GRP_MEETING ,
        AVChatRoom: TIM.TYPES.GRP_AVCHATROOM ,
      },
      joinList: {
        '自由加群': 'FreeAccess',
        '需要验证': 'NeedPermission',
        '禁止加群': 'DisableApply',
      },
      form: {
        groupID: Date.now(),
        name: '',
        type: this.TIM.TYPES.GRP_WORK,
        avatar: '',
        introduction: '',
        notification: '',
        joinOption: 'FreeAccess',
        memberList: []
      },
      options: [],
      loading: false
    }
  },
  computed: {
    joinOptionDisabled() {
      return [
        this.TIM.TYPES.GRP_WORK,
        this.TIM.TYPES.GRP_MEETING,
        this.TIM.TYPES.GRP_AVCHATROOM
      ].includes(this.form.type)
    }
  },
  methods: {
    onTypeConfirm(value) {
      this.form.type = this.typeList[value];
      this.showTypePicker = false;
    },
    onJoinConfirm(value) {
      this.form.joinOption = this.joinList[value];
      this.showJoinPicker = false;
    },
    onSubmit(ref) {
      this.$refs[ref].validate().then(valid => {
        this.createGroup()
      })
    },
    closeCreateGroupModel() {
      this.$store.commit('updateCreateGroupModelVisible', false)
    },
    createGroup() {
      this.tim.createGroup(this.getOptions()).then((imResponse) => {
         this.$toast({
            message: `群组：【${imResponse.data.group.name}】创建成功`,
            type: 'success'
          })
        this.closeCreateGroupModel()
      })
      .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
    },
    getOptions() {
      let options = {
        ...this.form,
        memberList: this.form.memberList.map(userID => ({ userID }))
      }
      if ([this.TIM.TYPES.GRP_WORK, this.TIM.TYPES.GRP_AVCHATROOM].includes(this.form.type)) {
        delete options.joinOption
      }
      return options
    },
    handleSearchUser(userID) {
      if (userID !== '') {
        this.loading = true
        this.tim.getUserProfile({ userIDList: [userID] }).then(({ data }) => {
          this.options = data.map(item => item.userID)
          this.loading = false
        })
        .catch(error => {
          this.$toast({
            type: 'error',
            message: error.message
          })
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.footer {
  display: flex;
  justify-content: space-around;
  padding: 20px;
}
</style>
