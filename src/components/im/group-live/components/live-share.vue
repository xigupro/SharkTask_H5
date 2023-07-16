<template>
  <div>
    <div class="share-content"  ref="shareCon" v-show="showShareContent">
      <p class="qrcode-tips">手机扫码观看或复制链接分享给好友</p>
      <qrcode ref="childQrcode"/>
      <button class="copy-link" @click="copyLink" v-clipboard="playUrl" v-clipboard:success="onCopySuccess" v-clipboard:error="onCopyError">复制链接</button>
    </div>
    <div class="share-btn" ref="shareBtn">
      <img class="share-icon" src="../../../assets/images/share-icon.png" alt=""/>
      分享直播
    </div>
  </div>
</template>

<script>
import qrcode from './qrcode'
export default {
  name: 'liveShare',
  data() {
    return {
      showShareContent: false,
      playUrl: '',
    }
  },
  computed: {},
  components: {
    qrcode
  },
  mounted() {
    const shareCon = this.$refs.shareCon
    const shareBtn = this.$refs.shareBtn
    shareBtn.addEventListener('mouseover', () => {
      this.showShareContent = true
    })
    shareBtn.addEventListener('mouseout', () => {
      this.showShareContent = false
    })
    shareCon.addEventListener('mouseover', () => {
      this.showShareContent = true
    })
    shareCon.addEventListener('mouseout', () => {
      this.showShareContent = false
    })
  },
  methods: {
    copyLink() {
      this.playUrl= this.$refs.childQrcode.playUrl
    },
    onCopySuccess() {
      this.$toast({
        type: 'success',
        message: '复制成功'
      })
    },
    onCopyError() {
      this.$toast({
        type: 'error',
        message: '复制失败'
      })
    }
  }
}
</script>
<style lang="less" scoped>
  // Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 2 times

.share-content {
	background: @color0;
	border-radius: 5px 5px 0 0;
	box-sizing: border-box;
	height: 250px;
	left: 20px;
	padding: 10px;
	position: absolute;
	text-align: center;
	top: -250px;
	width: 200px;
	z-index: 1;
	.qrcode-tips {
		color: #a5b5c1;
		margin: 0 0 0 0;
		text-align: center;
	}
	.copy-link {
		background: #5cadff;
		border-radius: 25px;
		border: hidden;
		color: @color0;
		cursor: pointer;
		font-size: 16px;
		height: 40px;
		margin: 20px 0;
		outline-style: none;
		width: 160px;
	}
}
.share-btn {
	align-items: center;
	bottom: 0;
	box-sizing: border-box;
	color: #8a9099;
	cursor: pointer;
	display: flex;
	font-size: 14px;
	letter-spacing: 0;
	line-height: 55px;
	margin: 0 0 0 20px;
	position: absolute;
	.share-icon {
		height: 20px;
		margin: 0 5px 2px 0;
		width: 20px;
	}
}
</style>
