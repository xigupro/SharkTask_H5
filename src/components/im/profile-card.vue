<template>
  <div class="profile-card-wrapper">
    <div class="content">
      <van-image round :src="profile.avatar" />
      <div class="basic">
        <span class="nick text-ellipsis">{{ profile.nick || profile.userID }}</span>
        <span class="iconfont" :class="genderClass"></span>
      </div>
    </div>
  </div>
</template>

<script>
import { Image } from 'vant'
export default {
  name: 'ProfileCard',
  props: {
    profile: {
      type: Object,
      required: true
    }
  },
  components: {
    [Image.name]: Image,
  },
  computed: {
    genderClass() {
      switch (this.profile.gender) {
        case this.TIM.TYPES.GENDER_MALE:
          return 'icon-male'
        case this.TIM.TYPES.GENDER_FEMALE:
          return 'icon-female'
        default:
          return '暂无'
      }
    }
  }
}
</script>

<style lang="less" scpoed>
.profile-header {
  display: flex;
  margin-bottom: 12px;
}

.profile-card-wrapper {
  .content {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  .avatar {
    width: 70px;
    height: 70px;
  }
}

.basic {
  display: flex;
  align-items: center;
  margin-top: 12px;
}

.icon-female {
  color: #ff8096;
}

.nick {
  font-size: 18px;
  margin-right: 8px;
  max-width: 100px;
  display: inline-block;
}
</style>
