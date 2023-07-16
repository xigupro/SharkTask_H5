<template>
  <div class="list-container">
    <div class="header-bar">
      <van-field
        v-model="groupID"
        left-icon="search"
        class="group-seach-bar"
        placeholder="输入群ID搜索">
        <template #button>
          <span @click="searchGroupByID">搜索</span>
        </template>
      </van-field>
      <van-button size="mini" @click="showCreateGroupModel" icon="plus" type="primary" />
    </div>
    <div class="group-container">
      <group-item v-for="group in groupList" :key="group.groupID" :group="group" />
      <van-popup :close-on-click-overlay="false" style="width: 80%" title="创建群组" v-model="createGroupModelVisible" @close="closeCreateGroupModel">
        <create-group></create-group>
      </van-popup>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Popup, Field, Button, Icon } from 'vant'
import CreateGroup from './create-group.vue'
import GroupItem from './group-item.vue'
export default {
  data() {
    return {
      groupID: '',
      hideSearchLoading: true
    }
  },
  components: {
    GroupItem,
    [Popup.name]: Popup,
    [Button.name]: Button,
    [Field.name]: Field,
    [Icon.name]: Icon,
    CreateGroup
  },
  computed: {
    groupList: function() {
      return this.$store.state.group.groupList
    },
    ...mapState({
      createGroupModelVisible: state => {
        return state.group.createGroupModelVisible
      }
    })
  },
  methods: {
    onGroupUpdated(groupList) {
      this.$store.dispatch('updateGroupList', groupList)
    },
    createGroup() {},
    closeCreateGroupModel() {
      this.$store.commit('updateCreateGroupModelVisible', false)
    },
    searchGroupByID() {
      const groupID = this.groupID.trim()
      if (groupID.length > 0) {
        this.hideSearchLoading = false
        this.tim
          .searchGroupByID(groupID)
          .then(({ data: { group } }) => {
            applyJoinGroup(group)
          })
          .catch(() => {
            this.$toast({
              message: '没有找到该群',
              type: 'error'
            })
          })
      } else {
        this.hideSearchLoading = true
      }
    },
    showCreateGroupModel() {
      this.$store.commit('updateCreateGroupModelVisible', true)
    },
    applyJoinGroup(group) {
      this.tim
        .joinGroup({ groupID: group.groupID })
        .then(async res => {
          switch(res.data.status) {
            case this.TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL:
              this.$toast({
                message: '申请成功，等待群管理员确认。',
                type: 'info'
              })
              break
            case this.TIM.TYPES.JOIN_STATUS_SUCCESS:
              await this.$store.dispatch(
                'checkoutConversation',
                `GROUP${res.data.group.groupID}`
              )
              this.$toast({
                message: '加群成功',
                type: 'success'
              })
              break
            case this.TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP:
              this.$toast({
                message: '您已经是群成员了，请勿重复加群哦！',
                type: 'info'
              })
              break
            default: break
          }
        })
        .catch(error => {
          this.$toast({
            message: error.message,
            type: 'error'
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
// Width variables (appears count calculates by raw css)
@width0: 100%; // Appears 2 times


.list-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: @width0;
	.group-container {
		overflow-y: scroll;
	}
	.header-bar {
		display: flex;
    align-items: center;
		flex-shrink: 0;
		height: 50px;
		padding-right: 10px;
		.group-seach-bar {
			margin-right: 10px;
			width: @width0;
		}
		.group-seach-bar .el-input {
			input {
				background-color: #eee !important;
				border-radius: 30px;
				border: none;
				color: #eee;
				&::placeholder {
						color: #000;
					}
			}
			.el-icon-search {
				color: #000;
			}
		}
	}
	.scroll-container {
		flex: 1;
		overflow-y: scroll;
	}
}
</style>
