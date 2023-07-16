<template>
  <div class="profile-user">
    <van-image round :title="userProfile.userID" :src="userProfile.avatar" />
    <div class="nick-name text-ellipsis">
      <span v-if="userProfile.nick" :title=userProfile.nick>
        {{ userProfile.nick }}
      </span>
      <span v-else class="anonymous" title="该用户未设置昵称">
        [Anonymous]
      </span>
    </div>
    <div class="gender" v-if="genderClass">
      <span :title="gender" class="iconfont" :class="genderClass"></span>
    </div>
    <van-button
      title="添加好友"
      v-if="[3, 4].includes(friendStatus)"
      size="mini"
      type="info"
      @click="addToFriendList">添加好友</van-button>
    <van-button
      title="删除好友"
      v-else
      size="mini"
      type="danger"
      @click="deleteFriend">删除好友</van-button>
    <van-button
      title="将该用户加入黑名单"
      size="mini"
      @click="addToBlackList"
      v-if="!isInBlacklist && userProfile.userID !== myUserID"
      >加入黑名单</van-button>
    <van-button title="将该用户移出黑名单" type="text" @click="removeFromBlacklist" v-else-if="isInBlacklist">移出黑名单</van-button>
    <!-- 拉黑 和 反拉黑 -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Button, Image } from 'vant';
export default {
  props: {
    userProfile: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      friendStatus: null
    }
  },
  components: {
    [Button.name]: Button,
    [Image.name]: Image,
  },
  computed: {
    ...mapState({
      blacklist: state => state.blacklist.blacklist,
      myUserID: state => state.user.currentUserProfile.userID
    }),
    isInBlacklist() {
      return this.blacklist.findIndex(item => item.userID === this.userProfile.userID) >= 0
    },
    gender() {
      switch (this.userProfile.gender) {
        case this.TIM.TYPES.GENDER_MALE:
          return '男'
        case this.TIM.TYPES.GENDER_FEMALE:
          return '女'
        default:
          return '未设置'
      }
    },
    genderClass() {
      switch (this.userProfile.gender) {
        case this.TIM.TYPES.GENDER_MALE:
          return 'icon-male'
        case this.TIM.TYPES.GENDER_FEMALE:
          return 'icon-female'
        default:
          return ''
      }
    }
  },
  created() {
    this.checkFriend();
  },
  methods: {
    // 校验好友
    checkFriend() {
      this.tim.checkFriend({ userIDList: [this.userProfile.userID] }).then(({
        code,
        data,
      }) => {
        const { relation } = data.successUserIDList[0]
        switch(relation) {
          case 'CheckResult_Type_BothWay':
            // 互相是好友
            this.friendStatus = 1;
            break;
          case 'CheckResult_Type_AWithB':
            // 当前用户已添加了目标用户为好友
            this.friendStatus = 2;
            break;
          case 'CheckResult_Type_BWithA':
            // 目标用户已添加了当前用户为好友
            this.friendStatus = 3;
            // 
            break;
          case 'CheckResult_Type_NoRelation':
            // 互相不是好友
            this.friendStatus = 4;
            break;
        }
      })
    },
    // 删除好友
    deleteFriend() {
      this.tim
        .deleteFriend({
            userIDList: [this.userProfile.userID],
            type: 'Delete_Type_Single'
        }).then((res) => {
          this.$toast('删除成功')
           this.checkFriend()
        }).catch((err) => {
          this.$toast(err)
        })
    },
    // 添加好友
    addToFriendList() {
      this.tim
        .addFriend({
            to: this.userProfile.userID,
            source: 'AddSource_Type_APP'
        }).then((res) => {
          this.$toast('添加成功')
           this.checkFriend()
        }).catch((err) => {
          this.$toast(err)
        })
    },
    // 添加到黑名单列表
    addToBlackList() {
      this.tim
        .addToBlacklist({ userIDList: [this.userProfile.userID] })
        .then(() => {
          this.$store.dispatch('getBlacklist')
        })
        .catch(imError => {
          this.$toast({
            message: imError.message,
            type: 'error'
          })
        })
    },
    // 从黑名单列表删除
    removeFromBlacklist() {
      this.tim.removeFromBlacklist({ userIDList: [this.userProfile.userID] }).then(() => {
        this.$store.commit('removeFromBlacklist', this.userProfile.userID)
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
</script>

<style lang="less" scoped>
// Width variables (appears count calculates by raw css)
@width1: 100%; // Appears 2 times
.profile-user {
	padding: 10px;
	text-align: center;
	.avatar {
		border-radius: 50%;
		height: 160px;
		margin: 30px auto;
		width: 160px;
	}
	.nick-name {
		color: #111;
		font-size: 16px;
		width: @width1;
		.anonymous {
			color: #000;
			text-shadow: none;
		}
	}
	.gender {
		border-bottom: 1px solid #eee;
		padding: 5px 0 10px 0;
    margin-bottom: 10px;
	}
	.btn-add-blacklist {
		color: red;
	}
}
</style>
