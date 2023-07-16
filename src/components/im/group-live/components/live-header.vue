<template>
  <div class="header-container">
    <div v-show="showLiveInfo">
      <div class="anchor-info">
        <img class="anchor-avatar" :src="avatar">
        <div class="anchor-other">
          <p class="anchor-nick">{{nick}}</p>
          <p class="online-num">在线：{{onlineMemberCount}}</p>
        </div>
      </div>
      <div class="online-info">
        <p class="room-name">直播中</p>
        <img class="living-icon" src="../../../../assets/images/living-icon.gif" />
        <span>{{` ${pusherTime}`}}</span>
      </div>
    </div>
    <div class="close-box" @click="closeLiveMask">
      <i class="el-icon-circle-close"></i>
    </div>
  </div>
</template>

<script>
 import { mapState } from 'vuex'
  export default {
    name: 'liveHeader',
    props: {
      fr: {
        type: String,
        requred: true
      },
      isPushingStream: {
        type: Boolean,
        default: false
      },
      stopPushStream: {
        type: Function
      },
      pusherTime: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        nick: '',
        avatar: 'https://imgcache.qq.com/open/qcloud/video/act/webim-avatar/avatar-2.png',
        onlineMemberCount: 0,
        timer: null,
        onlineList: []
      }
    },
    computed: {
      ...mapState({
        groupLiveInfo: state => state.groupLive.groupLiveInfo
      }),
      showLiveInfo() {
        return (this.fr === 'pusher' && this.isPushingStream) || this.fr === 'player'
      },
      roomName() {
        return this.groupLiveInfo.roomName || `${this.groupLiveInfo.anchorID}的直播`
      }
    },
    mounted() {
      this.getAnchorProfile()
      if (this.fr === 'player') {
        this.timer = setInterval(() => {
          this.getGroupOnlineMemberCount()
        }, 5000)
      }
    },
    beforeDestroy() {
      this.timer && clearInterval(this.timer)
    },
    methods: {
      closeLiveMask() {
        if (this.fr === 'pusher') {
          this.stopPushStream()
          return
        }
        this.$store.commit('updateGroupLiveInfo', { isNeededQuitRoom: 1 })
        this.$bus.$emit('close-group-live')
      },
      async getAnchorProfile() {
        const res = await this.tim.getUserProfile({userIDList: [this.groupLiveInfo.anchorID]})
        if (res.code === 0) {
          this.nick = res.data[0].nick || res.data[0].userID
          this.avatar = res.data[0].avatar || 'https://imgcache.qq.com/open/qcloud/video/act/webim-avatar/avatar-2.png'
        }
      },
      async getGroupOnlineMemberCount() {
        const res = await this.tim.getGroupOnlineMemberCount(this.groupLiveInfo.roomID)
        if (res.code === 0 && res.data) {
          this.onlineMemberCount = res.data.memberCount
        }
      }
    },
    watch: {
      isPushingStream: function(val) {
        if (val && this.fr === 'pusher') {
          this.timer = setInterval(() => {
            this.getGroupOnlineMemberCount()
          }, 5000)
        }
      }
    }
  }
</script>

<style lang="less" scoped>
 // Color variables (appears count calculates by raw css)
@color0: #ffffff; // Appears 2 times


// Height variables (appears count calculates by raw css)
@height0: 100%; // Appears 2 times
@height1: 50px; // Appears 3 times

.header-container {
	box-sizing: border-box;
	height: @height0;
	left: 0;
	padding: 10px 10px 10px 20px;
	position: absolute;
	top: 0;
	width: 100%;
	z-index: 99;
	.anchor-info {
		align-items: center;
		background: rgba(255,255,255,0.1);
		border-radius: 30px;
		display: flex;
		height: @height1;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 200px;
		.anchor-avatar {
			border-radius: 50%;
			height: @height1;
			margin: 0 5px;
			width: 50px;
		}
		.anchor-other {
			flex: 1;
			height: @height0;
			p {
				margin: 0;
			}
			.anchor-nick {
				color: @color0;
				font-weight: 500;
				margin: 6px 0 0 0;
				max-width: 140px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				word-break: keep-all;
			}
			.online-num {
				color: rgba(210,203,203,0.678);
				font-size: 14px;
				font-weight: 400;
			}
		}
	}
	.online-info {
		align-items: center;
		color: @color0;
		display: flex;
		height: @height1;
		left: 50%;
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		.room-name {
			display: inline-block;
			margin: 0;
			max-width: 160px;
			overflow: hidden;
			padding: 0 0 0 10px;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.living-icon {
			margin: 0 5px;
			position: relative;
			top: -3px;
			width: 25px;
		}
		span {
			margin: 2px 0 0 0;
		}
	}
	.close-box {
		align-items: center;
		color: #959798;
		cursor: pointer;
		display: flex;
		font-size: 36px;
		height: 70px;
		justify-content: center;
		position: absolute;
		right: 0;
		top: 0px;
		width: 70px;
	}
}
</style>
