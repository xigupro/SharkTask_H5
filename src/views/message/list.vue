<template>
  <div class="message-list-page">
    <van-pull-refresh
      v-model="loading"
      success-text="刷新成功"
      @refresh="onRefresh">
      <van-list
        v-if="messageList.length"
        v-model="loading"
        :finished="finished"
        :finished-text="$t('noMore')"
        @load="onLoad">
        <van-swipe-cell
          :before-close="(res)=>{return beforeClose(res, item.id)}"
          v-for="(item, index) in messageList"
          :key="index">
          <van-cell>
            <div @click="readMessage(item.id, item.is_read)" class="message-item shadow">
              <div class="icon">
                <van-icon
                  size="24"
                  :name="icon[item.type].name"
                  :dot="!item.is_read"
                  :color="icon[item.type].color" />
              </div>
              <div class="right">
                <div class="content">
                  <div class="title">{{item.title}}</div>
                  <div class="time">{{item.created_at | transLocalTime}}</div>
                </div>
                <div class="desc">
                  {{item.content}}
                </div>
              </div>
            </div>
          </van-cell>
          <template #right>
            <van-button class="remove-button" square type="danger" text="删除" />
          </template>
        </van-swipe-cell>
      </van-list>
      <van-empty v-else-if="finished" description="暂无消息" />
    </van-pull-refresh>
  </div>
</template>
<script>
import {
  List,
  Cell,
  Empty,
  Icon,
  SwipeCell,
  Button,
  Dialog,
  PullRefresh,
} from 'vant';
import MessageProxy from '@/proxies/messages';

export default {
  data() {
    return {
      messageList: [],
      finished: false,
      loading: true,
      page: 1,
      size: 10,
      totalRecordCount: 0,
      icon: {
        1: { name: 'chat', color: '#86c3ad' },
        2: { name: 'graphic', color: '#584d5e' },
        3: { name: 'todo-list', color: '#333333' },
        4: { name: 'todo-list', color: '#333333' },
        5: { name: 'balance-list', color: '#7876cb' },
        6: { name: 'gem', color: '#835932' },
      },
    };
  },
  components: {
    [List.name]: List,
    [Cell.name]: Cell,
    [Empty.name]: Empty,
    [Icon.name]: Icon,
    [SwipeCell.name]: SwipeCell,
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
    [PullRefresh.name]: PullRefresh,
  },
  watch: {
    userId() {
      this.page = 1;
      this.getMessageList();
    },
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
  },
  methods: {
    onRefresh() {
      this.finished = false;
      this.page = 1;
      this.totalRecordCount = 0;
      this.messageList = [];
      this.getMessageList();
    },
    onLoad() {
      this.finished = true;
      this.loading = true;
      setTimeout(() => {
        this.getMessageList();
      }, 500);
    },
    beforeClose({ position, instance }, id) {
      switch (position) {
        case 'left':
        case 'cell':
        case 'outside':
          instance.close();
          break;
        case 'right':
          Dialog.confirm({
            message: '确定删除吗？',
          }).then(() => {
            this.removeMessage(id);
            instance.close();
          });
          break;
        default:
          console.info(position, instance);
          break;
      }
    },
    async readMessage(id, isRead) {
      this.$router.push(`/message/detail/${id}`);
      if (isRead) {
        return;
      }
      const params = {
        user_id: this.userId,
        id,
      };
      const res = await MessageProxy.read(params);
      if (res.success) {
        const messageItem = this.messageList.find(item => item.id === id);
        messageItem.is_read = 1;
      }
    },
    async getMessageList() {
      this.loading = true;
      const params = {
        userId: this.userId,
        page: this.page,
        size: this.size,
      };
      const res = await MessageProxy.list(params);
      setTimeout(() => {
        this.loading = false;
      }, 800);
      if (!res.fail) {
        // 如果是获取第一页就清空整个列表TODO
        if (this.page === 1) {
          this.messageList = [];
        }
        this.page += 1;
        this.messageList = this.messageList.concat(res.data.list);
        this.totalRecordCount = res.data.totalCount;
        // 无数据
        if (this.messageList.length === this.totalRecordCount || !res.data.list.length) {
          this.finished = true;
        } else if (this.messageList.length < this.totalRecordCount) {
        // 还有数据
          this.finished = false;
        }
      }
    },
    async removeMessage(id) {
      const params = {
        id,
      };
      const res = await MessageProxy.remove(params);
      if (!res.fail) {
        this.messageList = this.messageList.filter(item => item.id !== id);
        this.$toast('删除成功');
      }
    },
  },
  created() {
    if (this.userId) {
      this.getMessageList();
    }
  },
};
</script>

<style lang="less">
  .message-list-page {
    padding-bottom: 60px;
    .remove-button {
      height: 100%;
    }
    .status {
      display: flex;
      justify-content: space-between;
      margin: 10px;
      .red {
        color: rgb(245, 107, 107);
      }
      .blue {
        color: rgb(25, 137, 250);
      }
      .van-icon {
        float: left;
        margin-right: 2px;
      }
    }
    .message-item {
      background-color: #fff;
      display: flex;
      align-items: center;
      .right {
        flex: 1;
      }
    }
    .icon {
      background-color: #eee;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      text-align: center;
      line-height: 52px;
      flex-shrink: 0;
      margin-right: 5px;
    }
    .content {
      display: flex;
      justify-content: space-between;
    }
    .desc {
      color: #999;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 228px;
      font-size: 13px;
      font-weight: 300;
    }
    .time {
      color: #999;
      flex-shrink: 0;
      font-size: 12px;
    }
  }
</style>
