<template>
  <div class="tabs-component">
    <div class="item" v-for="(item, index) in list" :key="index">{{item}}</div>
  </div>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
    },
  },
};
</script>
<style lang="less">
.tabs-component {
  background-color: #eee;
  display: flex;
  justify-content: space-between;
  border-radius: 10px;
  .item {
    border-right: 1px solid #d6d6d9;
    text-align: center;
    margin: 10px 0;
    flex: 1;
    &.active {
      background-color: #fff;
      margin: 3px;
      border-radius: 8px;
      border-right: none;
      line-height: 30px;
    }
    &:last-child {
      border-right: none;
    }
  }
}
</style>
