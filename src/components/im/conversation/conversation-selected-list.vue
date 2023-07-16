<template>
  <div class="group-member-list-wrapper">
    <div class="header">
      <span class="member-count text-ellipsis">会话列表</span>
    </div>
    <div class="scroll-content">
      <div class="group-member-list">
        <van-checkbox-group v-model="conversationSelected" @change="handleCheckedConversationChange">
          <van-cell-group>
            <van-cell
              v-for="conversation in conversationList"
              :key="conversation.conversationID"
            >
              <template #icon>
                <van-image width="40" height="40" round :src="avatar(conversation)" :type="conversation.type" />
              </template>
              <template #title>
                <span class="nickname"
                  :title="conversation.userProfile.nick || conversation.userProfile.userID"
                  v-if="conversation.type === TIM.TYPES.CONV_C2C"
                  >{{ conversation.userProfile.nick || conversation.userProfile.userID }}
                </span>
                <span class="nickname"
                  :title="conversation.groupProfile.name || conversation.groupProfile.groupID"
                  v-else-if="conversation.type === TIM.TYPES.CONV_GROUP"
                  >{{ conversation.groupProfile.name || conversation.groupProfile.groupID }}
                </span>
                <span class="nickname" v-else-if="conversation.type === TIM.TYPES.CONV_SYSTEM">系统通知 </span>
              </template>
              <template #right-icon>
                <van-checkbox :name="conversation.conversationID" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-checkbox-group>
      </div>
    </div>
    <div class="more">
      <!--            <van-button size="mini" v-if="showLoadMore" @click="loadMore">查看更多</van-button>-->
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { Button, Image, CheckboxGroup, Checkbox, Cell, CellGroup } from "vant";
export default {
  props: ["type"],
  data() {
    return {
      conversationSelected: [],
      addGroupMemberVisible: false,
      currentMemberID: "",
      count: 30 // 显示的群成员数量
    };
  },
  components: {
    [Button.name]: Button,
    [Image.name]: Image,
    [CheckboxGroup.name]: CheckboxGroup,
    [Checkbox.name]: Checkbox,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup
  },
  computed: {
    ...mapState({
      userID: state => state.user.userID,
      currentConversation: state => state.conversation.currentConversation,
      conversationList: state => state.conversation.conversationList.filter(item => item.type !== '@TIM#SYSTEM')
    }),
    showLoadMore() {
      return this.members.length < this.currentConversation.groupProfile.memberCount;
    },
    avatar() {
      return function(conversation) {
        switch (conversation.type) {
          case "GROUP":
            return conversation.groupProfile.avatar;
          case "C2C":
            return conversation.userProfile.avatar;
          default:
            return "";
        }
      };
    },
    members() {
      return this.currentMemberList.slice(0, this.count);
    }
  },
  methods: {
    handleCheckedConversationChange() {
      this.$emit("getList", this.conversationSelected);
    },
    loadMore() {
      this.$store.dispatch("getGroupMemberList", this.groupProfile.groupID).then(() => {
        this.count += 30;
      });
    }
  }
};
</script>

<style lang="less" scoped>
// Height variables (appears count calculates by raw css)
@height3: 40px; // Appears 2 times

.group-member-list-wrapper {
  .header {
    padding: 5px 10px;
    .member-count {
      display: inline-block;
      font-size: 14px;
      line-height: 30px;
      max-width: 130px;
      vertical-align: bottom;
    }
    .btn-add-member {
      cursor: pointer;
      float: right;
      font-size: 28px;
      height: 30px;
      line-height: 32px;
      text-align: center;
      width: 30px;
      &:hover {
        color: #eee;
      }
    }
  }
  .scroll-content {
    max-height: 250px;
    overflow-y: scroll;
    .nickname {
      line-height: 40px;
      margin-left: 10px;
    }
  }
}
.conversation-item-container {
  cursor: pointer;
  overflow: hidden;
  padding: 5px 20px;
  position: relative;
  transition: 0.2s;
  .warp {
    display: flex;
  }
  .avatar {
    border-radius: 50%;
    flex-shrink: 0;
    height: @height3;
    margin-right: 10px;
    width: 40px;
  }
  .content {
    flex: 1;
    font-size: 13px;
    height: @height3;
    overflow: hidden;
    .row-1 {
      display: flex;
      line-height: 21px;
      .name {
        color: #000000;
        flex: 1;
        line-height: @height3;
        min-width: 0px;
      }
    }
  }
}
el-checkbox {
  display: block;
}
el-checkbox__label {
  width: 100%;
}
el-divider--horizontal {
  margin: 0;
}
.group-member-list el-checkbox__input {
  position: absolute;
  top: -12px;
  left: 3px;
  bottom: 0;
  margin: auto;
  cursor: pointer;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
