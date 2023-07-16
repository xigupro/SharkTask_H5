<template>
  <div class="add-group-member">
    <van-field v-model="userID" placeholder="请输入用户ID"></van-field>
    <van-button size="small" class="confirm-button" @click="addGroupMember">确定</van-button>
  </div>
</template>

<script>
import { Field, Button } from 'vant'
import { mapState } from 'vuex'
export default {
  components: {
    [Field.name]: Field,
    [Button.name]: Button
  },
  data() {
    return {
      userID: ''
    }
  },
  computed: {
    ...mapState({
      currentConversation: state => state.conversation.currentConversation
    })
  },
  methods: {
    addGroupMember() {
      const groupID = this.currentConversation.conversationID.replace('GROUP', '')
      this.tim
        .addGroupMember({
          groupID,
          userIDList: [this.userID]
        })
        .then((imResponse) => {
          const {
            successUserIDList,
            failureUserIDList,
            existedUserIDList
          } = imResponse.data
          if (successUserIDList.length > 0) {
            this.$toast({
              message: `群成员：${successUserIDList.join(',')}，加群成功`,
              type: 'success'
            })
            this.tim.getGroupMemberProfile({groupID, userIDList: successUserIDList})
            .then(({ data: { memberList }}) => {
              this.$store.commit('updateCurrentMemberList', memberList)
            })
          }
          if (failureUserIDList.length > 0) {
            this.$toast({
              message: `群成员：${failureUserIDList.join(',')}，添加失败！`,
              type: 'error'
            })
          }
          if (existedUserIDList.length > 0) {
            this.$toast({
              message: `群成员：${existedUserIDList.join(',')}，已在群中`
            })
          }
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
.add-group-member {
  padding: 20px;
  .confirm-button {
    margin: 10px 15px;
  }
}
</style>
