<template>
  <div class="player">
    <div class="header-bar">
      <live-header  fr="player" />
    </div>
    <div id="player-container" class="video-container">
      <div style="position: absolute">
        <img src="../../../../assets/images/no-video.png">
        <p style="font-size: 24px;color: #8A9099;text-align: center;margin-top: 30px">暂无画面</p>
      </div>
    </div>
    <div class="setting-bar">
      <!-- <live-share /> -->
      <div>
        <div class="player-start cursor" v-if="!isPlaying" @click="resumeVideo">
          <img class="player-icon" src="../../../../assets/images/web-pusher-start.png">
          <span class="play-text">观看直播</span>
        </div>
        <div class="player-start cursor" v-else @click="pauseVideo">
          <img class="player-icon" src="../../../../assets/images/pause-icon.png">
          <span class="play-text">暂停观看</span>
        </div>
      </div>
      <div class="volume-box" ref="volumeBox">
        <p class="setting-icon cursor " @click="setPlayoutVolume">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="path-1-inside-1" fill="white">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M4.18171 12H0V4H4.19181L8 0.831913L9 0V1.3008V14.7003V16L8 15.1698L4.18171 12ZM5 4.62845L8 2.13271V13.8701L5 11.3796V4.62845Z"/>
            </mask>
            <path d="M0 12V14H-2V12H0ZM4.18171 12V10H4.9037L5.45921 10.4612L4.18171 12ZM0 4H-2V2H0V4ZM4.19181 4L5.47089 5.53752L4.91496 6H4.19181V4ZM8 0.831913L6.72092 -0.705603V-0.705603L8 0.831913ZM9 0L7.72092 -1.53752L11 -4.26543V0H9ZM9 16H11V20.2597L7.72251 17.5388L9 16ZM8 15.1698L9.27749 13.631H9.27749L8 15.1698ZM5 4.62845H3V3.69068L3.72092 3.09094L5 4.62845ZM8 2.13271L6.72092 0.595197L10 -2.13271V2.13271H8ZM8 13.8701H10V18.1299L6.72251 15.409L8 13.8701ZM5 11.3796L3.72251 12.9185L3 12.3187V11.3796H5ZM0 10H4.18171V14H0V10ZM2 4V12H-2V4H2ZM4.19181 6H0V2H4.19181V6ZM2.91273 2.46248L6.72092 -0.705603L9.27908 2.36943L5.47089 5.53752L2.91273 2.46248ZM6.72092 -0.705603L7.72092 -1.53752L10.2791 1.53752L9.27908 2.36943L6.72092 -0.705603ZM11 0V1.3008H7V0H11ZM11 1.3008V14.7003H7V1.3008H11ZM11 14.7003V16H7V14.7003H11ZM7.72251 17.5388L6.72251 16.7087L9.27749 13.631L10.2775 14.4612L7.72251 17.5388ZM6.72251 16.7087L2.90422 13.5388L5.45921 10.4612L9.27749 13.631L6.72251 16.7087ZM3.72092 3.09094L6.72092 0.595197L9.27908 3.67023L6.27908 6.16597L3.72092 3.09094ZM10 2.13271V13.8701H6V2.13271H10ZM6.72251 15.409L3.72251 12.9185L6.27749 9.8408L9.27749 12.3313L6.72251 15.409ZM3 11.3796V4.62845H7V11.3796H3Z" fill="#8A9099" mask="url(#path-1-inside-1)"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.6088 13.9991C13.9991 13.0388 15.6868 10.6992 15.6868 7.9654C15.6868 5.24314 14.0133 2.91174 11.639 1.94385L10.9332 3.81684C12.5511 4.49874 13.6868 6.09944 13.6868 7.9654C13.6868 9.84413 12.5355 11.454 10.8999 12.1278L11.6088 13.9991Z" fill="#8A9099"/>
          </svg>
          <span class="mic-text">声音</span>
        </p>
        <span class="progress-box" ref="progressBox" v-show="showSetVolume">
          <van-slider vertical height="200px" @change="setPlayoutVolume" v-model="volumeValue"></van-slider>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { Slider } from 'vant'
import liveHeader from './live-header'
// import liveShare from './live-share'
import poster from '../../../../assets/images/poster.png'

