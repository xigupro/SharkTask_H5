<template>
  <div class="entry-component">
    <template v-if="entries && entries.length">
      <div class="vertical" v-if="vertical">
        <van-cell
          @click="handleEntryClick(item.url)"
          :value="item.sub_name"
          is-link v-for="item in entries" :key="item.id">
          <template #title>
            <span :style="{'color': item.font_color}">{{item.name}}</span>
          </template>
          <template #icon>
            <img class="icon" :src="item.icon | getQiniuFullUrl">
          </template>
        </van-cell>
      </div>
      <div class="entries" v-else>
        <div
          v-for="item in entries"
          :key="item.id"
          @click="handleEntryClick(item.url)"
          class="entry-item">
          <img class="icon" :src="item.icon | getQiniuFullUrl">
          <div :style="{'color': item.font_color}">{{item.name}}</div>
        </div>
      </div>
    </template>
    <van-empty v-else-if="vertical" description="暂无数据" />
  </div>
</template>

<script>
import {
  Empty,
  Cell,
} from 'vant';
import EntryMixin from '@/mixins/entry';

export default {
  props: {
    entries: {
      type: Array,
      default() {
        return [];
      },
    },
    // 是否垂直
    vertical: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [EntryMixin],
  components: {
    [Empty.name]: Empty,
    [Cell.name]: Cell,
  },
};
</script>

<style lang="less">
  .entry-component {
    .van-cell {
      align-items: center;
    }
    .entries {
      background-color: #fff;
      padding: 2% 0;
    }
    .entries::after {
      content: '';
      display: table;
      clear: both;
    }
    .entry-item {
      width: 21%;
      margin: 1% 2%;
      float: left;
      text-align: center;
      font-size: 12px;
    }
    .icon {
      width: 60%;
      height: auto;
    }
    .vertical {
      .icon {
        width: 40px;
        height: 40px;
        margin-right: 8px;
      }
    }
  }
</style>
