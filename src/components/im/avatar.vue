<template>
  <div class="avatar" :class="shape === 'circle' ? 'shape-circle' : ''">
    <img :src="avatarSrc">
  </div>
</template>

<script>
import systemAvatar from '@/assets/images/system.png'
export default {
  props: {
    src: String,
    type: {
      type: String,
      default: 'C2C'
    },
    shape: {
      type: String,
      default: 'circle'
    }
  },
  computed: {
    avatarSrc: function () {
      let src = this.src
      if (/^(https:|http:|\/\/)/.test(src)) {
        return src
      } else {
        return this.defaultSrc
      }
    },
    defaultSrc: function () {
      switch(this.type) {
        case 'C2C':
          // 个人头像
          return 'https://imgcache.qq.com/open/qcloud/video/act/webim-avatar/avatar-2.png'
        case 'GROUP':
          // 群默认头像
          return 'https://imgcache.qq.com/open/qcloud/video/act/webim-avatar/avatar-3.png'
        case this.TIM.TYPES.CONV_SYSTEM:
          return systemAvatar
        default:
          // 默认头像
          return 'https://imgcache.qq.com/open/qcloud/video/act/webim-avatar/avatar-1.png'
      }
    }
  }
}
</script>

<style lang="less" scoped>
// Width variables (appears count calculates by raw css)
@width0: 100%; // Appears 2 times

// Height variables (appears count calculates by raw css)
@height0: 100%; // Appears 2 times

.avatar {
	background-color: #eee;
	height: @height0;
	overflow: hidden;
	text-align: center;
	width: @width0;
	img {
		height: @height0;
		width: @width0;
	}
}
.shape-circle {
	border-radius: 50%;
}
</style>