export default {
  name: 'livePlayer',
  data() {
    return {
      player: null,
      isPlaying: true, // 是否正在播放
      volumeValue: 70,
      showSetVolume: false,
      isMute: false,
    }
  },
  computed: {
    ...mapState({
      user: state => state.user,
      roomID: state => state.groupLive.groupLiveInfo.roomID,
      anchorID: state => state.groupLive.groupLiveInfo.anchorID,
    }),
  },
  mounted() {
    this.init()
    const volumeBox = this.$refs.volumeBox
    const progressBox = this.$refs.progressBox
    progressBox.addEventListener('mouseover', () => {
      this.showSetVolume = true
    })
    progressBox.addEventListener('mouseout', () => {
      this.showSetVolume = false
    })
    volumeBox.addEventListener('mouseover', () => {
      this.showSetVolume = true
    })
    volumeBox.addEventListener('mouseout', () => {
      this.showSetVolume = false
    })
  },
  beforeDestroy() {
    this.stopPlay()
  },
  components: {
    liveHeader,
    // liveShare,
    [Slider.name]: Slider
  },
  methods: {
    // 初始化
    init() {
      this.player = this.TWebLive.createPlayer()
      this.player.setCustomConfig({
        autoplay: true,
        poster: { style:'cover', src: poster },
        pausePosterEnabled: false,
        wording: {
          1:'您观看的直播已结束哦~ ',
          2:'您观看的直播已结束哦~ ',
          4:'您观看的直播已结束哦~ ',
          13:'您观看的直播已结束',
          2032: '请求视频失败，请检查网络',
          2048: '请求m3u8文件失败，可能是网络错误或者跨域问题'
        }
      })
      // 播放时
      this.player.on(this.TWebLive.EVENT.PLAYER_PLAYING, this.onPlayerPlaying)
      // 暂停
      this.player.on(this.TWebLive.EVENT.PLAYER_PAUSE, this.onPlayerPause)
      // 浏览器不允许自动播放
      this.player.on(this.TWebLive.EVENT.PLAYER_AUTOPLAY_NOT_ALLOWED, this.onPlayerAutoPlayNotAllowed)
      this.player.on(this.TWebLive.EVENT.PLAYER_ERROR, this.onPlayerError)
      this.setRenderView()
      this.$bus.$emit('join-group-live-avchatroom')
    },
    // eslint-disable-next-line no-unused-vars
    onPlayerPlaying(event) {},
    // eslint-disable-next-line no-unused-vars
    onPlayerPause(event) {},
    // eslint-disable-next-line no-unused-vars
    onPlayerAutoPlayNotAllowed(event) {
      this.$toast({
        message: '不能自动播放',
        type: 'info'
      })
    },
    // eslint-disable-next-line no-unused-vars
    onPlayerError(event) {},
    // 设置渲染界面
    setRenderView() {
      this.player.setRenderView({ elementID: 'player-container' })
      this.startPlay()
    },
    //开始播放
    startPlay() {
      const streamID = `${this.user.sdkAppID}_${this.roomID}_${this.anchorID}_main`
      const flv = `https://tuikit.qcloud.com/live/${streamID}.flv`
      const hls = `https://tuikit.qcloud.com/live/${streamID}.m3u8` 
      const url = `https://flv=${encodeURIComponent(flv)}&hls=${encodeURIComponent(hls)}`
      this.player.startPlay(url).then(() => {
        this.isPlaying = true
      }).catch(() => {})
    },
    resumeAudio() {
      this.player.resumeAudio().then(() => {
        this.isMute = false
      }).catch(() => {})
    },
    pauseAudio() {
      this.player.pauseAudio().then(() => {
        this.isMute = true
      }).catch(() => {})
    },
    //暂停播放
    pauseVideo() {
      this.player.pauseVideo().then(() => {
        this.isPlaying = false
      }).catch(() => {})
    },
    // 恢复播放
    resumeVideo() {
      this.player.resumeVideo().then(() => {
        this.isPlaying = true
      }).catch(() => {})
    },
    setPlayoutVolume() {
      this.player.setPlayoutVolume(this.volumeValue)
    },
    // 停止播放
    stopPlay() {
      this.player.stopPlay()
      this.isPlaying = false
    },
  }
}
</script>
<style lang="less">
.vcp-controls-panel {
  display: none;
}
</style>
<style lang="less" scoped>
  // Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 3 times
@color1: #363e47; // Appears 2 times

// Width variables (appears count calculates by raw css)
@width2: 100%; // Appears 5 times

// Height variables (appears count calculates by raw css)
@height1: 100%; // Appears 3 times
@height3: 55px; // Appears 3 times

.cursor {
	cursor: pointer;
}
.active {
	color: #2d8cf0;
}
.setting-icon {
	align-items: center;
	display: flex;
	height: 40px;
	justify-content: center;
	margin: 0 10px;
}
.player {
	display: flex;
	flex-flow: column;
	height: @height1;
	position: relative;
	width: 99.9%;
	.video-container {
		align-items: center;
		background: rgba(0,0,0,0.3);
		display: flex;
		flex-direction: column;
		flex: 1;
		justify-content: center;
		position: relative;
		.stop-camera {
			align-items: center;
			background-color: @color0;
			bottom: 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
			left: 0;
			position: absolute;
			right: 0;
			top: 0;
		}
	}
	.header-bar {
		background-color: @color1;
		height: 70px;
		padding: 10px 10px 10px 20px;
		position: relative;
		width: @width2;
	}
	.setting-bar {
		background-color: @color1;
		bottom: 0;
		height: @height3;
		position: relative;
		width: @width2;
		.player-time {
			bottom: 0;
			color: #d2dae6;
			font-size: 14px;
			left: 15px;
			letter-spacing: 0;
			line-height: 60px;
			position: absolute;
			width: @width2;
		}
		.player-start {
			align-items: center;
			background: #5cadff;
			bottom: 0;
			display: flex;
			height: @height3;
			justify-content: center;
			position: absolute;
			right: 0;
			width: 210px;
		}
		.player-mic {
			align-items: center;
			bottom: 0;
			display: flex;
			height: @height3;
			justify-content: center;
			padding: 0 10px;
			position: absolute;
			right: 260px;
		}
		.play-text {
			color: @color0;
			font-size: 16px;
			margin-left: 5px;
		}
		.player-icon {
			height: 14px;
			width: 14px;
		}
		.mic-text {
			color: #8a9099;
			font-size: 14px;
			margin-left: 5px;
		}
	}
	.volume-box {
		bottom: 8px;
		position: absolute;
		right: 220px;
		.progress-box {
			bottom: 35px;
			padding: 4px 0;
			position: absolute;
			right: 32px;
		}
	}
	vcp-player {
		align-items: center;
		background-color: rgba(0,0,0,0);
		display: flex;
		height: @height1 !important;
		justify-content: center;
		position: relative;
		width: @width2 !important;
		video {
			height: @height1 !important;
			left: 0;
			object-fit: cover;
			position: absolute;
			top: 0;
			width: @width2 !important;
		}
	}
	vcp-bigplay {
		display: none;
	}
	vcp-error-tips {
		color: @color0;
		margin-top: -8.25em;
	}
}
</style>
