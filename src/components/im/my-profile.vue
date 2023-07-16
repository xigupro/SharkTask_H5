<template>
  <div class="my-profile-wrapper">
    <van-image round width="100%" height="100%" :src="currentUserProfile.avatar" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import { Popover, Image } from "vant";
import ProfileCard from "./profile-card";
export default {
  name: "MyProfile",
  components: {
    ProfileCard,
    [Popover.name]: Popover,
    [Image.name]: Image
  },
  data() {
    return {
      form: { avatar: "", nick: "", gender: "" }
    };
  },
  computed: {
    ...mapState({
      currentUserProfile: state => state.user.currentUserProfile,
      currentConversation: state => state.conversation.currentConversation
    }),
    gender() {
      switch (this.currentUserProfile.gender) {
        case this.TIM.TYPES.GENDER_MALE:
          return "男";
        case this.TIM.TYPES.GENDER_FEMALE:
          return "女";
        default:
          return "暂无";
      }
    }
  },
  methods: {
    editMyProfile() {
      if (this.form.avatar && this.form.avatar.indexOf("http") === -1) {
        this.$store.commit("showMessage", {
          message: "头像应该是 Url 地址",
          type: "warning"
        });
        this.form.avatar = "";
        return;
      }
      const options = {};
      // 过滤空串
      Object.keys(this.form).forEach(key => {
        if (this.form[key]) {
          options[key] = this.form[key];
        }
      });
      this.tim
        .updateMyProfile(options)
        .then(() => {
          this.$store.commit("showMessage", {
            message: "修改成功"
          });
        })
        .catch(imError => {
          this.$store.commit("showMessage", {
            message: imError.message,
            type: "error"
          });
        });
    }
  }
};
</script>

<style lang="less" scoped>
.my-profile-wrapper {
  width: 50px;
  height: 50px;
  margin: 15px;
  background-color: #666;
  border-radius: 50%;
  & > span {
    display: block;
    width: 100%;
    height: 100%;
  }
  .popover {
    padding: none;
    border: none;
    border-radius: 30px;
  }
  .my-avatar {
    cursor: pointer;
    border-radius: 50%;
  }
  .edit-my-profile {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
  }
}
</style>
